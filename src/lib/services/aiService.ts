import { AI_CONFIG } from '../config/ai';
import { Recipe, GenerateRecipesRequest, AIServiceResponse, MealType } from '../types/recipe';
import { HealthGoalId } from '../types/healthGoals';
import { getRecipeImage, getMealTypeColor } from './imageService';

interface OllamaStreamResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

/**
 * Generate recipe prompt based on user's health goals or custom description
 */
function generateRecipePrompt(
  healthGoals: HealthGoalId[], 
  count: number = 6,
  customPrompt?: string
): string {
  const goalDescriptions = healthGoals.map(goal => {
    switch (goal) {
      case 'weight_loss':
        return 'weight loss (focus on low calorie, high protein, high fiber recipes around 300-450 calories)';
      case 'muscle_gain':
        return 'muscle building (focus on high protein 25-40g, moderate carbs for energy)';
      case 'competition_prep':
        return 'athletic performance (balanced macros, optimal timing, energy-dense)';
      case 'general_health':
        return 'balanced nutrition and wellness (variety of nutrients, whole foods)';
      default:
        return 'healthy eating';
    }
  }).join(', ');

  // If custom prompt provided, use it for specific recipe generation
  const baseDescription = customPrompt 
    ? `Create a recipe based on this description: "${customPrompt}". Also consider the user's health goals: ${goalDescriptions}.`
    : `Generate ${count} unique, healthy recipes for someone with these health goals: ${goalDescriptions}.`;

  return `You are a professional nutritionist and chef. ${baseDescription}

CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no explanation, no code blocks. Just pure JSON.

Requirements:
1. ${customPrompt ? 'Follow the user\'s description closely' : 'Diverse meal types: Mix of BREAKFAST, LUNCH, DINNER, and SNACK'}
2. Difficulty levels: Include Easy, Medium, and Hard recipes
3. Realistic times: Prep time 5-30 minutes, Cook time 0-60 minutes
4. Common ingredients: Use accessible, everyday ingredients
5. Accurate nutrition: Calculate realistic calorie and macro values
6. Clear instructions: 4-8 numbered steps, be specific

JSON Format (respond with ONLY this structure):
{
  "recipes": [
    {
      "title": "Specific Recipe Name",
      "description": "Brief 1-2 sentence description highlighting benefits",
      "mealType": "BREAKFAST",
      "prepTime": 15,
      "cookTime": 20,
      "servings": 2,
      "difficulty": "Easy",
      "ingredients": [
        {"name": "ingredient name", "amount": 1.5, "unit": "cup"},
        {"name": "another ingredient", "amount": 2, "unit": "tbsp"}
      ],
      "instructions": [
        "First step with specific details",
        "Second step with timing if needed",
        "Third step, etc."
      ],
      "nutrition": {
        "calories": 380,
        "protein": 25,
        "carbs": 45,
        "fat": 12
      },
      "tags": ["high-protein", "quick", "meal-prep"]
    }
  ]
}

Generate ${count} recipe${count > 1 ? 's' : ''} now in this exact JSON format. Remember: ONLY JSON, no other text.`;
}

/**
 * Generate recipes using Ollama local API with streaming support
 */
async function generateRecipesWithOllama(
  prompt: string,
  onProgress?: (chunk: string) => void
): Promise<string> {
  // Use the API route (baseUrl is now '/api/ollama')
  const apiUrl = AI_CONFIG.ollama.baseUrl.startsWith('/') 
    ? AI_CONFIG.ollama.baseUrl 
    : `${AI_CONFIG.ollama.baseUrl}/api/generate`;
    
  console.log('📡 Calling Ollama via:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.ollama.model,
        prompt: prompt,
        temperature: AI_CONFIG.ollama.temperature,
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ollama API error response:', errorText);
      throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (!reader) {
      throw new Error('No response body from stream');
    }

    console.log('📥 Reading stream...');

    try {
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log(`✅ Stream done. Total chunks: ${chunkCount}, Response length: ${fullResponse.length}`);
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Split by newlines as each line is a separate JSON object
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed: OllamaStreamResponse = JSON.parse(line);
            
            // Accumulate the response
            fullResponse += parsed.response;
            chunkCount++;
            
            // Call progress callback if provided
            if (onProgress) {
              onProgress(parsed.response);
            }
            
            // Check if generation is complete
            if (parsed.done) {
              console.log(`✅ Generation complete. Final length: ${fullResponse.length}`);
              return fullResponse;
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse chunk line (non-fatal):', line.substring(0, 50));
          }
        }
      }
      
      if (!fullResponse) {
        throw new Error('Empty response from Ollama');
      }
      
      return fullResponse;
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('❌ generateRecipesWithOllama error:', error);
    throw error;
  }
}

/**
 * Generate recipes using OpenAI API
 */
async function generateRecipesWithOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.openai.model,
      messages: [
        { role: 'system', content: AI_CONFIG.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: AI_CONFIG.openai.temperature,
      max_tokens: AI_CONFIG.openai.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Extract and parse JSON from AI response with multiple fallback strategies
 */
function extractAndParseJSON(responseText: string): any {
  console.log('🔍 Attempting to extract JSON from response (length:', responseText.length, ')');
  console.log('📄 First 300 chars:', responseText.substring(0, 300));
  console.log('📄 Last 200 chars:', responseText.substring(responseText.length - 200));
  
  // Strategy 1: Remove markdown code blocks first
  let cleanedText = responseText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  // Strategy 2: Try to find complete JSON object with proper nesting
  const jsonStart = cleanedText.indexOf('{');
  
  if (jsonStart !== -1) {
    // Find matching closing brace by counting braces
    let braceCount = 0;
    let jsonEnd = -1;
    
    for (let i = jsonStart; i < cleanedText.length; i++) {
      if (cleanedText[i] === '{') braceCount++;
      if (cleanedText[i] === '}') braceCount--;
      
      if (braceCount === 0) {
        jsonEnd = i;
        break;
      }
    }
    
    if (jsonEnd !== -1) {
      const jsonStr = cleanedText.substring(jsonStart, jsonEnd + 1);
      console.log('✂️ Extracted JSON (length:', jsonStr.length, ')');
      
      try {
        const parsed = JSON.parse(jsonStr);
        console.log('✅ Successfully parsed JSON');
        return parsed;
      } catch (e) {
        console.warn('❌ Failed to parse extracted JSON:', e);
        console.log('📋 Problematic JSON:', jsonStr.substring(0, 500));
      }
    }
  }

  // Strategy 3: Try parsing cleaned text directly
  try {
    const parsed = JSON.parse(cleanedText);
    console.log('✅ Successfully parsed cleaned text');
    return parsed;
  } catch (e) {
    console.warn('❌ Failed to parse cleaned text:', e);
  }

  // Strategy 4: Try simple regex match as last resort
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed with regex');
      return parsed;
    } catch (e) {
      console.warn('❌ Failed to parse regex match:', e);
    }
  }

  console.error('❌ All JSON extraction strategies failed');
  throw new Error('Could not extract valid JSON from response');
}

/**
 * Validate and sanitize recipe data
 */
/**
 * Sanitize and fix recipe data from AI
 */
function sanitizeRecipe(recipe: any): any {
  // Fix ingredient amounts if they're strings
  if (Array.isArray(recipe.ingredients)) {
    recipe.ingredients = recipe.ingredients.map((ing: any) => {
      let amount = ing.amount;
      
      // If amount is a string, try to parse it
      if (typeof amount === 'string') {
        // Handle fractions like "1/2"
        if (amount.includes('/')) {
          const parts = amount.split('/');
          amount = parseFloat(parts[0]) / parseFloat(parts[1]);
        }
        // Handle ranges like "1/2 - 1 cup" - take first number
        else if (amount.includes('-')) {
          amount = parseFloat(amount.split('-')[0]);
        }
        // Just parse the number
        else {
          amount = parseFloat(amount) || 1;
        }
      }
      
      return {
        ...ing,
        amount: typeof amount === 'number' ? amount : 1,
      };
    });
  }
  
  return recipe;
}

/**
 * Validate recipe structure
 */
function validateRecipe(recipe: any): boolean {
  return (
    recipe &&
    typeof recipe.title === 'string' &&
    typeof recipe.description === 'string' &&
    ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].includes(recipe.mealType) &&
    typeof recipe.prepTime === 'number' &&
    typeof recipe.cookTime === 'number' &&
    typeof recipe.servings === 'number' &&
    ['Easy', 'Medium', 'Hard'].includes(recipe.difficulty) &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.length > 0 &&
    Array.isArray(recipe.instructions) &&
    recipe.instructions.length > 0 &&
    recipe.nutrition &&
    typeof recipe.nutrition.calories === 'number' &&
    typeof recipe.nutrition.protein === 'number' &&
    typeof recipe.nutrition.carbs === 'number' &&
    typeof recipe.nutrition.fat === 'number'
  );
}

/**
 * Main AI service that supports both OpenAI and Ollama
 */
export const aiService = {
  async generateRecipes(
    request: GenerateRecipesRequest,
    userId: string,
    onProgress?: (chunk: string) => void
  ): Promise<AIServiceResponse> {
    console.log('🔧 aiService.generateRecipes called');
    console.log('📋 Request:', { 
      count: request.count, 
      hasCustomPrompt: !!request.customPrompt,
      customPrompt: request.customPrompt,
      healthGoals: request.healthGoals 
    });
    
    const maxRetries = 2;
    let lastError: Error | null = null;

    // Try up to maxRetries times
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Recipe generation attempt ${attempt}/${maxRetries}`);
        
        const prompt = generateRecipePrompt(
          request.healthGoals, 
          request.count, 
          request.customPrompt
        );
        
        console.log('📝 Generated prompt (first 200 chars):', prompt.substring(0, 200));
        
        let responseText: string;

        // Choose provider based on configuration
        console.log(`🤖 Using provider: ${AI_CONFIG.provider}`);
        
        if (AI_CONFIG.provider === 'ollama') {
          console.log('📡 Calling Ollama API...');
          responseText = await generateRecipesWithOllama(prompt, onProgress);
        } else {
          console.log('📡 Calling OpenAI API...');
          responseText = await generateRecipesWithOpenAI(prompt);
        }

        // Log response length for debugging
        console.log(`✅ Received response: ${responseText.length} characters`);

        // Extract and parse JSON with fallback strategies
        const parsed = extractAndParseJSON(responseText);
        
        if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
          throw new Error('Invalid recipe format: missing recipes array');
        }

        // Sanitize and validate recipes
        const validRecipes = parsed.recipes
          .map((r: any) => sanitizeRecipe(r)) // Sanitize first
          .filter((r: any) => {
            const isValid = validateRecipe(r);
            if (!isValid) {
              console.warn('Invalid recipe filtered out:', r.title || 'Unknown');
              console.warn('Recipe data:', JSON.stringify(r, null, 2));
            }
            return isValid;
          });

        if (validRecipes.length === 0) {
          throw new Error('No valid recipes generated');
        }

        // Transform to Recipe type with defaults and generate images
        const recipes: Recipe[] = validRecipes.map((r: any, index: number) => {
          // Use color-coded placeholders for fast, reliable recipe generation
          // AI-generated images are pre-cached for the main recipe database
          const fallbackColor = getMealTypeColor(r.mealType || 'LUNCH');
          const imageUrl = `https://via.placeholder.com/400x300/${fallbackColor}/ffffff?text=${encodeURIComponent(r.title)}`;
          
          return {
            ...r,
            id: `ai-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            isAiGenerated: true,
            generatedAt: new Date(),
            isFavorite: false,
            tags: Array.isArray(r.tags) ? r.tags : [],
            healthGoals: request.healthGoals,
            image: imageUrl,
          };
        });

        console.log(`✅ Successfully generated ${recipes.length} recipes on attempt ${attempt}`);

        return {
          success: true,
          recipes,
          cached: false,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, lastError);
        console.error('Error stack:', lastError instanceof Error ? lastError.stack : 'N/A');
        
        // If this isn't the last attempt, wait a bit before retrying
        if (attempt < maxRetries) {
          console.log(`Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // All retries failed
    console.error('All recipe generation attempts failed. Last error:', lastError);
    return {
      success: false,
      error: lastError?.message || 'Failed to generate recipes after multiple attempts',
    };
  },

  /**
   * Check if Ollama is available
   */
  async checkOllamaAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      // Use the API route for checking availability
      const apiUrl = AI_CONFIG.ollama.baseUrl.startsWith('/') 
        ? AI_CONFIG.ollama.baseUrl 
        : `${AI_CONFIG.ollama.baseUrl}/api/tags`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ollama available:', data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Ollama not available:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  },

  /**
   * Automatically detect and set the best available provider
   */
  async detectAndSetProvider(): Promise<'ollama' | 'openai' | null> {
    console.log('Detecting available AI providers...');
    
    // Check Ollama first (preferred for local/free)
    const ollamaAvailable = await this.checkOllamaAvailability();
    
    if (ollamaAvailable) {
      console.log('✅ Ollama is available');
      AI_CONFIG.provider = 'ollama';
      return 'ollama';
    }

    // Check OpenAI if API key is configured
    if (AI_CONFIG.openai.apiKey) {
      console.log('⚠️ Ollama not available, falling back to OpenAI');
      AI_CONFIG.provider = 'openai';
      return 'openai';
    }

    console.error('❌ No AI provider available');
    return null;
  },

  /**
   * Get current provider status
   */
  getProviderStatus(): { provider: string; available: boolean } {
    return {
      provider: AI_CONFIG.provider,
      available: true, // Simplified for now
    };
  },
};

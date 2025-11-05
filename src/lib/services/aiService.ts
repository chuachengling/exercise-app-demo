import { AI_CONFIG } from '../config/ai';
import { Recipe, GenerateRecipesRequest, AIServiceResponse, MealType } from '../types/recipe';
import { HealthGoalId } from '../types/healthGoals';

interface OllamaStreamResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

/**
 * Generate recipe prompt based on user's health goals
 */
function generateRecipePrompt(healthGoals: HealthGoalId[], count: number = 6): string {
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

  return `You are a professional nutritionist and chef. Generate ${count} unique, healthy recipes for someone with these health goals: ${goalDescriptions}.

CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no explanation, no code blocks. Just pure JSON.

Requirements:
1. Diverse meal types: Mix of BREAKFAST, LUNCH, DINNER, and SNACK
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

Generate ${count} recipes now in this exact JSON format. Remember: ONLY JSON, no other text.`;
}

/**
 * Generate recipes using Ollama local API with streaming support
 */
async function generateRecipesWithOllama(
  prompt: string,
  onProgress?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${AI_CONFIG.ollama.baseUrl}/api/generate`, {
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
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  if (!reader) {
    throw new Error('No response body');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      
      // Split by newlines as each line is a separate JSON object
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const parsed: OllamaStreamResponse = JSON.parse(line);
          
          // Accumulate the response
          fullResponse += parsed.response;
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress(parsed.response);
          }
          
          // Check if generation is complete
          if (parsed.done) {
            return fullResponse;
          }
        } catch (parseError) {
          console.warn('Failed to parse chunk:', line, parseError);
        }
      }
    }
    
    return fullResponse;
  } finally {
    reader.releaseLock();
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
  // Strategy 1: Try to find JSON between curly braces
  let jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('Failed to parse matched JSON:', e);
    }
  }

  // Strategy 2: Remove markdown code blocks if present
  const cleanedText = responseText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.warn('Failed to parse cleaned text:', e);
  }

  // Strategy 3: Try to find the start of JSON object
  const jsonStart = responseText.indexOf('{');
  const jsonEnd = responseText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    try {
      return JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
    } catch (e) {
      console.warn('Failed to parse substring:', e);
    }
  }

  throw new Error('Could not extract valid JSON from response');
}

/**
 * Validate and sanitize recipe data
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
    const maxRetries = 2;
    let lastError: Error | null = null;

    // Try up to maxRetries times
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Recipe generation attempt ${attempt}/${maxRetries}`);
        
        const prompt = generateRecipePrompt(request.healthGoals, request.count);
        let responseText: string;

        // Choose provider based on configuration
        if (AI_CONFIG.provider === 'ollama') {
          responseText = await generateRecipesWithOllama(prompt, onProgress);
        } else {
          responseText = await generateRecipesWithOpenAI(prompt);
        }

        // Log response length for debugging
        console.log(`Received response: ${responseText.length} characters`);

        // Extract and parse JSON with fallback strategies
        const parsed = extractAndParseJSON(responseText);
        
        if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
          throw new Error('Invalid recipe format: missing recipes array');
        }

        // Validate and filter recipes
        const validRecipes = parsed.recipes.filter((r: any) => {
          const isValid = validateRecipe(r);
          if (!isValid) {
            console.warn('Invalid recipe filtered out:', r.title || 'Unknown');
          }
          return isValid;
        });

        if (validRecipes.length === 0) {
          throw new Error('No valid recipes generated');
        }

        // Transform to Recipe type with defaults
        const recipes: Recipe[] = validRecipes.map((r: any) => ({
          ...r,
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          isAiGenerated: true,
          generatedAt: new Date(),
          isFavorite: false,
          tags: Array.isArray(r.tags) ? r.tags : [],
          healthGoals: request.healthGoals,
          image: r.image || `https://via.placeholder.com/400x300/10b981/ffffff?text=${encodeURIComponent(r.title)}`,
        }));

        console.log(`✅ Successfully generated ${recipes.length} recipes on attempt ${attempt}`);

        return {
          success: true,
          recipes,
          cached: false,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, lastError.message);
        
        // If this isn't the last attempt, wait a bit before retrying
        if (attempt < maxRetries) {
          console.log(`Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // All retries failed
    console.error('All recipe generation attempts failed');
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
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${AI_CONFIG.ollama.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Ollama not available:', error instanceof Error ? error.message : 'Unknown error');
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

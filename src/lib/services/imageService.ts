/**
 * Image Service for generating recipe images using Stable Diffusion and Unsplash
 */

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Stable Diffusion via Replicate API
const REPLICATE_API_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '';
const REPLICATE_API_URL = 'https://api.replicate.com/v1';

// Or use Hugging Face Inference API
const HUGGINGFACE_API_TOKEN = process.env.NEXT_PUBLIC_HUGGINGFACE_API_TOKEN || '';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';
const HUGGINGFACE_ROUTER_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
}

/**
 * Generate image using Stable Diffusion via Hugging Face
 */
export async function generateImageWithStableDiffusion(
  prompt: string
): Promise<string> {
  if (!HUGGINGFACE_API_TOKEN) {
    console.warn('No Hugging Face API token, using placeholder');
    return generatePlaceholderImage(prompt);
  }

  try {
    const response = await fetch(HUGGINGFACE_ROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, bad quality, distorted, ugly',
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Stable Diffusion API error:', response.statusText);
      return generatePlaceholderImage(prompt);
    }

    // Hugging Face returns image as blob
    const blob = await response.blob();
    
    // Convert blob to base64 for display
    const base64 = await blobToBase64(blob);
    return base64;
  } catch (error) {
    console.error('Failed to generate image with Stable Diffusion:', error);
    return generatePlaceholderImage(prompt);
  }
}

/**
 * Generate recipe-specific image prompt for Stable Diffusion
 */
export function createRecipeImagePrompt(recipeTitle: string): string {
  return `Professional food photography of ${recipeTitle}, appetizing, well-lit, high quality, detailed, restaurant style, close-up shot, food styling, 4k, sharp focus`;
}

/**
 * Generate a placeholder image URL with custom text and color
 */
export function generatePlaceholderImage(
  title: string,
  width: number = 400,
  height: number = 300,
  backgroundColor: string = '10b981'
): string {
  const encodedTitle = encodeURIComponent(title.slice(0, 50));
  return `https://via.placeholder.com/${width}x${height}/${backgroundColor}/ffffff?text=${encodedTitle}`;
}

/**
 * Convert blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get a recipe image - tries multiple sources in order:
 * 1. Stable Diffusion (if API key available)
 * 2. Unsplash stock photos
 * 3. Placeholder images
 */
export async function getRecipeImage(
  recipeTitle: string,
  useAI: boolean = false
): Promise<string> {
  try {
    // Option 1: Generate with AI if requested and API key available
    if (useAI && HUGGINGFACE_API_TOKEN) {
      console.log('Generating AI image for:', recipeTitle);
      const prompt = createRecipeImagePrompt(recipeTitle);
      return await generateImageWithStableDiffusion(prompt);
    }

    // Option 2: Try Unsplash for real food photos
    if (UNSPLASH_ACCESS_KEY !== 'demo') {
      const foodKeyword = extractFoodKeyword(recipeTitle);
      
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(foodKeyword)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const image: UnsplashImage = data.results[0];
          return image.urls.regular;
        }
      }
    }

    // Option 3: Fallback to placeholder
    const mealType = guessMealTypeFromTitle(recipeTitle);
    const color = getMealTypeColor(mealType);
    return generatePlaceholderImage(recipeTitle, 400, 300, color);
  } catch (error) {
    console.error('Failed to fetch recipe image:', error);
    return generatePlaceholderImage(recipeTitle);
  }
}

/**
 * Extract main food keyword from recipe title
 */
function extractFoodKeyword(title: string): string {
  const foodKeywords = [
    'chicken', 'salmon', 'beef', 'pork', 'fish', 'tofu', 'turkey',
    'pasta', 'rice', 'quinoa', 'oats', 'bread', 'noodles',
    'salad', 'soup', 'bowl', 'wrap', 'sandwich', 'burger',
    'pancake', 'waffle', 'eggs', 'avocado', 'bacon',
    'smoothie', 'yogurt', 'protein', 'vegetables', 'stir fry'
  ];

  const lowerTitle = title.toLowerCase();
  
  for (const keyword of foodKeywords) {
    if (lowerTitle.includes(keyword)) {
      return `${keyword} food meal`;
    }
  }

  return 'healthy food meal';
}

/**
 * Guess meal type from recipe title
 */
function guessMealTypeFromTitle(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('breakfast') || lowerTitle.includes('oats') || 
      lowerTitle.includes('pancake') || lowerTitle.includes('eggs')) {
    return 'BREAKFAST';
  }
  
  if (lowerTitle.includes('lunch') || lowerTitle.includes('salad') || 
      lowerTitle.includes('wrap') || lowerTitle.includes('sandwich')) {
    return 'LUNCH';
  }
  
  if (lowerTitle.includes('dinner') || lowerTitle.includes('steak') || 
      lowerTitle.includes('salmon')) {
    return 'DINNER';
  }
  
  if (lowerTitle.includes('snack') || lowerTitle.includes('smoothie') || 
      lowerTitle.includes('energy')) {
    return 'SNACK';
  }
  
  return 'LUNCH'; // Default
}

/**
 * Batch generate images for multiple recipes using AI
 */
export async function batchGenerateRecipeImages(
  recipeTitles: string[],
  useAI: boolean = false
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 3;
  for (let i = 0; i < recipeTitles.length; i += batchSize) {
    const batch = recipeTitles.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map(async (title) => {
        const imageUrl = await getRecipeImage(title, useAI);
        return { title, imageUrl };
      })
    );
    
    results.forEach(({ title, imageUrl }) => {
      imageMap.set(title, imageUrl);
    });
    
    // Delay between batches to respect API rate limits
    if (i + batchSize < recipeTitles.length && useAI) {
      console.log('Waiting before next AI batch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  return imageMap;
}

/**
 * Get color based on meal type for placeholder images
 */
export function getMealTypeColor(mealType: string): string {
  const colors: Record<string, string> = {
    BREAKFAST: 'f59e0b', // Orange
    LUNCH: '3b82f6',     // Blue
    DINNER: 'ef4444',    // Red
    SNACK: 'a855f7',     // Purple
  };
  
  return colors[mealType] || '10b981'; // Default green
}

# Recipe Image Generation Setup

This guide explains how to set up AI-powered image generation for recipe images using Stable Diffusion.

## Image Generation Options

The app supports multiple image sources (tried in order):

1. **Stable Diffusion (AI-Generated)** - Custom images via Hugging Face API
2. **Unsplash** - Real food photography stock photos
3. **Placeholders** - Color-coded placeholders as fallback

## Setup Instructions

### Option 1: Stable Diffusion via Hugging Face (Recommended)

1. **Create a Hugging Face account:**
   - Go to https://huggingface.co/join
   - Sign up for a free account

2. **Get an API token:**
   - Visit https://huggingface.co/settings/tokens
   - Click "New token"
   - Name it "recipe-app" (or anything you like)
   - Select "Read" permission
   - Copy the generated token

3. **Add to your .env.local file:**
   ```bash
   NEXT_PUBLIC_HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

### Option 2: Unsplash Stock Photos (Fallback)

1. **Create an Unsplash developer account:**
   - Go to https://unsplash.com/developers
   - Create an application

2. **Get your Access Key:**
   - Copy your "Access Key" from the application dashboard

3. **Add to your .env.local file:**
   ```bash
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

### Option 3: Placeholder Images Only

If you don't set up any API keys, the app will use color-coded placeholder images:
- 🟠 Orange - Breakfast
- 🔵 Blue - Lunch
- 🔴 Red - Dinner
- 🟣 Purple - Snacks

## How It Works

### Stable Diffusion Image Generation

When you generate a custom recipe, the system:

1. **Creates an optimized prompt:**
   ```
   "Professional food photography of [Recipe Title], appetizing, 
   well-lit, high quality, detailed, restaurant style, close-up shot, 
   food styling, 4k, sharp focus"
   ```

2. **Calls Hugging Face API:**
   - Uses Stable Diffusion 2.1 model
   - Generates a 512x512 image
   - Takes ~10-30 seconds per image

3. **Returns the image:**
   - Converts to base64 for immediate display
   - Caches in browser for performance

### Image Source Priority

```typescript
async function getRecipeImage(title: string, useAI: boolean) {
  if (useAI && HUGGINGFACE_API_TOKEN) {
    // 1. Try Stable Diffusion
    return await generateWithStableDiffusion(title);
  }
  
  if (UNSPLASH_ACCESS_KEY) {
    // 2. Try Unsplash stock photos
    return await searchUnsplash(title);
  }
  
  // 3. Fallback to placeholder
  return generatePlaceholder(title);
}
```

## Usage in Code

### Generate a single recipe image:

```typescript
import { getRecipeImage } from '@/lib/services/imageService';

// With AI generation
const imageUrl = await getRecipeImage("Grilled Chicken Bowl", true);

// Without AI (Unsplash or placeholder)
const imageUrl = await getRecipeImage("Grilled Chicken Bowl", false);
```

### Batch generate images:

```typescript
import { batchGenerateRecipeImages } from '@/lib/services/imageService';

const titles = [
  "Overnight Oats",
  "Chicken Salad",
  "Salmon Dinner"
];

const imageMap = await batchGenerateRecipeImages(titles, true);
// Returns: Map { "Overnight Oats" => "data:image/png;base64...", ... }
```

## Performance Considerations

### Stable Diffusion
- **Generation time:** 10-30 seconds per image
- **Rate limits:** Depends on your Hugging Face tier (free tier has limits)
- **Cost:** Free tier available, paid tiers for faster generation
- **Best for:** Custom recipes where unique images add value

### Unsplash
- **Speed:** ~1 second per image
- **Rate limits:** 50 requests/hour (free tier)
- **Cost:** Free
- **Best for:** Quick lookups with real food photos

### Placeholders
- **Speed:** Instant
- **Rate limits:** None
- **Cost:** Free
- **Best for:** Development and fallback

## Troubleshooting

### "Failed to generate image"
- Check your API token is correct
- Verify you have an active internet connection
- Check Hugging Face API status: https://status.huggingface.co/

### Images load slowly
- This is normal for AI generation (10-30 seconds)
- Consider using Unsplash for faster results
- Disable AI generation for cached recipes

### Base64 images too large
- Stable Diffusion images are ~200KB as base64
- Consider implementing image upload to cloud storage
- Or use image URLs instead of base64

## Advanced Configuration

### Use different Stable Diffusion models:

Edit `/src/lib/services/imageService.ts`:

```typescript
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5';
// Or: 'stabilityai/stable-diffusion-xl-base-1.0'
```

### Customize image prompts:

```typescript
export function createRecipeImagePrompt(recipeTitle: string): string {
  return `Food photography, ${recipeTitle}, magazine quality, natural lighting, wooden table, rustic style`;
}
```

### Adjust generation parameters:

```typescript
body: JSON.stringify({
  inputs: prompt,
  parameters: {
    negative_prompt: 'blurry, bad quality, distorted, ugly, cartoon',
    num_inference_steps: 50,  // Higher = better quality, slower
    guidance_scale: 7.5,       // Higher = more adherence to prompt
  },
})
```

## API Keys Security

⚠️ **Important:** Never commit your `.env.local` file to git!

The `.env.local` file is already in `.gitignore`. Always use environment variables for API keys.

For production deployment:
1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Use secrets management for sensitive keys
3. Never expose API keys in client-side code

## Cost Estimation

### Free Tier (Recommended for Development)
- Hugging Face: Free (with rate limits)
- Unsplash: Free (50 requests/hour)
- Total: $0/month

### Paid Tier (For Production)
- Hugging Face Pro: $9/month (faster, higher limits)
- Unsplash: Free or paid ($29/month for commercial use)
- Total: ~$10-40/month

## Next Steps

1. Set up your API keys
2. Test image generation with a custom recipe
3. Monitor API usage and costs
4. Consider implementing image caching/storage for production

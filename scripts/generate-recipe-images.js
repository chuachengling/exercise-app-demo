/**
 * Script to pre-generate recipe images using Stable Diffusion XL
 * 
 * Usage:
 *   node scripts/generate-recipe-images.js
 * 
 * Requires:
 *   - NEXT_PUBLIC_HUGGINGFACE_API_TOKEN in .env.local
 */

const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_HUGGINGFACE_API_TOKEN=')) {
      return trimmed.split('=')[1].trim();
    }
  }
  
  return null;
}

const HUGGINGFACE_API_TOKEN = loadEnv();
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';
const OUTPUT_DIR = path.join(__dirname, '../public/images/recipes');

// Recipe titles from cachedRecipes.ts
const RECIPES = [
  { id: 'cached-1', title: 'Overnight Oats with Berries' },
  { id: 'cached-2', title: 'Grilled Chicken & Quinoa Bowl' },
  { id: 'cached-3', title: 'Mediterranean Salmon with Roasted Vegetables' },
  { id: 'cached-4', title: 'Protein-Packed Energy Balls' },
  { id: 'cached-5', title: 'Green Smoothie Bowl' },
  { id: 'cached-6', title: 'Turkey & Avocado Wrap' },
  { id: 'cached-7', title: 'Avocado Toast with Poached Eggs' },
  { id: 'cached-8', title: 'Baked Cod with Roasted Vegetables' },
  { id: 'cached-9', title: 'Greek Yogurt Parfait' },
  { id: 'cached-10', title: 'Stir-Fried Tofu with Vegetables' },
  { id: 'cached-11', title: 'Banana Protein Pancakes' },
  { id: 'cached-12', title: 'Chicken Caesar Salad' },
];

/**
 * Create optimized prompt for food photography
 */
function createFoodPrompt(recipeTitle) {
  return `Professional food photography of ${recipeTitle}, appetizing, well-lit, high quality, detailed, restaurant style, close-up shot, food styling, 4k, sharp focus, natural lighting, wooden table background`;
}

/**
 * Generate image using Stable Diffusion XL
 */
async function generateImage(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${retries}...`);
      
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, bad quality, distorted, ugly, cartoon, illustration, drawing, 3d render, low quality, watermark, text',
            num_inference_steps: 40,
            guidance_scale: 8.0,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check if model is loading
        if (errorText.includes('loading')) {
          console.log(`  Model is loading, waiting 20 seconds...`);
          await sleep(20000);
          continue;
        }
        
        throw new Error(`API error: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error(`  Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying
      await sleep(5000);
    }
  }
}

/**
 * Save image buffer to file
 */
function saveImage(imageBuffer, filename) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, imageBuffer);
  console.log(`  ✓ Saved to ${filename}`);
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Recipe Image Generator using Stable Diffusion XL\n');
  
  // Validate API token
  if (!HUGGINGFACE_API_TOKEN) {
    console.error('❌ Error: NEXT_PUBLIC_HUGGINGFACE_API_TOKEN not found in .env.local');
    console.error('   Get your token from: https://huggingface.co/settings/tokens');
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created directory: ${OUTPUT_DIR}\n`);
  }
  
  // Generate images
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < RECIPES.length; i++) {
    const recipe = RECIPES[i];
    const filename = `${recipe.id}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    console.log(`[${i + 1}/${RECIPES.length}] ${recipe.title}`);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`  ⏭️  Image already exists, skipping...`);
      results.push({ id: recipe.id, title: recipe.title, status: 'skipped', filename });
      continue;
    }
    
    try {
      // Generate image
      const prompt = createFoodPrompt(recipe.title);
      console.log(`  📝 Prompt: ${prompt}`);
      
      const imageBuffer = await generateImage(prompt);
      saveImage(imageBuffer, filename);
      
      results.push({ id: recipe.id, title: recipe.title, status: 'success', filename });
      
      // Wait between requests to avoid rate limiting
      if (i < RECIPES.length - 1) {
        console.log(`  ⏳ Waiting 3 seconds before next generation...\n`);
        await sleep(3000);
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
      results.push({ id: recipe.id, title: recipe.title, status: 'failed', error: error.message });
    }
  }
  
  // Summary
  const duration = Math.round((Date.now() - startTime) / 1000);
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`Total recipes: ${RECIPES.length}`);
  console.log(`✓ Generated:   ${successful}`);
  console.log(`⏭️  Skipped:     ${skipped}`);
  console.log(`❌ Failed:      ${failed}`);
  console.log(`⏱️  Duration:    ${duration}s`);
  console.log('='.repeat(60));
  
  // Save manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    totalImages: RECIPES.length,
    successful,
    failed,
    skipped,
    duration,
    results,
  };
  
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest saved to: ${manifestPath}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some images failed to generate. Check the errors above.');
    process.exit(1);
  }
  
  console.log('\n✅ All images generated successfully!');
  console.log('\nNext step: Update cachedRecipes.ts to use the generated images.');
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

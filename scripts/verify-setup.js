/**
 * Verify API setup for image generation
 */

const fs = require('fs');
const path = require('path');

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

console.log('🔍 Verifying API Setup\n');
console.log('='.repeat(60));

const token = loadEnv();

if (!token) {
  console.log('❌ NEXT_PUBLIC_HUGGINGFACE_API_TOKEN not found in .env.local');
  console.log('\n📝 To fix this:');
  console.log('1. Get your token from: https://huggingface.co/settings/tokens');
  console.log('2. Open .env.local and replace the placeholder with your token');
  console.log('3. Make sure the line looks like:');
  console.log('   NEXT_PUBLIC_HUGGINGFACE_API_TOKEN=hf_YourActualTokenHere');
  process.exit(1);
}

if (token === 'your_huggingface_token_here') {
  console.log('❌ Token is still the placeholder value');
  console.log('\n📝 To fix this:');
  console.log('1. Get your token from: https://huggingface.co/settings/tokens');
  console.log('2. Open .env.local and replace "your_huggingface_token_here" with your actual token');
  console.log('3. Make sure the line looks like:');
  console.log('   NEXT_PUBLIC_HUGGINGFACE_API_TOKEN=hf_YourActualTokenHere');
  process.exit(1);
}

if (!token.startsWith('hf_')) {
  console.log('⚠️  Warning: Token doesn\'t start with "hf_"');
  console.log('   Hugging Face tokens typically start with "hf_"');
  console.log('   Current token: ' + token.substring(0, 10) + '...');
}

console.log('✅ Token found in .env.local');
console.log('   Token preview: ' + token.substring(0, 10) + '...' + token.substring(token.length - 5));
console.log('\n📡 Testing API connection...');

// Test the API
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

fetch(HUGGINGFACE_API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: 'A simple test image of an apple',
    parameters: {
      num_inference_steps: 20,
    },
  }),
})
  .then(async (response) => {
    if (response.ok) {
      console.log('✅ API connection successful!');
      console.log('   Status: ' + response.status);
      console.log('\n🎉 Setup is complete! You can now run:');
      console.log('   node scripts/generate-recipe-images.js');
    } else {
      const errorText = await response.text();
      console.log('❌ API connection failed');
      console.log('   Status: ' + response.status);
      console.log('   Error: ' + errorText);
      
      if (response.status === 401) {
        console.log('\n📝 This usually means:');
        console.log('   - The token is invalid or expired');
        console.log('   - The token doesn\'t have the right permissions');
        console.log('   - Get a new token from: https://huggingface.co/settings/tokens');
      }
      
      if (errorText.includes('loading')) {
        console.log('\n⏳ The model is loading. Try again in 20-30 seconds.');
      }
    }
  })
  .catch(error => {
    console.log('❌ Network error: ' + error.message);
  });

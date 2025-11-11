/**
 * Test script for custom recipe generation
 * Run with: node scripts/test-recipe-generation.js "create a high protein breakfast"
 */

const description = process.argv[2] || 'healthy chicken salad';

async function testRecipeGeneration() {
  console.log('🧪 Testing Recipe Generation');
  console.log('Description:', description);
  console.log('='.repeat(60));
  
  const prompt = `You are a nutrition expert. Create 1 recipe based on: "${description}". Return ONLY valid JSON with this structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "mealType": "BREAKFAST",
      "prepTime": 15,
      "cookTime": 30,
      "servings": 2,
      "difficulty": "Easy",
      "ingredients": [
        {"name": "ingredient", "amount": 1, "unit": "cup"}
      ],
      "instructions": ["Step 1", "Step 2"],
      "nutrition": {
        "calories": 350,
        "protein": 20,
        "carbs": 40,
        "fat": 12
      },
      "tags": ["tag1"]
    }
  ]
}`;

  try {
    console.log('\n📡 Calling Ollama API...\n');
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:1b',
        prompt: prompt,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Raw Response:');
    console.log('-'.repeat(60));
    console.log(data.response);
    console.log('-'.repeat(60));
    
    // Try to parse JSON
    console.log('\n🔍 Attempting to parse JSON...\n');
    
    // Extract JSON (it might be wrapped in ```json```)
    let jsonText = data.response.trim();
    
    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed JSON:');
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.recipes && parsed.recipes.length > 0) {
        console.log('\n✅ Recipe generated successfully!');
        console.log('Title:', parsed.recipes[0].title);
        console.log('Meal Type:', parsed.recipes[0].mealType);
        console.log('Ingredients:', parsed.recipes[0].ingredients.length);
      }
    } else {
      console.log('❌ No JSON found in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  }
}

testRecipeGeneration();

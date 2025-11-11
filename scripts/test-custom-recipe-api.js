/**
 * Test custom recipe generation end-to-end
 */

async function testCustomRecipeGeneration() {
  console.log('🧪 Testing Custom Recipe Generation via API Route\n');
  
  const prompt = `You are a nutrition expert. Create 1 recipe based on: "spicy chicken tacos". Return ONLY valid JSON with this structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "mealType": "LUNCH",
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
    console.log('📡 Calling /api/ollama...\n');
    
    const response = await fetch('http://localhost:3000/api/ollama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:1b',
        prompt: prompt,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Response received, reading stream...\n');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          fullResponse += parsed.response;
          
          if (parsed.done) {
            console.log('✅ Stream completed\n');
            console.log('📄 Full Response:');
            console.log('-'.repeat(60));
            console.log(fullResponse.substring(0, 500));
            console.log('-'.repeat(60));
            
            // Try to extract JSON
            const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const recipeData = JSON.parse(jsonMatch[0]);
              console.log('\n✅ Successfully parsed JSON recipe!');
              console.log('Recipe count:', recipeData.recipes?.length || 0);
              if (recipeData.recipes?.[0]) {
                console.log('Title:', recipeData.recipes[0].title);
                console.log('Meal Type:', recipeData.recipes[0].mealType);
              }
            } else {
              console.log('\n❌ No valid JSON found in response');
            }
            return;
          }
        } catch (parseError) {
          console.warn('Failed to parse chunk:', line);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  }
}

testCustomRecipeGeneration();

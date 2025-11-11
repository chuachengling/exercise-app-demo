export const AI_CONFIG = {
  provider: 'ollama' as 'openai' | 'ollama',
  
  // OpenAI Configuration
  openai: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
  },
  
  // Ollama Local Configuration
  ollama: {
    baseUrl: '/api/ollama', // Use Next.js API route as proxy
    model: 'gemma3:1b', // Using gemma3:1b as specified
    temperature: 0.7,
  },
  
  systemPrompt: `You are a nutrition expert and chef. Generate healthy recipes that align with the user's health goals. Return recipes in JSON format with the following structure:

{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "mealType": "BREAKFAST|LUNCH|DINNER|SNACK",
      "prepTime": 15,
      "cookTime": 30,
      "servings": 4,
      "difficulty": "Easy|Medium|Hard",
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
      "tags": ["tag1", "tag2"]
    }
  ]
}`
};

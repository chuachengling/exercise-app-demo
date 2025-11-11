# Custom Recipe Generation Debugging Guide

## How to Debug Recipe Generation

### 1. Open Browser Developer Tools
- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Go to the **Console** tab

### 2. Try Creating a Custom Recipe
1. Go to http://localhost:3000/recipes
2. Click the purple "Create Custom Recipe" card
3. Enter a description (e.g., "healthy chicken salad")
4. Click "Generate Recipe"

### 3. Watch for Console Logs

You should see logs in this order:

```
📝 CreateRecipeCard: Form submitted
📝 Description: healthy chicken salad
⏳ Is generating: false
✅ Calling onGenerateRecipe...
🚀 Starting custom recipe generation...
📝 Description: healthy chicken salad
👤 User ID: [your user id]
🎯 Health Goals: [array of goals]
📡 Calling aiService.generateRecipes...
🔧 aiService.generateRecipes called
📋 Request: {count: 1, hasCustomPrompt: true, customPrompt: "healthy chicken salad", healthGoals: [...]}
🔄 Recipe generation attempt 1/2
📝 Generated prompt (first 200 chars): [prompt preview]
🤖 Using provider: ollama
📡 Calling Ollama API...
📊 Progress chunk received (multiple times)
✅ Received response: [number] characters
✅ Recipe generated successfully: [Recipe Title]
🖼️ Image URL: [image URL]
✅ Custom recipe added to list
```

### 4. Common Issues and Solutions

#### Issue: "❌ Response not successful or no recipes"
**Possible causes:**
- Ollama not running
- Recipe validation failed
- JSON parsing error

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test recipe generation
node scripts/test-recipe-generation.js "your recipe description"
```

#### Issue: "❌ Custom recipe generation failed: TypeError"
**Possible causes:**
- Network error calling Ollama
- Invalid response format

**Check:**
- Look for the error message in console
- Check if Ollama is accessible at http://localhost:11434

#### Issue: Recipe generates but doesn't appear
**Possible causes:**
- Recipe not added to state
- Component not re-rendering

**Check:**
- Look for "✅ Custom recipe added to list" log
- Refresh the page to see if recipe was cached

#### Issue: "Failed to generate custom recipe. Please try again."
**This is the generic error message. Look earlier in the console for:**
- The actual error that occurred
- Stack trace showing where it failed

### 5. Manual Test Commands

#### Test Ollama Connection:
```bash
curl -X POST http://localhost:11434/api/generate \
  -d '{"model": "gemma3:1b", "prompt": "Say hello", "stream": false}'
```

#### Test Recipe Generation:
```bash
node scripts/test-recipe-generation.js "spicy chicken tacos"
```

#### Check Generated Images:
```bash
ls -lh public/images/recipes/
```

### 6. Expected Behavior

**Success Flow:**
1. User enters description and clicks "Generate Recipe"
2. Purple card shows "Generating..." with spinner
3. After 5-10 seconds, new recipe card appears at the top
4. Recipe has placeholder image (colored based on meal type)
5. Recipe can be clicked to view details

**Generation Time:**
- Text generation: 3-5 seconds
- Image generation: Skipped for custom recipes (instant placeholder)
- Total: 3-5 seconds

### 7. Troubleshooting Steps

1. **Check Ollama is running:**
   ```bash
   ollama list
   ```

2. **Verify gemma3:1b model is available:**
   ```bash
   ollama list | grep gemma3
   ```

3. **Test generation outside browser:**
   ```bash
   node scripts/test-recipe-generation.js "test recipe"
   ```

4. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

5. **Restart dev server:**
   ```bash
   npm run dev
   ```

### 8. Report the Issue

If still not working, share:
1. Screenshot of browser console logs
2. Output of `node scripts/test-recipe-generation.js "test"`
3. Output of `curl http://localhost:11434/api/tags`
4. The exact error message you see

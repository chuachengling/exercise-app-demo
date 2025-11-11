# Recipe Generation Fix - CORS Issue Resolved

## Problem
The browser was unable to call Ollama directly at `http://localhost:11434` due to CORS (Cross-Origin Resource Sharing) restrictions. Browsers block requests from `http://localhost:3000` (Next.js) to `http://localhost:11434` (Ollama) for security reasons.

## Solution
Created a Next.js API route that acts as a proxy between the browser and Ollama.

## Changes Made

### 1. Created API Proxy Route
**File:** `src/app/api/ollama/route.ts`
- Handles GET requests to check Ollama availability
- Handles POST requests to proxy recipe generation
- Forwards streaming responses from Ollama to the browser

### 2. Updated AI Configuration
**File:** `src/lib/config/ai.ts`
```diff
- baseUrl: 'http://localhost:11434',
+ baseUrl: '/api/ollama',
```

### 3. Updated AI Service
**File:** `src/lib/services/aiService.ts`
- Modified `generateRecipesWithOllama()` to handle both direct URLs and API routes
- Enhanced `checkOllamaAvailability()` with better logging
- Added error details in responses

### 4. Added Comprehensive Logging
All components now log detailed information:
- CreateRecipeCard: Form submission
- useRecipes: Generation flow
- aiService: API calls and responses

## How It Works Now

```
Browser (localhost:3000)
    ↓
Next.js API Route (/api/ollama)
    ↓
Ollama (localhost:11434)
    ↓
AI Response
    ↓
Next.js API Route
    ↓
Browser
```

## Testing

### Test API Availability:
```bash
curl http://localhost:3000/api/ollama
# Expected: {"available":true,"models":["gemma3:1b",...]}
```

### Test Recipe Generation:
```bash
curl -X POST http://localhost:3000/api/ollama \
  -H "Content-Type: application/json" \
  -d '{"model":"gemma3:1b","prompt":"Create a recipe","stream":false}'
```

## Expected Behavior

1. **Page Load**: Recipes page loads instantly with 12 cached recipes
2. **Custom Recipe**:
   - Click purple "Create Custom Recipe" card
   - Enter description (e.g., "spicy chicken tacos")
   - Click "Generate Recipe"
   - Wait 3-5 seconds
   - New recipe appears at top of list

3. **Console Logs** (in browser F12):
```
📝 CreateRecipeCard: Form submitted
🚀 Starting custom recipe generation...
🔧 aiService.generateRecipes called
📡 Calling Ollama via: /api/ollama
✅ Received response: 1234 characters
✅ Recipe generated successfully: Spicy Chicken Tacos
```

## Troubleshooting

### Still seeing "Failed to generate recipes"?

1. **Check API route is working:**
   ```bash
   curl http://localhost:3000/api/ollama
   ```
   Should return: `{"available":true,"models":[...]}`

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for network errors
   - Check for detailed error logs

3. **Verify Ollama is running:**
   ```bash
   ollama list
   ```

4. **Restart dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## Benefits

✅ **CORS Resolved**: Browser can now call Ollama through Next.js proxy
✅ **Faster Development**: No need for CORS configuration
✅ **Better Debugging**: All logs visible in terminal and browser
✅ **Secure**: API route can add authentication/rate limiting in future
✅ **Production Ready**: Can easily switch to hosted AI service

## Next Steps

If you're still having issues:
1. Open browser console (F12)
2. Try creating a custom recipe
3. Copy all console logs
4. Share the error message

The detailed logging will show exactly where the issue is occurring!

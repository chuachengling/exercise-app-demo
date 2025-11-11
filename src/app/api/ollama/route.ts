import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 Proxying request to Ollama:', {
      model: body.model,
      promptLength: body.prompt?.length || 0,
      stream: body.stream,
    });

    // Forward the request to Ollama
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!ollamaResponse.ok) {
      console.error('❌ Ollama API error:', ollamaResponse.statusText);
      return NextResponse.json(
        { error: `Ollama API error: ${ollamaResponse.statusText}` },
        { status: ollamaResponse.status }
      );
    }

    console.log('✅ Ollama response received, status:', ollamaResponse.status);

    // If streaming, return the stream
    if (body.stream) {
      console.log('📡 Streaming response to client...');
      
      // Create a passthrough stream
      const stream = new ReadableStream({
        async start(controller) {
          const reader = ollamaResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log('✅ Stream completed');
                controller.close();
                break;
              }
              controller.enqueue(value);
            }
          } catch (error) {
            console.error('❌ Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Otherwise return JSON
    console.log('📦 Returning JSON response');
    const data = await ollamaResponse.json();
    console.log('✅ Response data received:', { responseLength: JSON.stringify(data).length });
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check Ollama availability
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (!response.ok) {
      return NextResponse.json(
        { available: false, error: 'Ollama not responding' },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      available: true,
      models: data.models?.map((m: any) => m.name) || [],
    });
  } catch (error) {
    return NextResponse.json(
      { available: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    );
  }
}

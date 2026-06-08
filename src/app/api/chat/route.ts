import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje es requerido' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Si no hay API Key, devolvemos un mensaje de modo demostración
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "Hola! Soy el núcleo de RZStudio. Actualmente estoy en modo demostración. Configura la ANTHROPIC_API_KEY para habilitar mi cerebro completo.",
        mode: 'demo'
      });
    }

    // Integración real con Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [{ role: "user", content: message }],
        system: "Eres el asistente experto de RZStudio. Responde de forma profesional, tecnológica y amable. Tu objetivo es ayudar a los clientes a entender cómo la IA de RZStudio puede mejorar sus negocios."
      })
    });

    const data = await response.json();
    
    return NextResponse.json({ 
      reply: data.content[0].text,
      mode: 'live'
    });

  } catch (error) {
    console.error('Error en Chat API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getActiveKey } from '@/lib/runtime-key';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body as { message?: string; history?: ChatMessage[] };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensaje es requerido' }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Mensaje demasiado largo' }, { status: 400 });
    }

    const apiKey = getActiveKey();

    if (!apiKey) {
      return NextResponse.json({
        reply: 'hola. soy el núcleo de rzstudio en modo demostración. configura la anthropic_api_key para habilitar mi cerebro completo.',
        mode: 'demo',
      });
    }

    // Build conversation history (cap at MAX_HISTORY_TURNS to control token spend)
    const safeHistory: ChatMessage[] = Array.isArray(history)
      ? history.slice(-MAX_HISTORY_TURNS).filter(
          (m) => m.role && m.content && typeof m.content === 'string',
        )
      : [];

    const messages: ChatMessage[] = [
      ...safeHistory,
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system:
          'Eres el asistente experto de RZStudio. Responde de forma concisa, profesional y con estilo terminal — usa minúsculas cuando sea apropiado. Tu objetivo es ayudar a los visitantes a entender cómo la IA de RZStudio puede potenciar sus proyectos. Sé directo y evita respuestas genéricas.',
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return NextResponse.json(
        { error: 'Error al conectar con el modelo' },
        { status: 502 },
      );
    }

    const data = await response.json();
    const reply: string = data?.content?.[0]?.text ?? 'respuesta no disponible.';

    return NextResponse.json({ reply, mode: 'live' });
  } catch (error) {
    console.error('Error en Chat API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

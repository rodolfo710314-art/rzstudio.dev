import { NextRequest, NextResponse } from 'next/server';
import { getActiveKey } from '@/lib/runtime-key';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { recordUsage, getDailyTokens } from '@/lib/usage';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 10;

// Blindaje del chat público (riesgo #1 del análisis):
// - rate limit por IP
// - tope diario global de tokens — al alcanzarse degrada a modo demo
const RATE_MAX_PER_MIN = 10;
const DAILY_TOKEN_CAP = parseInt(process.env.RZ_CHAT_DAILY_TOKEN_CAP ?? '150000', 10);
const CHAT_PROJECT_ID = 'chat-publico';

const DEMO_REPLY =
  'hola. soy el núcleo de rzstudio en modo demostración — el cupo de conversación de hoy se agotó. vuelve mañana o escríbenos por el formulario de contacto.';

export async function POST(req: NextRequest) {
  try {
    // Rate limit por IP
    const ip = clientIp(req);
    const rate = checkRateLimit(`chat:${ip}`, RATE_MAX_PER_MIN, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'demasiados mensajes — espera un momento' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

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

    // Tope diario global — protege el presupuesto de la cuenta
    if (getDailyTokens(CHAT_PROJECT_ID) >= DAILY_TOKEN_CAP) {
      return NextResponse.json({ reply: DEMO_REPLY, mode: 'demo' });
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

    // Cost Governor: el chat público también se contabiliza
    recordUsage({
      projectId:    CHAT_PROJECT_ID,
      agent:        'chat',
      model:        'claude-sonnet-4-6',
      inputTokens:  data?.usage?.input_tokens ?? 0,
      outputTokens: data?.usage?.output_tokens ?? 0,
    });

    return NextResponse.json({ reply, mode: 'live' });
  } catch (error) {
    console.error('Error en Chat API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

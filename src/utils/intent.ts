export type Intent = 'approve' | 'reject' | 'neutral';

// Multi-word patterns matched via substring
const APPROVAL_PATTERNS = [
  'apruebo', 'acepto', 'sí', 'confirmo', 'procede', 'ejecuta',
  'merge', 'adelante', 'aplicar', 'aplica', 'correcto',
];
// Short words matched as whole words to avoid false positives ('si' inside 'sistema', etc.)
const APPROVAL_WORDS = ['si', 'sí'];

const REJECTION_PATTERNS = [
  'rechazo', 'cancela', 'detén', 'detente', 'purga', 'revertir',
  'abortar', 'aborta', 'rechazar', 'no aplica', 'no procede',
];
const REJECTION_WORDS = ['no'];

export function detectIntent(text: string): Intent {
  const lower = text.toLowerCase().trim();
  const words = lower.split(/\s+/);

  if (
    APPROVAL_PATTERNS.some((p) => lower.includes(p)) ||
    APPROVAL_WORDS.some((w) => words.includes(w))
  )
    return 'approve';

  if (
    REJECTION_PATTERNS.some((p) => lower.includes(p)) ||
    REJECTION_WORDS.some((w) => words.includes(w))
  )
    return 'reject';

  return 'neutral';
}

export const SYSTEM_RESPONSES: Record<Intent, string[]> = {
  approve: [
    '> [NLP] intención detectada: APROBACIÓN.',
    '> [MERGE] validando checksums del diff... integridad ✓',
    '> [EXEC] ejecutando merge en rama principal.',
    '> [LOG] cambio registrado en el historial de auditoría.',
  ],
  reject: [
    '> [NLP] intención detectada: RECHAZO.',
    '> [PURGE] abortando merge. restaurando estado HEAD.',
    '> [CLEAN] entorno de prueba eliminado.',
    '> [LOG] decisión registrada en el log de auditoría.',
  ],
  neutral: [
    '> [NLP] analizando respuesta...',
    '> puedes revisar el diff en el panel izquierdo.',
    '> escribe "apruebo" para ejecutar el merge o "rechazo" para purgar el entorno.',
  ],
};

export const QUICK_SUGGESTIONS: { label: string; intent: Intent }[] = [
  { label: 'apruebo', intent: 'approve' },
  { label: 'rechazo', intent: 'reject' },
  { label: 'revisar diff', intent: 'neutral' },
];

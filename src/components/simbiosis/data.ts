export type ProjectStatus = 'live' | 'standby';
export type ProjectPlatform = 'web' | 'android' | 'both';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  statusLabel: string;
  latency: string;
  tokens: string;
  agent: string;
  platform: ProjectPlatform;
  auditLogs: string[];
  codeDiff: { old: string[]; new: string[] };
}

export const PROJECTS: Project[] = [
  {
    id: '00',
    name: 'rzstudio.dev — núcleo vivo',
    description: 'tarjeta cero del meta-laboratorio: la propia plataforma auditándose a sí misma de forma recursiva, con blindaje de auto-destrucción y umbrales de veto absolutos.',
    status: 'live',
    statusLabel: 'Auto-auditoría recursiva del núcleo en curso...',
    latency: '41ms',
    tokens: '6.3k',
    agent: 'rz-meta-v1',
    platform: 'web',
    auditLogs: [
      '> [META] Manifiesto raíz .rz-manifest.json cargado.',
      '> [SHIELD] Blindaje meta-laboratorio activo. Tolerancia: 0.',
      '> [SCAN] Auditando rutas de admin y sesiones firmadas...',
      '> [OK] Cero advertencias de linting en el último ciclo.',
      '> [WATCH] Vigilancia del juez de hierro: implacable.',
    ],
    codeDiff: {
      old: [
        'export const config = {',
        '  matcher: ["/admin/:path*"],',
        '};',
      ],
      new: [
        'export const config = {',
        '  // protege dashboard, deja libre el login',
        '  matcher: ["/admin/dashboard/:path*"],',
        '};',
      ],
    },
  },
  {
    id: '01',
    name: 'agente autónomo de auditoría',
    description: 'motor de análisis de código que detecta y corrige deuda técnica en tiempo real usando razonamiento multi-paso.',
    status: 'live',
    statusLabel: 'Investigando patrones de deuda técnica...',
    latency: '84ms',
    tokens: '2.4k',
    agent: 'rz-auditor-v3',
    platform: 'web',
    auditLogs: [
      '> [INIT] Motor de análisis iniciado.',
      '> [SCAN] Analizando 1,247 líneas de código fuente...',
      '> [WARN] Complejidad ciclomática elevada detectada.',
      '> [FIX] Generando refactor sugerido para tokenize().',
      '> [DIFF] Propuesta lista. Reducción de complejidad: 67%.',
    ],
    codeDiff: {
      old: [
        'function tokenize(input, opts) {',
        '  if (!input) return null;',
        '  if (opts && opts.strict) {',
        '    if (!validate(input)) throw new Error("invalid");',
        '  }',
        '  return parse(input, opts);',
        '}',
      ],
      new: [
        'const tokenize = (input: string, opts?: TokenOpts) => {',
        '  if (!input) return null;',
        '  if (opts?.strict && !validate(input))',
        '    throw new TokenError("invalid input");',
        '  return parse(input, opts);',
        '};',
      ],
    },
  },
  {
    id: '02',
    name: 'motor de análisis predictivo',
    description: 'predice cuellos de botella de rendimiento antes de que impacten producción usando series temporales y LLM.',
    status: 'live',
    statusLabel: 'Monitoreando métricas de latencia en tiempo real...',
    latency: '127ms',
    tokens: '3.1k',
    agent: 'rz-predictor-v2',
    platform: 'both',
    auditLogs: [
      '> [INIT] Serie temporal activada. Ventana: 72h.',
      '> [DATA] Capturando 340 métricas de latencia...',
      '> [ML] Modelo LSTM procesando patrones de carga...',
      '> [ALERT] Anomalía en /api/embeddings detectada.',
      '> [PRED] Pico crítico en T+4h. Confidence: 91%.',
    ],
    codeDiff: {
      old: [
        'app.get("/api/embeddings", async (req, res) => {',
        '  const result = await generateEmbeddings(req.body);',
        '  res.json(result);',
        '});',
      ],
      new: [
        'app.get("/api/embeddings",',
        '  rateLimiter({ max: 100, window: "1m" }),',
        '  cache({ ttl: 300 }),',
        '  async (req, res) => {',
        '    const result = await generateEmbeddings(req.body);',
        '    res.json(result);',
        '  }',
        ');',
      ],
    },
  },
  {
    id: '03',
    name: 'compilador polimórfico',
    description: 'adapta la arquitectura del bundle en tiempo de build según el perfil de hardware del cliente destino.',
    status: 'standby',
    statusLabel: 'Última auditoría: build #4291 completado.',
    latency: '203ms',
    tokens: '5.7k',
    agent: 'rz-compiler-v4',
    platform: 'web',
    auditLogs: [
      '> [STANDBY] Motor en estado de espera.',
      '> [LAST] Compilación #4291 completada sin errores.',
      '> [STATS] Bundle size reducido 34% vs versión anterior.',
      '> [CFG] Perfil ESSENTIAL optimizado para 512MB RAM.',
      '> [READY] Aguardando próximo trigger de build.',
    ],
    codeDiff: {
      old: [
        'export default withBundleAnalyzer({',
        '  reactStrictMode: true,',
        '});',
      ],
      new: [
        'export default withPolymorphicCompiler({',
        '  reactStrictMode: true,',
        '  profiles: ["essential", "balanced", "ultra"],',
        '  adaptiveChunking: true,',
        '});',
      ],
    },
  },
  {
    id: '04',
    name: 'sistema rag de alta densidad',
    description: 'base de conocimiento vectorial con recuperación semántica híbrida BM25 + embedding para baja latencia.',
    status: 'live',
    statusLabel: 'Indexando documentos en el vector store...',
    latency: '56ms',
    tokens: '8.2k',
    agent: 'rz-rag-v5',
    platform: 'web',
    auditLogs: [
      '> [INIT] Vector store Chroma activado.',
      '> [INDEX] Procesando 1,892 documentos nuevos...',
      '> [EMBED] Modelo text-embedding-3-large en uso.',
      '> [HYBRID] BM25 + cosine similarity fusionados.',
      '> [PERF] Latencia P99: 56ms. Target: <100ms ✓',
    ],
    codeDiff: {
      old: [
        'const results = await vectorStore.search(query);',
        'return results.slice(0, 5);',
      ],
      new: [
        'const [semantic, keyword] = await Promise.all([',
        '  vectorStore.semanticSearch(query, { k: 10 }),',
        '  bm25Index.search(query, { k: 10 }),',
        ']);',
        'return hybridRank([semantic, keyword]).slice(0, 5);',
      ],
    },
  },
  {
    id: '05',
    name: 'orquestador multi-agente',
    description: 'coordina redes de agentes especializados con planificación dinámica, rollback automático y verificación cruzada.',
    status: 'standby',
    statusLabel: 'Última ejecución: ciclo de 8 agentes completado.',
    latency: '342ms',
    tokens: '12.1k',
    agent: 'rz-orchestrator-v2',
    platform: 'both',
    auditLogs: [
      '> [STANDBY] Orquestador en reposo. Agentes: 8/8 listos.',
      '> [LAST] Ciclo #291: 8 agentes coordinados con éxito.',
      '> [PLAN] Árbol de tareas profundidad-5 ejecutado.',
      '> [RB] 0 rollbacks en las últimas 48h.',
      '> [VERIFY] Cross-check entre agentes: 100% coherente.',
    ],
    codeDiff: {
      old: [
        'for (const task of tasks) {',
        '  const result = await singleAgent.run(task);',
        '  results.push(result);',
        '}',
      ],
      new: [
        'const plan = await orchestrator.plan(tasks);',
        'const results = await orchestrator.execute(plan, {',
        '  agents: specializedAgents,',
        '  verify: true,',
        '  rollback: "auto",',
        '});',
      ],
    },
  },
  {
    id: '06',
    name: 'interfaz cognitiva adaptativa',
    description: 'UI que reconfigura su layout, densidad de información y paleta en tiempo real según el modelo mental del usuario.',
    status: 'live',
    statusLabel: 'Calibrando perfil cognitivo del usuario activo...',
    latency: '23ms',
    tokens: '1.8k',
    agent: 'rz-cognitivo-v1',
    platform: 'android',
    auditLogs: [
      '> [INIT] Sensor de atención cognitiva activo.',
      '> [TRACK] Patrón de scroll: perfil experto detectado.',
      '> [ADAPT] Aumentando densidad de información +30%.',
      '> [UI] Colapsando onboarding, expandiendo data layer.',
      '> [CONF] Perfil "dev-pro" aplicado. Score: 94/100.',
    ],
    codeDiff: {
      old: [
        '<Layout density="default">',
        '  <Onboarding show={true} />',
        '  <Dashboard simplified />',
        '</Layout>',
      ],
      new: [
        '<CognitiveLayout',
        '  profile={userProfile}',
        '  density="adaptive"',
        '>',
        '  <Dashboard density="expert" />',
        '</CognitiveLayout>',
      ],
    },
  },
];

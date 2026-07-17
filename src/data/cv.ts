export type SectionId =
  | 'perfil'
  | 'habilidades'
  | 'experiencia'
  | 'proyectos'
  | 'educacion'
  | 'certificaciones'
  | 'perfiles'
  | 'cv'
  | 'contacto'

export type CarPart = {
  id: SectionId
  label: string
  hint: string
}

export const PROFILE = {
  name: 'Paulo César Vicencio Tello',
  title: 'Ingeniero Civil Informático',
  tagline: 'IA, Desarrollo Fullstack, Machine Learning para análisis de datos y automatización.',
  location: 'Villa Alemana, Valparaíso, Chile',
  email: 'paulocevite@gmail.com',
  phone: '+56 9 5447 5075',
  phoneHref: 'tel:+56954475075',
  linkedin: 'https://www.linkedin.com/in/paulovicenciotello/',
  github: 'https://github.com/Pillaulo',
  cvEs: '/cv/es/CV-Paulo-Vicencio.pdf',
  cvEn: '/cv/en/CV-Paulo-Vicencio.pdf',
} as const

export const CAR_PARTS: CarPart[] = [
  { id: 'perfil', label: 'PERFIL PROFESIONAL', hint: 'Capó / motor' },
  { id: 'habilidades', label: 'HABILIDADES', hint: 'Puertas' },
  { id: 'experiencia', label: 'EXPERIENCIA', hint: 'Body kit' },
  { id: 'proyectos', label: 'PROYECTOS', hint: 'Ruedas' },
  { id: 'educacion', label: 'EDUCACIÓN', hint: 'Techo' },
  { id: 'certificaciones', label: 'CERTIFICACIONES', hint: 'Alerón' },
  { id: 'perfiles', label: 'PERFILES', hint: 'Faros' },
  { id: 'cv', label: 'DESCARGAR CV', hint: 'Matrícula' },
  { id: 'contacto', label: 'CONTACTO', hint: 'Escape' },
]

/** Y rotation so each part faces the camera (camera looks from +Z). */
export const PART_FOCUS_Y: Record<SectionId, number> = {
  perfiles: -Math.PI / 2,
  perfil: -Math.PI / 2.2,
  habilidades: 0.15,
  experiencia: 0.45,
  proyectos: Math.PI * 0.35,
  educacion: -0.35,
  certificaciones: Math.PI / 2,
  cv: Math.PI / 1.85,
  contacto: Math.PI / 1.7,
}

export const MENU_ICONS: Record<SectionId, string> = {
  perfil: '◆',
  habilidades: '▣',
  experiencia: '▤',
  proyectos: '◎',
  educacion: '▲',
  certificaciones: '★',
  perfiles: '◉',
  cv: '☰',
  contacto: '✉',
}

export const SECTIONS: Record<
  SectionId,
  { title: string; body: string; items?: string[]; links?: { label: string; href: string }[] }
> = {
  perfil: {
    title: 'Perfil profesional',
    body: `${PROFILE.name}. ${PROFILE.title} titulado en la Universidad Andrés Bello, con experiencia en desarrollo web fullstack y proyectos de Inteligencia Artificial, Machine Learning y Ciencia de Datos. He diseñado e implementado sistemas reales: plataformas asistidas por IA, APIs REST con autenticación JWT, bases de datos relacionales y visualización de datos. Destaco por capacidad de aprendizaje, trabajo en equipo y soluciones escalables orientadas a resultados. ${PROFILE.tagline}`,
  },
  habilidades: {
    title: 'Habilidades técnicas',
    body: 'Stack y herramientas:',
    items: [
      'Lenguajes: Python, TypeScript, JavaScript, Java, C++',
      'Frontend: Angular, React, HTML, CSS, SCSS',
      'Backend: FastAPI, Node.js, Laravel',
      'Bases de datos: PostgreSQL, SQL',
      'Automatización: Docker, n8n, IA para tareas repetitivas',
      'IA: diseño de prompts, evaluación de modelos, Vibe Coding, investigación',
      'Data Science / ML: scikit-learn, TensorFlow, Keras, Pandas, SHAP',
      'Herramientas: Git, GitHub, Docker, Power BI, Jira, Trello',
      'Otros: APIs REST, arquitectura cliente-servidor, integración de servicios, visualización de datos',
    ],
  },
  experiencia: {
    title: 'Experiencia',
    body: 'Prácticas profesionales:',
    items: [
      'Ene 2026 – Mar 2026 · Práctica profesional · ITISB (remoto) — Investigación en Vibe Coding y evaluación de modelos IA: pipelines de calidad/productividad, documentación y recomendaciones de implementación.',
      'Ago 2025 – Dic 2025 · Práctica · Universidad Andrés Bello (Viña del Mar) — Automatización de comunicaciones académicas con IA (n8n): contenido multi-red, selección de canal, historial en BD y menos trabajo manual.',
    ],
  },
  proyectos: {
    title: 'Proyectos destacados',
    body: 'Selección de builds (tesis, fullstack, ML):',
    items: [
      'Tesis — Análisis de trayectorias académicas (ML): clasificación de macro-áreas, F1-score, interpretabilidad con SHAP.',
      'Inteligencia territorial para seguridad ciudadana — Fullstack | GIS: mapas/heatmaps Leaflet+OSM, reportes anónimos, Supabase (Auth, PostgreSQL, RLS).',
      'Sistema de reportes de seguridad — Viña del Mar (Fullstack): mapas dinámicos, flujo de reportes, arquitectura lista para FastAPI.',
      'Predicción de resistencia del concreto (ML): regresión y redes con TensorFlow/Keras, EDA y tuning de hiperparámetros.',
      'Análisis de rendimiento CS:GO (ML): modelos supervisados, clustering K-Means, outliers con pandas/scikit-learn.',
      'Sistema de gestión de producción — API, CRUD y modelado de dominio orientado a escalabilidad.',
      'E-commerce — Fullstack con Laravel (MVC): auth, usuarios, productos y pedidos.',
    ],
    links: [{ label: 'GitHub · Pillaulo', href: PROFILE.github }],
  },
  educacion: {
    title: 'Educación',
    body: 'Universidad Andrés Bello · Viña del Mar, Chile · 2020 – 2025',
    items: [
      'Título profesional: Ingeniero Civil Informático (2025)',
      'Licenciado en Ciencias de la Ingeniería (2025)',
      'Bachiller en Ingeniería (2025)',
    ],
  },
  certificaciones: {
    title: 'Certificaciones',
    body: 'Credenciales recientes:',
    items: [
      '2026 · Foundations of Data Science — Google',
      '2025 · IBM Data Science Professional Certificate — IBM',
      '2025 · Generative AI: Elevate Your Data Science Career — IBM',
      '2025 · Data Scientist Career Guide and Interview Preparation — IBM',
      '2025 · GitHub Copilot para Principiantes — Coursera',
    ],
  },
  perfiles: {
    title: 'Perfiles',
    body: 'Enlaces públicos:',
    links: [
      { label: 'GitHub · Pillaulo', href: PROFILE.github },
      { label: 'LinkedIn · paulovicenciotello', href: PROFILE.linkedin },
      { label: `Email · ${PROFILE.email}`, href: `mailto:${PROFILE.email}` },
    ],
  },
  cv: {
    title: 'Curriculum',
    body: 'Descarga el CV completo en PDF (español o inglés).',
    links: [
      { label: 'Descargar CV (ES)', href: PROFILE.cvEs },
      { label: 'Download CV (EN)', href: PROFILE.cvEn },
    ],
  },
  contacto: {
    title: 'Contacto',
    body: `${PROFILE.name} · ${PROFILE.title} · ${PROFILE.location}`,
    links: [
      { label: `Email · ${PROFILE.email}`, href: `mailto:${PROFILE.email}` },
      { label: `Tel · ${PROFILE.phone}`, href: PROFILE.phoneHref },
      { label: 'LinkedIn', href: PROFILE.linkedin },
      { label: 'GitHub', href: PROFILE.github },
    ],
  },
}

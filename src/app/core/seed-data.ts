import { AboutSection, Experience, Project, SocialLink } from './portfolio.models';

export const seedExperiences: Experience[] = [
  {
    id: 'exp-apex-es',
    locale: 'es',
    company: 'Apex Systems',
    role: 'Fullstack Engineer',
    year: '2025 - Present',
    description: 'Desarrollo de plataforma logistica para distribucion de combustible utilizando Angular, microservicios .NET, AWS Lambda y automatizacion CI/CD con Jenkins.',
    tags: ['Angular', '.NET', 'AWS Lambda', 'CI/CD', 'Jenkins'],
    logoUrl: '',
    companyUrl: 'https://www.apexsystems.com',
    order: 1,
    isPublished: true,
  },
  {
    id: 'exp-bosch-es',
    locale: 'es',
    company: 'Robert Bosch',
    role: 'Tech Lead',
    year: '2023 - 2025',
    description: 'Liderazgo tecnico en modernizacion de sistemas legacy e iniciativas de secure coding basadas en CWE.',
    tags: ['.NET', 'Tech Lead', 'CWE', 'Secure Coding'],
    logoUrl: '',
    companyUrl: 'https://www.bosch.com',
    order: 2,
    isPublished: true,
  },
];

export const seedProjects: Project[] = [
  {
    id: 'pro-gymxer-es',
    type: 'professional',
    locale: 'es',
    category: 'Plataforma fitness',
    title: 'Gymxer',
    description: 'Aplicacion enfocada en rutinas, seguimiento y experiencias fitness con frontend moderno y arquitectura modular.',
    tags: ['Angular', 'UX', 'APIs'],
    logoUrl: '',
    projectUrl: '',
    order: 1,
    isPublished: true,
  },
  {
    id: 'personal-sticky-es',
    type: 'personal',
    locale: 'es',
    category: 'Plataforma de productividad',
    title: 'StickyNotes',
    description: 'Aplicacion minimalista enfocada en productividad personal, organizacion visual y captura rapida de ideas.',
    tags: ['Angular', 'UI/UX', 'Productivity'],
    logoUrl: '',
    projectUrl: '',
    order: 1,
    isPublished: true,
  },
];

export const seedAbout: AboutSection[] = [
  {
    id: 'about-approach-es',
    locale: 'es',
    title: 'Mi Enfoque',
    paragraphs: [
      'Me especializo en sistemas empresariales, APIs, arquitectura backend y experiencias frontend modernas.',
      'Me gusta construir productos mantenibles cuidando arquitectura, experiencia visual y claridad de codigo.',
    ],
    stack: ['Clean Architecture', 'APIs', 'Secure Coding', 'Cloud Platforms'],
    order: 1,
    isPublished: true,
  },
];

export const seedSocial: SocialLink[] = [
  {
    id: 'social-linkedin-es',
    locale: 'es',
    label: 'LinkedIn',
    value: 'linkedin.com/in/nicolasmarlu',
    link: 'https://linkedin.com/in/nicolasmarlu',
    description: 'Para oportunidades profesionales, colaboracion tecnica o proyectos.',
    order: 1,
    isPublished: true,
  },
  {
    id: 'social-github-es',
    locale: 'es',
    label: 'Github',
    value: 'github.com/nicolasmarlu',
    link: 'https://github.com/nicolasmarlu',
    description: 'Repositorios, experimentos, arquitectura y proyectos personales.',
    order: 2,
    isPublished: true,
  },
];

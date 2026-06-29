export type Locale = 'es' | 'en';
export type ProjectType = 'professional' | 'personal';
export type AdminSection = 'overview' | 'experiences' | 'projects' | 'about' | 'social' | 'settings';

export interface Experience {
  id: string;
  locale: Locale;
  company: string;
  role: string;
  year: string;
  description: string;
  tags: string[];
  logoUrl: string;
  companyUrl: string;
  order: number;
  isPublished: boolean;
}

export interface Project {
  id: string;
  type: ProjectType;
  locale: Locale;
  category: string;
  title: string;
  description: string;
  tags: string[];
  logoUrl: string;
  projectUrl: string;
  order: number;
  isPublished: boolean;
}

export interface AboutSection {
  id: string;
  locale: Locale;
  title: string;
  paragraphs: string[];
  stack: string[];
  order: number;
  isPublished: boolean;
}

export interface SocialLink {
  id: string;
  locale: Locale;
  label: string;
  value: string;
  link: string;
  description: string;
  order: number;
  isPublished: boolean;
}

export interface AdminStats {
  experiences: number;
  publishedExperiences: number;
  projects: number;
  publishedProjects: number;
  social: number;
  about: number;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';
import { AboutSection, AdminStats, Experience, Locale, Project, ProjectType, SocialLink } from './portfolio.models';

interface ApiDocument {
  _id?: string;
  id?: string;
}

interface AboutApiDocument {
  _id: string;
  locale: Locale;
  aboutSections: AboutSection[];
  profileInfo: Array<{ label: string; value: string; order: number; isPublished: boolean }>;
}

@Injectable({ providedIn: 'root' })
export class ContentStoreService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly experiencesState = signal<Experience[]>([]);
  private readonly projectsState = signal<Project[]>([]);
  private readonly aboutState = signal<AboutSection[]>([]);
  private readonly socialState = signal<SocialLink[]>([]);
  private readonly statsState = signal<AdminStats | null>(null);
  private aboutDocuments = new Map<Locale, AboutApiDocument>();

  readonly experiences = computed(() => this.sort(this.experiencesState()));
  readonly projects = computed(() => this.sort(this.projectsState()));
  readonly about = computed(() => this.sort(this.aboutState()));
  readonly social = computed(() => this.sort(this.socialState()));
  readonly stats = computed(() => this.statsState());
  readonly publishedCount = computed(() => [
    ...this.experiencesState(),
    ...this.projectsState(),
    ...this.aboutState(),
    ...this.socialState(),
  ].filter((item) => item.isPublished).length);

  async loadAll(): Promise<void> {
    await Promise.all([
      this.loadExperiences(),
      this.loadProjects(),
      this.loadSocial(),
      this.loadAbout('es'),
      this.loadAbout('en'),
      this.loadStats(),
    ]);
  }

  async loadStats(): Promise<void> {
    this.statsState.set(await firstValueFrom(this.http.get<AdminStats>(`${API_BASE_URL}/admin/stats`, this.options())));
  }

  async loadExperiences(): Promise<void> {
    const items = await firstValueFrom(this.http.get<Experience[]>(`${API_BASE_URL}/admin/experiences`, this.options()));
    this.experiencesState.set(items.map((item) => this.withId(item)));
  }

  async loadProjects(): Promise<void> {
    const items = await firstValueFrom(this.http.get<Project[]>(`${API_BASE_URL}/admin/projects`, this.options()));
    this.projectsState.set(items.map((item) => this.withId(item)));
  }

  async loadSocial(): Promise<void> {
    const items = await firstValueFrom(this.http.get<SocialLink[]>(`${API_BASE_URL}/admin/social`, this.options()));
    this.socialState.set(items.map((item) => this.withId(item)));
  }

  async loadAbout(locale: Locale): Promise<void> {
    const about = await firstValueFrom(this.http.get<AboutApiDocument>(`${API_BASE_URL}/admin/about?locale=${locale}`, this.options()));

    if (!about) {
      return;
    }

    this.aboutDocuments.set(locale, about);
    const sections = about.aboutSections.map((section, index) => ({
      ...section,
      id: `${locale}-about-${index + 1}`,
      locale,
    }));
    this.aboutState.update((items) => [...items.filter((item) => item.locale !== locale), ...sections]);
  }

  async saveExperience(item: Experience): Promise<void> {
    const saved = item.id
      ? await firstValueFrom(this.http.put<Experience>(`${API_BASE_URL}/admin/experiences/${item.id}`, item, this.options()))
      : await firstValueFrom(this.http.post<Experience>(`${API_BASE_URL}/admin/experiences`, item, this.options()));
    this.upsert(this.experiencesState, this.withId(saved));
    await this.loadStats();
  }

  async saveProject(item: Project): Promise<void> {
    const saved = item.id
      ? await firstValueFrom(this.http.put<Project>(`${API_BASE_URL}/admin/projects/${item.id}`, item, this.options()))
      : await firstValueFrom(this.http.post<Project>(`${API_BASE_URL}/admin/projects`, item, this.options()));
    this.upsert(this.projectsState, this.withId(saved));
    await this.loadStats();
  }

  async saveAbout(item: AboutSection): Promise<void> {
    const current = this.aboutDocuments.get(item.locale);
    const sections = this.aboutState()
      .filter((section) => section.locale === item.locale && section.id !== item.id)
      .concat(item)
      .sort((a, b) => a.order - b.order)
      .map(({ title, paragraphs, stack, order, isPublished }) => ({ title, paragraphs, stack, order, isPublished }));

    const saved = await firstValueFrom(this.http.put<AboutApiDocument>(`${API_BASE_URL}/admin/about`, {
      locale: item.locale,
      aboutSections: sections,
      profileInfo: current?.profileInfo ?? [],
    }, this.options()));

    this.aboutDocuments.set(item.locale, saved);
    await this.loadAbout(item.locale);
    await this.loadStats();
  }

  async saveSocial(item: SocialLink): Promise<void> {
    const saved = item.id
      ? await firstValueFrom(this.http.put<SocialLink>(`${API_BASE_URL}/admin/social/${item.id}`, item, this.options()))
      : await firstValueFrom(this.http.post<SocialLink>(`${API_BASE_URL}/admin/social`, item, this.options()));
    this.upsert(this.socialState, this.withId(saved));
    await this.loadStats();
  }

  async remove(collection: 'experiences' | 'projects' | 'about' | 'social', id: string): Promise<void> {
    if (collection === 'about') {
      const item = this.aboutState().find((section) => section.id === id);
      if (!item) return;
      const current = this.aboutDocuments.get(item.locale);
      const remaining = this.aboutState()
        .filter((section) => section.locale === item.locale && section.id !== id)
        .sort((a, b) => a.order - b.order)
        .map(({ title, paragraphs, stack, order, isPublished }) => ({ title, paragraphs, stack, order, isPublished }));

      const saved = await firstValueFrom(this.http.put<AboutApiDocument>(`${API_BASE_URL}/admin/about`, {
        locale: item.locale,
        aboutSections: remaining,
        profileInfo: current?.profileInfo ?? [],
      }, this.options()));

      this.aboutDocuments.set(item.locale, saved);
      await this.loadAbout(item.locale);
      await this.loadStats();
      return;
    }

    await firstValueFrom(this.http.delete(`${API_BASE_URL}/admin/${collection}/${id}`, this.options()));
    if (collection === 'experiences') {
      this.experiencesState.update((items) => items.filter((item) => item.id !== id));
    }

    if (collection === 'projects') {
      this.projectsState.update((items) => items.filter((item) => item.id !== id));
    }

    if (collection === 'social') {
      this.socialState.update((items) => items.filter((item) => item.id !== id));
    }
    await this.loadStats();
  }

  private options(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private withId<T extends ApiDocument>(item: T): T & { id: string } {
    return {
      ...item,
      id: item.id ?? item._id ?? crypto.randomUUID(),
    };
  }

  private upsert<T extends { id: string }>(target: { update: (fn: (items: T[]) => T[]) => void }, item: T): void {
    target.update((items) => items.some((current) => current.id === item.id)
      ? items.map((current) => current.id === item.id ? item : current)
      : [...items, item]);
  }

  private sort<T extends { order: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.order - b.order);
  }
}

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ContentStoreService } from '../../core/content-store.service';
import { AboutSection, AdminSection, Experience, Locale, Project, ProjectType, SocialLink } from '../../core/portfolio.models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(ContentStoreService);
  readonly auth = inject(AuthService);
  readonly toast = inject(ToastService);
  readonly isLoading = signal(false);

  readonly activeSection = signal<AdminSection>('overview');
  readonly activeLocale = signal<Locale>('es');
  readonly activeProjectType = signal<ProjectType>('professional');
  readonly editingExperience = signal<string | null>(null);
  readonly editingProject = signal<string | null>(null);
  readonly editingAbout = signal<string | null>(null);
  readonly editingSocial = signal<string | null>(null);

  readonly experiences = computed(() => this.store.experiences().filter((item) => item.locale === this.activeLocale()));
  readonly projects = computed(() => this.store.projects().filter((item) => item.locale === this.activeLocale() && item.type === this.activeProjectType()));
  readonly about = computed(() => this.store.about().filter((item) => item.locale === this.activeLocale()));
  readonly social = computed(() => this.store.social().filter((item) => item.locale === this.activeLocale()));
  readonly totalDrafts = computed(() => this.store.experiences().length + this.store.projects().length + this.store.about().length + this.store.social().length);

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.store.loadAll();
      this.toast.success('Contenido V2 cargado.');
    } catch {
      this.toast.error('No se pudo cargar el contenido V2. Revisa API, Mongo y token.');
    } finally {
      this.isLoading.set(false);
      this.clearForms();
    }
  }

  readonly experienceForm = this.fb.nonNullable.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    year: ['', Validators.required],
    description: ['', Validators.required],
    tags: [''],
    logoUrl: [''],
    companyUrl: [''],
    order: [1, Validators.required],
    isPublished: [true],
  });

  readonly projectForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],
    tags: [''],
    logoUrl: [''],
    projectUrl: [''],
    order: [1, Validators.required],
    isPublished: [true],
  });

  readonly aboutForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    paragraphs: [''],
    stack: [''],
    order: [1, Validators.required],
    isPublished: [true],
  });

  readonly socialForm = this.fb.nonNullable.group({
    label: ['', Validators.required],
    value: ['', Validators.required],
    link: ['', Validators.required],
    description: [''],
    order: [1, Validators.required],
    isPublished: [true],
  });

  setSection(section: AdminSection): void {
    this.activeSection.set(section);
  }

  setLocale(locale: Locale): void {
    this.activeLocale.set(locale);
    this.clearForms();
  }

  setProjectType(type: ProjectType): void {
    this.activeProjectType.set(type);
    this.cancelProject();
  }

  editExperience(item: Experience): void {
    this.editingExperience.set(item.id);
    this.experienceForm.setValue({
      company: item.company,
      role: item.role,
      year: item.year,
      description: item.description,
      tags: item.tags.join(', '),
      logoUrl: item.logoUrl,
      companyUrl: item.companyUrl,
      order: item.order,
      isPublished: item.isPublished,
    });
  }

  async saveExperience(): Promise<void> {
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      return;
    }

    const value = this.experienceForm.getRawValue();
    await this.store.saveExperience({
      id: this.editingExperience() ?? '',
      locale: this.activeLocale(),
      ...value,
      tags: this.toList(value.tags),
    });
    this.cancelExperience();
    this.toast.success('Experiencia guardada.');
  }

  editProject(item: Project): void {
    this.editingProject.set(item.id);
    this.projectForm.setValue({
      title: item.title,
      category: item.category,
      description: item.description,
      tags: item.tags.join(', '),
      logoUrl: item.logoUrl,
      projectUrl: item.projectUrl,
      order: item.order,
      isPublished: item.isPublished,
    });
  }

  async saveProject(): Promise<void> {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const value = this.projectForm.getRawValue();
    await this.store.saveProject({
      id: this.editingProject() ?? '',
      type: this.activeProjectType(),
      locale: this.activeLocale(),
      ...value,
      tags: this.toList(value.tags),
    });
    this.cancelProject();
    this.toast.success('Proyecto guardado.');
  }

  editAbout(item: AboutSection): void {
    this.editingAbout.set(item.id);
    this.aboutForm.setValue({
      title: item.title,
      paragraphs: item.paragraphs.join('\n'),
      stack: item.stack.join(', '),
      order: item.order,
      isPublished: item.isPublished,
    });
  }

  async saveAbout(): Promise<void> {
    if (this.aboutForm.invalid) {
      this.aboutForm.markAllAsTouched();
      return;
    }

    const value = this.aboutForm.getRawValue();
    await this.store.saveAbout({
      id: this.editingAbout() ?? crypto.randomUUID(),
      locale: this.activeLocale(),
      title: value.title,
      paragraphs: this.toParagraphs(value.paragraphs),
      stack: this.toList(value.stack),
      order: value.order,
      isPublished: value.isPublished,
    });
    this.cancelAbout();
    this.toast.success('Seccion About guardada.');
  }

  editSocial(item: SocialLink): void {
    this.editingSocial.set(item.id);
    this.socialForm.setValue({
      label: item.label,
      value: item.value,
      link: item.link,
      description: item.description,
      order: item.order,
      isPublished: item.isPublished,
    });
  }

  async saveSocial(): Promise<void> {
    if (this.socialForm.invalid) {
      this.socialForm.markAllAsTouched();
      return;
    }

    const value = this.socialForm.getRawValue();
    await this.store.saveSocial({
      id: this.editingSocial() ?? '',
      locale: this.activeLocale(),
      ...value,
    });
    this.cancelSocial();
    this.toast.success('Red social guardada.');
  }

  async remove(collection: 'experiences' | 'projects' | 'about' | 'social', id: string): Promise<void> {
    await this.store.remove(collection, id);
    this.toast.info('Registro eliminado.');
  }

  logout(): void {
    this.auth.logout();
    location.href = '/login';
  }

  cancelExperience(): void {
    this.editingExperience.set(null);
    this.experienceForm.reset({ company: '', role: '', year: '', description: '', tags: '', logoUrl: '', companyUrl: '', order: this.experiences().length + 1, isPublished: true });
  }

  cancelProject(): void {
    this.editingProject.set(null);
    this.projectForm.reset({ title: '', category: '', description: '', tags: '', logoUrl: '', projectUrl: '', order: this.projects().length + 1, isPublished: true });
  }

  cancelAbout(): void {
    this.editingAbout.set(null);
    this.aboutForm.reset({ title: '', paragraphs: '', stack: '', order: this.about().length + 1, isPublished: true });
  }

  cancelSocial(): void {
    this.editingSocial.set(null);
    this.socialForm.reset({ label: '', value: '', link: '', description: '', order: this.social().length + 1, isPublished: true });
  }

  private clearForms(): void {
    this.cancelExperience();
    this.cancelProject();
    this.cancelAbout();
    this.cancelSocial();
  }

  private toList(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  private toParagraphs(value: string): string[] {
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
}

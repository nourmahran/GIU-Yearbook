
import {
  Component,
  computed,
  inject,
  signal,
  OnInit
} from '@angular/core';

import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators
} from '@angular/forms';

import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student.service';
import { StoryDraftService } from '../../services/story-draft.service';
import { Student } from '../../models/student.model';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit, HasUnsavedChanges {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly studentService = inject(StudentService);
  private readonly draftService = inject(StoryDraftService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.currentUser;
  protected readonly student = signal<Student | null>(null);

  protected readonly saved = signal(false);
  protected readonly savedAt = signal<string | null>(null);
  protected readonly changed = signal(false);
  protected readonly storageError = signal(false);

  protected readonly published = signal(false);
  protected readonly publishError = signal('');

  protected readonly form = this.fb.group({
    quote: ['', [Validators.required, Validators.maxLength(160)]],
    story: ['', [Validators.maxLength(1000)]],
    moment: ['', [Validators.maxLength(200)]],
    next: ['', [Validators.maxLength(120)]],
    consent: [false],
  });

  protected readonly formValue = toSignal(
    this.form.valueChanges,
    { initialValue: this.form.getRawValue() }
  );

  protected readonly previewQuote = computed(
    () => this.formValue().quote || 'Your quote will appear here.'
  );

  ngOnInit(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.studentService.getStudents().subscribe({
      next: (students) => {
        const matchingStudent = students.find(
          (student) => student.id === currentUser.studentId
        );

        if (matchingStudent) {
          this.student.set(matchingStudent);

          this.form.patchValue({
            quote: matchingStudent.quote,
          });

          const draft = this.draftService.load(
            String(currentUser.studentId)
          );

          if (draft) {
            this.form.patchValue(draft.values);
            this.saved.set(true);
            this.savedAt.set(draft.savedAt);
          }

          const publishedProfile = this.draftService.loadPublished(String(currentUser.studentId));
          if (!draft && publishedProfile) {
            this.form.patchValue(publishedProfile.values);
            this.published.set(true);
          }

          this.changed.set(false);
        }
      },
      error: () => {
        this.storageError.set(true);
      },
    });

    this.form.valueChanges.subscribe(() => {
      this.changed.set(true);
      this.saved.set(false);
      this.published.set(false);
      this.publishError.set('');
    });
  }

  // Save drafts even if the form is incomplete
  protected saveDraft(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    try {
      const time = this.draftService.save(
        String(currentUser.studentId),
        this.form.getRawValue()
      );

      if (!time) {
        this.storageError.set(true);
        return;
      }
      this.savedAt.set(time);
      this.saved.set(true);
      this.changed.set(false);
      this.storageError.set(false);
    } catch {
      this.storageError.set(true);
    }
  }

  protected clearDraft(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    try {
      this.draftService.clear(String(currentUser.studentId));

      this.form.reset({
        quote: this.student()?.quote ?? '',
        story: '',
        moment: '',
        next: '',
        consent: false,
      });

      this.saved.set(false);
      this.changed.set(false);
      this.published.set(false);
      this.publishError.set('');
      this.storageError.set(false);
    } catch {
      this.storageError.set(true);
    }
  }

  // Publishing requires valid fields and consent
  protected publishProfile(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.publishError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.publishError.set(
        'Please complete the required fields before publishing.'
      );
      return;
    }

    if (!this.form.controls.consent.value) {
      this.form.controls.consent.markAsTouched();
      this.publishError.set(
        'You must agree to share your profile before publishing.'
      );
      return;
    }

    try {
      if (!this.draftService.publish(String(currentUser.studentId), this.form.getRawValue())) {
        this.publishError.set('Could not publish your profile. Please try again.');
        return;
      }

      this.published.set(true);
      this.saved.set(false);
      this.changed.set(false);
      this.storageError.set(false);
    } catch {
      this.publishError.set(
        'Could not publish your profile. Please try again.'
      );
    }
  }

  hasUnsavedChanges(): boolean {
    return this.changed();
  }

  protected signOut(): void {
    if (this.changed() && !window.confirm('You have unsaved changes. Sign out and discard them?')) {
      return;
    }
    this.auth.logout().subscribe({
      next: () => {
        this.changed.set(false);
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.storageError.set(true);
      },
    });
  }
}

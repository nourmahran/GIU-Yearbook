import { Injectable } from '@angular/core';
import { StoryDraft, StoredStoryDraft } from '../models/story-draft.model';

interface PublishedProfile {
  studentId: string;
  publishedAt: string;
  values: StoryDraft;
}

@Injectable({ providedIn: 'root' })
export class StoryDraftService {
  private key(studentId: string): string {
    return `giu:story-draft:${studentId}`;
  }

  private validValues(value: unknown): value is StoryDraft {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return ['quote', 'story', 'moment', 'next'].every(key => typeof v[key] === 'string')
      && typeof v['consent'] === 'boolean';
  }

  load(studentId: string): StoredStoryDraft | null {
    try {
      const raw = localStorage.getItem(this.key(studentId));
      const draft = raw ? JSON.parse(raw) : null;
      return draft && typeof draft.savedAt === 'string'
        && Number.isFinite(Date.parse(draft.savedAt)) && this.validValues(draft.values)
        ? draft : null;
    } catch {
      return null;
    }
  }

  save(studentId: string, values: StoryDraft): string | null {
    try {
      const draft: StoredStoryDraft = { savedAt: new Date().toISOString(), values };
      localStorage.setItem(this.key(studentId), JSON.stringify(draft));
      return draft.savedAt;
    } catch {
      return null;
    }
  }

  clear(studentId: string): void {
    localStorage.removeItem(this.key(studentId));
  }

  loadPublished(studentId: string): PublishedProfile | null {
    try {
      const raw = localStorage.getItem(`giu:published-profile:${studentId}`);
      const profile = raw ? JSON.parse(raw) : null;
      return profile && String(profile.studentId) === studentId
        && typeof profile.publishedAt === 'string'
        && Number.isFinite(Date.parse(profile.publishedAt)) && this.validValues(profile.values)
        ? profile : null;
    } catch {
      return null;
    }
  }

  publish(studentId: string, values: StoryDraft): boolean {
    try {
      const profile: PublishedProfile = { studentId, publishedAt: new Date().toISOString(), values };
      localStorage.setItem(`giu:published-profile:${studentId}`, JSON.stringify(profile));
      this.clear(studentId);
      return true;
    } catch {
      return false;
    }
  }
}

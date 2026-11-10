
export interface StoryDraft {
  quote: string;
  story: string;
  moment: string;
  next: string;
  consent: boolean;
}

export interface StoredStoryDraft {
  savedAt: string;
  values: StoryDraft;
}

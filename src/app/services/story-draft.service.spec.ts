import { StoryDraftService } from './story-draft.service';
import { vi } from 'vitest';

describe('StoryDraftService storage contract', () => {
  const service = new StoryDraftService();
  const values = { quote: '', story: 'Incomplete', moment: '', next: '', consent: false };
  let entries: Map<string, string>;
  beforeEach(() => {
    entries = new Map();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => entries.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => entries.set(key, value)),
      removeItem: vi.fn((key: string) => entries.delete(key)),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('round-trips an incomplete draft with its save time', () => {
    const time = service.save('1', values);
    expect(time).toBeTruthy();
    expect(service.load('1')).toEqual({ savedAt: time, values });
  });
  it('isolates students and only clears the requested draft', () => {
    service.save('1', values); service.save('2', { ...values, story: 'Second student' });
    service.clear('1');
    expect(service.load('1')).toBeNull();
    expect(service.load('2')?.values.story).toBe('Second student');
  });
  it('recovers from invalid JSON', () => {
    entries.set('giu:story-draft:1', '{');
    expect(service.load('1')).toBeNull();
  });
  it('rejects malformed values and invalid dates', () => {
    entries.set('giu:story-draft:1', JSON.stringify({ savedAt: 'bad date', values }));
    expect(service.load('1')).toBeNull();
    entries.set('giu:story-draft:1', JSON.stringify({ savedAt: new Date().toISOString(), values: {...values, quote:null} }));
    expect(service.load('1')).toBeNull();
  });
  it('returns null when reads are blocked', () => {
    vi.mocked(localStorage.getItem).mockImplementation(() => { throw new Error('blocked'); });
    expect(service.load('1')).toBeNull();
    expect(service.loadPublished('1')).toBeNull();
  });
  it('reports failed writes without deleting the draft', () => {
    service.save('1', values);
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error('full'); });
    expect(service.save('1', values)).toBeNull();
    expect(service.publish('1', values)).toBe(false);
    expect(service.load('1')?.values).toEqual(values);
  });
  it('stores a local publication and clears its draft', () => {
    service.save('1', values);
    expect(service.publish('1', {...values, quote:'Published',consent:true})).toBe(true);
    expect(service.load('1')).toBeNull();
    expect(service.loadPublished('1')?.values.quote).toBe('Published');
    expect(service.loadPublished('2')).toBeNull();
  });
  it('recovers from corrupted published JSON', () => {
    entries.set('giu:published-profile:1', '{');
    expect(service.loadPublished('1')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { applyWrite, parseData, parseWrite, MAX_BYTES } from '../gameSave';

describe('cloud save writes', () => {
  it('accepts a normal write', () => {
    expect(parseWrite({ base: 3, set: { records: { best: {} }, 'fiver-daily': {} }, del: ['look'] })).toEqual({ user: null, base: 3, set: { records: { best: {} }, 'fiver-daily': {} }, del: ['look'] });
  });
  it('refuses bookkeeping, tuning and odd keys', () => {
    expect(typeof parseWrite({ base: 0, set: { __sync: 1 } })).toBe('string');
    expect(typeof parseWrite({ base: 0, set: { 'tuning:ball': 1 } })).toBe('string');
    expect(typeof parseWrite({ base: 0, set: { 'bad key': 1 } })).toBe('string');
    expect(typeof parseWrite({ base: -1 })).toBe('string');
    expect(typeof parseWrite(null)).toBe('string');
  });
  it('applies sets and deletes', () => {
    expect(applyWrite({ a: 1, b: 2 }, { user: null, base: 0, set: { a: 5, c: 3 }, del: ['b'] })).toEqual({ a: 5, c: 3 });
  });
  it('refuses saves over the size cap', () => {
    expect(applyWrite({}, { user: null, base: 0, set: { big: 'x'.repeat(MAX_BYTES) }, del: [] })).toBe('Save is too big');
  });
  it('counts the size cap in bytes, not characters', () => {
    expect(applyWrite({}, { user: null, base: 0, set: { s: '🌻'.repeat(Math.floor(MAX_BYTES / 3)) }, del: [] })).toBe('Save is too big');
  });
  it('keeps the account the device meant', () => {
    expect((parseWrite({ base: 0, user: 'user_1' }) as { user: string }).user).toBe('user_1');
  });
  it('reads stored data safely', () => {
    expect(parseData('{"a":1}')).toEqual({ a: 1 });
    expect(parseData('nope')).toEqual({});
    expect(parseData('[1]')).toEqual({});
    expect(parseData(null)).toEqual({});
  });
});

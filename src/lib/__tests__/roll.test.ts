import { describe, expect, it } from '@jest/globals';

import { eligibleActivities, parseSource, pickActivity } from '../roll';
import type { Activity } from '../types';

const make = (id: string, location: Activity['location'], archived = false): Activity => ({
  id,
  name: id,
  emoji: '✨',
  location,
  archived,
  createdAt: 0,
});

const drums = make('drums', 'home');
const walk = make('walk', 'anywhere');
const old = make('old', 'anywhere', true);
const all = [drums, walk, old];

describe('eligibleActivities', () => {
  it('excludes archived activities', () => {
    expect(eligibleActivities(all, { source: 'manual', atHome: true })).toEqual([drums, walk]);
  });

  it('hides home-only activities when away', () => {
    expect(eligibleActivities(all, { source: 'manual', atHome: false })).toEqual([walk]);
    expect(eligibleActivities(all, { source: 'tiktok', atHome: false })).toEqual([walk]);
  });

  it('allows home-only activities for location triggers even if not marked home yet', () => {
    expect(eligibleActivities(all, { source: 'leaving-work', atHome: false })).toEqual([drums, walk]);
    expect(eligibleActivities(all, { source: 'arrived-home', atHome: false })).toEqual([drums, walk]);
  });
});

describe('pickActivity', () => {
  it('returns undefined for an empty list', () => {
    expect(pickActivity([])).toBeUndefined();
  });

  it('never repeats the previous pick when there is another option', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickActivity([drums, walk], 'drums')).toBe(walk);
    }
  });

  it('allows a repeat when it is the only option', () => {
    expect(pickActivity([drums], 'drums')).toBe(drums);
  });

  it('can land on every candidate', () => {
    const three = [drums, walk, make('read', 'anywhere')];
    expect(pickActivity(three, undefined, () => 0)).toBe(three[0]);
    expect(pickActivity(three, undefined, () => 0.99)).toBe(three[2]);
  });
});

describe('parseSource', () => {
  it('accepts known sources and falls back to manual', () => {
    expect(parseSource('tiktok')).toBe('tiktok');
    expect(parseSource('bogus')).toBe('manual');
    expect(parseSource(undefined)).toBe('manual');
  });
});

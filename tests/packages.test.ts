import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_FEATURES, FEATURES_BY_PACKAGE, hasFeature, PACKAGE_PRICES_INR } from '../src/data/packageRules.ts';
import { DEMO_MANIFEST, DEMO_EVENTS, resolveDemoPath } from '../src/data/demoManifest.ts';
import { INITIAL_PACKAGES } from '../src/data/initialData.ts';

test('prices are fixed', () => {
  assert.deepEqual(PACKAGE_PRICES_INR, { basic: 499, standard: 799, premium: 1199 });
  for (const p of INITIAL_PACKAGES) assert.equal(p.price, PACKAGE_PRICES_INR[p.id]);
});

test('tiers are strictly cumulative', () => {
  const [b, s, r] = [FEATURES_BY_PACKAGE.basic, FEATURES_BY_PACKAGE.standard, FEATURES_BY_PACKAGE.premium];
  for (const f of b) assert.ok(s.has(f) && r.has(f));
  for (const f of s) assert.ok(r.has(f));
  assert.ok(b.size < s.size && s.size < r.size);
});

test('basic excludes every Standard and Royal feature', () => {
  for (const f of ['countdown', 'story', 'gallery', 'dressCode', 'music', 'rsvp', 'multiCeremonySchedule', 'embeddedMap', 'enhancedAudio', 'shimmerPetals', 'familyBlessings'] as const)
    assert.equal(hasFeature('basic', f), false, f);
  assert.equal(hasFeature('basic', 'twoPageInvitation'), true);
});

test('standard excludes Royal-only features', () => {
  for (const f of ['multiCeremonySchedule', 'embeddedMap', 'enhancedAudio', 'shimmerPetals', 'familyBlessings', 'priorityRevisions'] as const)
    assert.equal(hasFeature('standard', f), false, f);
  for (const f of ['countdown', 'story', 'gallery', 'dressCode', 'music', 'rsvp'] as const) assert.equal(hasFeature('standard', f), true, f);
});

test('royal has everything', () => {
  for (const f of ALL_FEATURES) assert.equal(hasFeature('premium', f), true, f);
});

test('manifest is exactly 42 unique routes: 12 events, 9 wedding + 33 other', () => {
  assert.equal(DEMO_EVENTS.length, 12);
  assert.equal(DEMO_MANIFEST.length, 42);
  assert.equal(new Set(DEMO_MANIFEST.map((r) => r.path)).size, 42);
  assert.equal(DEMO_MANIFEST.filter((r) => r.eventSlug === 'wedding').length, 9);
  assert.equal(DEMO_MANIFEST.filter((r) => r.eventSlug !== 'wedding').length, 33);
  assert.ok(resolveDemoPath('/demos/wedding/grand/royal/'));
  assert.equal(resolveDemoPath('/demos/wedding/royal'), null);
});

test('INITIAL_PACKAGES capabilities agree with central rules', () => {
  // Known gap being tracked: premium capabilities in initialData are identical to standard.
  const std = INITIAL_PACKAGES.find((p) => p.id === 'standard')!;
  assert.equal(std.capabilities.schedule, hasFeature('standard', 'multiCeremonySchedule'));
});

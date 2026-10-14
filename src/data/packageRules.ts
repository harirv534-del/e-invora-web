/**
 * Single source of truth for what each package includes.
 * Prices and feature tiers are fixed by the business: do not change without permission.
 * Tiers are cumulative: Basic < Standard < Royal Premium (internal id "premium", URL slug "royal").
 */
import type { PackageId } from '../types';

export type FeatureKey =
  // Basic
  | 'twoPageInvitation' | 'personalisedNames' | 'dateTime' | 'venueMapsLink' | 'responsive' | 'whatsappShare'
  // Standard additions
  | 'countdown' | 'story' | 'gallery' | 'dressCode' | 'music' | 'rsvp'
  // Royal additions
  | 'multiCeremonySchedule' | 'embeddedMap' | 'enhancedAudio' | 'shimmerPetals' | 'familyBlessings'
  | 'priorityRevisions'; // a service entitlement, NOT something the website fulfils automatically

export const PACKAGE_ORDER: PackageId[] = ['basic', 'standard', 'premium'];

export const PACKAGE_PRICES_INR: Record<PackageId, number> = { basic: 499, standard: 799, premium: 1199 };

const BASIC: FeatureKey[] = ['twoPageInvitation', 'personalisedNames', 'dateTime', 'venueMapsLink', 'responsive', 'whatsappShare'];
const STANDARD_ADDS: FeatureKey[] = ['countdown', 'story', 'gallery', 'dressCode', 'music', 'rsvp'];
const ROYAL_ADDS: FeatureKey[] = ['multiCeremonySchedule', 'embeddedMap', 'enhancedAudio', 'shimmerPetals', 'familyBlessings', 'priorityRevisions'];

export const FEATURES_BY_PACKAGE: Record<PackageId, ReadonlySet<FeatureKey>> = {
  basic: new Set(BASIC),
  standard: new Set([...BASIC, ...STANDARD_ADDS]),
  premium: new Set([...BASIC, ...STANDARD_ADDS, ...ROYAL_ADDS]),
};

export const ALL_FEATURES: FeatureKey[] = [...BASIC, ...STANDARD_ADDS, ...ROYAL_ADDS];

/** The only way UI code should decide whether to render or enable a feature. */
export function hasFeature(pkg: PackageId, feature: FeatureKey): boolean {
  return FEATURES_BY_PACKAGE[pkg].has(feature);
}

/** URL segment <-> internal package id. */
export const ROUTE_PACKAGE_SLUGS = { basic: 'basic', standard: 'standard', royal: 'premium' } as const;
export type RoutePackageSlug = keyof typeof ROUTE_PACKAGE_SLUGS;

export function packageFromRouteSlug(slug: string): PackageId | null {
  return (ROUTE_PACKAGE_SLUGS as Record<string, PackageId>)[slug] ?? null;
}
export function routeSlugFromPackage(pkg: PackageId): RoutePackageSlug {
  return pkg === 'premium' ? 'royal' : pkg;
}

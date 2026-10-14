/**
 * Route manifest for the 42 invitation demos (12 events; Wedding has 3 styles).
 * Wedding: 3 styles x 3 packages = 9. Other 11 events: 11 x 3 = 33. Total 42.
 * Each entry maps to a template (existing designs are reused where one exists).
 */
import type { PackageId } from '../types';
import { PACKAGE_ORDER, routeSlugFromPackage, PACKAGE_PRICES_INR } from './packageRules';

export interface DemoEvent {
  slug: string;          // URL segment under /demos/
  categoryId: string;    // EventCategory.id used by gallery and bookings
  label: string;
  styles?: { slug: string; label: string; templateSlug: string }[]; // wedding only
  templateSlug?: string; // events with a single design
}

export const DEMO_EVENTS: DemoEvent[] = [
  {
    slug: 'wedding', categoryId: 'wedding', label: 'Wedding',
    styles: [
      { slug: 'traditional', label: 'Traditional Wedding', templateSlug: 'kanjeevaram-heritage' },
      { slug: 'grand', label: 'Grand Wedding', templateSlug: 'royal-rajputana' },
      { slug: 'minimal', label: 'Minimal Wedding', templateSlug: 'elysian-luxe' },
    ],
  },
  { slug: 'housewarming', categoryId: 'housewarming', label: 'Housewarming', templateSlug: 'gruhapravesam-bliss' },
  { slug: 'baby-shower', categoryId: 'baby-shower', label: 'Baby Shower', templateSlug: 'seemantham-joy' },
  { slug: 'engagement', categoryId: 'engagement', label: 'Engagement', templateSlug: 'engagement-bliss' },
  { slug: 'reception', categoryId: 'reception', label: 'Reception', templateSlug: 'grand-reception' },
  { slug: 'birthday', categoryId: 'birthday', label: 'Birthday', templateSlug: 'joyful-birthday' },
  { slug: 'anniversary', categoryId: 'anniversary', label: 'Anniversary', templateSlug: 'silver-jubilee' },
  { slug: 'naming-ceremony', categoryId: 'naming-ceremony', label: 'Naming Ceremony', templateSlug: 'naming-ceremony' },
  { slug: 'marriage-proposal', categoryId: 'proposal', label: 'Marriage Proposal', templateSlug: 'romantic-proposal' },
  { slug: 'special-events', categoryId: 'special-events', label: 'Special Events', templateSlug: 'cultural-arangetram' },
  // NEW categories: no template exists yet (see TODO in README: needs design + licensed imagery)
  { slug: 'wedding-anniversary', categoryId: 'wedding-anniversary', label: 'Wedding Anniversary' },
  { slug: 'graduation', categoryId: 'graduation', label: 'Graduation' },
];

export interface DemoRoute {
  path: string;
  eventSlug: string;
  categoryId: string;
  styleSlug?: string;
  templateSlug?: string; // undefined => design not built yet
  packageId: PackageId;
  price: number;
  label: string;
}

export function buildDemoManifest(): DemoRoute[] {
  const routes: DemoRoute[] = [];
  for (const ev of DEMO_EVENTS) {
    const variants = ev.styles ?? [{ slug: '', label: ev.label, templateSlug: ev.templateSlug as string | undefined }];
    for (const v of variants) {
      for (const pkg of PACKAGE_ORDER) {
        const segs = ['/demos', ev.slug, v.slug, routeSlugFromPackage(pkg)].filter(Boolean);
        routes.push({
          path: segs.join('/'),
          eventSlug: ev.slug,
          categoryId: ev.categoryId,
          styleSlug: v.slug || undefined,
          templateSlug: v.templateSlug,
          packageId: pkg,
          price: PACKAGE_PRICES_INR[pkg],
          label: `${v.label} (${pkg})`,
        });
      }
    }
  }
  return routes;
}

export const DEMO_MANIFEST = buildDemoManifest();

/** Resolve a /demos/... path to a manifest entry, or null when it is not one of the 42. */
export function resolveDemoPath(pathname: string): DemoRoute | null {
  const clean = pathname.replace(/\/+$/, '');
  return DEMO_MANIFEST.find((r) => r.path === clean) ?? null;
}

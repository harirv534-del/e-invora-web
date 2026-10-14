import fs from 'fs';
import path from 'path';
import {
  AdminNotification,
  AiDraft,
  AppSettings,
  Booking,
  DesignAttribute,
  EventCategory,
  Package,
  PackageId,
  Payment,
  PublishedInvitation,
  RsvpResponse,
  Template,
} from '../src/types/index.ts';
import {
  INITIAL_CATEGORIES,
  INITIAL_DESIGN_ATTRIBUTES,
  INITIAL_PACKAGES,
  INITIAL_SETTINGS,
  INITIAL_TEMPLATES,
} from '../src/data/initialData.ts';

interface StoreData {
  settings: AppSettings;
  packages: Package[];
  categories: EventCategory[];
  attributes: DesignAttribute[];
  templates: Template[];
  bookings: Booking[];
  payments: Payment[];
  aiDrafts: AiDraft[];
  publishedInvitations: PublishedInvitation[];
  notifications: AdminNotification[];
  rsvps: RsvpResponse[];
}

const DATA_DIR = path.resolve('server/data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// In-memory cache synced to disk
let store: StoreData = {
  settings: INITIAL_SETTINGS,
  packages: INITIAL_PACKAGES,
  categories: INITIAL_CATEGORIES,
  attributes: INITIAL_DESIGN_ATTRIBUTES,
  templates: INITIAL_TEMPLATES,
  bookings: [],
  payments: [],
  aiDrafts: [],
  publishedInvitations: [],
  notifications: [],
  rsvps: [],
};

// Ensure data directory exists and load or initialize store
export function initDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      store = {
        ...store,
        ...parsed,
        packages: INITIAL_PACKAGES,
        categories: INITIAL_CATEGORIES,
        attributes: INITIAL_DESIGN_ATTRIBUTES,
        templates: INITIAL_TEMPLATES,
        settings: {
          ...INITIAL_SETTINGS,
          ...(parsed.settings || {}),
        },
      };
      delete (store as any).adminSessionTokens; // sessions are no longer stored on disk
      if (!Array.isArray(store.rsvps)) store.rsvps = [];
      saveDb();
      console.log(`[DB] Loaded ${store.bookings.length} bookings and synchronized categories/templates.`);
    } else {
      saveDb();
      console.log('[DB] Initialized fresh store.json with default templates and packages.');
    }
  } catch (err) {
    console.error('[DB] Error initializing database store:', err);
  }
}

function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing to store.json:', err);
  }
}

// ---------------- Settings ----------------
export function getSettings(): AppSettings {
  return store.settings;
}

export function updateSettings(newSettings: Partial<AppSettings>): AppSettings {
  store.settings = { ...store.settings, ...newSettings };
  saveDb();
  return store.settings;
}

// ---------------- Packages ----------------
export function getPackages(): Package[] {
  return store.packages.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPackageById(id: PackageId): Package | undefined {
  return store.packages.find((p) => p.id === id);
}

export function updatePackage(id: PackageId, update: Partial<Package>): Package | null {
  const index = store.packages.findIndex((p) => p.id === id);
  if (index === -1) return null;
  store.packages[index] = { ...store.packages[index], ...update };
  saveDb();
  return store.packages[index];
}

// ---------------- Categories & Attributes ----------------
export function getCategories(): EventCategory[] {
  return store.categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAttributes(): DesignAttribute[] {
  return store.attributes;
}

// ---------------- Templates ----------------
export function getTemplates(publishedOnly = false): Template[] {
  if (publishedOnly) {
    return store.templates.filter((t) => t.isPublishedInGallery);
  }
  return store.templates;
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return store.templates.find((t) => t.slug === slug);
}

export function getTemplateById(id: string): Template | undefined {
  return store.templates.find((t) => t.id === id);
}

export function createTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Template {
  const id = `tpl-${Date.now()}`;
  const now = new Date().toISOString();
  const newTemplate: Template = {
    ...templateData,
    id,
    createdAt: now,
    updatedAt: now,
  };
  store.templates.push(newTemplate);
  saveDb();
  return newTemplate;
}

export function updateTemplate(id: string, update: Partial<Template>): Template | null {
  const index = store.templates.findIndex((t) => t.id === id);
  if (index === -1) return null;
  store.templates[index] = {
    ...store.templates[index],
    ...update,
    updatedAt: new Date().toISOString(),
  };
  saveDb();
  return store.templates[index];
}

export function deleteTemplate(id: string): boolean {
  const index = store.templates.findIndex((t) => t.id === id);
  if (index === -1) return false;
  store.templates.splice(index, 1);
  saveDb();
  return true;
}

// ---------------- Bookings ----------------
export interface CreateBookingInput {
  customerName: string;
  primaryPhone: string;
  whatsappPhone: string;
  eventCategoryId: string;
  templateId: string;
  packageId: PackageId;
  celebrantNames: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string;
  preferredLanguage: string;
  designNotes?: string;
  uploadedPhotoUrls?: string[];
  additionalRequirements?: string;
  privacyAcknowledged: boolean;
}

export function createBooking(input: CreateBookingInput): { booking: Booking; payment: Payment } {
  // Validate package and get genuine server-verified price
  const pkg = getPackageById(input.packageId);
  if (!pkg || !pkg.isActive) {
    throw new Error(`Invalid or inactive package selected: ${input.packageId}`);
  }

  // Validate template
  const template = getTemplateById(input.templateId) || getTemplateBySlug(input.templateId);
  if (!template) {
    throw new Error(`Invalid template selected: ${input.templateId}`);
  }

  const now = new Date().toISOString();
  const sequenceNum = store.bookings.length + 1;
  const year = new Date().getFullYear();
  const reference = `EINV-${year}-${String(sequenceNum).padStart(4, '0')}`;
  const bookingId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const booking: Booking = {
    id: bookingId,
    reference,
    customerName: input.customerName.trim(),
    primaryPhone: input.primaryPhone.trim(),
    whatsappPhone: input.whatsappPhone.trim(),
    eventCategoryId: input.eventCategoryId,
    templateId: template.id,
    packageId: pkg.id,
    agreedPrice: pkg.price, // Immutable agreed-price snapshot from server DB
    currency: pkg.currency,
    celebrantNames: input.celebrantNames.trim(),
    eventDate: input.eventDate,
    eventTime: input.eventTime?.trim() || '',
    venueName: input.venueName.trim(),
    venueAddress: input.venueAddress.trim(),
    googleMapsUrl: input.googleMapsUrl?.trim(),
    preferredLanguage: input.preferredLanguage || 'English',
    designNotes: input.designNotes?.trim(),
    uploadedPhotoUrls: input.uploadedPhotoUrls || [],
    additionalRequirements: input.additionalRequirements?.trim(),
    privacyAcknowledged: Boolean(input.privacyAcknowledged),
    status: 'new',
    internalNotes: `New booking submitted via website on ${new Date().toLocaleDateString('en-IN')}`,
    contactHistory: [
      {
        id: `log-${Date.now()}`,
        timestamp: now,
        channel: 'WhatsApp',
        note: 'Booking enquiry received. Awaiting team review.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  store.bookings.unshift(booking);

  // Create initial payment tracking record
  const payment: Payment = {
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookingId: booking.id,
    bookingReference: booking.reference,
    amount: pkg.price,
    currency: pkg.currency,
    paymentMethod: 'Direct',
    status: 'pending',
    verificationNotes: 'Enquiry received. Team will contact customer directly to confirm requirements.',
    createdAt: now,
    updatedAt: now,
  };
  store.payments.unshift(payment);

  // Create admin notification
  createNotification({
    type: 'new_enquiry',
    title: `New Enquiry: ${booking.reference}`,
    message: `${booking.customerName} submitted a booking for ${booking.celebrantNames} (${pkg.name} — ₹${pkg.price}).`,
    bookingId: booking.id,
    bookingReference: booking.reference,
  });

  saveDb();
  return { booking, payment };
}

export function getBookings(): Booking[] {
  return store.bookings;
}

export function getBookingById(id: string): Booking | undefined {
  return store.bookings.find((b) => b.id === id || b.reference === id);
}

export function updateBooking(id: string, update: Partial<Booking>): Booking | null {
  const index = store.bookings.findIndex((b) => b.id === id || b.reference === id);
  if (index === -1) return null;
  store.bookings[index] = {
    ...store.bookings[index],
    ...update,
    updatedAt: new Date().toISOString(),
  };
  saveDb();
  return store.bookings[index];
}

export function addContactLog(bookingId: string, channel: 'WhatsApp' | 'Phone Call' | 'Email' | 'In-Person', note: string): Booking | null {
  const booking = getBookingById(bookingId);
  if (!booking) return null;
  const logItem = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    channel,
    note,
  };
  const history = booking.contactHistory || [];
  history.unshift(logItem);
  return updateBooking(booking.id, { contactHistory: history });
}

// ---------------- Payments ----------------
export function getPayments(): Payment[] {
  return store.payments;
}

export function getPaymentByBookingId(bookingId: string): Payment | undefined {
  return store.payments.find((p) => p.bookingId === bookingId);
}

export function updatePayment(id: string, update: Partial<Payment>): Payment | null {
  const index = store.payments.findIndex((p) => p.id === id || p.bookingId === id);
  if (index === -1) return null;
  store.payments[index] = {
    ...store.payments[index],
    ...update,
    updatedAt: new Date().toISOString(),
  };

  // If payment verified, update booking status accordingly
  if (update.status === 'verified') {
    const booking = getBookingById(store.payments[index].bookingId);
    if (booking && booking.status !== 'published') {
      updateBooking(booking.id, { status: 'payment_verified' });
      createNotification({
        type: 'ready_to_publish',
        title: `Payment Verified: ${booking.reference}`,
        message: `Payment of ₹${store.payments[index].amount} verified. Ready for final review & publishing.`,
        bookingId: booking.id,
        bookingReference: booking.reference,
      });
    }
  }

  saveDb();
  return store.payments[index];
}

// ---------------- AI Drafts ----------------
export function getAiDrafts(): AiDraft[] {
  return store.aiDrafts;
}

export function getAiDraftByBookingId(bookingId: string): AiDraft | undefined {
  return store.aiDrafts.find((d) => d.bookingId === bookingId);
}

export function saveAiDraft(draft: Omit<AiDraft, 'id' | 'createdAt' | 'updatedAt'>): AiDraft {
  const existingIndex = store.aiDrafts.findIndex((d) => d.bookingId === draft.bookingId);
  const now = new Date().toISOString();
  if (existingIndex !== -1) {
    store.aiDrafts[existingIndex] = {
      ...store.aiDrafts[existingIndex],
      ...draft,
      updatedAt: now,
    };
    saveDb();
    return store.aiDrafts[existingIndex];
  }

  const newDraft: AiDraft = {
    ...draft,
    id: `aidraft-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  store.aiDrafts.unshift(newDraft);
  saveDb();
  return newDraft;
}

// ---------------- Published Invitations ----------------
export function getPublishedInvitations(): PublishedInvitation[] {
  return store.publishedInvitations;
}

export function getPublishedInvitationBySlug(slug: string): PublishedInvitation | undefined {
  return store.publishedInvitations.find((p) => p.slug === slug && p.isActive);
}

export function publishInvitation(bookingId: string, customSlug?: string): PublishedInvitation {
  const booking = getBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');
  const template = getTemplateById(booking.templateId) || store.templates[0];
  const pkg = getPackageById(booking.packageId) || store.packages[0];
  const aiDraft = getAiDraftByBookingId(booking.id);

  // Generate URL slug from celebrant names + year or custom
  const cleanNames = booking.celebrantNames.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = (customSlug || `${cleanNames}-${new Date(booking.eventDate).getFullYear()}`).toLowerCase();

  const now = new Date().toISOString();

  // Public snapshot contains STRICTLY approved presentation fields, never private phone/internal notes/payments!
  const snapshotContent = {
    template: {
      ...template,
    },
    package: {
      ...pkg,
    },
    booking: {
      reference: booking.reference,
      celebrantNames: booking.celebrantNames,
      eventDate: booking.eventDate,
      eventTime: booking.eventTime,
      venueName: booking.venueName,
      venueAddress: booking.venueAddress,
      googleMapsUrl: booking.googleMapsUrl,
      preferredLanguage: booking.preferredLanguage,
      designNotes: booking.designNotes,
      uploadedPhotoUrls: booking.uploadedPhotoUrls,
    },
    approvedCopy: aiDraft?.draftContent || {
      title: `${booking.celebrantNames} Celebration`,
      subtitle: `Cordially invite you to celebrate with us`,
      formalInvitationText: `With joyous hearts and the blessings of our families, we invite you to share in our special day.`,
      welcomePoem: `Two lives, two hearts, joined together in friendship and united forever in love.`,
      scheduleSummary: `${booking.eventTime} at ${booking.venueName}`,
      dressCodeNote: 'Festive & Elegant Attire',
      rsvpMessage: 'Please let us know if you can attend.',
    },
  };

  const existingIndex = store.publishedInvitations.findIndex((p) => p.bookingId === bookingId);
  let published: PublishedInvitation;

  if (existingIndex !== -1) {
    published = {
      ...store.publishedInvitations[existingIndex],
      slug,
      packageId: booking.packageId,
      templateId: template.id,
      snapshotContent,
      isActive: true,
      lastUpdatedAt: now,
    };
    store.publishedInvitations[existingIndex] = published;
  } else {
    published = {
      id: `pub-${Date.now()}`,
      bookingId: booking.id,
      slug,
      packageId: booking.packageId,
      templateId: template.id,
      snapshotContent,
      isActive: true,
      publishedAt: now,
      lastUpdatedAt: now,
    };
    store.publishedInvitations.unshift(published);
  }

  // Update booking status
  updateBooking(booking.id, { status: 'published' });

  createNotification({
    type: 'invitation_published',
    title: `Invitation Published: /invite/${slug}`,
    message: `Celebration invitation for ${booking.celebrantNames} is now live at /invite/${slug}.`,
    bookingId: booking.id,
    bookingReference: booking.reference,
  });

  saveDb();
  return published;
}

export function unpublishInvitation(id: string): boolean {
  const item = store.publishedInvitations.find((p) => p.id === id || p.slug === id);
  if (!item) return false;
  item.isActive = false;
  item.lastUpdatedAt = new Date().toISOString();
  saveDb();
  return true;
}

// ---------------- Admin Notifications ----------------
export function getNotifications(): AdminNotification[] {
  return store.notifications;
}

export function createNotification(data: Omit<AdminNotification, 'id' | 'isRead' | 'createdAt'>): AdminNotification {
  const notif: AdminNotification = {
    ...data,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  store.notifications.unshift(notif);
  if (store.notifications.length > 50) {
    store.notifications = store.notifications.slice(0, 50);
  }
  saveDb();
  return notif;
}

export function markNotificationAsRead(id: string): boolean {
  const item = store.notifications.find((n) => n.id === id);
  if (!item) return false;
  item.isRead = true;
  saveDb();
  return true;
}

export function clearNotifications(): void {
  store.notifications = [];
  saveDb();
}

// ---------------- Metrics ----------------
export function getAdminMetrics() {
  const total = store.bookings.length;
  const newBookings = store.bookings.filter((b) => b.status === 'new').length;
  const underReview = store.bookings.filter((b) => b.status === 'under_review').length;
  const awaitingConfirm = store.bookings.filter((b) => b.status === 'awaiting_confirmation').length;
  const paymentPending = store.bookings.filter((b) => b.status === 'payment_pending').length;
  const paymentVerified = store.bookings.filter((b) => b.status === 'payment_verified').length;
  const readyToPublish = store.bookings.filter((b) => b.status === 'ready_to_publish').length;
  const published = store.bookings.filter((b) => b.status === 'published').length;
  const aiDraftsReady = store.aiDrafts.filter((d) => d.status === 'completed' || d.status === 'approved').length;
  const aiFailures = store.aiDrafts.filter((d) => d.status === 'failed').length;

  return {
    totalEnquiries: total,
    newBookings,
    pendingReview: underReview,
    awaitingCustomerConfirmation: awaitingConfirm,
    paymentPending,
    paymentVerified,
    readyToPublish,
    publishedInvitations: published,
    aiDraftsReady,
    aiGenerationFailures: aiFailures,
  };
}

// ---------------- Auth Session Tokens ----------------

// ---------------- RSVP responses ----------------
export function createRsvp(input: {
  invitationId: string;
  invitationSlug: string;
  bookingReference: string;
  guestName: string;
  attending: 'yes' | 'no';
  guestCount: number;
  message: string;
}): RsvpResponse {
  const rsvp: RsvpResponse = {
    id: `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    ...input,
    createdAt: new Date().toISOString(),
  };
  store.rsvps.unshift(rsvp);
  saveDb();
  return rsvp;
}

export function getRsvps(slug?: string): RsvpResponse[] {
  return slug ? store.rsvps.filter((r) => r.invitationSlug === slug) : store.rsvps;
}

export function deleteRsvp(id: string): boolean {
  const before = store.rsvps.length;
  store.rsvps = store.rsvps.filter((r) => r.id !== id);
  if (store.rsvps.length === before) return false;
  saveDb();
  return true;
}

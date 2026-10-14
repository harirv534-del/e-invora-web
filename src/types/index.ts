export type PackageId = 'basic' | 'standard' | 'premium';

export interface PackageCapabilities {
  rsvp: boolean;
  countdown: boolean;
  gallery: boolean;
  schedule: boolean;
  music: boolean;
  maps: boolean;
  story: boolean;
  customNotes: boolean;
}

export interface Package {
  id: PackageId;
  name: string;
  price: number; // In INR (499, 799, 1199)
  currency: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  features: string[];
  capabilities: PackageCapabilities;
}

export interface EventCategory {
  id: string;
  name: string;
  tamilName: string;
  description: string;
  tamilDescription?: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface DesignAttribute {
  id: string;
  name: string;
  category: 'style' | 'culture' | 'theme';
  isActive: boolean;
}

export interface ThemeColors {
  primary: string; // e.g. Burgundy #6E2639
  accent: string; // e.g. Champagne Gold #D4B477
  background: string; // e.g. Ivory #F8F3EA
  text: string; // e.g. Espresso #29221F
  secondaryBg?: string; // e.g. Soft Beige #E9DFD0
}

export interface TemplateSectionConfig {
  hero: boolean;
  details: boolean;
  story: boolean;
  schedule: boolean;
  gallery: boolean;
  countdown: boolean;
  rsvp: boolean;
  map: boolean;
  music: boolean;
  registry?: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  date?: string;
  venue: string;
  dressCode?: string;
  description?: string;
}

export interface DemoContent {
  coupleNames: string;
  celebrantNames?: string;
  subtitle: string;
  invitationText: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string;
  storyTitle?: string;
  storyText?: string;
  quote?: string;
  scheduleItems?: ScheduleItem[];
  galleryImages?: string[];
  rsvpDeadline?: string;
  dressCode?: string;
  contactPerson?: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  styleAttributes: string[];
  description: string;
  thumbnailUrl: string;
  heroImageUrl: string;
  galleryImages: string[];
  themeColors: ThemeColors;
  fontFamilySerif: string;
  fontFamilySans: string;
  isPublishedInGallery: boolean;
  isFeatured: boolean;
  availablePackages: PackageId[];
  sectionConfig: TemplateSectionConfig;
  demoContent: DemoContent;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'new'
  | 'under_review'
  | 'awaiting_confirmation'
  | 'payment_pending'
  | 'payment_verified'
  | 'ready_to_publish'
  | 'published'
  | 'rejected';

export interface ContactLogItem {
  id: string;
  timestamp: string;
  channel: 'WhatsApp' | 'Phone Call' | 'Email' | 'In-Person';
  note: string;
}

export interface Booking {
  id: string;
  reference: string;
  customerName: string;
  primaryPhone: string;
  whatsappPhone: string;
  eventCategoryId: string;
  templateId: string;
  packageId: PackageId;
  agreedPrice: number;
  currency: string;
  celebrantNames: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string;
  preferredLanguage: string;
  designNotes?: string;
  uploadedPhotoUrls: string[];
  additionalRequirements?: string;
  privacyAcknowledged: boolean;
  status: BookingStatus;
  internalNotes?: string;
  contactHistory?: ContactLogItem[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'under_review' | 'verified' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  paymentMethod: 'Bank Transfer' | 'Card' | 'Cash' | 'Direct' | 'Other';
  transactionReference?: string;
  status: PaymentStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AiDraftStatus = 'generating' | 'completed' | 'failed' | 'approved' | 'rejected';

export interface AiDraftContent {
  title: string;
  subtitle: string;
  formalInvitationText: string;
  welcomePoem?: string;
  scheduleSummary?: string;
  dressCodeNote?: string;
  rsvpMessage?: string;
  specialNote?: string;
}

export interface AiDraft {
  id: string;
  bookingId: string;
  bookingReference: string;
  modelUsed: string;
  promptUsed: string;
  status: AiDraftStatus;
  draftContent: AiDraftContent;
  errorMessage?: string;
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedInvitation {
  id: string;
  bookingId: string;
  slug: string;
  packageId: PackageId;
  templateId: string;
  snapshotContent: {
    template: Template;
    package: Package;
    booking: {
      reference: string;
      celebrantNames: string;
      eventDate: string;
      eventTime: string;
      venueName: string;
      venueAddress: string;
      googleMapsUrl?: string;
      preferredLanguage: string;
      designNotes?: string;
      uploadedPhotoUrls?: string[];
    };
    approvedCopy: AiDraftContent;
  };
  isActive: boolean;
  publishedAt: string;
  lastUpdatedAt: string;
}

export type NotificationType =
  | 'new_enquiry'
  | 'ai_draft_ready'
  | 'ai_draft_failed'
  | 'customer_confirmation_required'
  | 'payment_verification_required'
  | 'ready_to_publish'
  | 'invitation_published';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  bookingReference?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppSettings {
  brandName: string;
  tagline: string;
  whatsappNumber: string;
  contactEmail: string;
  primaryPhone: string;
  currencySymbol: string;
  autoGenerateAiDrafts: boolean;
}

export interface RsvpResponse {
  id: string;
  invitationId: string;
  invitationSlug: string;
  bookingReference: string;
  guestName: string;
  attending: 'yes' | 'no';
  guestCount: number;
  message: string;
  createdAt: string;
}

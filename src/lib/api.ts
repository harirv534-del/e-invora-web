import {
  AdminNotification,
  AiDraft,
  AppSettings,
  Booking,
  DesignAttribute,
  EventCategory,
  Package,
  Payment,
  PublishedInvitation,
  RsvpResponse,
  Template,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_DESIGN_ATTRIBUTES,
  INITIAL_PACKAGES,
  INITIAL_SETTINGS,
  INITIAL_TEMPLATES,
} from '../data/initialData';

// Admin sessions use an HttpOnly cookie set by the server, so no token is ever kept in JavaScript.
function getAuthHeader(): Record<string, string> {
  return {};
}

async function readError(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => null);
  return (err && err.error) || fallback;
}

export const api = {
  // Public
  async getSettings(): Promise<AppSettings> {
    try {
      const res = await fetch('/api/public/settings');
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_SETTINGS;
  },

  async getCategories(): Promise<EventCategory[]> {
    try {
      const res = await fetch('/api/public/categories');
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_CATEGORIES;
  },

  async getAttributes(): Promise<DesignAttribute[]> {
    try {
      const res = await fetch('/api/public/attributes');
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_DESIGN_ATTRIBUTES;
  },

  async getPackages(): Promise<Package[]> {
    try {
      const res = await fetch('/api/public/packages');
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_PACKAGES;
  },

  async getTemplates(category?: string, attribute?: string): Promise<Template[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (attribute && attribute !== 'all') params.append('attribute', attribute);
      const url = `/api/public/templates${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (_) {}
    let list = INITIAL_TEMPLATES;
    if (category && category !== 'all') list = list.filter((t) => t.categoryId === category);
    if (attribute && attribute !== 'all') list = list.filter((t) => t.styleAttributes.includes(attribute));
    return list;
  },

  async getTemplate(slug: string): Promise<Template | null> {
    try {
      const res = await fetch(`/api/public/templates/${slug}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_TEMPLATES.find((t) => t.slug === slug || t.id === slug) || null;
  },

  async submitBooking(data: any): Promise<{ success: boolean; bookingReference: string; bookingId: string; agreedPrice: number }> {
    const res = await fetch('/api/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Submission failed' }));
      throw new Error(err.error || 'Failed to submit booking enquiry');
    }
    return await res.json();
  },

  async getPublishedInvitation(slug: string): Promise<PublishedInvitation | null> {
    try {
      const res = await fetch(`/api/public/invitations/${slug}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  },

  // Guest RSVP (no login needed). Throws unless the server confirms the response was saved.
  async submitRsvp(
    slug: string,
    data: { guestName: string; attending: 'yes' | 'no'; guestCount: number; message: string }
  ): Promise<void> {
    const res = await fetch(`/api/public/invitations/${encodeURIComponent(slug)}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await readError(res, 'Could not save your RSVP. Please try again.'));
  },

  // Admin Auth
  async getAdminStatus(): Promise<{ configured: boolean; setupAvailable: boolean }> {
    const res = await fetch('/api/admin/status');
    if (!res.ok) throw new Error('Could not reach the server.');
    return res.json();
  },

  async adminSetup(setupKey: string, email: string, password: string): Promise<void> {
    const res = await fetch('/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setupKey, email, password }),
    });
    if (!res.ok) throw new Error(await readError(res, 'Setup failed.'));
  },

  async adminLogin(email: string, password: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await readError(res, 'Login failed'));
    return res.json();
  },

  async changeAdminCredentials(currentPassword: string, newEmail: string, newPassword: string): Promise<void> {
    const res = await fetch('/api/admin/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newEmail, newPassword }),
    });
    if (!res.ok) throw new Error(await readError(res, 'Could not change credentials.'));
  },

  async getAdminRsvps(slug?: string): Promise<RsvpResponse[]> {
    const res = await fetch(`/api/admin/rsvps${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`);
    if (!res.ok) throw new Error('Failed to load RSVP responses');
    return res.json();
  },

  async deleteAdminRsvp(id: string): Promise<void> {
    const res = await fetch(`/api/admin/rsvps/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete response');
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (_) {}
  },

  async checkAdminAuth(): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/me');
      return res.ok;
    } catch (_) {
      return false;
    }
  },

  // Protected Admin APIs
  async getAdminMetrics() {
    const res = await fetch('/api/admin/metrics', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load metrics');
    return await res.json();
  },

  async getAdminBookings(status?: string, search?: string): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load bookings');
    return await res.json();
  },

  async getAdminBookingDetails(id: string): Promise<{ booking: Booking; payment: Payment; aiDraft?: AiDraft; published?: PublishedInvitation }> {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load booking details');
    return await res.json();
  },

  async updateAdminBooking(id: string, update: Partial<Booking>): Promise<Booking> {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error('Failed to update booking');
    return await res.json();
  },

  async addContactLog(bookingId: string, channel: string, note: string): Promise<Booking> {
    const res = await fetch(`/api/admin/bookings/${bookingId}/contact-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ channel, note }),
    });
    if (!res.ok) throw new Error('Failed to add contact note');
    return await res.json();
  },

  async getAdminTemplates(): Promise<Template[]> {
    const res = await fetch('/api/admin/templates', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load admin templates');
    return await res.json();
  },

  async createAdminTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error('Failed to create template');
    return await res.json();
  },

  async updateAdminTemplate(id: string, update: Partial<Template>): Promise<Template> {
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error('Failed to update template');
    return await res.json();
  },

  async deleteAdminTemplate(id: string): Promise<void> {
    const res = await fetch(`/api/admin/templates/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete template');
  },

  async getAdminPackages(): Promise<Package[]> {
    const res = await fetch('/api/admin/packages', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load packages');
    return await res.json();
  },

  async updateAdminPackage(id: string, update: Partial<Package>): Promise<Package> {
    const res = await fetch(`/api/admin/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error('Failed to update package');
    return await res.json();
  },

  async getAdminPayments(): Promise<Payment[]> {
    const res = await fetch('/api/admin/payments', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load payments');
    return await res.json();
  },

  async updateAdminPayment(id: string, update: Partial<Payment>): Promise<Payment> {
    const res = await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error('Failed to update payment');
    return await res.json();
  },

  async getAdminAiDrafts(): Promise<AiDraft[]> {
    const res = await fetch('/api/admin/ai-drafts', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load AI drafts');
    return await res.json();
  },

  async generateAiDraft(bookingId: string): Promise<AiDraft> {
    const res = await fetch('/api/admin/ai-drafts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ bookingId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'AI generation failed' }));
      throw new Error(err.error || 'Failed to generate AI draft');
    }
    return await res.json();
  },

  async updateAiDraft(bookingId: string, update: any): Promise<AiDraft> {
    const res = await fetch(`/api/admin/ai-drafts/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(update),
    });
    if (!res.ok) throw new Error('Failed to update AI draft');
    return await res.json();
  },

  async getAdminPublished(): Promise<PublishedInvitation[]> {
    const res = await fetch('/api/admin/published', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load published list');
    return await res.json();
  },

  async publishInvitation(bookingId: string, customSlug?: string): Promise<PublishedInvitation> {
    const res = await fetch('/api/admin/published', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ bookingId, customSlug }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Publish failed' }));
      throw new Error(err.error || 'Failed to publish invitation');
    }
    return await res.json();
  },

  async unpublishInvitation(id: string): Promise<void> {
    const res = await fetch(`/api/admin/published/${id}/unpublish`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to unpublish');
  },

  async getAdminNotifications(): Promise<AdminNotification[]> {
    const res = await fetch('/api/admin/notifications', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load notifications');
    return await res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/admin/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() },
    });
  },

  async clearNotifications(): Promise<void> {
    await fetch('/api/admin/notifications', {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
  },

  async getAdminSettings(): Promise<AppSettings> {
    const res = await fetch('/api/admin/settings', { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to load settings');
    return await res.json();
  },

  async updateAdminSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
  },
};

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  addContactLog,
  clearNotifications,
  createBooking,
  createRsvp,
  deleteRsvp,
  getRsvps,
  createNotification,
  createTemplate,
  deleteTemplate,
  getAdminMetrics,
  getAiDraftByBookingId,
  getAiDrafts,
  getAttributes,
  getBookingById,
  getBookings,
  getCategories,
  getNotifications,
  getPackageById,
  getPackages,
  getPayments,
  getPublishedInvitationBySlug,
  getPublishedInvitations,
  getSettings,
  getTemplateById,
  getTemplateBySlug,
  getTemplates,
  markNotificationAsRead,
  publishInvitation,
  saveAiDraft,
  unpublishInvitation,
  updateBooking,
  updatePackage,
  updatePayment,
  updateSettings,
  updateTemplate,
} from './db.ts';
import { generateInvitationDraft } from './ai.ts';
import {
  changeCredentials,
  checkLogin,
  clearSession,
  completeSetup,
  getOwnerEmail,
  hasValidSession,
  isOwnerConfigured,
  issueSession,
  revokeSession,
  setupAvailable,
} from './auth.ts';

export const apiRouter = Router();

// Simple in-memory rate limiter (per IP). With failuresOnly, only failed requests count,
// so normal use never locks the owner out but password guessing is slowed down.
function makeLimiter(max: number, windowMs: number, failuresOnly = false) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const bump = (key: string) => {
    const now = Date.now();
    const rec = hits.get(key);
    if (!rec || rec.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      rec.count += 1;
    }
  };
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const rec = hits.get(key);
    if (rec && rec.resetAt >= Date.now() && rec.count >= max) {
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }
    if (failuresOnly) {
      res.on('finish', () => { if (res.statusCode >= 400) bump(key); });
    } else {
      bump(key);
    }
    next();
  };
}
const publicWriteLimiter = makeLimiter(30, 60 * 60 * 1000);
const authLimiter = makeLimiter(10, 15 * 60 * 1000, true);

// Middleware: Admin authorization (signed HttpOnly session cookie, checked on every request)
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!hasValidSession(req)) {
    return res.status(401).json({ error: 'Unauthorized: owner sign-in required.' });
  }
  next();
}

// ==============================================================================
// PUBLIC ENDPOINTS (No customer account or login required)
// ==============================================================================

// Settings (Public brand details)
apiRouter.get('/public/settings', (_req, res) => {
  const s = getSettings();
  res.json({
    brandName: s.brandName,
    tagline: s.tagline,
    whatsappNumber: s.whatsappNumber,
    contactEmail: s.contactEmail,
    primaryPhone: s.primaryPhone,
    currencySymbol: s.currencySymbol,
  });
});

// Categories & Style attributes
apiRouter.get('/public/categories', (_req, res) => {
  res.json(getCategories().filter((c) => c.isActive));
});

apiRouter.get('/public/attributes', (_req, res) => {
  res.json(getAttributes().filter((a) => a.isActive));
});

// Packages (Basic ₹499, Standard ₹799, Premium ₹1,199)
apiRouter.get('/public/packages', (_req, res) => {
  res.json(getPackages().filter((p) => p.isActive));
});

// Templates Gallery
apiRouter.get('/public/templates', (req, res) => {
  const category = req.query.category as string | undefined;
  const attribute = req.query.attribute as string | undefined;
  let templates = getTemplates(true); // only published designs

  if (category && category !== 'all') {
    templates = templates.filter((t) => t.categoryId === category);
  }
  if (attribute && attribute !== 'all') {
    templates = templates.filter((t) => t.styleAttributes.includes(attribute));
  }

  res.json(templates);
});

// Single Template / Demo Details
apiRouter.get('/public/templates/:slug', (req, res) => {
  const { slug } = req.params;
  const template = getTemplateBySlug(slug) || getTemplateById(slug);
  if (!template) {
    return res.status(404).json({ error: 'Invitation design template not found' });
  }
  res.json(template);
});

// Submit Booking Enquiry (Public - No login required)
apiRouter.post('/public/bookings', publicWriteLimiter, async (req, res) => {
  try {
    const {
      customerName,
      primaryPhone,
      whatsappPhone,
      eventCategoryId,
      templateId,
      packageId,
      celebrantNames,
      eventDate,
      eventTime,
      venueName,
      venueAddress,
      googleMapsUrl,
      preferredLanguage,
      designNotes,
      uploadedPhotoUrls,
      additionalRequirements,
      privacyAcknowledged,
    } = req.body;

    // Strict validation
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Customer full name is required.' });
    }
    if (!primaryPhone || primaryPhone.trim().length < 7) {
      return res.status(400).json({ error: 'Valid primary phone number is required.' });
    }
    if (!whatsappPhone || whatsappPhone.trim().length < 7) {
      return res.status(400).json({ error: 'Valid WhatsApp number is required.' });
    }
    if (!celebrantNames || celebrantNames.trim().length < 2) {
      return res.status(400).json({ error: 'Celebrant or couple names are required.' });
    }
    if (!eventDate) {
      return res.status(400).json({ error: 'Event date is required.' });
    }
    if (!venueName || venueName.trim().length < 2) {
      return res.status(400).json({ error: 'Venue name is required.' });
    }
    if (!venueAddress || venueAddress.trim().length < 2) {
      return res.status(400).json({ error: 'Venue address is required.' });
    }
    if (!privacyAcknowledged) {
      return res.status(400).json({ error: 'Please acknowledge the privacy notice to proceed.' });
    }

    const { booking, payment } = createBooking({
      customerName,
      primaryPhone,
      whatsappPhone,
      eventCategoryId,
      templateId,
      packageId,
      celebrantNames,
      eventDate,
      eventTime: eventTime || '',
      venueName,
      venueAddress,
      googleMapsUrl,
      preferredLanguage: preferredLanguage || 'English',
      designNotes,
      uploadedPhotoUrls,
      additionalRequirements,
      privacyAcknowledged,
    });

    // Background AI draft generation if autoGenerateAiDrafts is enabled
    const settings = getSettings();
    if (settings.autoGenerateAiDrafts && process.env.GEMINI_API_KEY) {
      setTimeout(async () => {
        try {
          const template = getTemplateById(booking.templateId);
          const aiResult = await generateInvitationDraft({
            bookingReference: booking.reference,
            customerName: booking.customerName,
            celebrantNames: booking.celebrantNames,
            eventCategory: booking.eventCategoryId,
            eventDate: booking.eventDate,
            eventTime: booking.eventTime,
            venueName: booking.venueName,
            venueAddress: booking.venueAddress,
            preferredLanguage: booking.preferredLanguage,
            designNotes: booking.designNotes,
            additionalRequirements: booking.additionalRequirements,
            templateName: template?.name,
          });

          if (aiResult.success && aiResult.draft) {
            saveAiDraft({
              bookingId: booking.id,
              bookingReference: booking.reference,
              modelUsed: aiResult.model,
              promptUsed: 'Auto-generated on new enquiry',
              status: 'completed',
              draftContent: aiResult.draft,
            });
            createNotification({
              type: 'ai_draft_ready',
              title: `AI Draft Ready: ${booking.reference}`,
              message: `Bespoke invitation draft generated for ${booking.celebrantNames}. Ready for review.`,
              bookingId: booking.id,
              bookingReference: booking.reference,
            });
          } else {
            createNotification({
              type: 'ai_draft_failed',
              title: `AI Draft Incomplete: ${booking.reference}`,
              message: aiResult.error || 'AI generation encountered an issue. Can be retried manually in admin.',
              bookingId: booking.id,
              bookingReference: booking.reference,
            });
          }
        } catch (err: any) {
          console.error('[AI Auto-Draft Error]:', err);
        }
      }, 500);
    }

    res.status(201).json({
      success: true,
      bookingReference: booking.reference,
      bookingId: booking.id,
      agreedPrice: booking.agreedPrice,
      currency: booking.currency,
      packageId: booking.packageId,
      paymentId: payment.id,
    });
  } catch (err: any) {
    console.error('[Create Booking Error]:', err);
    const known = typeof err.message === 'string' && err.message.startsWith('Invalid');
    res.status(known ? 400 : 500).json({ error: err.message || 'Failed to submit booking.' });
  }
});

// View Live Published Invitation (Public /invite/:slug)
apiRouter.get('/public/invitations/:slug', (req, res) => {
  const { slug } = req.params;
  const invitation = getPublishedInvitationBySlug(slug);
  if (!invitation || !invitation.isActive) {
    return res.status(404).json({ error: 'Invitation not found or currently unpublished.' });
  }

  // Public snapshot guarantees internal notes, customer phone, and payments are NOT exposed
  res.json({
    slug: invitation.slug,
    packageId: invitation.packageId,
    templateId: invitation.templateId,
    publishedAt: invitation.publishedAt,
    snapshotContent: invitation.snapshotContent,
  });
});

// ==============================================================================
// ADMIN AUTHENTICATION
// ==============================================================================

// Simple in-memory brute-force protection (per IP): 8 failed attempts / 15 minutes.
// ------------------------------------------------------------------------------
// OWNER AUTHENTICATION
// ------------------------------------------------------------------------------
// Tells the login page whether the owner account exists (reveals nothing else).
apiRouter.get('/admin/status', (_req, res) => {
  res.json({ configured: isOwnerConfigured(), setupAvailable: setupAvailable() });
});

// One-time owner setup. Needs the server-side setup key; closes itself after use.
apiRouter.post('/admin/setup', authLimiter, (req, res) => {
  const { setupKey, email, password } = req.body || {};
  const result = completeSetup(setupKey, email, password);
  if (!result.ok) return res.status(400).json({ error: result.error });
  issueSession(res, req);
  res.json({ success: true });
});

apiRouter.post('/admin/login', authLimiter, (req, res) => {
  if (!isOwnerConfigured()) {
    return res.status(503).json({ error: 'Owner account is not set up yet.' });
  }
  const { email, password } = req.body || {};
  if (checkLogin(email, password)) {
    issueSession(res, req);
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid email or password.' });
});

apiRouter.post('/admin/logout', (req, res) => {
  revokeSession(req);
  clearSession(res);
  res.json({ success: true });
});

apiRouter.get('/admin/me', requireAdmin, (_req, res) => {
  res.json({ authenticated: true, user: { email: getOwnerEmail(), role: 'owner' } });
});

// Replace login email/password. Needs a valid owner session AND the current password.
apiRouter.post('/admin/credentials', requireAdmin, authLimiter, (req, res) => {
  const { currentPassword, newEmail, newPassword } = req.body || {};
  const result = changeCredentials(currentPassword, newEmail, newPassword);
  if (!result.ok) return res.status(400).json({ error: result.error });
  issueSession(res, req); // old sessions are now invalid; keep this one signed in
  res.json({ success: true });
});

// ------------------------------------------------------------------------------
// RSVP (guests need no account; only the owner can read responses)
// ------------------------------------------------------------------------------
apiRouter.post('/public/invitations/:slug/rsvp', publicWriteLimiter, (req, res) => {
  const invitation = getPublishedInvitationBySlug(req.params.slug);
  if (!invitation || !invitation.isActive) {
    return res.status(404).json({ error: 'This invitation is not available.' });
  }
  const pkg = getPackageById(invitation.packageId);
  if (!pkg || !pkg.capabilities.rsvp) {
    return res.status(403).json({ error: 'Online RSVP is not included in this invitation package.' });
  }
  const { guestName, attending, guestCount, message } = req.body || {};
  const name = typeof guestName === 'string' ? guestName.trim() : '';
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Please enter your name (2 to 100 characters).' });
  }
  if (attending !== 'yes' && attending !== 'no') {
    return res.status(400).json({ error: 'Please choose whether you will attend.' });
  }
  const count = attending === 'yes' ? Math.floor(Number(guestCount)) : 0;
  if (attending === 'yes' && (!Number.isFinite(count) || count < 1 || count > 20)) {
    return res.status(400).json({ error: 'Number of guests must be between 1 and 20.' });
  }
  const note = typeof message === 'string' ? message.trim().slice(0, 500) : '';
  const saved = createRsvp({
    invitationId: invitation.id,
    invitationSlug: invitation.slug,
    bookingReference: invitation.snapshotContent.booking.reference,
    guestName: name,
    attending,
    guestCount: count,
    message: note,
  });
  res.status(201).json({ success: true, id: saved.id });
});

apiRouter.get('/admin/rsvps', requireAdmin, (req, res) => {
  const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined;
  res.json(getRsvps(slug));
});

apiRouter.delete('/admin/rsvps/:id', requireAdmin, (req, res) => {
  if (!deleteRsvp(req.params.id)) return res.status(404).json({ error: 'Response not found.' });
  res.json({ success: true });
});

apiRouter.get('/admin/metrics', requireAdmin, (_req, res) => {
  res.json(getAdminMetrics());
});

// Bookings Management
apiRouter.get('/admin/bookings', requireAdmin, (req, res) => {
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  let bookings = getBookings();

  if (status && status !== 'all') {
    bookings = bookings.filter((b) => b.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.reference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.celebrantNames.toLowerCase().includes(q) ||
        b.primaryPhone.includes(q) ||
        b.whatsappPhone.includes(q)
    );
  }

  res.json(bookings);
});

apiRouter.get('/admin/bookings/:id', requireAdmin, (req, res) => {
  const booking = getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const payment = getPayments().find((p) => p.bookingId === booking.id);
  const aiDraft = getAiDraftByBookingId(booking.id);
  const published = getPublishedInvitations().find((p) => p.bookingId === booking.id);

  res.json({
    booking,
    payment,
    aiDraft,
    published,
  });
});

apiRouter.patch('/admin/bookings/:id', requireAdmin, (req, res) => {
  const updated = updateBooking(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json(updated);
});

apiRouter.post('/admin/bookings/:id/contact-log', requireAdmin, (req, res) => {
  const { channel, note } = req.body;
  if (!channel || !note) {
    return res.status(400).json({ error: 'Channel and note are required' });
  }
  const updated = addContactLog(req.params.id, channel, note);
  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json(updated);
});

// Templates CRUD
apiRouter.get('/admin/templates', requireAdmin, (_req, res) => {
  res.json(getTemplates(false));
});

apiRouter.post('/admin/templates', requireAdmin, (req, res) => {
  try {
    const created = createTemplate(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/admin/templates/:id', requireAdmin, (req, res) => {
  const updated = updateTemplate(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Template not found' });
  res.json(updated);
});

apiRouter.delete('/admin/templates/:id', requireAdmin, (req, res) => {
  const ok = deleteTemplate(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Template not found' });
  res.json({ success: true });
});

// Packages Management
apiRouter.get('/admin/packages', requireAdmin, (_req, res) => {
  res.json(getPackages());
});

apiRouter.put('/admin/packages/:id', requireAdmin, (req, res) => {
  const updated = updatePackage(req.params.id as any, req.body);
  if (!updated) return res.status(404).json({ error: 'Package not found' });
  res.json(updated);
});

// Payments Verification
apiRouter.get('/admin/payments', requireAdmin, (_req, res) => {
  res.json(getPayments());
});

apiRouter.patch('/admin/payments/:id', requireAdmin, (req, res) => {
  const updated = updatePayment(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Payment record not found' });
  res.json(updated);
});

// AI Drafts
apiRouter.get('/admin/ai-drafts', requireAdmin, (_req, res) => {
  res.json(getAiDrafts());
});

apiRouter.post('/admin/ai-drafts/generate', requireAdmin, async (req, res) => {
  const { bookingId } = req.body;
  const booking = getBookingById(bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const template = getTemplateById(booking.templateId);
  const result = await generateInvitationDraft({
    bookingReference: booking.reference,
    customerName: booking.customerName,
    celebrantNames: booking.celebrantNames,
    eventCategory: booking.eventCategoryId,
    eventDate: booking.eventDate,
    eventTime: booking.eventTime,
    venueName: booking.venueName,
    venueAddress: booking.venueAddress,
    preferredLanguage: booking.preferredLanguage,
    designNotes: booking.designNotes,
    additionalRequirements: booking.additionalRequirements,
    templateName: template?.name,
  });

  if (!result.success || !result.draft) {
    createNotification({
      type: 'ai_draft_failed',
      title: `AI Generation Failed: ${booking.reference}`,
      message: result.error || 'Failed to generate draft',
      bookingId: booking.id,
      bookingReference: booking.reference,
    });
    return res.status(500).json({ error: result.error || 'AI generation failed' });
  }

  const saved = saveAiDraft({
    bookingId: booking.id,
    bookingReference: booking.reference,
    modelUsed: result.model,
    promptUsed: 'Manual generation by Owner',
    status: 'completed',
    draftContent: result.draft,
  });

  createNotification({
    type: 'ai_draft_ready',
    title: `AI Draft Ready: ${booking.reference}`,
    message: `Generated bespoke draft for ${booking.celebrantNames}`,
    bookingId: booking.id,
    bookingReference: booking.reference,
  });

  res.json(saved);
});

apiRouter.patch('/admin/ai-drafts/:bookingId', requireAdmin, (req, res) => {
  const booking = getBookingById(req.params.bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const saved = saveAiDraft({
    bookingId: booking.id,
    bookingReference: booking.reference,
    modelUsed: 'manual-edit',
    promptUsed: 'Admin edit',
    status: req.body.status || 'approved',
    draftContent: req.body.draftContent,
    adminFeedback: req.body.adminFeedback,
  });

  res.json(saved);
});

// Publishing Workflow
apiRouter.get('/admin/published', requireAdmin, (_req, res) => {
  res.json(getPublishedInvitations());
});

apiRouter.post('/admin/published', requireAdmin, (req, res) => {
  const { bookingId, customSlug } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });
  try {
    const published = publishInvitation(bookingId, customSlug);
    res.json(published);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/published/:id/unpublish', requireAdmin, (req, res) => {
  const ok = unpublishInvitation(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Published invitation not found' });
  res.json({ success: true });
});

// Notifications
apiRouter.get('/admin/notifications', requireAdmin, (_req, res) => {
  res.json(getNotifications());
});

apiRouter.patch('/admin/notifications/:id/read', requireAdmin, (req, res) => {
  const ok = markNotificationAsRead(req.params.id);
  res.json({ success: ok });
});

apiRouter.delete('/admin/notifications', requireAdmin, (_req, res) => {
  clearNotifications();
  res.json({ success: true });
});

// Settings
apiRouter.get('/admin/settings', requireAdmin, (_req, res) => {
  res.json(getSettings());
});

apiRouter.put('/admin/settings', requireAdmin, (req, res) => {
  // Only known, non-secret business fields may be changed here.
  const b = req.body || {};
  const patch: Record<string, unknown> = {};
  for (const key of ['brandName', 'tagline', 'whatsappNumber', 'contactEmail', 'primaryPhone', 'currencySymbol']) {
    if (typeof b[key] === 'string') patch[key] = b[key].trim().slice(0, 200);
  }
  if (typeof b.autoGenerateAiDrafts === 'boolean') patch.autoGenerateAiDrafts = b.autoGenerateAiDrafts;
  const updated = updateSettings(patch);
  res.json(updated);
});

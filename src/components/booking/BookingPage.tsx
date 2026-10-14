import React, { useState, useEffect } from 'react';
import {
  CalendarHeart,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Check,
} from 'lucide-react';
import { EventCategory, Package, PackageId, Template } from '../../types';
import { api } from '../../lib/api';

interface BookingPageProps {
  categories: EventCategory[];
  templates: Template[];
  packages: Package[];
  prefilledTemplateSlug?: string;
  prefilledPackageId?: PackageId;
  prefilledCategory?: string;
  onSuccess: (bookingReference: string, templateName: string, packageName: string, agreedPrice: number) => void;
  onCancel: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  categories,
  templates,
  packages,
  prefilledTemplateSlug,
  prefilledPackageId = 'standard',
  prefilledCategory,
  onSuccess,
  onCancel,
}) => {
  // Step navigation (1: Event & Design, 2: Your Contacts, 3: Event Details & Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Prefilled items
  const initialTemplate =
    templates.find((t) => t.slug === prefilledTemplateSlug || t.id === prefilledTemplateSlug) ||
    templates[0];

  const initialPkg =
    packages.find((p) => p.id === prefilledPackageId) ||
    packages.find((p) => p.id === 'standard') ||
    packages[0];

  // Form states
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    prefilledCategory || initialTemplate?.categoryId || categories[0]?.id || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplate?.id || templates[0]?.id || ''
  );
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId>(
    (initialPkg?.id as PackageId) || 'standard'
  );

  // Customer Contact Information
  const [customerName, setCustomerName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [sameAsPrimary, setSameAsPrimary] = useState(true);

  // Event Details
  const [celebrantNames, setCelebrantNames] = useState(
    initialTemplate?.demoContent?.coupleNames || ''
  );
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [designNotes, setDesignNotes] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep WhatsApp in sync if same as primary
  useEffect(() => {
    if (sameAsPrimary) {
      setWhatsappPhone(primaryPhone);
    }
  }, [sameAsPrimary, primaryPhone]);

  // Active items
  const activePackage = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length + uploadedPhotos.length > 6) {
      alert('Maximum 6 photos allowed.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`${file.name} exceeds the 8MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Step Validation
  const validateStep1 = () => {
    setErrorMessage('');
    if (!selectedCategoryId) {
      setErrorMessage('Please select an event category.');
      return false;
    }
    if (!selectedTemplateId) {
      setErrorMessage('Please select an invitation design.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setErrorMessage('');
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!primaryPhone.trim() || primaryPhone.trim().length < 8) {
      setErrorMessage('Please enter a valid mobile number.');
      return false;
    }
    const finalWhatsApp = sameAsPrimary ? primaryPhone.trim() : whatsappPhone.trim();
    if (!finalWhatsApp || finalWhatsApp.length < 8) {
      setErrorMessage('Please enter a valid WhatsApp number.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setErrorMessage('');
    if (!celebrantNames.trim()) {
      setErrorMessage('Please enter the names to appear on the invitation.');
      return false;
    }
    if (!eventDate) {
      setErrorMessage('Please choose the event date.');
      return false;
    }
    if (!venueName.trim()) {
      setErrorMessage('Please enter the venue name.');
      return false;
    }
    if (!venueAddress.trim()) {
      setErrorMessage('Please enter the venue address.');
      return false;
    }
    if (!privacyAcknowledged) {
      setErrorMessage('Please acknowledge the privacy notice.');
      return false;
    }
    return true;
  };

  // Final Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const finalWhatsApp = sameAsPrimary ? primaryPhone.trim() : whatsappPhone.trim();

      const response = await api.submitBooking({
        customerName: customerName.trim(),
        primaryPhone: primaryPhone.trim(),
        whatsappPhone: finalWhatsApp,
        eventCategoryId: selectedCategoryId,
        templateId: selectedTemplateId,
        packageId: selectedPackageId,
        celebrantNames: celebrantNames.trim(),
        eventDate,
        eventTime: eventTime.trim(),
        venueName: venueName.trim(),
        venueAddress: venueAddress.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        preferredLanguage,
        designNotes: designNotes.trim(),
        uploadedPhotoUrls: uploadedPhotos,
        additionalRequirements: additionalRequirements.trim(),
        privacyAcknowledged: true,
      });

      if (response && response.bookingReference) {
        onSuccess(
          response.bookingReference,
          activeTemplate?.name || 'Custom Invitation',
          activePackage?.name || 'Selected Package',
          response.agreedPrice
        );
      } else {
        throw new Error('Booking reference not received. Please try again.');
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMessage(
        err.message || 'Failed to submit booking. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-[#F8F3EA] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9DFD0] border border-[#D4B477]/40 text-xs font-semibold uppercase tracking-wider text-[#6E2639]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B477]" />
            <span>Easy 3-Step Booking</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#29221F]">
            Book Your Invitation Website
          </h1>

          <p className="text-xs sm:text-sm text-[#29221F]/75 max-w-xl mx-auto font-sans leading-relaxed">
            No online payment required now. Submit your event details and our concierge team will contact you directly to confirm requirements.
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="bg-white rounded-2xl p-4 border border-[#D4B477]/30 shadow-xs">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                currentStep === 1
                  ? 'bg-[#6E2639] text-white font-bold shadow-xs'
                  : currentStep > 1
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-[#F8F3EA] text-[#29221F]/60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span className="truncate">1. Design & Package</span>
            </button>

            <button
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                currentStep === 2
                  ? 'bg-[#6E2639] text-white font-bold shadow-xs'
                  : currentStep > 2
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-[#F8F3EA] text-[#29221F]/60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span className="truncate">2. Contact Details</span>
            </button>

            <button
              onClick={() => {
                if (validateStep1() && validateStep2()) setCurrentStep(3);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                currentStep === 3
                  ? 'bg-[#6E2639] text-white font-bold shadow-xs'
                  : 'bg-[#F8F3EA] text-[#29221F]/60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">
                3
              </span>
              <span className="truncate">3. Event Details</span>
            </button>
          </div>
        </div>

        {/* Selected Summary Sticky Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#D4B477]/40 shadow-gold-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4B477] block">
              Current Selection:
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#6E2639]">
              {activeTemplate?.name}
            </h3>
            <p className="text-xs text-[#29221F]/70">
              Category: <strong>{activeCategory?.name}</strong> • Package: <strong>{activePackage?.name}</strong>
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0 bg-[#FAF6EE] px-5 py-2.5 rounded-2xl border border-[#D4B477]/30">
            <span className="text-[10px] uppercase tracking-wider text-[#29221F]/60 block font-semibold">
              Package Price
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#6E2639]">
              ₹{activePackage?.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-[#29221F]/60 block">Confirmed with concierge</span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D4B477]/35 shadow-xs">
          {/* ==============================================================================
              STEP 1: EVENT, DESIGN & PACKAGE SELECTION
          ============================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#D4B477]/20 pb-3">
                <h3 className="font-serif text-2xl font-bold text-[#29221F]">
                  1. Select Event, Design & Package
                </h3>
                <p className="text-xs text-[#29221F]/70 font-sans mt-0.5">
                  Choose your event category, invitation design, and package tier.
                </p>
              </div>

              {/* Event Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#29221F] block">
                  Event Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    const matchedTpl = templates.find((t) => t.categoryId === e.target.value);
                    if (matchedTpl) setSelectedTemplateId(matchedTpl.id);
                  }}
                  className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F] focus:outline-none focus:ring-2 focus:ring-[#6E2639]/30"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Design */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#29221F] block">
                  Invitation Design <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F] focus:outline-none focus:ring-2 focus:ring-[#6E2639]/30"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3 Packages Radio Cards */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-[#29221F] block">
                  Choose Package Tier <span className="text-rose-600">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id as PackageId)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#6E2639] text-white border-[#D4B477] shadow-sm'
                            : 'bg-[#F8F3EA] text-[#29221F] border-[#D4B477]/30 hover:border-[#D4B477]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif font-bold text-base">{pkg.name.split(' ')[0]}</span>
                            <span className="font-bold text-xs">₹{pkg.price}</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-[#F8F3EA]/80' : 'text-[#29221F]/70'}`}>
                            {pkg.description}
                          </p>
                        </div>
                        <div className="pt-3 flex items-center justify-between text-[10px] font-semibold">
                          <span className={isSelected ? 'text-[#D4B477]' : 'text-[#6E2639]'}>
                            {pkg.id === 'premium' ? '★ Full Features' : pkg.id === 'standard' ? 'Popular' : 'Essential'}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D4B477]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[#D4B477]/20">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-xs font-semibold text-[#29221F]/60 hover:text-[#29221F] cursor-pointer"
                >
                  ← Back to Gallery
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setCurrentStep(2);
                  }}
                  className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Contact Details</span>
                  <ArrowRight className="w-4 h-4 text-[#D4B477]" />
                </button>
              </div>
            </div>
          )}

          {/* ==============================================================================
              STEP 2: CUSTOMER CONTACT DETAILS
          ============================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#D4B477]/20 pb-3">
                <h3 className="font-serif text-2xl font-bold text-[#29221F]">
                  2. Your Contact Information
                </h3>
                <p className="text-xs text-[#29221F]/70 font-sans mt-0.5">
                  We will use these details to coordinate and finalize your invitation website.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Your Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Karthikeyan Raman"
                    className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F] focus:outline-none focus:ring-2 focus:ring-[#6E2639]/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#29221F] block mb-1">
                      Primary Phone Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={primaryPhone}
                      onChange={(e) => setPrimaryPhone(e.target.value)}
                      placeholder="+91 00000 00000"
                      className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F] focus:outline-none focus:ring-2 focus:ring-[#6E2639]/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#29221F] block mb-1">
                      WhatsApp Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={sameAsPrimary}
                      value={sameAsPrimary ? primaryPhone : whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="+91 00000 00000"
                      className={`w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F] focus:outline-none focus:ring-2 focus:ring-[#6E2639]/30 ${
                        sameAsPrimary ? 'opacity-70 bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2.5 text-xs text-[#29221F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPrimary}
                      onChange={(e) => setSameAsPrimary(e.target.checked)}
                      className="w-4 h-4 rounded text-[#6E2639] accent-[#6E2639]"
                    />
                    <span>WhatsApp number is the same as my phone number</span>
                  </label>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[#D4B477]/20">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#29221F] bg-[#F8F3EA] hover:bg-[#E9DFD0] cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setCurrentStep(3);
                  }}
                  className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#6E2639] hover:bg-[#571C2B] transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Event Details</span>
                  <ArrowRight className="w-4 h-4 text-[#D4B477]" />
                </button>
              </div>
            </div>
          )}

          {/* ==============================================================================
              STEP 3: EVENT DETAILS & SUBMISSION
          ============================================================================== */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#D4B477]/20 pb-3">
                <h3 className="font-serif text-2xl font-bold text-[#29221F]">
                  3. Event & Venue Details
                </h3>
                <p className="text-xs text-[#29221F]/70 font-sans mt-0.5">
                  Enter details to appear on your personalized invitation website.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Names to Appear on Invitation <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={celebrantNames}
                    onChange={(e) => setCelebrantNames(e.target.value)}
                    placeholder="e.g. Karthik & Janani / Aarav's First Birthday"
                    className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#29221F] block mb-1">
                      Event Date <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#29221F] block mb-1">
                      Event Timing
                    </label>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="e.g. 9:00 AM onwards / 6:30 PM"
                      className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#29221F] block mb-1">
                      Venue Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. Mayor Ramanathan Chettiar Hall"
                      className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#29221F] block mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                    >
                      <option value="English">English</option>
                      <option value="Bilingual">English & Regional Language</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Venue Address <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g. Raja Annamalaipuram, Chennai 600028"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Google Maps URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                  />
                </div>

                {/* Optional Photo Uploads */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-[#29221F] block">
                    Photos (Optional, up to 6)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#D4B477]/40 shadow-xs">
                        <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {uploadedPhotos.length < 6 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#D4B477]/60 hover:border-[#6E2639] bg-[#F8F3EA] flex flex-col items-center justify-center cursor-pointer text-[#29221F]/60 transition-colors">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-semibold">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#29221F] block mb-1">
                    Additional Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    placeholder="e.g. Any special family quotes, blessings, or custom styling preferences..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#F8F3EA] border border-[#D4B477]/40 text-[#29221F]"
                  />
                </div>

                {/* Privacy Guarantee Notice */}
                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#D4B477]/30 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-[#29221F]/80 leading-relaxed font-sans">
                      <strong>E-INVORA Guarantee:</strong> Your contact details and celebration information are strictly confidential. No online payment is required today. Our team will review your enquiry and contact you directly via WhatsApp / phone call.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-[#D4B477]/20">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#29221F] bg-[#F8F3EA] hover:bg-[#E9DFD0] cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-10 py-4 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#6E2639] hover:bg-[#571C2B] transform active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Booking</span>
                      <ArrowRight className="w-4 h-4 text-[#D4B477]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

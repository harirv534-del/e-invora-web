import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  EventCategory,
  Package,
  PackageId,
  Template,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PACKAGES,
  INITIAL_SETTINGS,
  INITIAL_TEMPLATES,
} from './data/initialData';
import { api } from './lib/api';

// Public Layout & Home Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { CategoryBar } from './components/home/CategoryBar';
import { FeaturedDesigns } from './components/home/FeaturedDesigns';
import { PackageShowcase } from './components/home/PackageShowcase';
import { HowItWorks } from './components/home/HowItWorks';
import { Benefits } from './components/home/Benefits';
import { FAQSection } from './components/home/FAQSection';
import { WhatsAppCTA } from './components/home/WhatsAppCTA';

// Public Subpages
import { DesignGallery } from './components/gallery/DesignGallery';
import { InteractiveDemoView } from './components/demo/InteractiveDemoView';
import { BookingPage } from './components/booking/BookingPage';
import { ThankYouPage } from './components/booking/ThankYouPage';
import { PublicInvitationView } from './components/invitation/PublicInvitationView';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminBookings } from './components/admin/AdminBookings';
import { AdminTemplates } from './components/admin/AdminTemplates';
import { AdminPackages } from './components/admin/AdminPackages';
import { AdminPublished } from './components/admin/AdminPublished';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminRsvps } from './components/admin/AdminRsvps';

export default function App() {
  // Global Data
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [categories, setCategories] = useState<EventCategory[]>(INITIAL_CATEGORIES);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);

  // Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Navigation Parameters
  const [selectedDemoSlug, setSelectedDemoSlug] = useState<string>('royal-rajputana');
  const [selectedDemoPackage, setSelectedDemoPackage] = useState<PackageId>('standard');
  const [bookingPrefill, setBookingPrefill] = useState<{
    slug?: string;
    packageId?: PackageId;
    category?: string;
  }>({});
  const [thankYouData, setThankYouData] = useState<{
    reference: string;
    templateName: string;
    packageName: string;
    agreedPrice: number;
  } | null>(null);

  // Admin Auth State
  const [serverDown, setServerDown] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [adminSelectedBookingId, setAdminSelectedBookingId] = useState<string | undefined>(undefined);

  // Fetch initial data from server
  useEffect(() => {
    fetch('/api/health').then((r) => { if (!r.ok) setServerDown(true); }).catch(() => setServerDown(true));
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [s, pkgs, cats, tpls] = await Promise.all([
          api.getSettings(),
          api.getPackages(),
          api.getCategories(),
          api.getTemplates(),
        ]);
        setSettings(s);
        setPackages(pkgs);
        setCategories(cats);
        setTemplates(tpls);
      } catch (err) {
        console.error('Failed to load initial data from server API:', err);
      }
    }
    loadInitialData();

    // Check existing admin session
    api.checkAdminAuth().then((isAuth) => {
      setIsAdminLoggedIn(isAuth);
    });
  }, []);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, params?: any) => {
    if (params) {
      if (params.slug) setSelectedDemoSlug(params.slug);
      if (params.packageId) setSelectedDemoPackage(params.packageId);
      if (params.bookingPrefill) setBookingPrefill(params.bookingPrefill);
    }

    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper route matchers
  const isDemoRoute = currentPath.startsWith('/templates/') && currentPath.endsWith('/demo');
  const isInviteRoute = currentPath.startsWith('/invite/');
  const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin/login';
  const isAdminLoginRoute = currentPath === '/admin/login';

  // Extract slugs
  const demoSlug = isDemoRoute
    ? currentPath.replace('/templates/', '').replace('/demo', '')
    : selectedDemoSlug;

  const inviteSlug = isInviteRoute
    ? currentPath.replace('/invite/', '')
    : '';

  // Current active template for demo
  const currentDemoTemplate =
    templates.find((t) => t.slug === demoSlug || t.id === demoSlug) || templates[0];

  // ==============================================================================
  // 1. PUBLIC PUBLISHED INVITATION ROUTE (/invite/:slug)
  // ==============================================================================
  if (isInviteRoute && inviteSlug) {
    return <PublicInvitationView slug={inviteSlug} onGoHome={() => navigateTo('/')} />;
  }

  // ==============================================================================
  // 2. INTERACTIVE DEMO VIEW ROUTE (/templates/:slug/demo)
  // ==============================================================================
  if (isDemoRoute && currentDemoTemplate) {
    return (
      <InteractiveDemoView
        template={currentDemoTemplate}
        packages={packages}
        initialPackageId={selectedDemoPackage}
        onBack={() => navigateTo('/gallery')}
        onBookThisDesign={(slug, pkgId) => {
          setBookingPrefill({ slug, packageId: pkgId });
          navigateTo('/book');
        }}
      />
    );
  }

  // ==============================================================================
  // 3. OWNER ADMIN LOGIN ROUTE (/admin/login)
  // ==============================================================================
  if (isAdminLoginRoute) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          navigateTo('/admin');
        }}
        onGoHome={() => navigateTo('/')}
      />
    );
  }

  // ==============================================================================
  // 4. OWNER-ONLY ADMIN WORKSPACE ROUTE (/admin)
  // ==============================================================================
  if (isAdminRoute) {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            navigateTo('/admin');
          }}
          onGoHome={() => navigateTo('/')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => setAdminTab(tab)}
        onLogout={async () => {
          await api.adminLogout();
          setIsAdminLoggedIn(false);
          navigateTo('/admin/login');
        }}
        onGoPublic={() => navigateTo('/')}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab) => setAdminTab(tab)}
            onSelectBooking={(id) => {
              setAdminSelectedBookingId(id);
              setAdminTab('bookings');
            }}
          />
        )}
        {adminTab === 'bookings' && (
          <AdminBookings
            initialSelectedBookingId={adminSelectedBookingId}
            onClearInitialBooking={() => setAdminSelectedBookingId(undefined)}
          />
        )}
        {adminTab === 'templates' && (
          <AdminTemplates
            categories={categories}
            onPreviewTemplate={(slug) => {
              navigateTo(`/templates/${slug}/demo`, { slug });
            }}
          />
        )}
        {adminTab === 'packages' && <AdminPackages />}
        {adminTab === 'ai-drafts' && (
          <AdminBookings
            initialSelectedBookingId={adminSelectedBookingId}
            onClearInitialBooking={() => setAdminSelectedBookingId(undefined)}
          />
        )}
        {adminTab === 'payments' && (
          <AdminBookings
            initialSelectedBookingId={adminSelectedBookingId}
            onClearInitialBooking={() => setAdminSelectedBookingId(undefined)}
          />
        )}
        {adminTab === 'published' && <AdminPublished />}
        {adminTab === 'rsvps' && <AdminRsvps />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // ==============================================================================
  // 5. PUBLIC WEBSITE (NAVBAR, PAGES, FOOTER)
  // ==============================================================================
  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#29221F] flex flex-col font-sans">
      {serverDown && (
        <div role="alert" className="bg-amber-100 text-amber-900 text-xs text-center px-4 py-2 border-b border-amber-300">
          The booking server is not reachable right now, so bookings and replies cannot be saved. Please try again shortly or contact us on WhatsApp.
        </div>
      )}
      <Navbar
        settings={settings}
        currentPath={currentPath}
        onNavigate={(path, params) => navigateTo(path, params)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <main className="flex-1">
        {/* Route: Thank You Page */}
        {currentPath === '/thank-you' && thankYouData ? (
          <ThankYouPage
            bookingReference={thankYouData.reference}
            templateName={thankYouData.templateName}
            packageName={thankYouData.packageName}
            agreedPrice={thankYouData.agreedPrice}
            settings={settings}
            onGoHome={() => navigateTo('/')}
          />
        ) : currentPath === '/book' ? (
          /* Route: Dedicated Booking Page */
          <BookingPage
            categories={categories}
            templates={templates}
            packages={packages}
            prefilledTemplateSlug={bookingPrefill.slug}
            prefilledPackageId={bookingPrefill.packageId}
            prefilledCategory={bookingPrefill.category}
            onSuccess={(ref, tplName, pkgName, agreedPrice) => {
              setThankYouData({
                reference: ref,
                templateName: tplName,
                packageName: pkgName,
                agreedPrice,
              });
              navigateTo('/thank-you');
            }}
            onCancel={() => navigateTo('/gallery')}
          />
        ) : currentPath === '/gallery' ? (
          /* Route: Design Gallery Page */
          <DesignGallery
            templates={templates}
            categories={categories}
            packages={packages}
            initialCategory={bookingPrefill.category}
            onViewDemo={(slug) => {
              navigateTo(`/templates/${slug}/demo`, { slug });
            }}
            onBookDesign={(slug) => {
              setBookingPrefill({ slug });
              navigateTo('/book');
            }}
          />
        ) : (
          /* Route: Home Page */
          <>
            <Hero
              featuredTemplate={templates[0]}
              onExploreDesigns={() => navigateTo('/gallery')}
              onViewHowItWorks={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewDemo={(slug) => {
                navigateTo(`/templates/${slug}/demo`, { slug });
              }}
              onBookNow={(slug) => {
                setBookingPrefill({ slug });
                navigateTo('/book');
              }}
            />

            <CategoryBar
              categories={categories}
              onSelectCategory={(catId) => {
                setBookingPrefill({ category: catId });
                navigateTo('/gallery');
              }}
            />

            <FeaturedDesigns
              templates={templates}
              categories={categories}
              packages={packages}
              onViewDemo={(slug) => {
                navigateTo(`/templates/${slug}/demo`, { slug });
              }}
              onBookDesign={(slug) => {
                setBookingPrefill({ slug });
                navigateTo('/book');
              }}
              onViewAllGallery={() => navigateTo('/gallery')}
            />

            <PackageShowcase
              packages={packages}
              onSelectPackage={(pkgId) => {
                setBookingPrefill({ packageId: pkgId as PackageId });
                navigateTo('/book');
              }}
              onViewDemoWithPackage={(pkgId) => {
                setSelectedDemoPackage(pkgId as PackageId);
                navigateTo(`/templates/${templates[0]?.slug || 'royal-rajputana'}/demo`, {
                  slug: templates[0]?.slug || 'royal-rajputana',
                  packageId: pkgId as PackageId,
                });
              }}
            />

            <HowItWorks onStartBooking={() => navigateTo('/book')} />

            <Benefits />

            <FAQSection />

            <WhatsAppCTA settings={settings} onBookNow={() => navigateTo('/book')} />
          </>
        )}
      </main>

      <Footer settings={settings} onNavigate={(path) => navigateTo(path)} />
    </div>
  );
}

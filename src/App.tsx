import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { OfflineBanner } from '@/components/ui/offline-banner'
import { UpdateToast } from '@/components/pwa/UpdateToast'
import { Toaster } from 'sonner'

import { CataloguePage } from '@/pages/customer/CataloguePage'
import RequestPage from '@/pages/customer/RequestPage'
import ContactPage from '@/pages/customer/ContactPage'
import SubmittedPage from '@/pages/customer/SubmittedPage'
import EnquiriesPage from '@/pages/customer/EnquiriesPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Lazy-loaded admin routes (heavy libraries like jspdf, html2canvas, image compression stay isolated)
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminCreateOrderPage = lazy(() => import('@/pages/admin/AdminCreateOrderPage'))
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'))
const AdminInvoicePage = lazy(() => import('@/pages/admin/AdminInvoicePage'))
const AdminMenuPage = lazy(() => import('@/pages/admin/AdminMenuPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'))
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomerDetailPage'))
const AdminNotFoundPage = lazy(() => import('@/pages/admin/AdminNotFoundPage'))

// Legal & Consumer Advisory Routes
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage'))
const AllergyDietaryPage = lazy(() => import('@/pages/legal/AllergyDietaryPage'))
const FoodSafetyPage = lazy(() => import('@/pages/legal/FoodSafetyPage'))

import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard'
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary'

import { MotionProvider } from '@/motion/MotionProvider'
import { FlyToBarProvider } from '@/components/motion/FlyToBar'
import { SmoothScroll } from '@/components/motion/SmoothScroll'

// Route fallback for budget phone networks
const RouteFallback = () => (
  <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
    <div 
      className="w-8 h-8 rounded-full border-3 border-[var(--brand)] border-t-transparent animate-spin" 
      role="status" 
      aria-label="Loading page..."
    />
  </div>
)

export default function App() {
  return (
    <MotionProvider>
      <BrowserRouter>
        {/* Universal Frosted Glass Offline Banner */}
        <OfflineBanner />

        {/* PWA Update Notification Toast */}
        <UpdateToast />

        {/* Global Bottom Toasts via Sonner per specification */}
        <Toaster position="bottom-center" richColors />

        {/* Non-touch Desktop Smooth Scroll (Lenis) */}
        <SmoothScroll />

        <FlyToBarProvider>
          <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Customer Routes (Catalogue is instant, sub-pages load on demand) */}
          <Route path="/" element={<CataloguePage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/submitted" element={<SubmittedPage />} />
          <Route path="/enquiries" element={<EnquiriesPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/allergy-dietary-info" element={<AllergyDietaryPage />} />
          <Route path="/food-safety" element={<FoodSafetyPage />} />

          {/* Admin Login Route (Unprotected) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes (Guarded with Error Boundary) */}
          <Route
            element={
              <AdminErrorBoundary>
                <AdminRouteGuard />
              </AdminErrorBoundary>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/new" element={<AdminCreateOrderPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="/admin/orders/:id/invoice" element={<AdminInvoicePage />} />
            <Route path="/admin/menu" element={<AdminMenuPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
            {/* 404 inside Admin Shell */}
            <Route path="/admin/*" element={<AdminNotFoundPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </FlyToBarProvider>
  </BrowserRouter>
</MotionProvider>
  )
}


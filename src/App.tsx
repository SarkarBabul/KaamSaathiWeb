import { lazy } from "react";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { KaamSaathiLayout } from "./components/kaamsaathi/KaamSaathiLayout";
import { CanonicalHead } from "./components/seo/CanonicalHead";
import { UrlCanonicalizer } from "./components/seo/UrlCanonicalizer";
import Home from "./pages/Home";
import About from "./pages/About";
import KaamSaathiHome from "./pages/kaamsaathi/KaamSaathiHome";
import KaamSaathiFeatures from "./pages/kaamsaathi/KaamSaathiFeatures";
import KaamSaathiPricing from "./pages/kaamsaathi/KaamSaathiPricing";
import KaamSaathiFAQ from "./pages/kaamsaathi/KaamSaathiFAQ";
import KaamSaathiBlog from "./pages/kaamsaathi/KaamSaathiBlog";
import KaamSaathiBlogPost from "./pages/kaamsaathi/KaamSaathiBlogPost";
import KaamSaathiScheduleDemo from "./pages/kaamsaathi/KaamSaathiScheduleDemo";
import WorkerAttendanceApp from "./pages/kaamsaathi/landing/WorkerAttendanceApp";
import LabourManagementApp from "./pages/kaamsaathi/landing/LabourManagementApp";
import ContractorAttendanceApp from "./pages/kaamsaathi/landing/ContractorAttendanceApp";
import MazdoorHajriApp from "./pages/kaamsaathi/landing/MazdoorHajriApp";
import ConstructionSiteManagement from "./pages/kaamsaathi/landing/ConstructionSiteManagement";
import BrickEstimation from "./pages/kaamsaathi/BrickEstimation";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.KaamSaathi";

const PlayStoreRedirect = () => {
  useEffect(() => {
    window.location.href = PLAY_STORE_URL;
  }, []);
  return null;
};
const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UrlCanonicalizer />
        <CanonicalHead />
        <Routes>
          {/* KaamSaathi standalone site — served at root for custom domain */}
          <Route element={<KaamSaathiLayout />}>
            <Route path="/" element={<KaamSaathiHome />} />
            <Route path="/features" element={<KaamSaathiFeatures />} />
            <Route path="/pricing" element={<KaamSaathiPricing />} />
            <Route path="/faq" element={<KaamSaathiFAQ />} />
            <Route path="/blog" element={<KaamSaathiBlog />} />
            <Route path="/blog/:slug" element={<KaamSaathiBlogPost />} />
            <Route path="/schedule-demo" element={<KaamSaathiScheduleDemo />} />
            <Route path="/worker-attendance-app" element={<WorkerAttendanceApp />} />
            <Route path="/labour-management-app" element={<LabourManagementApp />} />
            <Route path="/contractor-attendance-app" element={<ContractorAttendanceApp />} />
            <Route path="/mazdoor-hajri-app" element={<MazdoorHajriApp />} />
            <Route path="/construction-site-management" element={<ConstructionSiteManagement />} />
            <Route path="/cost-estimation/brick-estimation" element={<BrickEstimation />} />
          </Route>

          {/* Kamet corporate site (accessible under /kamet) */}
          <Route element={<div className="flex flex-col min-h-screen"><Navbar /><main className="flex-1"><Outlet /></main><Footer /></div>}>
            <Route path="/kamet" element={<Home />} />
            <Route path="/kamet/about" element={<About />} />
            <Route path="/kamet/services" element={<Services />} />
            <Route path="/kamet/contact" element={<Contact />} />
          </Route>

          <Route path="/about" element={<Navigate to="/kamet/about" replace />} />
          <Route path="/services" element={<Navigate to="/kamet/services" replace />} />
          <Route path="/contact" element={<Navigate to="/kamet/contact" replace />} />
          <Route path="/kaamsaathi" element={<Navigate to="/" replace />} />

          {/* App deep-link redirects to Play Store */}
          <Route path="/attendance" element={<PlayStoreRedirect />} />
          <Route path="/dashboard" element={<PlayStoreRedirect />} />
          <Route path="/addEmployee" element={<PlayStoreRedirect />} />
          <Route path="/forgetPassword" element={<PlayStoreRedirect />} />
          <Route path="/reports" element={<PlayStoreRedirect />} />
          <Route path="/plans" element={<PlayStoreRedirect />} />
          <Route path="/expenseTracker" element={<PlayStoreRedirect />} />
          <Route path="/siteManagement" element={<PlayStoreRedirect />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
import { lazy, Suspense } from "react";
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
import { AuthProvider } from "./app-desktop/auth/AuthContext";
import { ProtectedRoute } from "./app-desktop/routes/ProtectedRoute";
import { RoleRoute } from "./app-desktop/routes/RoleRoute";
import { DesktopShell } from "./app-desktop/layouts/DesktopShell";
import { PlaceholderPage } from "./app-desktop/components/shared/PlaceholderPage";
import {
  AttendanceSkeleton,
  ChatSkeleton,
  ExpenseTrackerSkeleton,
  FormPageSkeleton,
  ListPageSkeleton,
  LoginSkeleton,
  DashboardSkeleton as PageDashboardSkeleton,
  PageSkeleton,
  PricingSkeleton,
  ProfileSkeleton,
  ReportSkeleton,
} from "./app-desktop/components/shared/skeletons";
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

const Login = lazy(() => import("./app-desktop/pages/auth/Login"));
const EnterpriseLayout = lazy(() => import("./app-desktop/layouts/EnterpriseLayout"));
const EmployerLayout = lazy(() => import("./app-desktop/layouts/EmployerLayout"));
const EnterpriseDashboard = lazy(() => import("./app-desktop/pages/enterprise/Dashboard"));
const EnterpriseUserManagement = lazy(() => import("./app-desktop/pages/enterprise/UserManagement"));
const EnterpriseSiteManagement = lazy(() => import("./app-desktop/pages/enterprise/SiteManagement"));
const EnterpriseAttendance = lazy(() => import("./app-desktop/pages/enterprise/Attendance"));
const EnterprisePayments = lazy(() => import("./app-desktop/pages/enterprise/Payments"));
const EnterpriseExpenseTracker = lazy(() => import("./app-desktop/pages/enterprise/ExpenseTracker"));
const EnterpriseReports = lazy(() => import("./app-desktop/pages/enterprise/Reports"));
const EnterpriseAiDashboard = lazy(() => import("./app-desktop/pages/enterprise/AiDashboard"));
const EnterpriseSettings = lazy(() => import("./app-desktop/pages/enterprise/Settings"));
const EmployerHome = lazy(() => import("./app-desktop/pages/employer/Home"));
const EmployerEmployeeManagement = lazy(() => import("./app-desktop/pages/employer/EmployeeManagement"));
const EmployerSiteManagement = lazy(() => import("./app-desktop/pages/employer/SiteManagement"));
const Profile = lazy(() => import("./app-desktop/pages/common/Profile"));
const EmployerAttendance = lazy(() => import("./app-desktop/pages/employer/Attendance"));
const EmployerRecordPayment = lazy(() => import("./app-desktop/pages/employer/RecordPayment"));
const EmployerReports = lazy(() => import("./app-desktop/pages/employer/Reports"));
const EmployerAttendanceReport = lazy(() => import("./app-desktop/pages/employer/AttendanceReport"));
const EmployerPaymentReport = lazy(() => import("./app-desktop/pages/employer/PaymentReport"));
const EmployerPlan = lazy(() => import("./app-desktop/pages/employer/Plan"));
const EmployerAiChat = lazy(() => import("./app-desktop/pages/employer/AiChat"));
const EmployerExpenseTracker = lazy(() => import("./app-desktop/pages/employer/ExpenseTracker"));

// Wraps a single lazy page in its OWN <Suspense> boundary, right at the
// route that renders it — never around the persistent shell (Navbar,
// workspace sidebar/header) those routes render inside. This is the fix for
// the full-screen white flash: previously one <Suspense> wrapped the entire
// <Routes> tree, so any not-yet-loaded lazy chunk hid everything up to that
// single boundary (the whole app) behind its `fallback={null}`, rather than
// just the destination page's own content area.
function withFallback(children: React.ReactNode, fallback: React.ReactNode) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

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
    <AuthProvider>
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

          {/*
            KaamSaathi Desktop Version — reached via the public Navbar's own
            "Desktop Version" link. DesktopShell keeps that same public
            Navbar mounted as the top-level brand/nav layer above login and
            every authenticated workspace below it, so the transition reads
            as a continuation of the same website rather than a jump into a
            separate application.
          */}
          <Route element={<DesktopShell />}>
            <Route path="/auth/login" element={withFallback(<Login />, <LoginSkeleton />)} />

            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allow={["ENTERPRISE"]} />}>
                <Route path="/enterprise" element={withFallback(<EnterpriseLayout />, <PageSkeleton />)}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={withFallback(<EnterpriseDashboard />, <PageDashboardSkeleton />)} />
                  <Route
                    path="user-management"
                    element={withFallback(<EnterpriseUserManagement />, <ListPageSkeleton />)}
                  />
                  <Route
                    path="site-management"
                    element={withFallback(<EnterpriseSiteManagement />, <ListPageSkeleton />)}
                  />
                  <Route path="attendance" element={withFallback(<EnterpriseAttendance />, <AttendanceSkeleton />)} />
                  <Route path="payments" element={withFallback(<EnterprisePayments />, <ReportSkeleton />)} />
                  <Route
                    path="expense-tracker"
                    element={withFallback(<EnterpriseExpenseTracker />, <ExpenseTrackerSkeleton />)}
                  />
                  <Route path="reports" element={withFallback(<EnterpriseReports />, <ReportSkeleton />)} />
                  <Route path="ai-dashboard" element={withFallback(<EnterpriseAiDashboard />, <PageSkeleton />)} />
                  <Route path="settings" element={withFallback(<EnterpriseSettings />, <PageSkeleton />)} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>
              </Route>

              {/* Employer/Admin workspace — Angular's dashboard/employer/*, role "admin" */}
              <Route element={<RoleRoute allow={["admin"]} />}>
                <Route path="/dashboard/employer" element={withFallback(<EmployerLayout />, <PageSkeleton />)}>
                  <Route index element={<Navigate to="home" replace />} />
                  <Route path="home" element={withFallback(<EmployerHome />, <PageDashboardSkeleton />)} />
                  <Route
                    path="employee-management"
                    element={withFallback(<EmployerEmployeeManagement />, <ListPageSkeleton />)}
                  />
                  <Route path="attendance" element={withFallback(<EmployerAttendance />, <AttendanceSkeleton />)} />
                  <Route
                    path="attendance/record-payment/:workerId"
                    element={withFallback(<EmployerRecordPayment />, <FormPageSkeleton />)}
                  />
                  <Route path="reports" element={withFallback(<EmployerReports />, <ReportSkeleton />)} />
                  <Route
                    path="reports/attendance"
                    element={withFallback(<EmployerAttendanceReport />, <ReportSkeleton />)}
                  />
                  <Route path="reports/payment" element={withFallback(<EmployerPaymentReport />, <ReportSkeleton />)} />
                  <Route path="plan" element={withFallback(<EmployerPlan />, <PricingSkeleton />)} />
                  <Route
                    path="site-management"
                    element={withFallback(<EmployerSiteManagement />, <ListPageSkeleton />)}
                  />
                  <Route
                    path="expense-tracker"
                    element={withFallback(<EmployerExpenseTracker />, <ExpenseTrackerSkeleton />)}
                  />
                  <Route path="ai-chat" element={withFallback(<EmployerAiChat />, <ChatSkeleton />)} />
                  <Route path="*" element={<Navigate to="home" replace />} />
                </Route>
              </Route>

              {/*
                Angular's dashboard/profile: a sibling of both the 'employer'
                and 'enterprise' role-gated children under dashboard.routes.ts,
                with no canActivate/roles of its own — only the parent
                '/dashboard' route's AuthGuard applies. Common to every
                authenticated dashboard role (admin, ENTERPRISE, non-admin),
                so this sits directly under ProtectedRoute rather than inside
                either RoleRoute block.
              */}
              <Route path="/dashboard/profile" element={withFallback(<EmployerLayout />, <PageSkeleton />)}>
                <Route index element={withFallback(<Profile />, <ProfileSkeleton />)} />
              </Route>
            </Route>
          </Route>

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
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
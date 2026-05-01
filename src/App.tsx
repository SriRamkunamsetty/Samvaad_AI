import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Landing = lazy(() => import("./pages/Landing"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const ProspectPage = lazy(() => import("./pages/dashboard/ProspectPage"));
const OutreachPage = lazy(() => import("./pages/dashboard/OutreachPage"));
const AnalyzerPage = lazy(() => import("./pages/dashboard/AnalyzerPage"));
const FollowUpPage = lazy(() => import("./pages/dashboard/FollowUpPage"));
const RefinePage = lazy(() => import("./pages/dashboard/RefinePage"));
const MetricsPage = lazy(() => import("./pages/dashboard/MetricsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const SharePage = lazy(() => import("./pages/SharePage"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="fixed inset-0 grid place-items-center bg-background text-primary" aria-live="polite" aria-busy="true">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="sr-only">Loading page content...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/dashboard/prospect" element={<ProspectPage />} />
            <Route path="/dashboard/outreach" element={<OutreachPage />} />
            <Route path="/dashboard/analyzer" element={<AnalyzerPage />} />
            <Route path="/dashboard/followup" element={<FollowUpPage />} />
            <Route path="/dashboard/refine" element={<RefinePage />} />
            <Route path="/dashboard/metrics" element={<MetricsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/share/:id" element={<SharePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

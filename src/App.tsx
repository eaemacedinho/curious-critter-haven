import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/app/AppLayout";
import CookieConsent from "@/components/CookieConsent";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Templates from "@/pages/Templates";
import Privacy from "@/pages/Privacy";
import Cookies from "@/pages/Cookies";
import Terms from "@/pages/Terms";
import CreatorPublic from "@/pages/CreatorPublic";
import NotFound from "@/pages/NotFound";
import ResetPassword from "@/pages/ResetPassword";

import Dashboard from "@/pages/app/Dashboard";
import Creators from "@/pages/app/Creators";
import CreatorEdit from "@/pages/app/CreatorEdit";
import Checkout from "@/pages/app/Checkout";
import Campaigns from "@/pages/app/Campaigns";
import Analytics from "@/pages/app/Analytics";
import Settings from "@/pages/app/Settings";
import Members from "@/pages/app/Members";
import Referrals from "@/pages/app/Referrals";
import AppTemplates from "@/pages/app/AppTemplates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/c/:handle" element={<CreatorPublic />} />
              <Route path="/exemplo" element={<ExampleLink />} />

              {/* Protected app routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="creators" element={<Creators />} />
                <Route path="creators/:creatorId/edit" element={<CreatorEdit />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="templates" element={<AppTemplates />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="members" element={<Members />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="checkout" element={<Checkout />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

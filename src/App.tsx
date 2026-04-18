import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import JobOffers from "./pages/JobOffers";
import JobDetails from "./pages/JobDetails";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import SearchJobs from "./pages/candidate/SearchJobs";
import Applications from "./pages/candidate/Applications";

import CompanyDashboard from "./pages/company/CompanyDashboard";
import ManageOffers from "./pages/company/ManageOffers";
import ViewCandidates from "./pages/company/ViewCandidates";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageAccounts from "./pages/admin/ManageAccounts";
import ManageCategories from "./pages/admin/ManageCategories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobOffers />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* Candidate routes */}
            <Route path="/candidate" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><SearchJobs /></DashboardLayout></ProtectedRoute>} />
            <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><CandidateProfile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/candidate/jobs" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><SearchJobs /></DashboardLayout></ProtectedRoute>} />
            <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['candidate']}><DashboardLayout><Applications /></DashboardLayout></ProtectedRoute>} />

            {/* Company routes */}
            <Route path="/company" element={<ProtectedRoute allowedRoles={['company']}><DashboardLayout><CompanyDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/company/offers" element={<ProtectedRoute allowedRoles={['company']}><DashboardLayout><ManageOffers /></DashboardLayout></ProtectedRoute>} />
            <Route path="/company/candidates" element={<ProtectedRoute allowedRoles={['company']}><DashboardLayout><ViewCandidates /></DashboardLayout></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/accounts" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ManageAccounts /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ManageCategories /></DashboardLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

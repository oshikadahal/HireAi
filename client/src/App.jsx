import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import CandidateLayout from './layouts/CandidateLayout.jsx';
import HRLayout from './layouts/HRLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Public
import LandingPage from './pages/public/LandingPage.jsx';
import JobsPage from './pages/public/JobsPage.jsx';
import JobDetailPage from './pages/public/JobDetailPage.jsx';
import CompanyPage from './pages/public/CompanyPage.jsx';

// Auth
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterCandidate from './pages/auth/RegisterCandidate.jsx';
import RegisterHR from './pages/auth/RegisterHR.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Candidate
import CandidateDashboard from './pages/candidate/Dashboard.jsx';
import CandidateProfile from './pages/candidate/Profile.jsx';
import MyApplications from './pages/candidate/MyApplications.jsx';
import Assessments from './pages/candidate/Assessments.jsx';
import TakeAssessment from './pages/candidate/TakeAssessment.jsx';
import CandidateInterviews from './pages/candidate/Interviews.jsx';

// HR
import HRDashboard from './pages/hr/Dashboard.jsx';
import ManageJobs from './pages/hr/ManageJobs.jsx';
import CreateJob from './pages/hr/CreateJob.jsx';
import EditJob from './pages/hr/EditJob.jsx';
import Applicants from './pages/hr/Applicants.jsx';
import CompanyProfile from './pages/hr/CompanyProfile.jsx';
import HRInterviews from './pages/hr/Interviews.jsx';
import HRAssessments from './pages/hr/HRAssessments.jsx';
import AITools from './pages/hr/AITools.jsx';

// Admin
import AdminDashboard from './pages/admin/Dashboard.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import CompanyApproval from './pages/admin/CompanyApproval.jsx';
import AdminManageJobs from './pages/admin/ManageJobs.jsx';
import AdminCreateJob from './pages/admin/CreateJob.jsx';
import AdminEditJob from './pages/admin/EditJob.jsx';
import AdminApplicants from './pages/admin/Applicants.jsx';

// Misc
import NotFound from './pages/NotFound.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { token, user } = useSelector((s) => s.auth);
  if (token) {
    const path = user?.role === 'hr' ? '/hr' : user?.role === 'admin' ? '/admin' : '/candidate';
    return <Navigate to={path} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────── */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="company/:id" element={<CompanyPage />} />

        <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="register/candidate" element={<GuestRoute><RegisterCandidate /></GuestRoute>} />
        <Route path="register/hr" element={<GuestRoute><RegisterHR /></GuestRoute>} />
        <Route path="forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
      </Route>

      {/* ── Candidate ──────────────────────────────── */}
      <Route
        path="/candidate"
        element={<ProtectedRoute roles={['candidate']}><CandidateLayout /></ProtectedRoute>}
      >
        <Route index element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="assessments/take/:id" element={<TakeAssessment />} />
        <Route path="interviews" element={<CandidateInterviews />} />
      </Route>

      {/* ── HR ─────────────────────────────────────── */}
      <Route
        path="/hr"
        element={<ProtectedRoute roles={['hr']}><HRLayout /></ProtectedRoute>}
      >
        <Route index element={<HRDashboard />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="jobs/create" element={<CreateJob />} />
        <Route path="jobs/:id/edit" element={<EditJob />} />
        <Route path="jobs/:id/applicants" element={<Applicants />} />
        <Route path="company" element={<CompanyProfile />} />
        <Route path="interviews" element={<HRInterviews />} />
        <Route path="assessments" element={<HRAssessments />} />
        <Route path="ai-tools" element={<AITools />} />
      </Route>

      {/* ── Admin ──────────────────────────────────── */}
      <Route
        path="/admin"
        element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="jobs" element={<AdminManageJobs />} />
        <Route path="jobs/create" element={<AdminCreateJob />} />
        <Route path="jobs/:id/edit" element={<AdminEditJob />} />
        <Route path="jobs/:id/applicants" element={<AdminApplicants />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="companies" element={<CompanyApproval />} />
      </Route>

      {/* ── Catch-all ──────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

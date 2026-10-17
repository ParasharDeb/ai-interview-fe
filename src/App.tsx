
import { ThemeProvider } from "./lib/theme-context"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Landingpage } from "./components/pages/landingpage"
import { InformationPage } from "./components/pages/informationPage"
import { Toaster } from "sonner"
import { Loader } from "./components/pages/loadercomponent"

import { AuthPage } from "./components/pages/authPage"
import InterviewPage from "./components/pages/Interviewpage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import PaymentPage from "./components/pages/payment"
import DashboardPage from "./components/pages/dashboard"
import InterviewsPage from "./components/pages/interviews"
import ImprovementsPage from "./components/pages/improvements"
import { AppLayout } from "./components/AppLayout"

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route
            path="/information"
            element={
              <ProtectedRoute>
                <InformationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/loading-content" element={<Loader />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Signed-in pages that share the navbar */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/improvements" element={<ImprovementsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Route>
          <Route path="/about" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/interview/:interviewId"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster/>
    </ThemeProvider>
  );
}

export default App;

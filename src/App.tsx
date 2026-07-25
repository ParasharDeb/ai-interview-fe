
import { ThemeProvider } from "./lib/theme-context"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Landingpage } from "./components/pages/landingpage"
import { InformationPage } from "./components/pages/informationPage"
import { Toaster } from "sonner"
import { Loader } from "./components/pages/loadercomponent"

import { AuthPage } from "./components/pages/authPage"
import InterviewPage from "./components/pages/Interviewpage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import PaymentPage from "./components/pages/payment"
import AboutPage from "./components/pages/about"

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
          
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutPage/>
              </ProtectedRoute>
            }
          />
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

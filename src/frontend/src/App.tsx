import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile } from "./hooks/useQueries";
import Assessment from "./pages/Assessment";
import AuthPage from "./pages/AuthPage";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Ideas from "./pages/Ideas";
import Jobs from "./pages/Jobs";

export type Page = "dashboard" | "assessment" | "chat" | "jobs" | "ideas";

export default function App() {
  const { identity, isInitializing, login } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 w-64">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!identity) {
    if (currentPage === "ideas") {
      return (
        <>
          <div className="min-h-screen flex flex-col bg-background">
            <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
              <span className="font-display font-bold text-foreground">
                CareerPath AI
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  data-ocid="nav.dashboard.link"
                  onClick={() => setCurrentPage("dashboard")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  data-ocid="auth.signin.primary_button"
                  onClick={() => login()}
                  className="text-sm font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Started
                </button>
              </div>
            </header>
            <main className="flex-1 overflow-hidden">
              <Ideas />
            </main>
          </div>
          <Toaster />
        </>
      );
    }

    return (
      <>
        <AuthPage />
        <Toaster />
      </>
    );
  }

  const showProfileSetup = !profileLoading && !profile;

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "assessment":
        return <Assessment onComplete={() => setCurrentPage("jobs")} />;
      case "chat":
        return <Chat />;
      case "jobs":
        return <Jobs onStartAssessment={() => setCurrentPage("assessment")} />;
      case "ideas":
        return <Ideas />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      {showProfileSetup && <ProfileSetupModal open={showProfileSetup} />}
      <Toaster />
    </>
  );
}

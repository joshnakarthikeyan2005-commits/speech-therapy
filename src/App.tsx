import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PatientsView } from './components/patients/PatientsView';
import { SessionsView } from './components/sessions/SessionsView';
import { ProgressView } from './components/progress/ProgressView';
import { TherapistsView } from './components/therapists/TherapistsView';
import { ReportsView } from './components/reports/ReportsView';
import { MatchingView } from './components/matching/MatchingView';
import { FeedbackView } from './components/feedback/FeedbackView';
import { ConsentView } from './components/consent/ConsentView';
import { SettingsView } from './components/settings/SettingsView';
import { ExercisesView } from './components/exercises/ExercisesView';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-center items-center text-white">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8 mx-auto">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">SpeechCare</h1>
            <p className="text-xl mb-8 opacity-90">Clinical Platform</p>
            <div className="text-left space-y-4 max-w-md">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Streamlined patient management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Advanced progress tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>HIPAA-compliant platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Real-time collaboration tools</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <AuthScreen />;
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'patients':
        return <PatientsView />;
      case 'sessions':
        return <SessionsView />;
      case 'exercises':
        return <ExercisesView />;
      case 'progress':
        return <ProgressView />;
      case 'therapists':
        return <TherapistsView />;
      case 'reports':
        return <ReportsView />;
      case 'matching':
        return <MatchingView />;
      case 'feedback':
        return <FeedbackView />;
      case 'consent':
        return <ConsentView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          isOpen={sidebarOpen}
        />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 lg:ml-0">
          <Header 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          <main className="min-h-screen">
            {renderMainContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
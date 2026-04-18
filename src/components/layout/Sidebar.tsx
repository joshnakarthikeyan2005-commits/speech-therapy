import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Settings, 
  UserCheck,
  Shield,
  BookOpen,
  MessageSquare,
  Mic
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['patient', 'therapist', 'supervisor', 'admin'] },
  { id: 'patients', label: 'Patients', icon: Users, roles: ['therapist', 'supervisor', 'admin'] },
  { id: 'therapists', label: 'Therapists', icon: UserCheck, roles: ['supervisor', 'admin'] },
  { id: 'sessions', label: 'Sessions', icon: Calendar, roles: ['patient', 'therapist', 'supervisor'] },
  { id: 'exercises', label: 'Exercises', icon: Mic, roles: ['patient'] },
  { id: 'progress', label: 'Progress', icon: TrendingUp, roles: ['patient', 'therapist', 'supervisor'] },
  { id: 'reports', label: 'Reports', icon: FileText, roles: ['therapist', 'supervisor', 'admin'] },
  { id: 'matching', label: 'Patient Matching', icon: BookOpen, roles: ['supervisor', 'admin'] },
  { id: 'feedback', label: 'Feedback & Reviews', icon: MessageSquare, roles: ['supervisor', 'patient'] },
  { id: 'consent', label: 'Consent Management', icon: Shield, roles: ['therapist', 'supervisor', 'admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['patient', 'therapist', 'supervisor', 'admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen }) => {
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">SpeechCare</h2>
              <p className="text-sm text-gray-500">Clinical Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Need Help?</h3>
            <p className="text-xs text-blue-700 mt-1">
              Contact our support team for assistance
            </p>
            <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
              Get Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
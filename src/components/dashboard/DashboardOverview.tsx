import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Session } from '../../types';
import UpcomingSessionsCard from '../sessions/UpcomingSessionsCard';
import ExercisesCard from '../exercises/ExercisesCard';
import ConsentView from '../consent/ConsentView';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, changeType, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConsentForm, setShowConsentForm] = useState(false);

  // Fetch sessions for the current user
  useEffect(() => {
    const fetchSessions = async () => {
      if (user?.role === 'therapist' || user?.role === 'patient') {
        try {
          setLoading(true);
          const response = await fetch('/api/sessions');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch sessions: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Transform the backend data to match our frontend Session type
          const transformedSessions: Session[] = data.map((session: any) => ({
            id: session._id,
            patientId: session.patientId._id,
            therapistId: session.therapistId._id,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            type: session.type,
            status: session.status,
            notes: session.notes,
            goals: session.goals || [],
            activities: session.activities || [],
            supervisorApproval: session.supervisorApproval || 'pending',
            supervisorNotes: session.supervisorNotes,
            // Add patient and therapist names for display
            patientName: `${session.patientId.firstName} ${session.patientId.lastName}`,
            therapistName: `${session.therapistId.firstName} ${session.therapistId.lastName}`
          }));
          
          setSessions(transformedSessions);
        } catch (err) {
          console.error('Error fetching sessions:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchSessions();
  }, [user]);

  // Handle starting a session
  const handleStartSession = (sessionId: string) => {
    // Only allow therapists and patients to start sessions
    if (user?.role !== 'therapist' && user?.role !== 'patient') {
      console.warn("Only therapists and patients can start sessions");
      return;
    }
    
    // Find the session details to personalize the message (if available)
    const session = sessions.find(s => s.id === sessionId);
    
    // Show a brief notification based on user role
    if (user?.role === 'therapist') {
      const confirmation = window.confirm(
        `You're about to start a session with ${session?.patientName || 'your patient'}.\n\n` +
        `Clicking OK will open Google Meet in a new tab. Your patient will receive a notification to join.`
      );
      if (!confirmation) return;
    } else if (user?.role === 'patient') {
      const confirmation = window.confirm(
        `You're about to join a session with ${session?.therapistName || 'your therapist'}.\n\n` +
        `Clicking OK will open Google Meet in a new tab.`
      );
      if (!confirmation) return;
    }
    
    // Open Google Meet in a new tab
    window.open('https://meet.google.com/wba-qcrc-jzq', '_blank');
    
    // In a real application, you might also want to update the session status to 'in-progress'
    // and record that the session has started in your backend
    console.log(`Session ${sessionId} started with Google Meet`);
  };

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'patient':
        return [
          { title: 'Total Sessions', value: 8, icon: Calendar, color: 'bg-blue-500' },
          { title: 'Current Progress', value: '78%', icon: TrendingUp, color: 'bg-green-500' },
          { title: 'Next Session', value: 'Tomorrow 2:00 PM', icon: Clock, color: 'bg-purple-500' },
          { title: 'Goals Achieved', value: 5, icon: CheckCircle, color: 'bg-emerald-500' },
        ];
      
      case 'therapist':
        return [
          { title: 'Active Patients', value: 24, icon: Users, change: '+3 new patients', changeType: 'positive' as const, color: 'bg-blue-500' },
          { title: 'Sessions This Week', value: 18, icon: Calendar, change: '95% attendance', changeType: 'positive' as const, color: 'bg-green-500' },
          { title: 'Avg Progress Rate', value: '82%', icon: TrendingUp, change: '+5% this month', changeType: 'positive' as const, color: 'bg-purple-500' },
          { title: 'Pending Reviews', value: 3, icon: AlertTriangle, change: 'Require attention', changeType: 'neutral' as const, color: 'bg-yellow-500' },
        ];
      
      case 'supervisor':
        return [
          { title: 'Supervised Therapists', value: 12, icon: Users, change: '+2 new therapists', changeType: 'positive' as const, color: 'bg-blue-500' },
          { title: 'Reviews Completed', value: 45, icon: CheckCircle, change: '89% on time', changeType: 'positive' as const, color: 'bg-green-500' },
          { title: 'Department Progress', value: '85%', icon: TrendingUp, change: '+3% this quarter', changeType: 'positive' as const, color: 'bg-purple-500' },
          { title: 'Pending Approvals', value: 7, icon: AlertTriangle, change: '2 urgent', changeType: 'neutral' as const, color: 'bg-yellow-500' },
        ];
      
      case 'admin':
        return [
          { title: 'Total Users', value: 1247, icon: Users, change: '+89 this month', changeType: 'positive' as const, color: 'bg-blue-500' },
          { title: 'Active Sessions', value: 342, icon: Calendar, change: '98% completion rate', changeType: 'positive' as const, color: 'bg-green-500' },
          { title: 'System Health', value: '99.8%', icon: CheckCircle, change: 'All systems operational', changeType: 'positive' as const, color: 'bg-emerald-500' },
          { title: 'Compliance Score', value: '94%', icon: TrendingUp, change: '+2% this month', changeType: 'positive' as const, color: 'bg-purple-500' },
        ];
      
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your {user?.role === 'patient' ? 'therapy journey' : 'clinical work'} today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* For Therapists: Show upcoming sessions with start button */}
        {user?.role === 'therapist' && (
          <UpcomingSessionsCard 
            sessions={sessions}
            onStartSession={handleStartSession}
          />
        )}
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {user?.role === 'patient' && (
              <>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">View Next Session</div>
                  <div className="text-sm text-gray-600">Tomorrow at 2:00 PM</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Practice Exercises</div>
                  <div className="text-sm text-gray-600">3 exercises assigned</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Progress Report</div>
                  <div className="text-sm text-gray-600">View monthly summary</div>
                </button>
                <button
                  className="w-full text-left p-3 rounded-lg hover:bg-green-50 border border-gray-200 hover:border-green-200 transition-colors"
                  onClick={() => setShowConsentForm(true)}
                >
                  <div className="font-medium text-gray-900">Consent Form</div>
                  <div className="text-sm text-gray-600">Submit or view your consent</div>
                </button>
              </>
            )}
            
            {user?.role === 'therapist' && (
              <>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Schedule Session</div>
                  <div className="text-sm text-gray-600">Book new appointment</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Update Patient Notes</div>
                  <div className="text-sm text-gray-600">3 sessions pending notes</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Generate Report</div>
                  <div className="text-sm text-gray-600">Monthly progress reports</div>
                </button>
              </>
            )}

            {user?.role === 'supervisor' && (
              <>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Review Sessions</div>
                  <div className="text-sm text-gray-600">7 sessions pending approval</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Therapist Evaluation</div>
                  <div className="text-sm text-gray-600">2 evaluations due this week</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Department Analytics</div>
                  <div className="text-sm text-gray-600">View performance metrics</div>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">User Management</div>
                  <div className="text-sm text-gray-600">Manage platform users</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">System Reports</div>
                  <div className="text-sm text-gray-600">Generate platform analytics</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-gray-900">Compliance Check</div>
                  <div className="text-sm text-gray-600">Review HIPAA compliance</div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Session completed with Sarah Johnson</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Progress report generated</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">New patient assigned</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Feedback submitted for review</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Consent Form Modal */}
      {showConsentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConsentForm(false)}
            >
              &times;
            </button>
            <ConsentView />
          </div>
        </div>
      )}
    </div>
  );
};
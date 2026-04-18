import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Plus, Filter, Search, CheckCircle, XCircle, AlertCircle, Loader, User } from 'lucide-react';
import { Session } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SessionScheduler } from './SessionScheduler';

export const SessionsView: React.FC = () => {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch sessions from the backend
  useEffect(() => {
    const fetchSessions = async () => {
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
        setError('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  // Update the sessions list when a new session is created
  const handleSessionCreated = (newSession: Session) => {
    setSessions(prevSessions => [...prevSessions, newSession]);
  };
  
  // Function to check if a session is within 5 minutes of starting
  const canStartSession = (sessionTime: string): boolean => {
    const sessionDate = new Date(sessionTime);
    const fiveMinutesBeforeSession = new Date(sessionDate);
    fiveMinutesBeforeSession.setMinutes(sessionDate.getMinutes() - 5);
    
    return currentTime >= fiveMinutesBeforeSession;
  };
  
  // Handle starting a session
  const handleStartSession = (sessionId: string) => {
    // Only allow therapists and patients to start sessions
    if (user?.role !== 'therapist' && user?.role !== 'patient') {
      console.warn("Only therapists and patients can start sessions");
      return;
    }
    
    // Find the session details to personalize the message
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

  const filteredSessions = sessions.filter((session: Session) => {
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      session.goals.some((goal: string) => goal.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'no-show':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: Session['status']) => {
    const styles = {
      scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      'no-show': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getApprovalBadge = (approval: Session['supervisorApproval']) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      'revision-requested': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[approval]}`}>
        {approval.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600">Schedule, conduct, and track therapy sessions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewType === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewType('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewType === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
          </div>
          {user?.role !== 'patient' && (
            <button 
              onClick={() => setShowScheduler(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Schedule Session
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search sessions by goals or activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {sessions.filter(s => s.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {sessions.filter(s => s.status === 'scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {sessions.filter(s => s.status === 'no-show').length}
          </div>
          <div className="text-sm text-gray-600">No Shows</div>
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div className="text-gray-600">Loading sessions...</div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session: Session) => (
          <div key={session.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(session.status)}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
                    </h3>
                    {getStatusBadge(session.status)}
                    {user?.role === 'supervisor' && getApprovalBadge(session.supervisorApproval)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(session.scheduledAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{session.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 space-x-4 mt-1">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Patient: {session.patientName || 'Unknown'}
                    </span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Therapist: {session.therapistName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {session.status === 'scheduled' && 
                  (user?.role === 'therapist' || user?.role === 'patient') && 
                  (canStartSession(session.scheduledAt) || user?.role === 'therapist') && (
                  <button 
                    onClick={() => handleStartSession(session.id)}
                    disabled={!canStartSession(session.scheduledAt)}
                    className={`px-3 py-1.5 rounded-lg flex items-center text-sm ${
                      canStartSession(session.scheduledAt) 
                        ? 'bg-green-600 text-white hover:bg-green-700 transition-colors' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    {canStartSession(session.scheduledAt) ? 'Start Now' : 'Start Session'}
                  </button>
                )}
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Session Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {session.goals.map((goal, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {session.notes && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Session Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {session.notes}
                  </p>
                </div>
              )}

              {session.activities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Activities</h4>
                  <div className="space-y-2">
                    {session.activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{activity.name}</div>
                          <div className="text-xs text-gray-600">{activity.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            activity.patientResponse === 'excellent' ? 'bg-green-100 text-green-800' :
                            activity.patientResponse === 'good' ? 'bg-blue-100 text-blue-800' :
                            activity.patientResponse === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {activity.patientResponse}
                          </span>
                          {activity.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
      
      {!loading && !error && filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-gray-500 mb-4">No sessions found matching your criteria</div>
          {user?.role !== 'patient' && (
            <button 
              onClick={() => setShowScheduler(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Schedule New Session
            </button>
          )}
        </div>
      )}

      <SessionScheduler 
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  );
};

// Add default export for compatibility
export default SessionsView;
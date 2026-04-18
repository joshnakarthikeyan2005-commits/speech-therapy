import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, AlertCircle } from 'lucide-react';
import { Session } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface UpcomingSessionsCardProps {
  sessions: Session[];
  onStartSession: (sessionId: string) => void;
}

export const UpcomingSessionsCard: React.FC<UpcomingSessionsCardProps> = ({ 
  sessions,
  onStartSession
}) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Filter and sort only upcoming sessions scheduled for today
  const todaySessions = sessions
    .filter(session => {
      const sessionTime = new Date(session.scheduledAt);
      const today = new Date();
      
      return (
        session.status === 'scheduled' &&
        sessionTime.getDate() === today.getDate() &&
        sessionTime.getMonth() === today.getMonth() &&
        sessionTime.getFullYear() === today.getFullYear() &&
        sessionTime > today
      );
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3); // Show only the next 3 sessions
  
  // Function to check if a session is within 5 minutes of starting
  const isWithin5Minutes = (sessionTime: Date): boolean => {
    const fiveMinutesBeforeSession = new Date(sessionTime);
    fiveMinutesBeforeSession.setMinutes(sessionTime.getMinutes() - 5);
    
    return currentTime >= fiveMinutesBeforeSession && currentTime <= sessionTime;
  };
  
  // Function to calculate time remaining until session
  const getTimeRemaining = (sessionTime: Date): string => {
    const diffMs = sessionTime.getTime() - currentTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMins % 60} min`;
    } else {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions Today</h3>
      
      {todaySessions.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="text-gray-500">No upcoming sessions scheduled for today</div>
        </div>
      ) : (
        <div className="space-y-4">
          {todaySessions.map((session) => {
            const sessionTime = new Date(session.scheduledAt);
            const canStartSession = isWithin5Minutes(sessionTime);
            
            return (
              <div 
                key={session.id} 
                className={`border p-4 rounded-lg ${
                  canStartSession ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {sessionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-1">•</span>
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <User className="h-4 w-4 mr-1" />
                      Patient: {session.patientName || 'Unknown'}
                    </div>
                    
                    <div className={`flex items-center mt-2 ${
                      canStartSession ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {canStartSession 
                        ? 'Session is ready to start' 
                        : `Starts in ${getTimeRemaining(sessionTime)}`
                      }
                    </div>
                  </div>
                  
                  {(user?.role === 'therapist' || (user?.role === 'patient' && canStartSession)) && (
                    <button 
                      onClick={() => onStartSession(session.id)}
                      disabled={!canStartSession}
                      className={`px-3 py-2 rounded-lg flex items-center text-sm ${
                        canStartSession 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      {canStartSession ? 'Start Now' : 'Start Session'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {todaySessions.length > 0 && (
            <div className="text-center mt-2">
              <a href="/sessions" className="text-blue-600 text-sm hover:underline">
                View all scheduled sessions
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingSessionsCard;

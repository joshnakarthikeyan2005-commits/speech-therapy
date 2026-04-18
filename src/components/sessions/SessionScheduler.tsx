import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Video, Phone, Plus, X, AlertCircle } from 'lucide-react';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Therapist {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface SessionSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated?: (session: any) => void;
  patientId?: string;
  therapistId?: string;
}

export const SessionScheduler: React.FC<SessionSchedulerProps> = ({ 
  isOpen, 
  onClose, 
  onSessionCreated,
  patientId, 
  therapistId 
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sessionData, setSessionData] = useState({
    patientId: patientId || '',
    therapistId: therapistId || '',
    date: '',
    time: '',
    duration: 60,
    type: 'therapy' as 'therapy' | 'assessment' | 'consultation' | 'review',
    location: 'in-person' as 'in-person' | 'telehealth',
    goals: [''],
    notes: ''
  });
  
  // Fetch patients and therapists from API
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      
      const fetchData = async () => {
        try {
          // Fetch patients
          const patientsRes = await fetch('/api/patients');
          if (!patientsRes.ok) {
            throw new Error(`Failed to fetch patients: ${patientsRes.status}`);
          }
          const patientsData = await patientsRes.json();
          setPatients(patientsData);
          
          // Fetch therapists
          const therapistsRes = await fetch('/api/therapists');
          if (!therapistsRes.ok) {
            throw new Error(`Failed to fetch therapists: ${therapistsRes.status}`);
          }
          const therapistsData = await therapistsRes.json();
          setTherapists(therapistsData);
          
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load patients and therapists. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [isOpen]);

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...sessionData.goals];
    newGoals[index] = value;
    setSessionData({ ...sessionData, goals: newGoals });
  };

  const addGoal = () => {
    setSessionData({ ...sessionData, goals: [...sessionData.goals, ''] });
  };

  const removeGoal = (index: number) => {
    const newGoals = sessionData.goals.filter((_, i) => i !== index);
    setSessionData({ ...sessionData, goals: newGoals });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: Failed to create session`);
      }
      
      const newSession = await response.json();
      
      // Transform the returned session to match our frontend Session type
      const transformedSession = {
        id: newSession._id,
        patientId: newSession.patientId._id,
        therapistId: newSession.therapistId._id,
        scheduledAt: newSession.scheduledAt,
        duration: newSession.duration,
        type: newSession.type,
        status: newSession.status,
        notes: newSession.notes,
        goals: newSession.goals || [],
        activities: newSession.activities || [],
        supervisorApproval: newSession.supervisorApproval || 'pending',
        supervisorNotes: newSession.supervisorNotes,
        patientName: `${newSession.patientId.firstName} ${newSession.patientId.lastName}`,
        therapistName: `${newSession.therapistId.firstName} ${newSession.therapistId.lastName}`
      };
      
      console.log('Session created successfully:', transformedSession);
      
      // Call the callback with the new session
      if (onSessionCreated) {
        onSessionCreated(transformedSession);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error creating session:', err);
      setSubmitError(err.message || 'Failed to create session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              {isLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading patients...
                </div>
              ) : error ? (
                <div className="w-full px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> Failed to load patients
                </div>
              ) : (
                <select
                  value={sessionData.patientId}
                  onChange={(e) => setSessionData({ ...sessionData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Therapist</label>
              {isLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading therapists...
                </div>
              ) : error ? (
                <div className="w-full px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> Failed to load therapists
                </div>
              ) : (
                <select
                  value={sessionData.therapistId}
                  onChange={(e) => setSessionData({ ...sessionData, therapistId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Therapist</option>
                  {therapists.map((therapist) => (
                    <option key={therapist._id} value={therapist._id}>
                      {therapist.firstName} {therapist.lastName} - {therapist.specialization}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={sessionData.date}
                  onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="time"
                  value={sessionData.time}
                  onChange={(e) => setSessionData({ ...sessionData, time: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <select
                value={sessionData.duration}
                onChange={(e) => setSessionData({ ...sessionData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
              <select
                value={sessionData.type}
                onChange={(e) => setSessionData({ ...sessionData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="therapy">Therapy Session</option>
                <option value="assessment">Assessment</option>
                <option value="consultation">Consultation</option>
                <option value="review">Progress Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={sessionData.location}
                onChange={(e) => setSessionData({ ...sessionData, location: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="in-person">In-Person</option>
                <option value="telehealth">Telehealth</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Goals</label>
            <div className="space-y-2">
              {sessionData.goals.map((goal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                    placeholder="Enter session goal..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {sessionData.goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addGoal}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
            <textarea
              value={sessionData.notes}
              onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
              placeholder="Add any additional notes or special instructions..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <div>{submitError}</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Schedule Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
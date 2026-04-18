import React, { useState, useEffect } from 'react';
import { User, Clock, Calendar, Award, Languages, CheckCircle } from 'lucide-react';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  languagePreferences: string[];
  medicalHistory: string[];
  dateOfBirth: string;
}

interface Therapist {
  _id: string;
  firstName: string;
  lastName: string;
  specializations: string[];
  languages: string[];
  experience: number;
  rating: number;
  availability: {
    [key: string]: { start: string; end: string }[];
  };
}

interface TherapistMatchingProps {
  isOpen: boolean;
  onClose: () => void;
  onMatch: (patientId: string, therapistId: string) => void;
}

export const TherapistMatching: React.FC<TherapistMatchingProps> = ({ 
  isOpen, 
  onClose,
  onMatch
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [matchResults, setMatchResults] = useState<Array<{
    therapist: Therapist;
    score: number;
    matchingLanguages: string[];
    matchingSpecializations: string[];
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch patients and therapists
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

  // Find patient by ID
  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(p => p._id === id);
  };
  
  // Calculate matching score for therapists
  const findMatchingTherapists = () => {
    const patient = getPatientById(selectedPatient);
    
    if (!patient) {
      setMatchResults([]);
      return;
    }
    
    const matches = therapists.map(therapist => {
      // Calculate language match score (0-100)
      const matchingLanguages = therapist.languages.filter(lang => 
        patient.languagePreferences.includes(lang)
      );
      const languageScore = patient.languagePreferences.length > 0 
        ? (matchingLanguages.length / patient.languagePreferences.length) * 100 
        : 0;
      
      // Calculate specialization match score based on patient's medical history
      const matchingSpecializations = therapist.specializations.filter(spec => 
        patient.medicalHistory.some(condition => 
          condition.toLowerCase().includes(spec.toLowerCase())
        )
      );
      const specializationScore = matchingSpecializations.length > 0 
        ? Math.min(matchingSpecializations.length * 20, 100) 
        : 0;
      
      // Factor in experience (0-100)
      const experienceScore = Math.min(therapist.experience * 10, 100);
      
      // Factor in rating (0-100)
      const ratingScore = therapist.rating * 20;
      
      // Calculate overall score with weighted importance
      const overallScore = (
        (languageScore * 0.4) +       // 40% weight for language match
        (specializationScore * 0.3) +  // 30% weight for specialization
        (experienceScore * 0.2) +      // 20% weight for experience
        (ratingScore * 0.1)            // 10% weight for rating
      );
      
      return {
        therapist,
        score: Math.round(overallScore),
        matchingLanguages,
        matchingSpecializations
      };
    });
    
    // Sort by score descending
    const sortedMatches = matches.sort((a, b) => b.score - a.score);
    setMatchResults(sortedMatches);
  };

  // Handle patient selection change
  const handlePatientChange = (patientId: string) => {
    setSelectedPatient(patientId);
    setSelectedTherapist('');
    setMatchResults([]);
  };
  
  // Handle search button click
  const handleFindMatches = () => {
    if (selectedPatient) {
      findMatchingTherapists();
    }
  };
  
  // Handle match confirmation
  const handleConfirmMatch = () => {
    if (selectedPatient && selectedTherapist) {
      onMatch(selectedPatient, selectedTherapist);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Therapist Matching</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            {isLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading patients...
              </div>
            ) : error ? (
              <div className="w-full px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg">
                Failed to load patients
              </div>
            ) : (
              <>
                <select
                  value={selectedPatient}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
                
                <div className="mt-4">
                  <button
                    onClick={handleFindMatches}
                    disabled={!selectedPatient}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Find Matching Therapists
                  </button>
                </div>
              </>
            )}
          </div>

          {selectedPatient && matchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Matching Therapists</h3>
              <div className="space-y-4">
                {matchResults.map((match) => (
                  <div 
                    key={match.therapist._id} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTherapist === match.therapist._id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTherapist(match.therapist._id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{match.therapist.firstName} {match.therapist.lastName}</div>
                          <div className="text-sm text-gray-500">
                            {match.therapist.specializations.join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`text-lg font-bold rounded-full h-14 w-14 flex items-center justify-center ${
                          match.score >= 80 ? 'bg-green-100 text-green-800' :
                          match.score >= 60 ? 'bg-blue-100 text-blue-800' :
                          match.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {match.score}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Match</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="flex items-center text-sm text-gray-700 mb-1">
                          <Languages className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="font-medium">Language Match:</span>
                        </div>
                        <div className="text-sm pl-5">
                          {match.matchingLanguages.length > 0 ? 
                            match.matchingLanguages.join(', ') : 
                            <span className="text-gray-400">No matching languages</span>
                          }
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-sm text-gray-700 mb-1">
                          <Award className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="font-medium">Experience:</span>
                        </div>
                        <div className="text-sm pl-5">
                          {match.therapist.experience} years
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center text-sm text-gray-700 mb-1">
                          <CheckCircle className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="font-medium">Relevant Specializations:</span>
                        </div>
                        <div className="text-sm pl-5">
                          {match.matchingSpecializations.length > 0 ? 
                            match.matchingSpecializations.join(', ') : 
                            <span className="text-gray-400">No directly matching specializations</span>
                          }
                        </div>
                      </div>
                    </div>
                    
                    {selectedTherapist === match.therapist._id && (
                      <div className="mt-3 flex justify-end">
                        <button 
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                          onClick={handleConfirmMatch}
                        >
                          Select This Therapist
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedPatient && matchResults.length === 0 && (
            <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-lg font-medium text-gray-500">No matching therapists found</div>
              <div className="text-sm text-gray-400 mt-1">Try selecting a different patient or adding more therapists</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistMatching;

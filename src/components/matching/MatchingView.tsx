import React, { useState, useEffect } from 'react';
import { Users, Brain, Languages, Clock, Star, CheckCircle, AlertCircle, RefreshCw, Link2, Loader } from 'lucide-react';
import { Patient, Therapist } from '../../types';
import { TherapistMatching } from './TherapistMatching';

interface MatchingScore {
  patientId: string;
  therapistId: string;
  score: number;
  factors: {
    specialization: number;
    language: number;
    availability: number;
    experience: number;
    rating: number;
  };
  recommendation: 'excellent' | 'good' | 'fair' | 'poor';
  createdAt?: string;
  patientName?: string;
  therapistName?: string;
}

// We'll replace this with data from the API
const initialMatchingScores: MatchingScore[] = [
  {
    patientId: '1',
    therapistId: 'th1',
    score: 95,
    factors: {
      specialization: 100,
      language: 90,
      availability: 95,
      experience: 85,
      rating: 95
    },
    recommendation: 'excellent'
  },
  {
    patientId: '1',
    therapistId: 'th2',
    score: 78,
    factors: {
      specialization: 60,
      language: 90,
      availability: 80,
      experience: 95,
      rating: 98
    },
    recommendation: 'good'
  },
  {
    patientId: '2',
    therapistId: 'th2',
    score: 92,
    factors: {
      specialization: 95,
      language: 100,
      availability: 85,
      experience: 95,
      rating: 98
    },
    recommendation: 'excellent'
  }
];

const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    conditions: ['Aphasia', 'Stroke Recovery'],
    languages: ['English'],
    preferredSchedule: 'Afternoon',
    urgency: 'high'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    conditions: ['Stuttering', 'Social Anxiety'],
    languages: ['Spanish', 'English'],
    preferredSchedule: 'Morning',
    urgency: 'medium'
  },
  {
    id: '3',
    name: 'Michael Chen',
    conditions: ['Voice Disorders'],
    languages: ['English', 'Mandarin'],
    preferredSchedule: 'Evening',
    urgency: 'low'
  }
];

const mockTherapists = [
  {
    id: 'th1',
    name: 'Sarah Johnson',
    specializations: ['Aphasia', 'Stroke Recovery'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    experience: 8,
    currentLoad: 18,
    maxLoad: 25
  },
  {
    id: 'th2',
    name: 'David Martinez',
    specializations: ['Stuttering', 'Voice Disorders'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    experience: 12,
    currentLoad: 22,
    maxLoad: 25
  },
  {
    id: 'th3',
    name: 'Emily Chen',
    specializations: ['Autism Speech Therapy', 'Child Language Disorders'],
    languages: ['English', 'Mandarin'],
    rating: 4.7,
    experience: 5,
    currentLoad: 15,
    maxLoad: 20
  }
];

// Define the named export component that App.tsx is expecting
export const MatchingView: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState('1');
  const [matchResults, setMatchResults] = useState<MatchingScore[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  
  // Load patients and therapists data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsProcessing(true);
        
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
        
        // If we have patients, select the first one
        if (patientsData.length > 0) {
          setSelectedPatient(patientsData[0]._id);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate matching scores for the selected patient
  useEffect(() => {
    if (selectedPatient && patients.length > 0 && therapists.length > 0) {
      calculateMatches(selectedPatient);
    }
  }, [selectedPatient, patients, therapists]);
  
  const calculateMatches = (patientId: string) => {
    setIsProcessing(true);
    
    // Find the patient
    const patient = patients.find(p => p._id === patientId);
    if (!patient) {
      setMatchResults([]);
      setIsProcessing(false);
      return;
    }
    
    // Calculate matches for each therapist
    const matches: MatchingScore[] = therapists.map(therapist => {
      // Language match (0-100)
      const languageMatch = calculateLanguageMatch(patient.languagePreferences || [], therapist.languages || []);
      
      // Specialization match based on patient's conditions (0-100)
      const specializationMatch = calculateSpecializationMatch(
        patient.medicalHistory || [], 
        therapist.specializations || []
      );
      
      // Experience score (0-100)
      const experienceScore = Math.min(therapist.experience * 10, 100) || 50;
      
      // Rating score (0-100)
      const ratingScore = (therapist.rating || 3) * 20;
      
      // Availability score - placeholder for now
      const availabilityScore = 80;
      
      // Calculate overall score
      const overallScore = Math.round(
        (languageMatch * 0.3) +         // 30% weight
        (specializationMatch * 0.3) +    // 30% weight
        (experienceScore * 0.2) +        // 20% weight
        (availabilityScore * 0.1) +      // 10% weight
        (ratingScore * 0.1)              // 10% weight
      );
      
      // Determine recommendation
      let recommendation: 'excellent' | 'good' | 'fair' | 'poor';
      if (overallScore >= 85) recommendation = 'excellent';
      else if (overallScore >= 70) recommendation = 'good';
      else if (overallScore >= 50) recommendation = 'fair';
      else recommendation = 'poor';
      
      return {
        patientId,
        therapistId: therapist._id,
        score: overallScore,
        factors: {
          specialization: specializationMatch,
          language: languageMatch,
          availability: availabilityScore,
          experience: experienceScore,
          rating: ratingScore
        },
        recommendation,
        patientName: `${patient.firstName} ${patient.lastName}`,
        therapistName: `${therapist.firstName} ${therapist.lastName}`,
        createdAt: new Date().toISOString()
      };
    });
    
    // Sort matches by score (descending)
    const sortedMatches = matches.sort((a, b) => b.score - a.score);
    setMatchResults(sortedMatches);
    setIsProcessing(false);
  };
  
  const calculateLanguageMatch = (patientLanguages: string[], therapistLanguages: string[]): number => {
    if (!patientLanguages.length || !therapistLanguages.length) return 50;
    
    const matchingLanguages = therapistLanguages.filter(lang => 
      patientLanguages.some(pLang => pLang.toLowerCase() === lang.toLowerCase())
    );
    
    return matchingLanguages.length > 0 
      ? (matchingLanguages.length / patientLanguages.length) * 100 
      : 0;
  };
  
  const calculateSpecializationMatch = (conditions: string[], specializations: string[]): number => {
    if (!conditions.length || !specializations.length) return 50;
    
    let matchCount = 0;
    for (const condition of conditions) {
      for (const specialization of specializations) {
        if (condition.toLowerCase().includes(specialization.toLowerCase()) ||
            specialization.toLowerCase().includes(condition.toLowerCase())) {
          matchCount++;
          break;
        }
      }
    }
    
    return (matchCount / conditions.length) * 100;
  };
  
  const handlePatientChange = (id: string) => {
    setSelectedPatient(id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      );
    }
    return stars;
  };

  const getRecommendationStyles = (recommendation: string) => {
    switch (recommendation) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Patient-Therapist Matching</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Select Patient
          </h2>
          
          <div className="space-y-2">
            {isProcessing && patients.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No patients found
              </div>
            ) : (
              patients.map(patient => (
                <button
                  key={patient._id}
                  onClick={() => handlePatientChange(patient._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selectedPatient === patient._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
                    {patient.medicalHistory?.map((condition, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {condition}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-600" />
              Matching Results
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowMatchingModal(true)}
                className="px-3 py-1 rounded-lg text-sm flex items-center space-x-1 bg-green-100 text-green-700 hover:bg-green-200"
              >
                <Users className="h-4 w-4 mr-1" />
                <span>Advanced Matching</span>
              </button>
              <button 
                onClick={() => calculateMatches(selectedPatient)}
                className={`px-3 py-1 rounded-lg text-sm flex items-center space-x-1 ${
                  isProcessing ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                disabled={isProcessing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Recalculate</span>
              </button>
            </div>
          </div>
          
          {isProcessing ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Processing matches...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {matchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No matching results available. Select a patient and click "Recalculate".
                </div>
              ) : matchResults.map((match, index) => {
                // Find the therapist in our local data
                const therapist = therapists.find(t => t._id === match.therapistId);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{match.therapistName || therapist?.firstName + ' ' + therapist?.lastName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span className="flex">{renderStars(therapist?.rating || 3)}</span>
                          <span>{therapist?.experience || 0} years exp.</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {therapist?.specializations?.map((spec: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{match.score}%</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRecommendationStyles(match.recommendation)}`}>
                          {match.recommendation.charAt(0).toUpperCase() + match.recommendation.slice(1)} Match
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Match Factors</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div>
                          <div className="text-xs text-gray-500">Specialization</div>
                          <div className="font-medium">{match.factors.specialization}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Language</div>
                          <div className="font-medium">{match.factors.language}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Availability</div>
                          <div className="font-medium">{match.factors.availability}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Experience</div>
                          <div className="font-medium">{match.factors.experience}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Rating</div>
                          <div className="font-medium">{match.factors.rating}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Assign Therapist
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Matching Algorithm Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Accuracy Rate</h3>
            <div className="text-2xl font-bold text-gray-900">96.7%</div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="text-sm text-green-600">+1.2%</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Satisfaction Score</h3>
            <div className="text-2xl font-bold text-gray-900">4.8/5</div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Based on Feedback</span>
              <span className="text-sm text-green-600">+0.3</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Patient Retention</h3>
            <div className="text-2xl font-bold text-gray-900">92.3%</div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">After Matching</span>
              <span className="text-sm text-green-600">+3.5%</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Algorithm Stats</h3>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Processing Time</span>
              <span className="text-sm font-medium text-gray-900">2.3s avg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-green-600">94%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Therapist Matching Modal */}
      <TherapistMatching 
        isOpen={showMatchingModal} 
        onClose={() => setShowMatchingModal(false)}
        onMatch={(patientId, therapistId) => {
          // Here you would typically call an API to assign the therapist
          console.log(`Assigning therapist ${therapistId} to patient ${patientId}`);
          
          // For now, just update our local state to show the match
          const patient = patients.find(p => p._id === patientId);
          const therapist = therapists.find(t => t._id === therapistId);
          
          if (patient && therapist) {
            // Create a new match result
            const newMatch: MatchingScore = {
              patientId,
              therapistId,
              score: 95, // We assume this is an excellent match since it was manually selected
              factors: {
                specialization: 90,
                language: 95,
                availability: 100,
                experience: 90,
                rating: 90
              },
              recommendation: 'excellent',
              patientName: `${patient.firstName} ${patient.lastName}`,
              therapistName: `${therapist.firstName} ${therapist.lastName}`,
              createdAt: new Date().toISOString()
            };
            
            // Update results to show this match at the top
            setMatchResults(prev => [newMatch, ...prev]);
            
            // Set the selected patient to the one we just matched
            setSelectedPatient(patientId);
          }
        }}
      />
    </div>
  );
};

// Also add a default export for compatibility
export default MatchingView;

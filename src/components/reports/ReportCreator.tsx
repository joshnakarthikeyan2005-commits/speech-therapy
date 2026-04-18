import React, { useState, useEffect } from "react";
import { X, FileText, ChevronDown, AlertCircle, Loader } from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Session {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  scheduledAt: string;
  type: string;
  status: string;
  goals: string[];
  notes?: string;
}

interface ReportCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: any) => void;
}

export const ReportCreator: React.FC<ReportCreatorProps> = ({
  isOpen,
  onClose,
  onReportCreated,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patientSessions, setPatientSessions] = useState<Session[]>([]);

  const [reportData, setReportData] = useState({
    title: "",
    type: "progress" as "progress" | "assessment" | "discharge",
    patientId: "",
    period: {
      start: "",
      end: "",
    },
    assessmentAreas: [
      { name: "Articulation", score: 0, notes: "" },
      { name: "Fluency", score: 0, notes: "" },
      { name: "Voice", score: 0, notes: "" },
      { name: "Language Comprehension", score: 0, notes: "" },
      { name: "Expressive Language", score: 0, notes: "" }
    ],
    overallProgress: 0,
    recommendations: "",
    goalsStatus: [
      { goal: "", status: "in-progress" as "achieved" | "in-progress" | "not-started" }
    ],
    nextSteps: ""
  });

  // Fetch patients and sessions when the modal opens
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
          
          // Fetch sessions
          const sessionsRes = await fetch('/api/sessions');
          if (!sessionsRes.ok) {
            throw new Error(`Failed to fetch sessions: ${sessionsRes.status}`);
          }
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData);
          
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load patients and sessions data.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [isOpen]);

  // Update patientSessions when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      const filteredSessions = sessions.filter(
        (session) => session.patientId._id === selectedPatient
      );
      setPatientSessions(filteredSessions);
      
      // Update the report data with the selected patient
      setReportData((prev) => ({
        ...prev,
        patientId: selectedPatient,
        title: `Progress Report - ${getPatientName(selectedPatient)} - ${new Date().toLocaleDateString()}`,
      }));
    } else {
      setPatientSessions([]);
    }
  }, [selectedPatient, sessions]);

  const getPatientName = (id: string) => {
    const patient = patients.find((p) => p._id === id);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatient(e.target.value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setReportData((prev) => {
        if (parent === "period") {
          return {
            ...prev,
            period: {
              ...prev.period,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setReportData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleScoreChange = (index: number, value: number) => {
    const newAreas = [...reportData.assessmentAreas];
    newAreas[index] = { ...newAreas[index], score: value };
    setReportData((prev) => ({
      ...prev,
      assessmentAreas: newAreas,
      // Calculate overall progress as the average of all scores
      overallProgress: Math.round(
        newAreas.reduce((sum, area) => sum + area.score, 0) / newAreas.length
      ),
    }));
  };

  const handleAreaNotesChange = (index: number, value: string) => {
    const newAreas = [...reportData.assessmentAreas];
    newAreas[index] = { ...newAreas[index], notes: value };
    setReportData((prev) => ({
      ...prev,
      assessmentAreas: newAreas,
    }));
  };

  const handleGoalChange = (index: number, field: string, value: string) => {
    const newGoals = [...reportData.goalsStatus];
    newGoals[index] = { 
      ...newGoals[index], 
      [field]: value 
    };
    setReportData((prev) => ({
      ...prev,
      goalsStatus: newGoals,
    }));
  };

  const addGoal = () => {
    setReportData((prev) => ({
      ...prev,
      goalsStatus: [
        ...prev.goalsStatus,
        { goal: "", status: "in-progress" as "achieved" | "in-progress" | "not-started" },
      ],
    }));
  };

  const removeGoal = (index: number) => {
    const newGoals = reportData.goalsStatus.filter((_, i) => i !== index);
    setReportData((prev) => ({
      ...prev,
      goalsStatus: newGoals,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // In a real app, you would send this to your backend
      console.log("Submitting report:", reportData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create report object with timestamp
      const newReport = {
        id: Date.now().toString(),
        title: reportData.title,
        type: reportData.type,
        patientId: reportData.patientId,
        patientName: getPatientName(reportData.patientId),
        generatedAt: new Date().toISOString(),
        period: `${reportData.period.start} to ${reportData.period.end}`,
        status: "ready",
        size: "1.5 MB",
        data: reportData
      };
      
      // Pass the new report to parent component
      onReportCreated(newReport);
      onClose();
    } catch (err: any) {
      console.error("Error creating report:", err);
      setSubmitError(err.message || "Failed to create report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Patient Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Report Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title
              </label>
              <input
                type="text"
                name="title"
                value={reportData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  name="type"
                  value={reportData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="progress">Progress Report</option>
                  <option value="assessment">Assessment Report</option>
                  <option value="discharge">Discharge Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient
                </label>
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
                    value={selectedPatient}
                    onChange={handlePatientChange}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Start
                </label>
                <input
                  type="date"
                  name="period.start"
                  value={reportData.period.start}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period End
                </label>
                <input
                  type="date"
                  name="period.end"
                  value={reportData.period.end}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Patient Sessions Summary */}
          {selectedPatient && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Recent Sessions</h3>
              {patientSessions.length === 0 ? (
                <p className="text-sm text-gray-500">No sessions found for this patient.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {patientSessions.slice(0, 3).map((session) => (
                    <div
                      key={session._id}
                      className="p-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {new Date(session.scheduledAt).toLocaleDateString()} - {session.type}{" "}
                          Session
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {session.status}
                        </div>
                      </div>
                      {session.goals.length > 0 && (
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">Goals: </span>
                          {session.goals.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                  {patientSessions.length > 3 && (
                    <div className="text-xs text-gray-500 text-right">
                      +{patientSessions.length - 3} more sessions
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assessment Areas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Assessment Areas</h3>
            {reportData.assessmentAreas.map((area, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="font-medium text-gray-900">{area.name}</div>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-600">Score:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange(index, score)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            area.score === score
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={area.notes}
                    onChange={(e) => handleAreaNotesChange(index, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Notes about ${area.name}...`}
                  />
                </div>
              </div>
            ))}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="text-md font-medium text-gray-900">Overall Progress</div>
                <div className="text-2xl font-bold text-blue-600">{reportData.overallProgress}%</div>
              </div>
              <div className="mt-2 h-2.5 w-full bg-gray-200 rounded-full">
                <div
                  className="h-2.5 bg-blue-600 rounded-full"
                  style={{ width: `${reportData.overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Therapy Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Therapy Goals</h3>
            {reportData.goalsStatus.map((goalItem, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={goalItem.goal}
                  onChange={(e) => handleGoalChange(index, "goal", e.target.value)}
                  placeholder="Enter therapy goal..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={goalItem.status}
                  onChange={(e) => handleGoalChange(index, "status", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="achieved">Achieved</option>
                  <option value="in-progress">In Progress</option>
                  <option value="not-started">Not Started</option>
                </select>
                {reportData.goalsStatus.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addGoal}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Add Goal
            </button>
          </div>

          {/* Recommendations & Next Steps */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                name="recommendations"
                value={reportData.recommendations}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide recommendations based on the assessment..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps
              </label>
              <textarea
                name="nextSteps"
                value={reportData.nextSteps}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Outline the next steps in the therapy plan..."
              />
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
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
              disabled={isSubmitting || !selectedPatient}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCreator;

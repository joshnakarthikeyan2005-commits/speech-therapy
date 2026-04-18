export type UserRole = 'patient' | 'therapist' | 'supervisor' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  languagePreferences: string[];
  consentStatus: 'pending' | 'approved' | 'declined';
  assignedTherapistId?: string;
}

export interface Therapist extends User {
  role: 'therapist';
  license: string;
  specializations: string[];
  languages: string[];
  availability: {
    [key: string]: { start: string; end: string }[];
  };
  supervisorId?: string;
  experience: number;
  rating: number;
}

export interface Supervisor extends User {
  role: 'supervisor';
  department: string;
  therapistIds: string[];
  license: string;
}

export interface Session {
  id: string;
  patientId: string;
  therapistId: string;
  scheduledAt: string;
  duration: number;
  type: 'assessment' | 'therapy' | 'consultation' | 'review';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  goals: string[];
  activities: Activity[];
  supervisorApproval: 'pending' | 'approved' | 'revision-requested';
  supervisorNotes?: string;
  // Optional display properties
  patientName?: string;
  therapistName?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: number;
  materials: string[];
  completed: boolean;
  patientResponse: 'excellent' | 'good' | 'needs-improvement' | 'difficulty';
  notes?: string;
}

export interface Progress {
  id: string;
  patientId: string;
  sessionId: string;
  date: string;
  goals: {
    goal: string;
    targetScore: number;
    actualScore: number;
    notes: string;
  }[];
  overallProgress: number;
  therapistNotes: string;
}

export interface Report {
  id: string;
  patientId: string;
  therapistId: string;
  type: 'progress' | 'assessment' | 'discharge';
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  data: any;
  status: 'draft' | 'final' | 'reviewed';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
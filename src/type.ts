// types.ts
export interface Therapist {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'therapist';
  license: string;
  specializations: string[];
  languages: string[];
  availability: {
    workingHours?: string;   // e.g., "9 AM - 5 PM"
    freeSlots?: string[];    // e.g., ["10:00 AM", "2:30 PM"]
  };
  supervisorId: string;
  experience: number;        // years
  rating: number;            // out of 5
  createdAt: string;
  avatar?: string;
}

import React, { useState } from "react";
import { Therapist } from "../../types";

// Extended interface to match MongoDB structure
interface TherapistWithMongoDB {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  phoneNumber?: string;
  qualifications?: string[];
  experience?: number;
  bio?: string;
  avatar?: string;
  availability?: any;
}

interface AddTherapistModalProps {
  onClose: () => void;
  onTherapistAdded: (therapist: TherapistWithMongoDB) => void;
}

const AddTherapistModal: React.FC<AddTherapistModalProps> = ({ onClose, onTherapistAdded }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    specialization: "",
    qualifications: "",
    experience: 0,
    bio: "",
    avatar: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.email || !form.specialization) {
      alert("Please fill in all required fields: First Name, Last Name, Email, and Specialization");
      return;
    }
    
    const newTherapist = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber || "",
      specialization: form.specialization,
      qualifications: form.qualifications ? form.qualifications.split(",").map((s: string) => s.trim()) : [],
      experience: Number(form.experience) || 0,
      bio: form.bio || "",
      avatar: form.avatar || `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=random`
    };

    try {
      console.log('AddTherapistModal - Sending therapist data:', newTherapist);
      
      const res = await fetch("/api/therapists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTherapist),
      });
      
      // Try to parse the response as JSON regardless of status
      const responseData = await res.json();
      
      if (!res.ok) {
        const errorMessage = responseData.error || 'Failed to add therapist';
        console.error('Error from server:', responseData);
        throw new Error(errorMessage);
      }

      console.log('AddTherapistModal - Therapist added successfully:', responseData);
      
      // Make sure we're passing back the right data structure to the parent component
      console.log('AddTherapistModal - Calling onTherapistAdded with:', responseData);
      
      // Make sure we pass the MongoDB response data structure back to parent
      onTherapistAdded({
        _id: responseData._id,
        firstName: responseData.firstName,
        lastName: responseData.lastName,
        email: responseData.email,
        specialization: responseData.specialization,
        phoneNumber: responseData.phoneNumber || '',
        qualifications: responseData.qualifications || [],
        experience: responseData.experience || 0,
        bio: responseData.bio || '',
        avatar: responseData.avatar || '',
        availability: responseData.availability
      });
      onClose();
    } catch (err: any) {
      console.error('Error adding therapist:', err);
      alert(err.message || "Error adding therapist. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add Therapist</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="w-full border rounded p-2" required />
          <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="w-full border rounded p-2" required />
          <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2" required />
          <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className="w-full border rounded p-2" />
          <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} className="w-full border rounded p-2" required />
          <input name="qualifications" placeholder="Qualifications (comma-separated)" value={form.qualifications} onChange={handleChange} className="w-full border rounded p-2" />
          <input name="experience" placeholder="Experience (years)" type="number" value={form.experience} onChange={handleChange} className="w-full border rounded p-2" />
          <textarea name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} className="w-full border rounded p-2" rows={3} />
          <input name="avatar" placeholder="Avatar URL (optional)" value={form.avatar} onChange={handleChange} className="w-full border rounded p-2" />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTherapistModal;

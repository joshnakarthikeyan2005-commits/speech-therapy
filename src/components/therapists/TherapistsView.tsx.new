import React, { useState, useEffect } from "react";
import { Mail, Phone, Users, Calendar, Plus } from "lucide-react";
import AddTherapistModal from "./AddTherapistModal";

// Extended interface to handle MongoDB fields
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

export const TherapistsView: React.FC = () => {
  const [therapists, setTherapists] = useState<TherapistWithMongoDB[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch therapists on load
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        console.log("Fetching therapists from API...");
        setIsLoading(true);
        setError(null);
        
        const res = await fetch("http://localhost:3001/api/therapists");
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Therapists fetched successfully:", data);
        setTherapists(data);
      } catch (err) {
        console.error("Error fetching therapists:", err);
        setError("Failed to load therapists. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTherapists();
  }, []);

  // Add therapist handler
  const handleTherapistAdded = (newTherapist: TherapistWithMongoDB) => {
    console.log("TherapistsView - Received new therapist from modal:", newTherapist);
    
    // update UI immediately by adding the new therapist to the beginning of our array
    setTherapists((prev) => {
      const newList = [newTherapist, ...prev];
      console.log("TherapistsView - Updated therapists list:", newList);
      return newList;
    });
  };

  console.log("TherapistsView rendering with therapists:", therapists);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Therapists</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Therapist
        </button>
      </div>

      {/* Status Messages */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading therapists...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Therapists Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {therapists.length === 0 ? (
            <div className="col-span-3 text-center p-8">
              <p className="text-gray-500">No therapists found. Add one to get started.</p>
            </div>
          ) : (
            therapists.map((therapist) => (
              <div
                key={therapist._id || therapist.id}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                {/* Avatar + Name */}
                <div className="flex items-center mb-4">
                  {therapist.avatar ? (
                    <img
                      src={therapist.avatar}
                      alt="Avatar"
                      className="h-14 w-14 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                      {therapist.firstName?.[0]}
                      {therapist.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {therapist.firstName} {therapist.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {therapist.specialization || "General Practice"}
                    </p>
                  </div>
                </div>

                {/* Rating + Experience */}
                <div className="flex items-center mb-3">
                  <div className="flex">
                    <span className="text-yellow-400">★★★★</span>
                    <span className="text-gray-300">★</span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-800">
                    4.0
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({therapist.experience || 0} yrs exp.)
                  </span>
                </div>

                {/* Specialization */}
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Specialization
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {therapist.specialization || "General Practice"}
                    </span>
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Languages</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {therapist.qualifications?.length ? (
                      therapist.qualifications.map((qual, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          {qual}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Not set</span>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Availability</h4>
                  <p className="text-sm text-gray-600">
                    Working: 9 AM - 5 PM
                  </p>
                  <p className="text-sm text-gray-600">
                    Free Slots: Available for new clients
                  </p>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-600 mt-3">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" /> 24 patients
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> 18 sessions/week
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1">
                    View Profile
                  </button>
                  <button className="p-2 border rounded-lg">
                    <Mail className="h-4 w-4" />
                  </button>
                  <button className="p-2 border rounded-lg">
                    <Phone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddTherapistModal
          onClose={() => setShowModal(false)}
          onTherapistAdded={handleTherapistAdded}
        />
      )}
    </div>
  );
};

export default TherapistsView;

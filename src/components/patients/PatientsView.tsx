import axios from 'axios';
import { useEffect, useState } from 'react';
import { Patient } from '../../types';
import { Plus, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientsView: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'declined'>('all');
  const [showForm, setShowForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    medicalHistory: '',
    consentStatus: 'pending',
    avatar: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch patients from backend
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/patients');
        setPatients(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Filtered patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.consentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Add patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.dateOfBirth) {
      setError('Please fill all required fields');
      return;
    }

    const newEntry = {
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      email: newPatient.email,
      dateOfBirth: newPatient.dateOfBirth,
      emergencyContact: {
        name: newPatient.emergencyContactName,
        phone: newPatient.emergencyContactPhone,
        relationship: newPatient.emergencyContactRelationship
      },
      medicalHistory: newPatient.medicalHistory.split(',').map(s => s.trim()),
      consentStatus: newPatient.consentStatus,
      avatar: newPatient.avatar
    };

    try {
      const res = await axios.post('/api/patients', newEntry);
      setPatients([res.data, ...patients]);
      setShowForm(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        medicalHistory: '',
        consentStatus: 'pending',
        avatar: ''
      });
    } catch (err: any) {
      console.log('Error adding patient:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add patient');
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      declined: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header + Filter + Search */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patients ({filteredPatients.length})</h1>
        <div className="flex gap-2 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border p-2 rounded-md"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded-md"
          />
          {user?.role !== 'therapist' && (
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus className="h-5 w-5 mr-2" /> {showForm ? 'Cancel' : 'Add'}
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showForm && user?.role !== 'therapist' && (
        <form onSubmit={handleAddPatient} className="bg-white p-4 rounded-lg shadow border mb-6 space-y-4">
          {error && <div className="text-red-500">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <input placeholder="First Name" value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} className="border p-2 rounded-md" />
            <input placeholder="Last Name" value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} className="border p-2 rounded-md" />
          </div>

          <input placeholder="Email" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} className="border p-2 rounded-md w-full" />
          <input type="date" value={newPatient.dateOfBirth} onChange={e => setNewPatient({...newPatient, dateOfBirth: e.target.value})} className="border p-2 rounded-md w-full" />

          <div className="grid grid-cols-3 gap-4">
            <input placeholder="Emergency Name" value={newPatient.emergencyContactName} onChange={e => setNewPatient({...newPatient, emergencyContactName: e.target.value})} className="border p-2 rounded-md" />
            <input placeholder="Phone" value={newPatient.emergencyContactPhone} onChange={e => setNewPatient({...newPatient, emergencyContactPhone: e.target.value})} className="border p-2 rounded-md" />
            <input placeholder="Relationship" value={newPatient.emergencyContactRelationship} onChange={e => setNewPatient({...newPatient, emergencyContactRelationship: e.target.value})} className="border p-2 rounded-md" />
          </div>

          <input placeholder="Conditions (comma separated)" value={newPatient.medicalHistory} onChange={e => setNewPatient({...newPatient, medicalHistory: e.target.value})} className="border p-2 rounded-md w-full" />
          <input placeholder="Avatar URL" value={newPatient.avatar} onChange={e => setNewPatient({...newPatient, avatar: e.target.value})} className="border p-2 rounded-md w-full" />

          <select value={newPatient.consentStatus} onChange={e => setNewPatient({...newPatient, consentStatus: e.target.value})} className="border p-2 rounded-md w-full">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save Patient</button>
        </form>
      )}

      {/* Patients Table */}
      <div className="bg-white rounded-lg shadow border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Conditions</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 flex items-center">
                  {patient.avatar ? <img src={patient.avatar} className="h-10 w-10 rounded-full object-cover" /> :
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{patient.firstName[0]}{patient.lastName[0]}</span>
                    </div>
                  }
                  <div className="ml-4">
                    <div className="text-sm font-medium">{patient.firstName} {patient.lastName}</div>
                    <div className="text-xs text-gray-500">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm flex items-center"><Mail className="h-4 w-4 mr-1 text-gray-400" /> {patient.email}</div>
                  <div className="text-sm flex items-center mt-1"><Phone className="h-4 w-4 mr-1 text-gray-400" /> {patient.emergencyContact?.phone}</div>
                </td>
                <td className="px-6 py-4 flex flex-wrap gap-1">{patient.medicalHistory?.map((c, i) => <span key={i} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{c}</span>)}</td>
                <td className="px-6 py-4">{getStatusBadge(patient.consentStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Shield, FileText, CheckCircle, XCircle, Clock, Download, Eye, AlertTriangle } from 'lucide-react';
import ConsentForm, { ConsentFormData } from './ConsentForm';
import { useAuth } from '../../context/AuthContext';

interface ConsentRecord {
  id: string;
  patientId: string;
  patientName: string;
  documentType: 'treatment-consent' | 'data-sharing' | 'recording-consent' | 'research-participation';
  status: 'pending' | 'approved' | 'declined' | 'expired';
  submittedAt: string;
  reviewedAt?: string;
  expiresAt: string;
  version: string;
  ipAddress: string;
  digitalSignature: boolean;
}

const mockConsentRecords: ConsentRecord[] = [
  {
    id: '1',
    patientId: 'pat-001',
    patientName: 'John Doe',
    documentType: 'treatment-consent',
    status: 'approved',
    submittedAt: '2024-02-01T10:00:00Z',
    reviewedAt: '2024-02-01T10:30:00Z',
    expiresAt: '2025-02-01T10:00:00Z',
    version: '2.1',
    ipAddress: '192.168.1.100',
    digitalSignature: true
  },
  {
    id: '2',
    patientId: 'pat-001',
    patientName: 'John Doe',
    documentType: 'data-sharing',
    status: 'approved',
    submittedAt: '2024-02-01T10:05:00Z',
    reviewedAt: '2024-02-01T10:35:00Z',
    expiresAt: '2025-02-01T10:05:00Z',
    version: '1.3',
    ipAddress: '192.168.1.100',
    digitalSignature: true
  },
  {
    id: '3',
    patientId: 'pat-002',
    patientName: 'Maria Garcia',
    documentType: 'treatment-consent',
    status: 'pending',
    submittedAt: '2024-02-14T14:00:00Z',
    expiresAt: '2025-02-14T14:00:00Z',
    version: '2.1',
    ipAddress: '192.168.1.105',
    digitalSignature: true
  },
  {
    id: '4',
    patientId: 'pat-003',
    patientName: 'Michael Chen',
    documentType: 'recording-consent',
    status: 'expired',
    submittedAt: '2023-02-01T09:00:00Z',
    reviewedAt: '2023-02-01T09:30:00Z',
    expiresAt: '2024-02-01T09:00:00Z',
    version: '1.2',
    ipAddress: '192.168.1.110',
    digitalSignature: false
  }
];

export const ConsentView: React.FC = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'declined' | 'expired'>('all');
  const [filterType, setFilterType] = useState<'all' | 'treatment-consent' | 'data-sharing' | 'recording-consent' | 'research-participation'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [consentRecordsState, setConsentRecordsState] = useState<ConsentRecord[]>(mockConsentRecords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch consent records when component mounts
  useEffect(() => {
    const fetchConsentRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For therapists and supervisors, get all consents
        // For patients, get only their own consents
        const endpoint = user?.role === 'patient'
          ? `/api/consent/patient/${user.id}`
          : '/api/consent';
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch consent records: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform backend data to match our frontend ConsentRecord type
        const transformedData: ConsentRecord[] = data.map((record: any) => ({
          id: record._id,
          patientId: record.patientId._id || record.patientId,
          patientName: record.patientId.firstName && record.patientId.lastName 
            ? `${record.patientId.firstName} ${record.patientId.lastName}`
            : 'Unknown Patient',
          documentType: record.consentType,
          status: record.status,
          submittedAt: record.dateSubmitted,
          reviewedAt: record.dateReviewed,
          expiresAt: new Date(new Date(record.dateSubmitted).setFullYear(new Date(record.dateSubmitted).getFullYear() + 1)).toISOString(),
          version: '2.1', // Hardcoded for now
          ipAddress: record.ipAddress || 'Unknown',
          digitalSignature: !!record.signature
        }));
        
        setConsentRecordsState(transformedData);
      } catch (err: any) {
        console.error('Error fetching consent records:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConsentRecords();
  }, [user]);

  const handleConsentFormSubmit = async (formData: ConsentFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get client IP (in a real app, this would be handled by the server)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: user?.id,
          consentType: formData.documentType,
          signature: formData.signature || user?.firstName + ' ' + user?.lastName,
          ipAddress: ipData.ip,
          additionalNotes: formData.additionalNotes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit consent form');
      }
      
      const newConsent = await response.json();
      
      // Create a frontend representation of the new consent
      const newConsentRecord: ConsentRecord = {
        id: newConsent._id,
        patientId: newConsent.patientId,
        patientName: user?.firstName + ' ' + user?.lastName || 'Unknown Patient',
        documentType: newConsent.consentType,
        status: 'pending',
        submittedAt: newConsent.dateSubmitted,
        expiresAt: new Date(new Date(newConsent.dateSubmitted).setFullYear(new Date(newConsent.dateSubmitted).getFullYear() + 1)).toISOString(),
        version: '2.1', // Current version
        ipAddress: newConsent.ipAddress || 'Unknown',
        digitalSignature: !!newConsent.signature
      };
      
      // Add the new consent record to the state
      setConsentRecordsState([newConsentRecord, ...consentRecordsState]);
      
      // Close the form
      setShowConsentForm(false);
    } catch (err: any) {
      console.error('Error submitting consent form:', err);
      setError(err.message);
      alert(`Failed to submit consent form: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = consentRecordsState.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesType = filterType === 'all' || record.documentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDocumentType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="bg-blue-50 p-4 rounded-md flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <p>Loading consent records...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 mb-6">
          <p className="font-medium">Error loading consent records:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consent Management</h1>
          <p className="text-gray-600">HIPAA-compliant consent tracking and management</p>
        </div>
        <button 
          onClick={() => setShowConsentForm(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FileText className="h-5 w-5 mr-2" />
          New Consent Form
        </button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">98%</div>
          <div className="text-sm text-gray-600">Compliance Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">156</div>
          <div className="text-sm text-gray-600">Active Consents</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-600">Pending Approvals</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">2</div>
          <div className="text-sm text-gray-600">Expiring Soon</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="treatment-consent">Treatment Consent</option>
            <option value="data-sharing">Data Sharing</option>
            <option value="recording-consent">Recording Consent</option>
            <option value="research-participation">Research Participation</option>
          </select>
        </div>
      </div>

      {/* Consent Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">
                          {record.patientName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                        <div className="text-sm text-gray-500">ID: {record.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDocumentType(record.documentType)}
                        </div>
                        <div className="text-sm text-gray-500">v{record.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      {getStatusBadge(record.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(record.submittedAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isExpiringSoon(record.expiresAt) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(record.expiresAt).toLocaleDateString()}
                    </div>
                    {isExpiringSoon(record.expiresAt) && (
                      <div className="text-xs text-red-500">Expiring soon</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 rounded hover:bg-gray-100" title="View Document">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100" title="Download">
                        <Download className="h-4 w-4 text-gray-600" />
                      </button>
                      {record.status === 'pending' && (
                        <>
                          <button className="p-1 rounded hover:bg-green-100" title="Approve">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </button>
                          <button className="p-1 rounded hover:bg-red-100" title="Decline">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

  {/* HIPAA Compliance Dashboard removed for compact modal */}

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-gray-500 mb-4">No consent records found matching your criteria</div>
        </div>
      )}
      
      {showConsentForm && (
        <ConsentForm 
          onClose={() => setShowConsentForm(false)} 
          onSubmit={handleConsentFormSubmit}
        />
      )}
    </div>
  );
};

// Add default export for compatibility
export default ConsentView;
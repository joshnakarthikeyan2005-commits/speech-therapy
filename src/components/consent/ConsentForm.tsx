import React, { useState } from 'react';
import { Shield, FileText, X, ChevronRight, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ConsentFormProps {
  onClose: () => void;
  onSubmit: (formData: ConsentFormData) => void;
  patientId?: string; // Optional: If provided, pre-fills the patient ID
  patientName?: string; // Optional: If provided, pre-fills the patient name
}

export interface ConsentFormData {
  patientId: string;
  patientName: string;
  documentType: 'treatment-consent' | 'data-sharing' | 'recording-consent' | 'research-participation';
  acknowledgedSections: string[];
  signature: string;
  signatureDate: string;
  additionalNotes?: string;
}

const consentSections = {
  'treatment-consent': [
    {
      id: 'purpose',
      title: 'Purpose of Treatment',
      content: 'I understand the purpose of speech therapy is to improve communication skills which may include speech production, language comprehension, reading, writing, voice, fluency, cognitive-communication, and/or pragmatics (social skills). The evaluation and treatment plan will be discussed, and I will have the opportunity to ask questions about the proposed treatment.'
    },
    {
      id: 'process',
      title: 'Treatment Process',
      content: 'I understand that the treatment may include various techniques, exercises, and activities tailored to my specific needs or the needs of the patient I am representing. These may include verbal exercises, physical manipulation of speech articulators, use of specialized equipment, homework assignments, and other therapeutic activities.'
    },
    {
      id: 'risks',
      title: 'Risks and Benefits',
      content: 'I understand that speech therapy generally carries minimal risk. Potential discomfort may include fatigue or frustration during challenging tasks. The benefits may include improved communication skills, enhanced quality of life, and increased independence. I understand that results vary by individual and are not guaranteed.'
    },
    {
      id: 'confidentiality',
      title: 'Confidentiality',
      content: 'I understand that my health information or that of the patient I represent will be kept confidential in accordance with HIPAA regulations. Information may only be released with written consent or as required by law.'
    },
    {
      id: 'revocation',
      title: 'Right to Revoke',
      content: 'I understand that I have the right to revoke this consent at any time by providing written notice. Revocation will not apply to information already disclosed based on prior consent.'
    }
  ],
  'data-sharing': [
    {
      id: 'data-collection',
      title: 'Data Collection',
      content: 'I understand that personal health information will be collected as part of speech therapy services. This includes assessment results, treatment notes, audio/video recordings (if separately authorized), and other clinical documentation.'
    },
    {
      id: 'data-use',
      title: 'Data Use',
      content: 'I consent to the use of this data for treatment planning, coordination of care with other healthcare providers, billing/insurance purposes, and quality improvement within the practice.'
    },
    {
      id: 'third-parties',
      title: 'Third-Party Sharing',
      content: 'I understand that my information may be shared with the following third parties: (1) Other healthcare providers directly involved in my care or the care of the patient I represent; (2) Insurance companies or other payers for billing purposes; (3) Electronic health record system providers with appropriate security safeguards.'
    },
    {
      id: 'de-identified',
      title: 'De-identified Data',
      content: 'I consent to the use of de-identified data (with all personally identifiable information removed) for research, education, or statistical purposes.'
    },
    {
      id: 'revocation-sharing',
      title: 'Right to Revoke',
      content: 'I understand that I can revoke this consent for data sharing at any time by providing written notice, but that revocation will not apply to information already shared.'
    }
  ],
  'recording-consent': [
    {
      id: 'recording-purpose',
      title: 'Purpose of Recording',
      content: 'I consent to audio and/or video recording of speech therapy sessions for the following purposes: (1) Assessment and documentation of progress; (2) Treatment planning; (3) Clinical education and supervision.'
    },
    {
      id: 'recording-storage',
      title: 'Storage and Security',
      content: 'I understand that all recordings will be stored securely in accordance with HIPAA regulations, with access limited to authorized clinical personnel directly involved in treatment or supervision.'
    },
    {
      id: 'recording-duration',
      title: 'Retention Period',
      content: 'I understand that recordings will be retained for a period of [Duration] after which they will be securely deleted unless otherwise required by law or separate consent is provided for longer retention.'
    },
    {
      id: 'recording-sharing',
      title: 'Limitations on Sharing',
      content: 'I understand that recordings will not be shared with anyone outside the clinical team without separate explicit consent, except as required by law.'
    },
    {
      id: 'recording-revocation',
      title: 'Right to Revoke',
      content: 'I understand that I may revoke this consent for recording at any time by providing written notice. Previously recorded materials will be deleted upon request unless required for legal or documentation purposes.'
    }
  ],
  'research-participation': [
    {
      id: 'research-purpose',
      title: 'Research Purpose',
      content: 'I consent to participate in research activities related to speech therapy outcomes, techniques, or other relevant studies. The purpose of this research is to advance the field of speech-language pathology and improve future treatment approaches.'
    },
    {
      id: 'research-procedures',
      title: 'Research Procedures',
      content: 'Research participation may involve additional assessments, questionnaires, specialized treatment protocols, or follow-up evaluations beyond standard care.'
    },
    {
      id: 'research-risks',
      title: 'Risks and Benefits',
      content: 'Potential risks include additional time commitment and possibly trying new therapeutic approaches. Benefits may include access to innovative techniques and contributing to the advancement of speech therapy. I understand that I may or may not directly benefit from participation.'
    },
    {
      id: 'research-confidentiality',
      title: 'Data Confidentiality',
      content: 'All research data will be de-identified (stripped of personal information) before analysis and publication. My privacy will be protected according to HIPAA standards and research ethics guidelines.'
    },
    {
      id: 'research-withdrawal',
      title: 'Right to Withdraw',
      content: 'I understand that participation is voluntary and I can withdraw from research participation at any time without penalty or loss of speech therapy services. Data collected prior to withdrawal may still be used in de-identified form unless I specifically request otherwise.'
    }
  ]
};

export const ConsentForm: React.FC<ConsentFormProps> = ({ onClose, onSubmit, patientId = '', patientName = '' }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ConsentFormData>({
    patientId: patientId,
    patientName: patientName,
    documentType: 'treatment-consent',
    acknowledgedSections: [],
    signature: '',
    signatureDate: new Date().toISOString().split('T')[0],
    additionalNotes: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [allChecked, setAllChecked] = useState<boolean>(false);
  
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    }
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    const sections = consentSections[formData.documentType];
    
    if (formData.acknowledgedSections.length !== sections.length) {
      newErrors.acknowledgements = 'You must acknowledge all sections';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.signature.trim()) {
      newErrors.signature = 'Signature is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      onSubmit(formData);
    }
  };
  
  const toggleSection = (sectionId: string) => {
    if (formData.acknowledgedSections.includes(sectionId)) {
      setFormData({
        ...formData,
        acknowledgedSections: formData.acknowledgedSections.filter(id => id !== sectionId)
      });
      setAllChecked(false);
    } else {
      const newAcknowledgedSections = [...formData.acknowledgedSections, sectionId];
      setFormData({
        ...formData,
        acknowledgedSections: newAcknowledgedSections
      });
      
      // Check if all sections are now acknowledged
      const allSections = consentSections[formData.documentType].map(section => section.id);
      setAllChecked(allSections.every(id => newAcknowledgedSections.includes(id)));
    }
  };
  
  const toggleAllSections = () => {
    if (allChecked) {
      // Uncheck all
      setFormData({
        ...formData,
        acknowledgedSections: []
      });
      setAllChecked(false);
    } else {
      // Check all
      const allSections = consentSections[formData.documentType].map(section => section.id);
      setFormData({
        ...formData,
        acknowledgedSections: allSections
      });
      setAllChecked(true);
    }
  };
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Consent Document Type</label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.documentType}
          onChange={(e) => setFormData({...formData, documentType: e.target.value as any})}
        >
          <option value="treatment-consent">Treatment Consent</option>
          <option value="data-sharing">Data Sharing</option>
          <option value="recording-consent">Recording Consent</option>
          <option value="research-participation">Research Participation</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patient ID
          {errors.patientId && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          className={`w-full p-2 border ${errors.patientId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={formData.patientId}
          onChange={(e) => setFormData({...formData, patientId: e.target.value})}
          placeholder="Enter patient ID"
        />
        {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patient Name
          {errors.patientName && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          className={`w-full p-2 border ${errors.patientName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={formData.patientName}
          onChange={(e) => setFormData({...formData, patientName: e.target.value})}
          placeholder="Enter patient name"
        />
        {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
      </div>
    </div>
  );
  
  const renderStep2 = () => {
    const sections = consentSections[formData.documentType];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{formData.documentType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h3>
          <div 
            className="flex items-center cursor-pointer text-blue-600" 
            onClick={toggleAllSections}
          >
            {allChecked ? <CheckSquare className="h-5 w-5 mr-1" /> : <Square className="h-5 w-5 mr-1" />}
            <span className="text-sm">{allChecked ? 'Uncheck All' : 'Acknowledge All'}</span>
          </div>
        </div>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
              <div 
                className="flex items-start cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="mt-0.5">
                  {formData.acknowledgedSections.includes(section.id) ? 
                    <CheckSquare className="h-5 w-5 text-blue-600" /> : 
                    <Square className="h-5 w-5 text-gray-400" />
                  }
                </div>
                <div className="ml-2 flex-1">
                  <h4 className="font-medium text-gray-900">{section.title}</h4>
                  <p className="text-gray-700 text-sm mt-1">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {errors.acknowledgements && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{errors.acknowledgements}</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Consent Summary</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600">Document Type:</span> {formData.documentType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
            <p><span className="text-gray-600">Patient:</span> {formData.patientName} (ID: {formData.patientId})</p>
            <p><span className="text-gray-600">Acknowledged:</span> {formData.acknowledgedSections.length} sections</p>
            <p><span className="text-gray-600">Date:</span> {new Date(formData.signatureDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Signature (Type your full name)
          {errors.signature && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          className={`w-full p-2 border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={formData.signature}
          onChange={(e) => setFormData({...formData, signature: e.target.value})}
          placeholder="Enter your full name"
        />
        {errors.signature && <p className="text-red-500 text-sm mt-1">{errors.signature}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.signatureDate}
          onChange={(e) => setFormData({...formData, signatureDate: e.target.value})}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.additionalNotes || ''}
          onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
          placeholder="Any additional comments or information..."
          rows={3}
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        <p className="text-sm">By signing, you confirm that you have read, understood, and agree to the terms outlined in this consent document.</p>
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[50vh] flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep === 1 && 'New Consent Form'}
              {currentStep === 2 && 'Consent Acknowledgement'}
              {currentStep === 3 && 'Sign Consent Form'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
  <div className="flex items-center bg-gray-50 px-4 py-2 border-b">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
        
  <div className="px-4 py-4 flex-1 overflow-y-auto">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
        
  <div className="border-t px-4 py-3 flex justify-between">
          {currentStep > 1 ? (
            <button 
              type="button" 
              onClick={handlePrevStep}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStep < 3 ? (
            <button 
              type="button" 
              onClick={handleNextStep}
              className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 flex items-center"
            >
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700"
            >
              Submit Consent Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;

import React from 'react';
import { X } from 'lucide-react';
import SpeechAnalyzer from './SpeechAnalyzer';

interface SpeechAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseTitle: string;
  exerciseType: 'breathing' | 'speech-rate' | 'rhythm' | 'articulation';
  selectedLanguage: string;
  practiceTexts: {
    [key: string]: string[];
  };
}

const SpeechAnalyzerModal: React.FC<SpeechAnalyzerModalProps> = ({
  isOpen,
  onClose,
  exerciseId,
  exerciseTitle,
  exerciseType,
  selectedLanguage,
  practiceTexts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {exerciseTitle} - Speech Analysis
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <SpeechAnalyzer 
            exerciseId={exerciseId}
            exerciseTitle={exerciseTitle}
            exerciseType={exerciseType}
            initialLanguage={selectedLanguage}
            practiceTexts={practiceTexts[selectedLanguage]}
          />
        </div>
      </div>
    </div>
  );
};

export default SpeechAnalyzerModal;

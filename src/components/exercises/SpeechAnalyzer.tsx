import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, BarChart2, FileText, Play, Award, CheckCircle, AlertCircle, Volume2, RefreshCw } from 'lucide-react';

// Types
interface AnalysisResult {
  fluencyScore: number;
  wordCount: number;
  speechRate: number;
  pauseCount: number;
  disfluencyCount: number;
  suggestions: string[];
  language: string;
  timestamp: Date;
  exerciseId?: string;
  transcript?: string;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

interface SpeechAnalyzerProps {
  exerciseId?: string;
  exerciseTitle?: string;
  exerciseType?: 'breathing' | 'speech-rate' | 'rhythm' | 'articulation';
  initialLanguage?: string;
  practiceTexts?: string[];
}

const SpeechAnalyzer: React.FC<SpeechAnalyzerProps> = ({
  exerciseId = '',
  exerciseTitle = '',
  exerciseType = 'speech-rate',
  initialLanguage = 'en',
  practiceTexts = []
}) => {
  // State variables
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previousResults, setPreviousResults] = useState<AnalysisResult[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Language options
  const languages: LanguageOption[] = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'zh', name: 'Mandarin', nativeName: '普通话' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl, isRecording]);

  // Sync selected language when initialLanguage prop changes
  useEffect(() => {
    setSelectedLanguage(initialLanguage);
  }, [initialLanguage]);

  // Start recording
  const startRecording = async () => {
    try {
      // Reset
      audioChunksRef.current = [];
      setRecordingDuration(0);
      setAnalysisResult(null);
      setAudioUrl(null);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setIsRecording(false);
        
        // Auto analyze
        analyzeRecording();
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
        
        // Auto stop after 2 minutes
        if (recordingDuration >= 120) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop and clear all tracks on the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Mock analysis function (in a real app, this would send the audio to a server for processing)
  const analyzeRecording = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      // Generate mock analysis results with realistic data
      const mockResult: AnalysisResult = generateMockAnalysisResult();
      
      // Update state
      setAnalysisResult(mockResult);
      setPreviousResults(prev => [mockResult, ...prev].slice(0, 5));
      setIsAnalyzing(false);
    }, 2500); // 2.5 second delay to simulate processing
  };
  
  // Generate mock analysis results based on language
  const generateMockAnalysisResult = (): AnalysisResult => {
    // Base values that vary by language
    const baseValues: { [key: string]: any } = {
      english: { fluency: 75, wordCount: 120, speechRate: 150, pauseCount: 8, disfluencyCount: 6 },
      spanish: { fluency: 65, wordCount: 110, speechRate: 160, pauseCount: 10, disfluencyCount: 8 },
      mandarin: { fluency: 55, wordCount: 95, speechRate: 140, pauseCount: 12, disfluencyCount: 10 },
      tamil: { fluency: 60, wordCount: 100, speechRate: 130, pauseCount: 11, disfluencyCount: 9 },
      default: { fluency: 70, wordCount: 115, speechRate: 145, pauseCount: 9, disfluencyCount: 7 },
    };
    
    // Get base values for selected language
    const base = baseValues[selectedLanguage] || baseValues.default;
    
    // Add some random variation (±10% of base value)
    const getRandomizedValue = (baseValue: number) => {
      const variation = baseValue * 0.1; // 10% of base value
      return Math.round(baseValue + (Math.random() * variation * 2 - variation));
    };
    
    // Language-specific suggestions
    const suggestionsByLanguage: { [key: string]: any } = {
      english: [
        "Try slowing down your speech rate slightly",
        "Practice more consistent breathing during longer sentences",
        "Work on smoother transitions between phrases",
        "Reduce tension in your jaw and throat when speaking",
        "Try using more gentle onsets at the beginning of sentences"
      ],
      spanish: [
        "Practicar pausas más naturales entre frases",
        "Trabajar en la consistencia del ritmo del habla",
        "Reducir la velocidad en palabras complicadas",
        "Enfocarse en la respiración diafragmática",
        "Practicar la entonación natural en preguntas"
      ],
      mandarin: [
        "注意声调的一致性",
        "在句子之间使用更自然的停顿",
        "练习更平稳的语速",
        "增强呼吸控制",
        "在说话时保持放松的姿态"
      ],
      tamil: [
        "பேச்சு விகிதத்தை சற்று குறைக்க முயற்சிக்கவும்",
        "நீண்ட வாக்கியங்களின் போது அதிக சீரான சுவாசத்தை பயிற்சி செய்யுங்கள்",
        "சொற்றொடர்களுக்கு இடையில் மென்மையான மாற்றங்களில் வேலை செய்யுங்கள்",
        "பேசும் போது உங்கள் தாடை மற்றும் தொண்டையில் பதற்றத்தை குறைக்கவும்",
        "வாக்கியங்களின் தொடக்கத்தில் மென்மையான தொடக்கங்களைப் பயன்படுத்த முயற்சிக்கவும்"
      ],
      default: [
        "Focus on clear articulation.",
        "Maintain a steady pace.",
        "Use pauses effectively.",
      ]
    };
    
    // Exercise-specific suggestions if exercise type is provided
    if (exerciseType === 'breathing') {
      (suggestionsByLanguage[selectedLanguage] || suggestionsByLanguage.default).push(
        "Focus on diaphragmatic breathing throughout your speech",
        "Establish a consistent breathing pattern before starting to speak",
        "Take a full breath at natural pauses in your speech"
      );
    } else if (exerciseType === 'speech-rate') {
      (suggestionsByLanguage[selectedLanguage] || suggestionsByLanguage.default).push(
        "Try using a metronome to maintain consistent speech rate",
        "Practice with gradually increasing speech rate while maintaining fluency",
        "Pay attention to word transitions where you tend to speed up"
      );
    } else if (exerciseType === 'rhythm') {
      (suggestionsByLanguage[selectedLanguage] || suggestionsByLanguage.default).push(
        "Try tapping a consistent rhythm while speaking",
        "Focus on syllable-by-syllable practice to establish rhythm",
        "Practice with varied stress patterns to improve speech rhythm"
      );
    }
    
    // Randomly select 3 suggestions
    const allSuggestions = suggestionsByLanguage[selectedLanguage] || suggestionsByLanguage.default;
    const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random());
    const selectedSuggestions = shuffled.slice(0, 3);
    
    return {
      fluencyScore: getRandomizedValue(base.fluency),
      wordCount: getRandomizedValue(base.wordCount),
      speechRate: getRandomizedValue(base.speechRate),
      pauseCount: getRandomizedValue(base.pauseCount),
      disfluencyCount: getRandomizedValue(base.disfluencyCount),
      suggestions: selectedSuggestions,
      language: selectedLanguage,
      timestamp: new Date(),
      exerciseId: exerciseId || undefined,
      transcript: practiceTexts && practiceTexts.length > 0 ? practiceTexts[0] : 'The patient did not follow a script.'
    };
  };

  // Get fluency level description
  const getFluencyLevelDescription = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Developing';
    return 'Needs Improvement';
  };

  // Get color class based on score
  const getScoreColorClass = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get icon based on score
  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 50) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Speech Fluency Analyzer</h1>
        <p className="text-gray-600">
          Record your voice to receive personalized fluency analysis and improvement suggestions
        </p>
      </div>

      {/* Language selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Analysis Language
            </label>
            <div className="flex space-x-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    selectedLanguage === lang.code 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing}
              className={`px-4 py-2 rounded-lg flex items-center font-medium ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : isAnalyzing 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording ({formatTime(recordingDuration)})
                </>
              ) : isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
              <div className="text-sm text-gray-500">
                {analysisResult.timestamp.toLocaleTimeString()} • {analysisResult.language}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Overall Fluency</div>
                <div className="flex items-baseline">
                  <div className={`text-3xl font-bold ${getScoreColorClass(analysisResult.fluencyScore)}`}>
                    {analysisResult.fluencyScore}%
                  </div>
                  <div className="text-sm ml-2 text-gray-500">
                    {getFluencyLevelDescription(analysisResult.fluencyScore)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analysisResult.fluencyScore >= 80 ? 'bg-green-600' : 
                      analysisResult.fluencyScore >= 70 ? 'bg-emerald-500' : 
                      analysisResult.fluencyScore >= 60 ? 'bg-yellow-500' : 
                      analysisResult.fluencyScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysisResult.fluencyScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1 flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1 text-blue-500" /> Speech Rate
                </div>
                <div className="text-lg font-semibold">
                  {analysisResult.speechRate} wpm
                </div>
                <div className="text-xs text-gray-500">words per minute</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1 flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-green-500" /> Word Count
                </div>
                <div className="text-lg font-semibold">
                  {analysisResult.wordCount} words
                </div>
                <div className="text-xs text-gray-500">{recordingDuration} seconds</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1 flex items-center">
                  <Volume2 className="h-4 w-4 mr-1 text-yellow-500" /> Disfluencies
                </div>
                <div className="text-lg font-semibold">
                  {analysisResult.disfluencyCount} detected
                </div>
                <div className="text-xs text-gray-500">{Math.round(analysisResult.disfluencyCount / (analysisResult.wordCount / 100))}% of words</div>
              </div>
            </div>
            
            {/* Transcript */}
            {analysisResult.transcript && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-blue-600" /> 
                        Transcript
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{analysisResult.transcript}</p>
                </div>
            )}

            {/* Audio playback */}
            {audioUrl && (
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-700 mb-2">Review Your Recording</div>
                <audio src={audioUrl} controls className="w-full"></audio>
              </div>
            )}
            
            {/* Suggestions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Award className="h-4 w-4 mr-1 text-blue-600" /> 
                Improvement Suggestions
              </h4>
              <ul className="space-y-2 bg-blue-50 p-4 rounded-lg">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 mr-2">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button 
              onClick={startRecording}
              className="flex items-center text-sm font-medium text-blue-600"
              disabled={isRecording || isAnalyzing}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Record Again
            </button>
            
            <div className="text-sm text-gray-500">
              Try reading a prepared text for more accurate results
            </div>
          </div>
        </div>
      )}
      
      {/* Practice Prompts */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {exerciseTitle ? `${exerciseTitle} - Practice Prompts` : 'Practice Prompts'}
        </h3>
        <div className="space-y-4">
          {practiceTexts && practiceTexts.length > 0 ? (
            // Display custom practice texts from the exercise
            practiceTexts.map((text, index) => (
              <div key={index} className={`border-l-4 border-${index % 2 === 0 ? 'blue' : 'green'}-500 pl-4 py-2`}>
                <p className="text-gray-700">{text}</p>
                <div className="flex justify-end">
                  <button className="flex items-center text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md mt-2">
                    <Play className="h-3 w-3 mr-1" />
                    Play Example
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Default practice texts if none provided
            <>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-gray-700">
                  {selectedLanguage === 'english' && "The quick brown fox jumps over the lazy dog. I packed my box with five dozen liquor jugs. How vexingly quick daft zebras jump!"}
                  {selectedLanguage === 'spanish' && "El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja."}
                  {selectedLanguage === 'mandarin' && "床前明月光，疑是地上霜。举头望明月，低头思故乡。天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。"}
                </p>
                <div className="flex justify-end">
                  <button className="flex items-center text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md mt-2">
                    <Play className="h-3 w-3 mr-1" />
                    Play Example
                  </button>
                </div>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-gray-700">
                  {selectedLanguage === 'english' && "Please call Stella. Ask her to bring these things with her from the store: Six spoons of fresh snow peas, five thick slabs of blue cheese, and maybe a snack for her brother Bob."}
                  {selectedLanguage === 'spanish' && "Por favor, llama a Sofía. Pídele que traiga estas cosas de la tienda: Seis cucharadas de guisantes frescos, cinco rebanadas gruesas de queso azul, y quizá un aperitivo para su hermano Roberto."}
                  {selectedLanguage === 'mandarin' && "请给小明打电话。让他从商店带些东西回来：六勺新鲜豌豆，五片蓝纹奶酪，或许还有他兄弟小刚的点心。"}
                </p>
                <div className="flex justify-end">
                  <button className="flex items-center text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md mt-2">
                    <Play className="h-3 w-3 mr-1" />
                    Play Example
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Previous Analysis */}
      {previousResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress History</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fluency Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speech Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previousResults.map((result, index) => (
                  <tr key={index} className={index === 0 ? "bg-blue-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.language.charAt(0).toUpperCase() + result.language.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getScoreIcon(result.fluencyScore)}
                        <span className={`ml-2 font-medium ${getScoreColorClass(result.fluencyScore)}`}>
                          {result.fluencyScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.speechRate} wpm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${result.fluencyScore >= 70 ? 'bg-green-100 text-green-800' : 
                          result.fluencyScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {getFluencyLevelDescription(result.fluencyScore)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechAnalyzer;

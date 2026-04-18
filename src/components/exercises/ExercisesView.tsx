import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Repeat, CheckCircle, PlayCircle, PauseCircle, Globe } from 'lucide-react';
import SpeechAnalyzerModal from './SpeechAnalyzerModal';

interface Exercise {
  id: string;
  title: string;
  type: 'breathing' | 'speech-rate' | 'rhythm' | 'articulation';
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  progress: number;
  icon: React.ElementType;
  practiceTexts?: {
    [key: string]: string[];
  };
}

const API_KEY = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Mock API Key

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Mandarin' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ta', name: 'Tamil' },
];

// Mock API function to fetch exercises
const fetchExercises = async (language: string) => {
  console.log(`Fetching exercises for ${language} using API_KEY: ${API_KEY}`);
  // In a real app, you would make an API call here.
  // For now, we'll return mock data with practice texts for all languages.
  const mockExercises: Exercise[] = [
    {
      id: 'ex1',
      title: 'Articulation Drills',
      type: 'articulation',
      description: 'Practice specific sounds and syllables to improve clarity.',
      duration: '10 minutes',
      difficulty: 'beginner',
      completed: false,
      progress: 0,
      icon: Mic,
      practiceTexts: {
        en: ['The quick brown fox jumps over the lazy dog.'],
        es: ['El rápido zorro marrón salta sobre el perro perezoso.'],
        zh: ['敏捷的棕色狐狸跳过了懒狗。'],
        fr: ['Le renard brun et rapide saute par-dessus le chien paresseux.'],
        hi: ['तेज भूरी लोमड़ी आलसी कुत्ते के ऊपर से कूदती है।'],
        ar: ['الثعلب البني السريع يقفز فوق الكلب الكسول.'],
        pt: ['A raposa marrom rápida salta sobre o cão preguiçoso.'],
        ta: ['விரைவான பழுப்பு நரி சோம்பேறி நாய் மீது தாவுகிறது.'],
      }
    },
    {
      id: 'ex2',
      title: 'Sentence Repetition',
      type: 'speech-rate',
      description: 'Repeat sentences of increasing complexity to improve pacing and flow.',
      duration: '15 minutes',
      difficulty: 'intermediate',
      completed: false,
      progress: 0,
      icon: Repeat,
      practiceTexts: {
        en: ['She sells seashells by the seashore.'],
        es: ['Ella vende conchas marinas a la orilla del mar.'],
        zh: ['她在海边卖贝壳。'],
        fr: ['Elle vend des coquillages au bord de la mer.'],
        hi: ['वह समुद्र के किनारे शंख बेचती है।'],
        ar: ['هي تبيع أصداف البحر على شاطئ البحر.'],
        pt: ['Ela vende conchas à beira-mar.'],
        ta: ['அவள் கடற்கரையில் கடல் சிப்பிகளை விற்கிறாள்.'],
      }
    },
    {
      id: 'ex3',
      title: 'Story Retelling',
      type: 'rhythm',
      description: 'Retell a short story in your own words to practice narrative fluency.',
      duration: '20 minutes',
      difficulty: 'advanced',
      completed: false,
      progress: 0,
      icon: Volume2,
      practiceTexts: {
        en: ['The North Wind and the Sun were disputing which was the stronger.'],
        es: ['El Viento del Norte y el Sol discutían sobre cuál era más fuerte.'],
        zh: ['北风和太阳正在争论谁更强大。'],
        fr: ['Le vent du nord et le soleil se disputaient pour savoir lequel était le plus fort.'],
        hi: ['उत्तरी हवा और सूर्य इस बात पर विवाद कर रहे थे कि कौन अधिक शक्तिशाली है।'],
        ar: ['كانت رياح الشمال والشمس تتنازعان أيهما أقوى.'],
        pt: ['O Vento Norte e o Sol estavam discutindo qual era o mais forte.'],
        ta: ['வடக்குக் காற்றும் சூரியனும் யார் வலிமையானவர் என்று விவாதித்துக் கொண்டிருந்தன.'],
      }
    },
     {
      id: 'ex4',
      title: 'Controlled Breathing',
      type: 'breathing',
      description: 'Practice diaphragmatic breathing to establish respiratory control.',
      duration: '5 minutes',
      difficulty: 'beginner',
      completed: false,
      progress: 0,
      icon: Volume2,
      practiceTexts: {
        en: ['Breathe in, and now breathe out.'],
        es: ['Inhala, y ahora exhala.'],
        zh: ['吸气，然后呼气。'],
        fr: ['Inspirez, et maintenant expirez.'],
        hi: ['सांस अंदर लें, और अब सांस छोड़ें।'],
        ar: ['استنشق ، والآن ازفر.'],
        pt: ['Inspire e agora expire.'],
        ta: ['மூச்சை உள்ளே இழுங்கள், இப்போது மூச்சை வெளியே விடுங்கள்.'],
      }
    },
  ];
  return mockExercises;
};

export const ExercisesView: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [analyzingExercise, setAnalyzingExercise] = useState<Exercise | null>(null);
  const [showSpeechAnalyzer, setShowSpeechAnalyzer] = useState(false);

  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true);
      const fetchedExercises = await fetchExercises(selectedLanguage);
      setExercises(fetchedExercises);
      setLoading(false);
    };
    loadExercises();
  }, [selectedLanguage]);

  // Toggle exercise details visibility
  const toggleExercise = (id: string) => {
    if (expandedExercise === id) {
      setExpandedExercise(null);
    } else {
      setExpandedExercise(id);
    }
  };

  // Handle play/pause
  const togglePlay = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (playing === id) {
      setPlaying(null);
    } else {
      setPlaying(id);
    }
  };

  // Mark exercise as completed
  const markCompleted = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // In a real app, this would update the backend
    console.log(`Exercise ${id} marked as completed`);
  };
  
  // Open speech analyzer for an exercise
  const openSpeechAnalyzer = (exercise: Exercise, event: React.MouseEvent) => {
    event.stopPropagation();
    setAnalyzingExercise(exercise);
    setShowSpeechAnalyzer(true);
  };

  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Speech Exercises for Accuracy</h3>
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-gray-500 mr-2" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exercises...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className={`p-3 cursor-pointer ${expandedExercise === exercise.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => toggleExercise(exercise.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 
                      ${exercise.type === 'breathing' ? 'bg-blue-100' : 
                        exercise.type === 'speech-rate' ? 'bg-green-100' : 
                        exercise.type === 'articulation' ? 'bg-yellow-100' : 'bg-purple-100'}`}>
                      <exercise.icon className={`h-5 w-5 
                        ${exercise.type === 'breathing' ? 'text-blue-600' : 
                          exercise.type === 'speech-rate' ? 'text-green-600' : 
                          exercise.type === 'articulation' ? 'text-yellow-600' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{exercise.title}</div>
                      <div className="text-xs text-gray-600">{exercise.duration} • {exercise.difficulty}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {exercise.progress > 0 && (
                      <div className="text-xs text-blue-600 mr-3">{exercise.progress}% complete</div>
                    )}
                    <button 
                      onClick={(e) => togglePlay(exercise.id, e)}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      {playing === exercise.id ? 
                        <PauseCircle className="h-6 w-6 text-blue-600" /> : 
                        <PlayCircle className="h-6 w-6 text-blue-600" />
                      }
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {exercise.progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${exercise.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Expanded view */}
              {expandedExercise === exercise.id && (
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <p className="text-sm text-gray-700 mb-3">{exercise.description}</p>
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2">
                      <button className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        View Instructions
                      </button>
                      <button 
                        onClick={(e) => openSpeechAnalyzer(exercise, e)}
                        className="flex items-center text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Mic className="h-3 w-3 mr-1" />
                        Analyze Speech
                      </button>
                    </div>
                    <button 
                      onClick={(e) => markCompleted(exercise.id, e)}
                      className="flex items-center text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Speech Analyzer Modal */}
      {analyzingExercise && (
        <SpeechAnalyzerModal
          isOpen={showSpeechAnalyzer}
          onClose={() => {
            setShowSpeechAnalyzer(false);
            setAnalyzingExercise(null);
          }}
          exerciseId={analyzingExercise.id}
          exerciseTitle={analyzingExercise.title}
          exerciseType={analyzingExercise.type as any}
          selectedLanguage={selectedLanguage as any}
          practiceTexts={(analyzingExercise.practiceTexts || {}) as any}
        />
      )}
    </div>
  );
};

export default ExercisesView;
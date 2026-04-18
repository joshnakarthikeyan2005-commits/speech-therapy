import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';

interface Feedback {
  _id: string;
  patientId: { firstName: string; lastName: string };
  therapistId: { firstName: string; lastName: string };
  sessionId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const FeedbackList: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        console.log('Fetching feedback data...');
        const response = await fetch('/api/feedback');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to fetch feedback: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Feedback data received:', data);
        setFeedbacks(data);
      } catch (err: any) {
        console.error('Error fetching feedback:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading feedback...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }
  
  // Debug output to see what's happening
  console.log(`Rendering feedback list with ${feedbacks.length} items:`, feedbacks);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Feedback</h3>
      {feedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback has been submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-700">
                    Patient: {feedback.patientId && typeof feedback.patientId === 'object' ? 
                      `${feedback.patientId.firstName || ''} ${feedback.patientId.lastName || ''}` : 
                      'Unknown Patient'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                    />
                  ))}
                </div>
              </div>
              {feedback.comment && (
                <div className="flex items-start space-x-3 mt-3 text-gray-600">
                  <MessageSquare className="h-5 w-5 flex-shrink-0 mt-1" />
                  <p className="italic">"{feedback.comment}"</p>
                </div>
              )}
               <p className="text-xs text-gray-400 mt-2 text-right">
                {new Date(feedback.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;

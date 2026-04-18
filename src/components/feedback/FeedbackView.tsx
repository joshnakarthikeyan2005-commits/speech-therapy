import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Star, Send } from 'lucide-react';
import FeedbackList from './FeedbackList';

export const FeedbackView: React.FC = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback || rating === 0) {
      alert('Please provide a rating and feedback.');
      return;
    }

    try {
      console.log('Submitting feedback with patient ID:', user?.id);
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: user?.id || '64f5c7d10a7e7700138d7654', // Using a default ID if user ID is not available
          rating,
          comment: feedback,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Feedback submitted successfully:', result);
        setSubmitted(true);
      } else {
        console.error('Server error:', result);
        alert(`Failed to submit feedback: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (user?.role === 'supervisor') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Feedback & Reviews</h1>
        <p className="text-gray-600 mb-6">Review feedback submitted by patients about their therapy sessions.</p>
        <FeedbackList />
      </div>
    );
  }
  
  if (user?.role !== 'patient') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600">This page is for patients to provide feedback.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Thank You!</h1>
        <p className="text-gray-600">Your feedback has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Provide Feedback</h1>
      <p className="text-gray-600 mb-6">We value your opinion. Please let us know about your experience.</p>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-800 mb-3">How would you rate your last session?</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer transition-colors ${
                  star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="feedback" className="block text-lg font-medium text-gray-800 mb-3">
            Do you have any comments or suggestions?
          </label>
          <textarea
            id="feedback"
            rows={6}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Share your thoughts on what went well or what could be improved..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-semibold text-lg"
          >
            <Send className="h-5 w-5 mr-2" />
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackView;
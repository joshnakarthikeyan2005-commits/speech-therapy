import React, { useState } from 'react';
import { TrendingUp, Calendar, Target, Award, BarChart3, LineChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProgressData {
  date: string;
  score: number;
  goal: string;
}

const mockProgressData: ProgressData[] = [
  { date: '2024-01-01', score: 65, goal: 'Articulation' },
  { date: '2024-01-08', score: 68, goal: 'Articulation' },
  { date: '2024-01-15', score: 72, goal: 'Articulation' },
  { date: '2024-01-22', score: 75, goal: 'Articulation' },
  { date: '2024-01-29', score: 78, goal: 'Articulation' },
  { date: '2024-02-05', score: 82, goal: 'Articulation' },
  { date: '2024-02-12', score: 85, goal: 'Articulation' },
];

export const ProgressView: React.FC = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedGoal, setSelectedGoal] = useState<'all' | 'articulation' | 'fluency' | 'voice'>('all');

  const goals = [
    {
      id: '1',
      name: 'Articulation Improvement',
      target: 85,
      current: 82,
      progress: 96,
      color: 'blue',
      sessions: 12,
      trend: '+5%'
    },
    {
      id: '2',
      name: 'Fluency Development',
      target: 80,
      current: 74,
      progress: 93,
      color: 'green',
      sessions: 8,
      trend: '+8%'
    },
    {
      id: '3',
      name: 'Voice Quality',
      target: 75,
      current: 68,
      progress: 91,
      color: 'purple',
      sessions: 6,
      trend: '+3%'
    }
  ];

  const achievements = [
    { name: '30-Day Streak', icon: '🔥', earned: true, date: '2024-02-10' },
    { name: 'Articulation Master', icon: '🎯', earned: true, date: '2024-02-05' },
    { name: 'Consistent Practitioner', icon: '⭐', earned: true, date: '2024-01-28' },
    { name: 'Voice Champion', icon: '🏆', earned: false, progress: 85 },
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="text-gray-600">Monitor therapy progress and achievements</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">82%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sessions Completed</h3>
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">26</div>
          <div className="text-sm text-blue-600">95% attendance rate</div>
          <p className="text-sm text-gray-500 mt-1">Target: 28 sessions</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Goals Achieved</h3>
            <Award className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">5/7</div>
          <div className="text-sm text-purple-600">71% completion</div>
          <p className="text-sm text-gray-500 mt-1">2 goals in progress</p>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Goals</option>
            <option value="articulation">Articulation</option>
            <option value="fluency">Fluency</option>
            <option value="voice">Voice Quality</option>
          </select>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{goal.name}</h4>
                  <p className="text-sm text-gray-600">{goal.sessions} sessions completed</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {goal.current}/{goal.target}
                  </div>
                  <div className={`text-sm ${goal.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {goal.trend} this month
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`${getProgressColor(goal.progress)} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress: {goal.progress}%</span>
                <span>Target Score: {goal.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Progress Trend</h3>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="h-64 flex items-end space-x-2">
            {mockProgressData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                  style={{ height: `${(data.score / 100) * 200}px` }}
                ></div>
                <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className={`font-medium ${achievement.earned ? 'text-green-900' : 'text-gray-700'}`}>
                      {achievement.name}
                    </div>
                    {achievement.earned ? (
                      <div className="text-sm text-green-600">
                        Earned {new Date(achievement.date!).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {achievement.progress}% progress
                      </div>
                    )}
                  </div>
                </div>
                {achievement.earned && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
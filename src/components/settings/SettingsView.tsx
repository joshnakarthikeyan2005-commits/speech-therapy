import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Database, Key, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    sessionReminders: true,
    progressUpdates: true,
    systemAlerts: false,
    emailDigest: true,
    smsNotifications: false
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    timezone: 'America/New_York',
    language: 'English'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Database },
  ];

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => handleProfileChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={profileData.language}
                    onChange={(e) => handleProfileChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Mandarin">Mandarin</option>
                  </select>
                </div>
              </div>
            </div>

            {user?.role === 'therapist' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      placeholder="CCC-SLP-12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      placeholder="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="text-sm text-gray-600">
                        {key === 'sessionReminders' && 'Get notified about upcoming therapy sessions'}
                        {key === 'progressUpdates' && 'Receive updates on patient progress and milestones'}
                        {key === 'systemAlerts' && 'Important system notifications and maintenance alerts'}
                        {key === 'emailDigest' && 'Weekly summary of activities and updates'}
                        {key === 'smsNotifications' && 'Text message notifications for urgent matters'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handleNotificationChange(key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Enabled</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Add an extra layer of security to your account
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Manage 2FA Settings
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Password</div>
                  <div className="text-sm text-gray-600 mb-3">
                    Last changed 45 days ago
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Change Password
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Active Sessions</div>
                  <div className="text-sm text-gray-600 mb-3">
                    Manage your active login sessions across devices
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm font-medium">Current Session</div>
                        <div className="text-xs text-gray-500">Chrome on Windows • 192.168.1.100</div>
                      </div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Theme</div>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 border-2 border-blue-500 rounded-lg bg-white">
                      <div className="w-full h-8 bg-white border border-gray-200 rounded mb-2"></div>
                      <div className="text-sm font-medium">Light</div>
                    </button>
                    <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300">
                      <div className="w-full h-8 bg-gray-800 rounded mb-2"></div>
                      <div className="text-sm font-medium">Dark</div>
                    </button>
                    <button className="p-3 border border-gray-200 rounded-lg hover:border-gray-300">
                      <div className="w-full h-8 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
                      <div className="text-sm font-medium">Auto</div>
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Font Size</div>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Compact Mode</div>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Use compact layout to show more information</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Data Sharing</div>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Share anonymized data for research purposes</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Allow marketing communications</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Data Export</div>
                  <div className="text-sm text-gray-600 mb-3">
                    Download a copy of your data in a portable format
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Request Data Export
                  </button>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="font-medium text-red-900 mb-2">Delete Account</div>
                  <div className="text-sm text-red-700 mb-3">
                    Permanently delete your account and all associated data
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and platform settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-700">Account Type</div>
            <div className="text-lg font-semibold text-gray-900 capitalize">{user?.role}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Member Since</div>
            <div className="text-lg font-semibold text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Last Login</div>
            <div className="text-lg font-semibold text-gray-900">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add default export for compatibility
export default SettingsView;
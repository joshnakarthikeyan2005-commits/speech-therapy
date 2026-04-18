import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SignupFormProps {
  onToggleForm: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500 mt-2">Join our speech therapy platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First Name"
            required
          />
          <input
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last Name"
            required
          />
        </div>

        {/* Email */}
        <input
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address"
          required
        />

        {/* Role selection */}
        <select
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
        >
          <option value="patient">Patient</option>
          <option value="therapist">Therapist</option>
          <option value="supervisor">Supervisor</option>
        </select>

        {/* Password field */}
        <div className="relative">
          <input
            className="w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Confirm Password */}
        <input
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          required
        />

        {/* Error message */}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold rounded-md py-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition"
        >
          {loading ? 'Loading...' : <><UserPlus /> Create Account</>}
        </button>
      </form>

      <div className="text-center mt-5">
        <button onClick={onToggleForm} className="text-blue-600 hover:underline text-sm">
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

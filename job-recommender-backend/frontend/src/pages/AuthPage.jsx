import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Toast from '../components/common/Toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TagInput from '../components/common/TagInput';

const AuthPage = ({ role, onNavigate }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    name: '',
    degree: '',
    skills: [],
    companyName: '',
    companyDetails: '',
  });

  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      setToast({ message: 'Please fill all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const result = await api.login(loginData);
      if (result.token) {
        login(result.token, { username: loginData.username, role });
        setToast({ message: 'Login successful!', type: 'success' });
        setTimeout(() => {
          onNavigate(role === 'jobseeker' ? 'jobseeker-dashboard' : 'employer-dashboard');
        }, 1000);
      } else {
        setToast({ message: result.msg || 'Login failed', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Login failed. Please try again.', type: 'error' });
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    // Validation
    if (!registerData.username || !registerData.password || !registerData.name) {
      setToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    // Additional validation for job seeker
    if (role === 'jobseeker') {
      if (!registerData.degree || registerData.skills.length === 0) {
        setToast({ message: 'Please provide education and at least one skill', type: 'error' });
        return;
      }
    }

    // Additional validation for employer
    if (role === 'jobposter') {
      if (!registerData.companyName) {
        setToast({ message: 'Please provide company name', type: 'error' });
        return;
      }
    }

    setLoading(true);
    try {
      const data = {
        username: registerData.username,
        password: registerData.password,
        role: role,
        name: registerData.name,
      };

      // Add role-specific fields
      if (role === 'jobseeker') {
        data.degree = registerData.degree;
        data.skills = registerData.skills; // Send as array of strings
      } else if (role === 'jobposter') {
        data.companyName = registerData.companyName;
        data.companyDetails = registerData.companyDetails;
      }

      console.log('Registration data being sent:', data); // Debug log

      const result = await api.register(data);
      
      if (result.msg === 'User registered successfully') {
        setToast({ message: 'Registration successful! Please login.', type: 'success' });
        // Reset form
        setRegisterData({
          username: '',
          password: '',
          name: '',
          degree: '',
          skills: [],
          companyName: '',
          companyDetails: '',
        });
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        setToast({ message: result.msg || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setToast({ message: 'Registration failed. Please try again.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onNavigate('home')}
          className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-600 mb-6">
          {role === 'jobseeker' ? 'Job Seeker' : 'Employer'} {isLogin ? 'Login' : 'Registration'}
        </p>

        {isLogin ? (
          <div>
            <Input
              label="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <Button onClick={handleLogin} className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        ) : (
          <div>
            <Input
              label="Username"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <Input
              label="Full Name"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              required
            />

            {role === 'jobseeker' ? (
              <>
                <Input
                  label="Education Qualification"
                  value={registerData.degree}
                  onChange={(e) => setRegisterData({ ...registerData, degree: e.target.value })}
                  placeholder="e.g., B.Tech in Computer Science"
                  required
                />
                <TagInput
                  label="Skills"
                  tags={registerData.skills}
                  setTags={(skills) => setRegisterData({ ...registerData, skills })}
                  placeholder="Type a skill and press Enter"
                />
                <p className="text-sm text-gray-500 -mt-2 mb-4">
                  Add skills like: Python, Java, JavaScript, React, etc.
                </p>
              </>
            ) : (
              <>
                <Input
                  label="Company Name"
                  value={registerData.companyName}
                  onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                  placeholder="e.g., Tech Corp"
                  required
                />
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Company Details
                  </label>
                  <textarea
                    value={registerData.companyDetails}
                    onChange={(e) => setRegisterData({ ...registerData, companyDetails: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                    rows="3"
                    placeholder="Briefly describe your company..."
                  />
                </div>
              </>
            )}

            <Button onClick={handleRegister} className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        )}

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
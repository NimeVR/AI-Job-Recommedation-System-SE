import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/NavBar';
import JobCard from '../components/jobs/JobCard';
import { Briefcase, AlertCircle } from 'lucide-react';

const JobSeekerDashboard = ({ onNavigate }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('recommended');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [recommendedCount, setRecommendedCount] = useState(0);
  const [allJobsCount, setAllJobsCount] = useState(0);
  const [error, setError] = useState(null);
  const [mlApiStatus, setMlApiStatus] = useState('checking'); // 'checking', 'online', 'offline'

  // Check ML API status on mount
  useEffect(() => {
    checkMLApiStatus();
  }, []);

  // Fetch user skills and all jobs count on component mount
  useEffect(() => {
    fetchUserSkills();
    fetchAllJobsCount();
  }, []);

  // Fetch jobs when tab changes
  useEffect(() => {
    if (activeTab === 'recommended' && userSkills.length > 0) {
      fetchRecommendedJobsFromML();
    } else if (activeTab === 'all') {
      fetchAllJobs();
    }
  }, [activeTab, userSkills]);

  const checkMLApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setMlApiStatus('online');
        console.log('✅ ML API is online');
      } else {
        setMlApiStatus('offline');
        console.log('❌ ML API is offline');
      }
    } catch (error) {
      setMlApiStatus('offline');
      console.log('❌ ML API is not reachable:', error);
    }
  };

  const fetchUserSkills = async () => {
    try {
      // Fetch user profile to get skills
      const response = await fetch(`http://localhost:5000/api/auth/profile/${user.username}`);
      const data = await response.json();
      
      console.log('User profile data:', data);
      
      if (data.skills && Array.isArray(data.skills)) {
        // Extract skill names from the populated skills
        const skillNames = data.skills.map(skill => 
          typeof skill === 'string' ? skill : skill.name
        );
        console.log('User skills:', skillNames);
        setUserSkills(skillNames);
      } else {
        console.log('No skills found for user');
        setUserSkills([]);
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
      setUserSkills([]);
      setError('Failed to load user profile');
    }
  };

  const fetchAllJobsCount = async () => {
    try {
      const data = await api.getAllJobs();
      if (Array.isArray(data)) {
        setAllJobsCount(data.length);
        console.log(`Total jobs available: ${data.length}`);
      }
    } catch (error) {
      console.error('Error fetching all jobs count:', error);
      setAllJobsCount(0);
    }
  };

  const fetchRecommendedJobsFromML = async () => {
    setLoading(true);
    setError(null);
    
    if (userSkills.length === 0) {
      setJobs([]);
      setRecommendedCount(0);
      setError('Add skills to your profile to get job recommendations');
      setLoading(false);
      return;
    }

    try {
      console.log('Requesting ML recommendations for skills:', userSkills);
      
      // Call Python ML API for recommendations
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: userSkills
        }),
      });

      if (!response.ok) {
        throw new Error(`ML API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log('ML API Response:', data);
      
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setJobs(data.recommendations);
        setRecommendedCount(data.recommendations.length);
        setMlApiStatus('online');
        console.log(`✅ Got ${data.recommendations.length} recommendations from ML API`);
      } else {
        setJobs([]);
        setRecommendedCount(0);
        console.log('⚠️ No recommendations returned from ML API');
      }
    } catch (error) {
      console.error('❌ Error fetching ML recommendations:', error);
      setMlApiStatus('offline');
      setError('ML recommendation service is unavailable. Showing Node.js recommendations instead.');
      // Fallback to Node.js recommendations
      await fetchRecommendedJobsFromNode();
    }
    setLoading(false);
  };

  const fetchRecommendedJobsFromNode = async () => {
    try {
      console.log('Fetching recommendations from Node.js API...');
      const data = await api.getRecommendedJobs(user.username);
      const jobsArray = Array.isArray(data) ? data : [];
      setJobs(jobsArray);
      setRecommendedCount(jobsArray.length);
      console.log(`✅ Got ${jobsArray.length} recommendations from Node.js API`);
    } catch (error) {
      console.error('Error fetching Node recommendations:', error);
      setJobs([]);
      setRecommendedCount(0);
      setError('Failed to load recommendations');
    }
  };

  const fetchAllJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllJobs();
      const jobsArray = Array.isArray(data) ? data : [];
      setJobs(jobsArray);
      setAllJobsCount(jobsArray.length);
      console.log(`✅ Loaded ${jobsArray.length} total jobs`);
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      setJobs([]);
      setAllJobsCount(0);
      setError('Failed to load jobs');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Job Opportunities</h2>
          
          {/* ML API Status Indicator */}
          {mlApiStatus === 'offline' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-600" />
              <span className="text-sm text-yellow-800">
                ML recommendation service is offline. Using basic recommendations.
              </span>
            </div>
          )}
          
          {userSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-600 font-medium">Your Skills:</span>
              {userSkills.map((skill, idx) => (
                <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-600" />
              <span className="text-sm text-blue-800">
                Add skills to your profile to get personalized job recommendations
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'recommended'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            <span className="text-lg">🤖</span>
            <span>AI Recommended Jobs</span>
            <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${
              activeTab === 'recommended' 
                ? 'bg-white text-indigo-600' 
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              {recommendedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            <Briefcase size={20} />
            <span>All Jobs</span>
            <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${
              activeTab === 'all' 
                ? 'bg-white text-indigo-600' 
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              {allJobsCount}
            </span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">AI Recommended</p>
                <h3 className="text-4xl font-bold mt-1">{recommendedCount}</h3>
                <p className="text-indigo-100 text-sm mt-1">
                  {mlApiStatus === 'online' ? 'Jobs matching your skills' : 'Basic recommendations'}
                </p>
              </div>
              <div className="text-6xl opacity-20">🎯</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Available</p>
                <h3 className="text-4xl font-bold mt-1">{allJobsCount}</h3>
                <p className="text-blue-100 text-sm mt-1">All job opportunities</p>
              </div>
              <div className="text-6xl opacity-20">💼</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Found</h3>
            <p className="text-gray-500">
              {activeTab === 'recommended' 
                ? userSkills.length === 0
                  ? 'Add skills to your profile to get personalized recommendations.'
                  : 'No jobs match your current skills. Try adding more skills or check all available jobs.'
                : 'No jobs have been posted yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-700">
                {activeTab === 'recommended' 
                  ? `${jobs.length} Recommended Jobs for You` 
                  : `${jobs.length} Available Jobs`}
              </h3>
              {activeTab === 'recommended' && jobs.length > 0 && (
                <div className="text-sm text-gray-500">
                  {mlApiStatus === 'online' ? 'Sorted by AI relevance' : 'Sorted by skill match'}
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, idx) => (
                <JobCard 
                  key={job.job_id || job._id || idx} 
                  job={job} 
                  showSimilarity={activeTab === 'recommended'} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
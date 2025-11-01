// frontend/src/pages/JobSeekerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/NavBar';
import JobCard from '../components/jobs/JobCard';
import JobDetailsModal from '../components/jobs/JobDetailsModal';
import MyApplications from '../components/jobs/MyApplications';
import { Briefcase, AlertCircle, FileText, Search } from 'lucide-react';

const JobSeekerDashboard = ({ onNavigate }) => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('recommended');
  const [activeView, setActiveView] = useState('jobs'); // 'jobs' or 'applications'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [recommendedCount, setRecommendedCount] = useState(0);
  const [allJobsCount, setAllJobsCount] = useState(0);
  const [error, setError] = useState(null);
  const [mlApiStatus, setMlApiStatus] = useState('checking');
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    checkMLApiStatus();
  }, []);

  useEffect(() => {
    fetchUserSkills();
    fetchAllJobsCount();
  }, []);

  useEffect(() => {
    if (activeView === 'jobs') {
      if (activeTab === 'recommended' && userSkills.length > 0) {
        fetchRecommendedJobsFromML();
      } else if (activeTab === 'all') {
        fetchAllJobs();
      }
    }
  }, [activeTab, userSkills, activeView]);

  const checkMLApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setMlApiStatus('online');
      } else {
        setMlApiStatus('offline');
      }
    } catch (error) {
      setMlApiStatus('offline');
    }
  };

  const fetchUserSkills = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/profile/${user.username}`);
      const data = await response.json();
      
      if (data.skills && Array.isArray(data.skills)) {
        const skillNames = data.skills.map(skill => 
          typeof skill === 'string' ? skill : skill.name
        );
        setUserSkills(skillNames);
      } else {
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
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: userSkills }),
      });

      if (!response.ok) {
        throw new Error(`ML API returned status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setJobs(data.recommendations);
        setRecommendedCount(data.recommendations.length);
        setMlApiStatus('online');
      } else {
        setJobs([]);
        setRecommendedCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching ML recommendations:', error);
      setMlApiStatus('offline');
      setError('ML recommendation service is unavailable. Showing Node.js recommendations instead.');
      await fetchRecommendedJobsFromNode();
    }
    setLoading(false);
  };

  const fetchRecommendedJobsFromNode = async () => {
    try {
      const data = await api.getRecommendedJobs(user.username);
      const jobsArray = Array.isArray(data) ? data : [];
      setJobs(jobsArray);
      setRecommendedCount(jobsArray.length);
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

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const handleApplicationSubmitted = () => {
    // Refresh the current view
    if (activeTab === 'recommended') {
      fetchRecommendedJobsFromML();
    } else {
      fetchAllJobs();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={handleCloseModal}
          onApply={handleApplicationSubmitted}
        />
      )}
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Main Navigation */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveView('jobs')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeView === 'jobs'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            <Search size={20} />
            <span>Search Jobs</span>
          </button>
          <button
            onClick={() => setActiveView('applications')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeView === 'applications'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            <FileText size={20} />
            <span>My Applications</span>
          </button>
        </div>

        {/* Applications View */}
        {activeView === 'applications' ? (
          <MyApplications />
        ) : (
          <>
            {/* Job Search View */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Job Opportunities</h2>
              
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
                      showActions={true}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/layout/NavBar';
import Toast from '../components/common/Toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TagInput from '../components/common/TagInput';
import JobCard from '../components/jobs/JobCard';
import { Briefcase, Plus, Eye } from 'lucide-react';

const EmployerDashboard = ({ onNavigate }) => {
  const { logout, token } = useAuth();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [jobData, setJobData] = useState({
    companyName: '',
    jobDescription: '',
    Category: '',
    skillsRequired: [],
    Type: 'Full-time',
    Workplace: 'On-site',
    Location: '',
    Department: '',
  });

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await api.getAllJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
    setLoadingJobs(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const handleSubmit = async () => {
    // Validation
    if (!jobData.companyName || !jobData.Category || !jobData.jobDescription) {
      setToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    if (jobData.skillsRequired.length === 0) {
      setToast({ message: 'Please add at least one skill', type: 'error' });
      return;
    }

    if (!jobData.Location || !jobData.Department) {
      setToast({ message: 'Please fill Location and Department', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const result = await api.createJob(jobData, token);
      if (result._id || result.companyName) {
        setToast({ message: 'Job posted successfully!', type: 'success' });
        
        // Reset form
        setJobData({
          companyName: '',
          jobDescription: '',
          Category: '',
          skillsRequired: [],
          Type: 'Full-time',
          Workplace: 'On-site',
          Location: '',
          Department: '',
        });

        // Show success modal with view jobs button
        setShowSuccessModal(true);
        
        // Refresh jobs list
        await fetchAllJobs();
        
        // Auto-redirect after 3 seconds if user doesn't click
        setTimeout(() => {
          setShowSuccessModal(false);
          setView('list');
        }, 3000);
      } else {
        setToast({ message: 'Failed to post job', type: 'error' });
      }
    } catch (error) {
      console.error('Job creation error:', error);
      setToast({ message: 'Error posting job', type: 'error' });
    }
    setLoading(false);
  };

  const handleViewJobs = () => {
    setShowSuccessModal(false);
    setView('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Job Posted Successfully!</h3>
            <p className="text-gray-600 mb-6">Your job posting is now live and visible to job seekers.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Create Another
              </button>
              <button
                onClick={handleViewJobs}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={20} />
                View All Jobs
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Toggle Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('list')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              view === 'list'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Briefcase size={20} />
            My Job Posts ({jobs.length})
          </button>
          <button
            onClick={() => setView('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              view === 'create'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plus size={20} />
            Create New Job
          </button>
        </div>

        {/* Create Job View */}
        {view === 'create' && (
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Job Post</h2>
            
            <div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={jobData.companyName}
                  onChange={(e) => setJobData({ ...jobData, companyName: e.target.value })}
                  required
                />
                <Input
                  label="Job Position"
                  value={jobData.Category}
                  onChange={(e) => setJobData({ ...jobData, Category: e.target.value })}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Job Description *</label>
                <textarea
                  value={jobData.jobDescription}
                  onChange={(e) => setJobData({ ...jobData, jobDescription: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  rows="4"
                  placeholder="Describe the job role, responsibilities, and requirements..."
                />
              </div>

              <TagInput
                label="Skills Required *"
                tags={jobData.skillsRequired}
                setTags={(skills) => setJobData({ ...jobData, skillsRequired: skills })}
                placeholder="Type a skill and press Enter (e.g., Python, React, SQL)"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Job Type *</label>
                  <select
                    value={jobData.Type}
                    onChange={(e) => setJobData({ ...jobData, Type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Workplace *</label>
                  <select
                    value={jobData.Workplace}
                    onChange={(e) => setJobData({ ...jobData, Workplace: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={jobData.Location}
                  onChange={(e) => setJobData({ ...jobData, Location: e.target.value })}
                  placeholder="e.g., New York, NY"
                  required
                />
                <Input
                  label="Department"
                  value={jobData.Department}
                  onChange={(e) => setJobData({ ...jobData, Department: e.target.value })}
                  placeholder="e.g., Engineering"
                  required
                />
              </div>

              <Button onClick={handleSubmit} className="w-full mt-6" disabled={loading}>
                {loading ? 'Creating Job Post...' : 'Create Job Post'}
              </Button>
            </div>
          </div>
        )}

        {/* List Jobs View */}
        {view === 'list' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Job Posts</h2>
            
            {loadingJobs ? (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Posted Yet</h3>
                <p className="text-gray-500 mb-6">Create your first job post to find talented candidates.</p>
                <Button onClick={() => setView('create')}>
                  Create Your First Job
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, idx) => (
                  <JobCard key={job._id || idx} job={job} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
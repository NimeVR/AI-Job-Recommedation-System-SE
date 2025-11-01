// frontend/src/components/jobs/JobDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Clock, Tag, Briefcase, Users, Send, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobDetailsModal = ({ job, onClose, onApply }) => {
  const { user } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applying, setApplying] = useState(false);

  const jobTitle = job.title || job.Category;
  const jobSkills = job.skills || job.skillsRequired || [];
  const jobId = job.job_id || job._id;

  useEffect(() => {
    if (user && jobId) {
      checkApplicationStatus();
    }
  }, [jobId, user]);

  const checkApplicationStatus = async () => {
    try {
      const result = await api.checkApplication(user.username, jobId);
      setHasApplied(result.hasApplied);
      setApplicationStatus(result.status);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleQuickApply = async () => {
    if (applying || hasApplied) return;

    setApplying(true);
    try {
      const jobType = job.isEmployerCreated !== undefined || job.createdAt ? 'CreatedJob' : 'Job';
      const result = await api.applyForJob(user.username, jobId, jobType);
      
      if (result.alreadyApplied) {
        setHasApplied(true);
        alert('You have already applied for this job!');
      } else {
        setHasApplied(true);
        setApplicationStatus('Applied');
        alert('Application submitted successfully!');
        if (onApply) onApply();
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application. Please try again.');
    }
    setApplying(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">{jobTitle}</h2>
              <div className="flex items-center gap-2 text-indigo-100">
                <Building2 size={18} />
                <span className="text-lg">{job.companyName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Job Info Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="text-indigo-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-semibold text-gray-800">{job.Location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Job Type</p>
                <p className="font-semibold text-gray-800">{job.Type}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Workplace</p>
                <p className="font-semibold text-gray-800">{job.Workplace}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-semibold text-gray-800">{job.Department || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />
              Job Description
            </h3>
            <p className="text-gray-700 leading-relaxed">{job.jobDescription}</p>
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={20} className="text-purple-600" />
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {jobSkills.map((skill, idx) => {
                const skillName = typeof skill === 'string' ? skill : skill.name;
                return (
                  <span
                    key={idx}
                    className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skillName}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Application Status or Apply Button */}
          <div className="border-t pt-6">
            {hasApplied ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle size={32} className="text-green-600" />
                <div>
                  <p className="font-bold text-green-800 text-lg">Already Applied</p>
                  <p className="text-green-600 text-sm">
                    Status: <span className="font-semibold">{applicationStatus}</span>
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleQuickApply}
                disabled={applying}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <Send size={24} />
                {applying ? 'Submitting Application...' : 'Quick Apply Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
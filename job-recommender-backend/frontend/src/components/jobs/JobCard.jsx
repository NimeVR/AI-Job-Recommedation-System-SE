// frontend/src/components/jobs/JobCard.jsx
import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Clock, Tag, TrendingUp, Eye, Send, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobCard = ({ job, showSimilarity = false, onViewDetails, showActions = false }) => {
  const { user } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applying, setApplying] = useState(false);

  // Handle both ML API format and Node API format
  const jobTitle = job.title || job.Category;
  const jobSkills = job.skills || job.skillsRequired || [];
  const similarity = job.similarity;
  const jobId = job.job_id || job._id;

  useEffect(() => {
    if (showActions && user && jobId) {
      checkApplicationStatus();
    }
  }, [jobId, user, showActions]);

  const checkApplicationStatus = async () => {
    try {
      const result = await api.checkApplication(user.username, jobId);
      setHasApplied(result.hasApplied);
      setApplicationStatus(result.status);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleQuickApply = async (e) => {
    e.stopPropagation();
    if (applying || hasApplied) return;

    setApplying(true);
    try {
      // Determine job type based on collection
      const jobType = job.isEmployerCreated !== undefined || job.createdAt ? 'CreatedJob' : 'Job';
      
      const result = await api.applyForJob(user.username, jobId, jobType);
      
      if (result.alreadyApplied) {
        setHasApplied(true);
        alert('You have already applied for this job!');
      } else {
        setHasApplied(true);
        setApplicationStatus('Applied');
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application. Please try again.');
    }
    setApplying(false);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(job);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 relative">
      {showSimilarity && similarity && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <TrendingUp size={14} />
          {(similarity * 100).toFixed(0)}% Match
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-800 mb-2 pr-20">{jobTitle}</h3>
      
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <Building2 size={16} />
        <span className="font-medium">{job.companyName}</span>
      </div>
      
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <MapPin size={16} />
        <span>{job.Location}</span>
      </div>
      
      <div className="flex items-center gap-2 text-gray-600 mb-3 flex-wrap">
        <Clock size={16} />
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
          {job.Type}
        </span>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
          {job.Workplace}
        </span>
        {job.Department && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            {job.Department}
          </span>
        )}
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-2">{job.jobDescription}</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {jobSkills.map((skill, idx) => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          return (
            <span key={idx} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Tag size={12} />
              {skillName}
            </span>
          );
        })}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            View Details
          </button>
          
          {hasApplied ? (
            <button
              disabled
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              {applicationStatus === 'Applied' ? 'Applied' : applicationStatus}
            </button>
          ) : (
            <button
              onClick={handleQuickApply}
              disabled={applying}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {applying ? 'Applying...' : 'Quick Apply'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobCard;
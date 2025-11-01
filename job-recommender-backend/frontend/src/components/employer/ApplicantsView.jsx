// frontend/src/components/employer/ApplicantsView.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Mail, GraduationCap, Tag, Eye, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const ApplicantCard = ({ application, onStatusUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const user = application.userId;
  const job = application.job;
  const userSkills = user?.skills || [];

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await api.updateApplicationStatus(application._id, newStatus);
      alert(`Status updated to ${newStatus}`);
      onStatusUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
    setUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Viewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{user?.name || 'Unknown'}</h3>
            <p className="text-gray-600 flex items-center gap-2">
              <Mail size={14} />
              {user?.username || 'N/A'}
            </p>
            {user?.degree && (
              <p className="text-gray-600 flex items-center gap-2">
                <GraduationCap size={14} />
                {user.degree}
              </p>
            )}
          </div>
        </div>
        <div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>
      </div>

      {/* Job Applied For */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-1">Applied for:</p>
        <p className="font-bold text-gray-800">{job?.Category || 'Unknown Position'}</p>
        <p className="text-sm text-gray-600">{job?.companyName}</p>
        <p className="text-xs text-gray-500 mt-2">
          Applied on {new Date(application.appliedAt).toLocaleDateString()} at{' '}
          {new Date(application.appliedAt).toLocaleTimeString()}
        </p>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Tag size={16} />
          Skills ({userSkills.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {userSkills.slice(0, expanded ? userSkills.length : 5).map((skill, idx) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            return (
              <span key={idx} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm">
                {skillName}
              </span>
            );
          })}
        </div>
        {userSkills.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-indigo-600 text-sm mt-2 flex items-center gap-1 hover:underline"
          >
            {expanded ? (
              <>Show less <ChevronUp size={16} /></>
            ) : (
              <>Show {userSkills.length - 5} more <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {application.status !== 'Viewed' && (
          <button
            onClick={() => handleStatusUpdate('Viewed')}
            disabled={updating || application.status === 'Accepted' || application.status === 'Rejected'}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            Mark as Viewed
          </button>
        )}
        
        {application.status !== 'Accepted' && (
          <button
            onClick={() => handleStatusUpdate('Accepted')}
            disabled={updating || application.status === 'Rejected'}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Accept
          </button>
        )}
        
        {application.status !== 'Rejected' && (
          <button
            onClick={() => handleStatusUpdate('Rejected')}
            disabled={updating || application.status === 'Accepted'}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <XCircle size={18} />
            Reject
          </button>
        )}
      </div>

      {updating && (
        <div className="mt-2 text-center text-sm text-gray-600">
          Updating status...
        </div>
      )}
    </div>
  );
};

const ApplicantsView = ({ jobId, jobTitle }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getJobApplications(jobId);
      setApplications(Array.isArray(data) ? data : []);
      console.log(`✅ Loaded ${data.length} applications for job ${jobId}`);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
    setLoading(false);
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    viewed: applications.filter(a => a.status === 'Viewed').length,
    accepted: applications.filter(a => a.status === 'Accepted').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Applicants for: {jobTitle}</h2>
        <p className="text-gray-600">{applications.length} total applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">New</p>
          <p className="text-3xl font-bold">{stats.applied}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">Reviewed</p>
          <p className="text-3xl font-bold">{stats.viewed}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">Accepted</p>
          <p className="text-3xl font-bold">{stats.accepted}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">Rejected</p>
          <p className="text-3xl font-bold">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'Applied', 'Viewed', 'Accepted', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === status
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading applicants...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applicants Found</h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'No one has applied for this job yet.'
              : `No applications with status "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map(app => (
            <ApplicantCard
              key={app._id}
              application={app}
              onStatusUpdate={fetchApplications}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantsView;
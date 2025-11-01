// frontend/src/components/jobs/MyApplications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Eye, FileText, Clock, TrendingUp, Frown } from 'lucide-react';

const ApplicationStatusBar = ({ status }) => {
  const stages = ['Applied', 'Viewed', status === 'Rejected' ? 'Rejected' : 'Accepted'];
  const currentIndex = stages.indexOf(status);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className={`h-full transition-all duration-500 ${
              status === 'Rejected' ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>

        {/* Stage Markers */}
        {stages.map((stage, index) => {
          const isActive = index <= currentIndex;
          const isRejected = stage === 'Rejected' && status === 'Rejected';
          const isCompleted = index < currentIndex;

          return (
            <div key={stage} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                  isRejected
                    ? 'bg-red-500 border-red-200'
                    : isActive
                    ? 'bg-green-500 border-green-200'
                    : 'bg-gray-200 border-gray-100'
                } transition-all duration-300`}
              >
                {isCompleted ? (
                  <CheckCircle className="text-white" size={20} />
                ) : isRejected ? (
                  <XCircle className="text-white" size={20} />
                ) : isActive ? (
                  <Clock className="text-white" size={20} />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                )}
              </div>
              <p
                className={`mt-2 text-sm font-semibold ${
                  isRejected ? 'text-red-600' : isActive ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {stage}
              </p>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      {status === 'Rejected' && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <Frown className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">Don't give up!</p>
            <p className="text-sm text-red-600">Every rejection brings you closer to the right opportunity. Keep applying!</p>
          </div>
        </div>
      )}

      {status === 'Accepted' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <TrendingUp className="text-green-500" size={24} />
          <div>
            <p className="font-semibold text-green-800">Congratulations! 🎉</p>
            <p className="text-sm text-green-600">Your application has been accepted. The employer will contact you soon.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ApplicationCard = ({ application }) => {
  const job = application.job;
  const jobTitle = job?.title || job?.Category;
  const jobSkills = job?.skills || job?.skillsRequired || [];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{jobTitle}</h3>
          <p className="text-gray-600 flex items-center gap-2">
            <FileText size={16} />
            {job?.companyName}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-bold ${
            application.status === 'Accepted'
              ? 'bg-green-100 text-green-700'
              : application.status === 'Rejected'
              ? 'bg-red-100 text-red-700'
              : application.status === 'Viewed'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {application.status}
        </span>
      </div>

      <ApplicationStatusBar status={application.status} />

      <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
        <p><span className="font-semibold">Location:</span> {job?.Location}</p>
        <p><span className="font-semibold">Type:</span> {job?.Type}</p>
        <p><span className="font-semibold">Workplace:</span> {job?.Workplace}</p>
        <p><span className="font-semibold">Applied:</span> {new Date(application.appliedAt).toLocaleDateString()}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {jobSkills.slice(0, 5).map((skill, idx) => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          return (
            <span key={idx} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm">
              {skillName}
            </span>
          );
        })}
        {jobSkills.length > 5 && (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            +{jobSkills.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getUserApplications(user.username);
      setApplications(Array.isArray(data) ? data : []);
      console.log(`✅ Loaded ${data.length} applications`);
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Applications</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">Applied</p>
          <p className="text-3xl font-bold">{stats.applied}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-xl p-4">
          <p className="text-sm opacity-90">Viewed</p>
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

      {/* Filter Buttons */}
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

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Found</h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? "You haven't applied to any jobs yet. Start exploring opportunities!"
              : `No applications with status "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map(app => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
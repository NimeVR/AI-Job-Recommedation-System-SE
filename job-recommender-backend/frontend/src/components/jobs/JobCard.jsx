import React from 'react';
import { Building2, MapPin, Clock, Tag, TrendingUp } from 'lucide-react';

const JobCard = ({ job, showSimilarity = false }) => {
  // Handle both ML API format and Node API format
  const jobTitle = job.title || job.Category;
  const jobSkills = job.skills || job.skillsRequired || [];
  const similarity = job.similarity;

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
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-2">{job.jobDescription}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
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
    </div>
  );
};

export default JobCard;
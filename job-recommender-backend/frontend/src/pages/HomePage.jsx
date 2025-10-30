import React from 'react';
import { User, Building2 } from 'lucide-react';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
          JobMatch
        </h1>
        <p className="text-xl text-purple-200 mb-12">Find Your Perfect Career Match</p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button
            onClick={() => onNavigate('jobseeker-auth')}
            className="group bg-white hover:bg-indigo-50 text-indigo-900 px-8 py-6 rounded-2xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <User size={48} className="mx-auto mb-3 text-indigo-600" />
            <h2 className="text-2xl font-bold mb-2">I'm a Job Seeker</h2>
            <p className="text-gray-600">Find opportunities that match your skills</p>
          </button>
          <button
            onClick={() => onNavigate('employer-auth')}
            className="group bg-white hover:bg-purple-50 text-purple-900 px-8 py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <Building2 size={48} className="mx-auto mb-3 text-purple-600" />
            <h2 className="text-2xl font-bold mb-2">I'm an Employer</h2>
            <p className="text-gray-600">Post jobs and find talented candidates</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
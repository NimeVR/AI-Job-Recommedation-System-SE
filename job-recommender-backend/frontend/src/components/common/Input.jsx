import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, required }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
      />
    </div>
  );
};

export default Input;
import React, { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ label, tags, setTags, placeholder }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            {tag}
            <X size={14} className="cursor-pointer" onClick={() => removeTag(tag)} />
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
      />
      <p className="text-sm text-gray-500 mt-1">Press Enter to add</p>
    </div>
  );
};

export default TagInput;
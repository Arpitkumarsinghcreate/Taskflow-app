import React from 'react';

const FormField = ({ label, error, children }) => {
  return (
    <div className="mb-4">
      <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">
        {label}
      </label>
      
      {React.cloneElement(children, {
        className: `w-full px-3 py-2.5 bg-[#111] border rounded-md text-sm 
          text-[#e8e8e8] placeholder-[#333] outline-none transition-colors 
          ${error 
            ? 'border-[#3a1515] focus:border-[#cc4444] focus:ring-1 focus:ring-[#cc4444]' 
            : 'border-[#1e1e1e] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]' 
          } ${children.props.className || ''}`
      })}

      {error && (
        <p className="text-[11px] text-[#cc4444] mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default FormField;

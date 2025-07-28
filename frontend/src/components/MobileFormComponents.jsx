import React, { useState } from 'react';

const MobileFormField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  required = false,
  options = [],
  multiline = false,
  autoComplete,
  error,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputClasses = `
    w-full px-4 py-4 text-base border-2 rounded-xl transition-all duration-200
    ${error 
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
      : isFocused 
        ? 'border-blue-500 bg-blue-50 focus:border-blue-500 focus:ring-blue-500' 
        : 'border-gray-200 bg-gray-50 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
    focus:outline-none focus:ring-2 focus:ring-opacity-50
  `;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={inputClasses}
          autoComplete={autoComplete}
          {...props}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      );
    }

    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`${inputClasses} resize-none`}
          rows={4}
          autoComplete={autoComplete}
          {...props}
        />
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={inputClasses}
        autoComplete={autoComplete}
        {...props}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const MobileFormButton = ({ 
  children, 
  type = "button", 
  variant = "primary", 
  size = "large",
  disabled = false, 
  loading = false,
  className = "",
  ...props 
}) => {
  const baseClasses = "w-full font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed flex items-center justify-center space-x-2";
  
  const sizeClasses = {
    large: "px-6 py-4 text-base",
    medium: "px-4 py-3 text-sm",
    small: "px-3 py-2 text-sm"
  };

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500 disabled:bg-gray-50 border border-gray-300",
    outline: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:border-gray-300 disabled:text-gray-300"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
};

const MobileFormContainer = ({ children, onSubmit, className = "" }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
};

export { MobileFormField, MobileFormButton, MobileFormContainer };

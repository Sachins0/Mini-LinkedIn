import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { VALIDATION_RULES } from '../utils/constants';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Validate individual fields
  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.length < 2) {
          errors.name = 'Name must be at least 2 characters long';
        } else if (value.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
          errors.name = `Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`;
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.name = 'Name can only contain letters and spaces (no numbers or special characters)';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          errors.email = 'Please enter a valid email address (e.g., user@example.com)';
        }
        break;

      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
          errors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`;
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain at least one number';
        }
        break;

      case 'bio':
        if (value && value.length > VALIDATION_RULES.BIO_MAX_LENGTH) {
          errors.bio = `Bio cannot exceed ${VALIDATION_RULES.BIO_MAX_LENGTH} characters`;
        }
        break;

      default:
        break;
    }

    return errors;
  };

  // Validate all fields
  const validateForm = () => {
    let allErrors = {};

    Object.keys(formData).forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      allErrors = { ...allErrors, ...fieldErrors };
    });

    setValidationErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors below');
      return;
    }
    
    const result = await register(formData);
    
    if (result.success) {
      toast.success('Registration successful! Welcome to Mini LinkedIn!');
      navigate('/');
    } else {
      // Handle server-side validation errors
      if (result.message.includes('validation') || result.message.includes('Validation')) {
        toast.error('Please check your input and try again');
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    const fieldErrors = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      ...fieldErrors,
      // Remove error if field is now valid
      ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
    }));
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = "input-field";
    if (validationErrors[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    if (formData[fieldName] && !validationErrors[fieldName]) {
      return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500`;
    }
    return baseClass;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Mini LinkedIn and connect with professionals
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={getFieldClassName('name')}
                placeholder="Enter your full name"
                maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.name}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {formData.name.length}/{VALIDATION_RULES.NAME_MAX_LENGTH} characters
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={getFieldClassName('email')}
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={getFieldClassName('password')}
                placeholder="Enter your password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.password}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Password requirements: At least 6 characters, 1 uppercase, 1 lowercase, 1 number
              </div>
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio (optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className={getFieldClassName('bio')}
                placeholder="Tell us about yourself"
                maxLength={VALIDATION_RULES.BIO_MAX_LENGTH}
              />
              {validationErrors.bio && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.bio}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {formData.bio.length}/{VALIDATION_RULES.BIO_MAX_LENGTH} characters
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).some(key => validationErrors[key])}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

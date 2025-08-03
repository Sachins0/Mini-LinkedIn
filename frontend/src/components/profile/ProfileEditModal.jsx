import React, { useState } from 'react';
import { updateProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { VALIDATION_RULES } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProfileEditModal = ({ user, onClose, onUpdate }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    profilePicture: user.profilePicture || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (formData.name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
      toast.error(`Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`);
      return;
    }

    if (formData.bio.length > VALIDATION_RULES.BIO_MAX_LENGTH) {
      toast.error(`Bio cannot exceed ${VALIDATION_RULES.BIO_MAX_LENGTH} characters`);
      return;
    }

    setLoading(true);

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        const updatedUser = result.data.data.user;
        onUpdate(updatedUser);
        updateUser(updatedUser);
        toast.success('Profile updated successfully!');
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Profile Picture URL */}
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture URL
            </label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="url"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="Enter image URL"
              className="input-field"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="input-field"
              maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.name.length}/{VALIDATION_RULES.NAME_MAX_LENGTH}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="input-field resize-none"
              maxLength={VALIDATION_RULES.BIO_MAX_LENGTH}
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.bio.length}/{VALIDATION_RULES.BIO_MAX_LENGTH}
            </div>
          </div>

          {/* Preview */}
          {(formData.name || formData.profilePicture) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="flex items-center space-x-3">
                <img
                  src={formData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=3b82f6&color=fff`}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=3b82f6&color=fff`;
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">{formData.name || 'Your Name'}</p>
                  {formData.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{formData.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

const ProfileSetup: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    profilePicture: '',
    bio: '',
    location: '',
    interests: []
  });

  const [currentInterest, setCurrentInterest] = useState('');

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfilePicturePreview(result);
        setProfile(prev => ({
          ...prev,
          profilePicture: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addInterest = () => {
    if (currentInterest.trim() && !profile.interests?.includes(currentInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...(prev.interests || []), currentInterest.trim()]
      }));
      setCurrentInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests?.filter(i => i !== interest) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.firstName || !profile.lastName || !profile.dateOfBirth) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await updateProfile(profile);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Create minimal profile
    const minimalProfile: UserProfile = {
      firstName: 'User',
      lastName: '',
      dateOfBirth: new Date().toISOString().split('T')[0],
    };
    
    setLoading(true);
    updateProfile(minimalProfile).then(() => {
      navigate('/dashboard', { replace: true });
    }).catch((err) => {
      setError('Failed to skip setup. Please try again.');
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-primary">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">
            Let's set up your profile to personalize your mood journal experience.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-brand-primary text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">Upload a profile picture</p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                id="firstName"
                value={profile.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary"
                placeholder=" "
                required
                disabled={loading}
              />
              <label 
                htmlFor="firstName" 
                className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
              >
                First Name *
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                id="lastName"
                value={profile.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary"
                placeholder=" "
                required
                disabled={loading}
              />
              <label 
                htmlFor="lastName" 
                className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
              >
                Last Name *
              </label>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <input
              type="date"
              id="dateOfBirth"
              value={profile.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary"
              required
              disabled={loading}
            />
            <label 
              htmlFor="dateOfBirth" 
              className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
            >
              Date of Birth *
            </label>
          </div>

          {/* Location */}
          <div className="relative">
            <input
              type="text"
              id="location"
              value={profile.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary"
              placeholder=" "
              disabled={loading}
            />
            <label 
              htmlFor="location" 
              className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
            >
              Location (Optional)
            </label>
          </div>

          {/* Bio */}
          <div className="relative">
            <textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="peer w-full p-4 pt-6 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-gray-300 focus:border-brand-primary resize-none"
              placeholder=" "
              disabled={loading}
            />
            <label 
              htmlFor="bio" 
              className="absolute text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 text-gray-500"
            >
              Bio (Optional)
            </label>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Interests (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                className="flex-1 p-3 border-2 rounded-md outline-none transition border-gray-300 focus:border-brand-primary"
                placeholder="Add an interest..."
                disabled={loading}
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-3 bg-brand-primary text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={loading}
              >
                Add
              </button>
            </div>
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-primary bg-opacity-10 text-brand-primary"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-brand-primary hover:text-red-500"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-center text-red-500">{error}</p>}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-300 disabled:bg-gray-100"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-brand-primary text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-300 disabled:bg-gray-400 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Profile...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Globe,
  Briefcase,
  Award,
  Star,
} from "lucide-react";
import authService from "../services/authServiceLocal";

const UserProfile = ({ user, userData, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    linkedIn: "",
    experience: "",
    specializations: [],
    availability: "available",
    hourlyRate: "",
    timezone: "",
    preferredContact: "email",
    notifications: {
      newTenders: true,
      proposalUpdates: true,
      marketing: false,
      weeklyDigest: true,
    },
  });

  const [tempData, setTempData] = useState({});

  useEffect(() => {
    if (user && userData) {
      setProfileData({
        displayName: userData.displayName || user.displayName || "",
        email: user.email || "",
        phone: userData.phone || "",
        location: userData.location || "",
        bio: userData.bio || "",
        website: userData.website || "",
        linkedIn: userData.linkedIn || "",
        experience: userData.experience || "",
        specializations: userData.specializations || [],
        availability: userData.availability || "available",
        hourlyRate: userData.hourlyRate || "",
        timezone:
          userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredContact: userData.preferredContact || "email",
        notifications: userData.notifications || {
          newTenders: true,
          proposalUpdates: true,
          marketing: false,
          weeklyDigest: true,
        },
      });
    }
  }, [user, userData]);

  const specializationOptions = [
    "AI/ML",
    "Cloud Computing",
    "Cybersecurity",
    "Data Analytics",
    "Web Development",
    "Mobile Development",
    "DevOps",
    "Project Management",
    "UI/UX Design",
    "Digital Marketing",
    "Blockchain",
    "IoT",
    "Software Architecture",
    "Quality Assurance",
    "Technical Writing",
  ];

  const handleEdit = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData({});
  };

  const handleSave = async () => {
    try {
      // Update profile data
      setProfileData(tempData);

      // Save to localStorage and Firebase
      await authService.updateUserProfile(user.uid, tempData);

      // Callback to parent component
      onUpdateProfile?.(tempData);

      setIsEditing(false);
      setTempData({});
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecializationToggle = (specialization) => {
    setTempData((prev) => ({
      ...prev,
      specializations: prev.specializations?.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...(prev.specializations || []), specialization],
    }));
  };

  const handleNotificationChange = (key, value) => {
    setTempData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const currentData = isEditing ? tempData : profileData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(currentData.displayName || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700">
                  <Camera className="h-3 w-3" />
                </button>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentData.displayName || "Your Name"}
              </h1>
              <p className="text-gray-600">{currentData.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    currentData.availability === "available"
                      ? "bg-green-100 text-green-800"
                      : currentData.availability === "busy"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-1 ${
                      currentData.availability === "available"
                        ? "bg-green-400"
                        : currentData.availability === "busy"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  {currentData.availability?.charAt(0).toUpperCase() +
                    currentData.availability?.slice(1) || "Available"}
                </span>
                {currentData.location && (
                  <span className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {currentData.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentData.displayName || ""}
                onChange={(e) =>
                  handleInputChange("displayName", e.target.value)
                }
              />
            ) : (
              <p className="text-gray-900">
                {currentData.displayName || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <p className="text-gray-900 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              {currentData.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            ) : (
              <p className="text-gray-900 flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                {currentData.phone || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
              />
            ) : (
              <p className="text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {currentData.location || "Not set"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={currentData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about yourself and your experience..."
            />
          ) : (
            <p className="text-gray-900">
              {currentData.bio || "No bio added yet"}
            </p>
          )}
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Professional Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            {isEditing ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentData.experience || ""}
                onChange={(e) =>
                  handleInputChange("experience", e.target.value)
                }
              >
                <option value="">Select experience</option>
                <option value="0-1">0-1 years</option>
                <option value="2-3">2-3 years</option>
                <option value="4-6">4-6 years</option>
                <option value="7-10">7-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            ) : (
              <p className="text-gray-900 flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                {currentData.experience || "Not set"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (USD)
            </label>
            {isEditing ? (
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentData.hourlyRate || ""}
                onChange={(e) =>
                  handleInputChange("hourlyRate", e.target.value)
                }
                placeholder="e.g., 150"
              />
            ) : (
              <p className="text-gray-900">
                {currentData.hourlyRate
                  ? `$${currentData.hourlyRate}/hour`
                  : "Not set"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specializations
          </label>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specializationOptions.map((spec) => (
                <label key={spec} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={
                      currentData.specializations?.includes(spec) || false
                    }
                    onChange={() => handleSpecializationToggle(spec)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentData.specializations?.length > 0 ? (
                currentData.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No specializations added</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Status
            </label>
            {isEditing ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentData.availability || "available"}
                onChange={(e) =>
                  handleInputChange("availability", e.target.value)
                }
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {currentData.availability || "Available"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            {isEditing ? (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={currentData.preferredContact || "email"}
                onChange={(e) =>
                  handleInputChange("preferredContact", e.target.value)
                }
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="both">Both</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {currentData.preferredContact || "Email"}
              </p>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Notification Preferences
          </label>
          <div className="space-y-3">
            {[
              {
                key: "newTenders",
                label: "New tender notifications",
                icon: Bell,
              },
              {
                key: "proposalUpdates",
                label: "Proposal status updates",
                icon: Star,
              },
              { key: "weeklyDigest", label: "Weekly digest", icon: Mail },
              {
                key: "marketing",
                label: "Marketing communications",
                icon: Globe,
              },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{label}</span>
                </div>
                {isEditing ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentData.notifications?.[key] || false}
                      onChange={(e) =>
                        handleNotificationChange(key, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                ) : (
                  <span
                    className={`text-sm ${
                      currentData.notifications?.[key]
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {currentData.notifications?.[key] ? "Enabled" : "Disabled"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  User,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import authService from "../services/authServiceLocal";

const Login = ({ onLogin, onToggleMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    companyName: "",
    role: "bidder",
    capabilities: [],
    countries: [],
  });

  const capabilities = [
    "AI/ML",
    "Cloud Computing",
    "Cybersecurity",
    "Data Analytics",
    "IoT",
    "Project Management",
    "Software Development",
    "Infrastructure",
    "Healthcare IT",
    "Financial Services",
    "Environmental",
    "Construction",
    "Transportation",
  ];

  const countries = [
    { code: "usa", name: "United States", flag: "🇺🇸" },
    { code: "uk", name: "United Kingdom", flag: "🇬🇧" },
    { code: "canada", name: "Canada", flag: "🇨🇦" },
    { code: "australia", name: "Australia", flag: "🇦🇺" },
    { code: "germany", name: "Germany", flag: "🇩🇪" },
    { code: "singapore", name: "Singapore", flag: "🇸🇬" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCapabilityToggle = (capability) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter((c) => c !== capability)
        : [...prev.capabilities, capability],
    }));
  };

  const handleCountryToggle = (countryCode) => {
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.includes(countryCode)
        ? prev.countries.filter((c) => c !== countryCode)
        : [...prev.countries, countryCode],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let result;

      if (isLogin) {
        result = await authService.signIn(formData.email, formData.password);
      } else {
        if (!formData.displayName || !formData.companyName) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }
        result = await authService.signUp(
          formData.email,
          formData.password,
          formData
        );
      }

      if (result.success) {
        setSuccess(
          isLogin ? "Login successful!" : "Account created successfully!"
        );
        setTimeout(() => {
          onLogin(result.user, result.userData);
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await authService.signInWithGoogle();
      if (result.success) {
        setSuccess("Google sign-in successful!");
        setTimeout(() => {
          onLogin(result.user, result.userData);
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Google sign-in failed");
      console.error("Google auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">TenderForge</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLogin
              ? "Sign in to access your AI-powered tender dashboard"
              : "Join TenderForge and start forging winning proposals with AI"}
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign Up Additional Fields */}
            {!isLogin && (
              <>
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bidder">Bidder/Contractor</option>
                    <option value="buyer">Government Buyer</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </div>

                {/* Capabilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capabilities (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {capabilities.map((capability) => (
                      <button
                        key={capability}
                        type="button"
                        onClick={() => handleCapabilityToggle(capability)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.capabilities.includes(capability)
                            ? "bg-blue-100 border-blue-300 text-blue-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {capability}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Countries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Countries
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountryToggle(country.code)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center space-x-2 ${
                          formData.countries.includes(country.code)
                            ? "bg-blue-100 border-blue-300 text-blue-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>

            {/* Google Sign In */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  FileText,
  CreditCard,
  Bell,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Send,
  Eye,
  Filter,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Users,
  Crown,
  Target,
  Shield,
  CheckCircle,
  LogOut,
  Heart,
  Bookmark,
  Receipt,
} from "lucide-react";
import apiService from "./services/api";
import authService from "./services/authServiceLocal";
import metricsService from "./services/metricsService";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./components/PaymentForm";
import SubscriptionPlans from "./components/SubscriptionPlans";
import QuickPayment from "./components/QuickPayment";
import LocationSelector from "./components/LocationSelector";
import Login from "./components/Login";
import PersonalizedDashboard from "./components/PersonalizedDashboard";
import TenderDetails from "./components/TenderDetails";
import SavedTenders from "./components/SavedTenders";
import CheckoutPage from "./components/CheckoutPage";
import PaymentHistory from "./components/PaymentHistory";
import UserProfile from "./components/UserProfile";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51S4hjdInh3NQvVYIUw1yn7PCawpgDSvqHDRbCgHDNbcka0Euxw8FhyQidJdH7ibF6JNtpLuWJVX7TmtlYOXBQBNn00oNn3D2I9"
);

// Enhanced mock data
const mockTenders = [
  {
    id: 1,
    title: "AI-Powered Traffic Management System",
    description:
      "Develop and implement an AI-driven traffic management system for smart city initiative including real-time optimization and predictive analytics",
    country: "USA",
    budget: 2800000,
    deadline: "2025-02-15",
    category: "Technology",
    requirements: [
      "AI/ML",
      "IoT Integration",
      "Cloud Computing",
      "Real-time Systems",
    ],
    similarity: 0.94,
    status: "open",
    bidsCount: 23,
    timeLeft: "39 days",
  },
  {
    id: 2,
    title: "Sustainable Energy Infrastructure Development",
    description:
      "Design and construction of renewable energy infrastructure including solar farms, wind turbines, and energy storage systems",
    country: "UK",
    budget: 15500000,
    deadline: "2025-06-30",
    category: "Energy",
    requirements: [
      "Renewable Energy",
      "Project Management",
      "Electrical Engineering",
      "Environmental Compliance",
    ],
    similarity: 0.89,
    status: "open",
    bidsCount: 45,
    timeLeft: "174 days",
  },
  {
    id: 3,
    title: "Cybersecurity Framework Implementation",
    description:
      "Comprehensive cybersecurity assessment and implementation of advanced security measures for critical government infrastructure",
    country: "Canada",
    budget: 4200000,
    deadline: "2025-04-15",
    category: "Cybersecurity",
    requirements: [
      "Cybersecurity",
      "Compliance",
      "Risk Assessment",
      "Security Auditing",
    ],
    similarity: 0.87,
    status: "open",
    bidsCount: 31,
    timeLeft: "98 days",
  },
  {
    id: 4,
    title: "Healthcare Digital Transformation",
    description:
      "Modernization of healthcare systems with electronic health records, telemedicine platforms, and AI-powered diagnostic tools",
    country: "Australia",
    budget: 6800000,
    deadline: "2025-08-20",
    category: "Healthcare Technology",
    requirements: [
      "Healthcare IT",
      "HIPAA Compliance",
      "AI/ML",
      "Database Management",
    ],
    similarity: 0.82,
    status: "open",
    bidsCount: 19,
    timeLeft: "235 days",
  },
  {
    id: 5,
    title: "Smart Grid Implementation Project",
    description:
      "Implementation of intelligent electrical grid system with IoT sensors, automated control systems, and predictive maintenance",
    country: "Germany",
    budget: 12300000,
    deadline: "2025-09-15",
    category: "Infrastructure",
    requirements: [
      "Smart Grid Technology",
      "IoT",
      "Electrical Engineering",
      "Data Analytics",
    ],
    similarity: 0.85,
    status: "open",
    bidsCount: 37,
    timeLeft: "261 days",
  },
  {
    id: 6,
    title: "Financial Services Cloud Migration",
    description:
      "Secure migration of banking infrastructure to cloud with enhanced security protocols and regulatory compliance",
    country: "Singapore",
    budget: 3900000,
    deadline: "2025-05-10",
    category: "Financial Technology",
    requirements: [
      "Cloud Computing",
      "Financial Services",
      "Security",
      "Compliance",
    ],
    similarity: 0.91,
    status: "open",
    bidsCount: 28,
    timeLeft: "123 days",
  },
];

const mockProfile = {
  id: 1,
  companyName: "TenderForge Solutions",
  email: "info@tenderforge.com",
  capabilities: [
    "AI/ML",
    "Cloud Computing",
    "Cybersecurity",
    "Project Management",
  ],
  experience: 12,
  completedProjects: 89,
  successRate: 94.2,
  totalRevenue: 24500000,
  certifications: ["ISO 27001", "SOC 2 Type II", "AWS Certified"],
  countries: ["USA", "Canada", "UK"],
  activeProposals: 12,
  recentWins: 8,
};

const TenderForge = () => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Existing state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTender, setSelectedTender] = useState(null);
  const [profile, setProfile] = useState(mockProfile);
  const [filteredTenders, setFilteredTenders] = useState(mockTenders);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New tender matching your profile: Highway Construction",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      message: "Proposal deadline approaching for IT Infrastructure project",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      message: "Payment received for Smart City project",
      time: "2 hours ago",
      unread: false,
    },
  ]);
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [proposalId, setProposalId] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking"); // 'online', 'offline', 'checking'

  // Payment and subscription state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  // New features state
  const [savedTenders, setSavedTenders] = useState([]);
  const [showTenderDetails, setShowTenderDetails] = useState(false);
  const [selectedTenderForDetails, setSelectedTenderForDetails] =
    useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [userMetrics, setUserMetrics] = useState({});

  // Government API and location state
  const [selectedCountries, setSelectedCountries] = useState([
    "usa",
    "uk",
    "canada",
    "australia",
  ]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [useGovernmentAPIs, setUseGovernmentAPIs] = useState(true);
  const [governmentTenders, setGovernmentTenders] = useState([]);
  const [isLoadingGovTenders, setIsLoadingGovTenders] = useState(false);
  const [tenderSource, setTenderSource] = useState("hybrid"); // 'database', 'government', 'hybrid'

  // Authentication effect
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // User is signed in
        const userInfo = await authService.getUserData(firebaseUser.uid);
        setUser(firebaseUser);
        setUserData(userInfo);

        // Update profile with Firebase data
        if (userInfo?.profile) {
          setProfile({
            ...mockProfile,
            id: firebaseUser.uid,
            companyName: userInfo.companyName || mockProfile.companyName,
            email: firebaseUser.email,
            capabilities:
              userInfo.profile.capabilities || mockProfile.capabilities,
            countries: userInfo.profile.countries || mockProfile.countries,
            completedProjects:
              userInfo.profile.completedProjects ||
              mockProfile.completedProjects,
            successRate:
              userInfo.profile.successRate || mockProfile.successRate,
            totalRevenue:
              userInfo.profile.totalRevenue || mockProfile.totalRevenue,
            activeProposals:
              userInfo.profile.activeProposals || mockProfile.activeProposals,
            recentWins: userInfo.profile.recentWins || mockProfile.recentWins,
          });

          // Set user's preferred countries
          if (userInfo.profile.countries?.length > 0) {
            setSelectedCountries(userInfo.profile.countries);
          }
        }
      } else {
        // User is signed out
        setUser(null);
        setUserData(null);
        setProfile(mockProfile);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize metrics and load saved tenders
  useEffect(() => {
    // Initialize metrics service
    metricsService.initializeBaseline();
    setUserMetrics(metricsService.getMetrics());

    // Load saved tenders from localStorage
    const saved = localStorage.getItem("savedTenders");
    if (saved) {
      setSavedTenders(JSON.parse(saved));
    }

    // Update saved tenders count in metrics
    const savedTendersArray = saved ? JSON.parse(saved) : [];
    metricsService.updateSavedTenders(savedTendersArray);
  }, []);

  // Authentication handlers
  const handleLogin = (firebaseUser, userInfo) => {
    setUser(firebaseUser);
    setUserData(userInfo);
    setShowLogin(false);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setUserData(null);
      setProfile(mockProfile);
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Enhanced tender filtering with government APIs
  useEffect(() => {
    const searchTenders = async () => {
      if (
        useGovernmentAPIs &&
        backendStatus === "online" &&
        selectedCountries.length > 0
      ) {
        setIsLoadingGovTenders(true);
        try {
          console.log("🔍 Searching government tenders with:", {
            searchQuery,
            selectedCountries,
            selectedLocation,
          });

          // Use the API service for government tender search
          const data = await apiService.searchGovernmentTenders(
            searchQuery,
            selectedCountries,
            {
              region: selectedLocation,
              limit: 50,
            }
          );

          if (data.success) {
            setGovernmentTenders(data.data || []);
            console.log(`✅ Found ${data.data.length} government tenders`);

            // Combine with mock data for hybrid approach
            if (tenderSource === "hybrid") {
              const mockFiltered = mockTenders.filter(
                (tender) =>
                  tender.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  tender.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  tender.category
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
              );
              setFilteredTenders([...data.data, ...mockFiltered]);
            } else {
              setFilteredTenders(data.data);
            }
          } else {
            throw new Error("Government API search failed");
          }
        } catch (error) {
          console.error("❌ Error searching government tenders:", error);
          // Fallback to mock data
          const filtered = mockTenders.filter(
            (tender) =>
              tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tender.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              tender.category.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredTenders(filtered);
        } finally {
          setIsLoadingGovTenders(false);
        }
      } else {
        // Use mock data only
        const filtered = mockTenders.filter(
          (tender) =>
            tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tender.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            tender.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTenders(filtered);
      }
    };

    searchTenders();
  }, [
    searchQuery,
    selectedCountries,
    selectedLocation,
    useGovernmentAPIs,
    backendStatus,
    tenderSource,
  ]);

  // Location and country change handlers
  const handleCountryChange = (countries) => {
    setSelectedCountries(countries);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  // Toggle between data sources
  const handleSourceToggle = (source) => {
    setTenderSource(source);
  };

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/health");
        if (response.ok) {
          setBackendStatus("online");
          console.log("🟢 Backend online - government APIs available");

          // Load available countries when backend comes online
          try {
            const countriesData = await apiService.getAvailableCountries();
            if (countriesData.success && countriesData.data.countries) {
              console.log(
                "📍 Available countries:",
                countriesData.data.countries.map((c) => c.name).join(", ")
              );
            }
          } catch (error) {
            console.warn(
              "⚠️ Could not load available countries:",
              error.message
            );
          }
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        setBackendStatus("offline");
        console.log("🔴 Backend not available, using mock data");
      }
    };

    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real AI proposal generation using Gemini
  const generateProposal = async (tender) => {
    setIsGenerating(true);
    setGeneratedProposal(""); // Clear previous proposal

    try {
      console.log("Generating proposal with Gemini AI for:", tender.title);

      const response = await apiService.generateProposal(tender, profile);

      if (response.success && response.proposal) {
        setGeneratedProposal(response.proposal);
        setProposalId(response.id || null);

        console.log("Proposal generated successfully");
      } else {
        throw new Error(response.message || "Failed to generate proposal");
      }
    } catch (error) {
      console.error("Error generating proposal:", error);

      // Fallback to mock proposal if API fails
      const fallbackProposal = `
❌ AI PROPOSAL GENERATION FAILED

Error: ${error.message}

FALLBACK PROPOSAL FOR: ${tender.title}

EXECUTIVE SUMMARY
${profile.companyName} is pleased to submit this proposal for ${
        tender.title
      }. With ${profile.experience} years of experience and a ${
        profile.successRate
      }% success rate across ${
        profile.completedProjects
      } completed projects, we are uniquely positioned to deliver this project successfully.

PROJECT UNDERSTANDING
We understand that this project involves ${tender.description.toLowerCase()}. Our team has extensive experience in ${tender.requirements.join(
        ", "
      )} which directly aligns with your requirements.

TECHNICAL APPROACH
Our proposed approach includes:
1. Initial assessment and planning phase
2. Phased implementation with regular milestones
3. Quality assurance and testing protocols
4. Documentation and knowledge transfer

COMPANY QUALIFICATIONS
- ${profile.experience} years of industry experience
- ${profile.completedProjects} successfully completed projects
- ${profile.successRate}% project success rate
- Certified in: ${profile.certifications.join(", ")}
- Active in markets: ${profile.countries.join(", ")}

TIMELINE & BUDGET
Based on the project scope, we propose a competitive approach that delivers maximum value within your budget of $${tender.budget.toLocaleString()}.

⚠️ NOTE: This is a fallback template. To get AI-generated proposals:
1. Ensure backend server is running on port 3001
2. Add OpenAI API key to backend/.env file
3. Verify Gemini API configuration

We look forward to discussing this opportunity further.

Best regards,
${profile.companyName}
      `;

      setGeneratedProposal(fallbackProposal);
    } finally {
      setIsGenerating(false);
    }
  };

  const editProposal = async (proposalId, currentContent, userMessage) => {
    try {
      if (generatedProposal.trim() === "" || userMessage.trim() === "") {
        throw new Error("No proposal content to edit/No update prompts submitted");
      }

      const response = await apiService.editProposal(proposalId, currentContent, userMessage);

      if (response.success && response.data && response.data.proposal) {
        setGeneratedProposal(response.data.proposal.content);
        //setProposalId(response.data.proposal.id || null);
        console.log("Proposal updated successfully: ", response.data.proposal.content);
      } else {
        throw new Error(response.message || "Failed to update proposal");
      }
    } catch (error) {
      console.error("Error generating proposal:", error);
    }
  }

  // Payment and subscription handlers
  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setShowSubscriptionModal(false);

    try {
      // Create subscription payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.price * 100, // Convert to cents
          currency: "usd",
          metadata: {
            type: "subscription",
            plan: plan.id,
            userId: profile.id,
          },
        }),
      });

      const { clientSecret } = await response.json();
      setPaymentIntent(clientSecret);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log("Payment successful:", paymentResult);
    setShowPaymentModal(false);

    // Update subscription if it was a subscription payment
    if (selectedPlan) {
      setUserSubscription(selectedPlan);
      setSelectedPlan(null);

      // Add success notification
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `Successfully subscribed to ${selectedPlan.name} plan!`,
          time: "Just now",
          unread: true,
        },
        ...prev,
      ]);
    } else {
      // Add success notification for one-time payment
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `Payment successful! Your premium feature is now active.`,
          time: "Just now",
          unread: true,
        },
        ...prev,
      ]);
    }

    // Show success toast (you can add a toast library or custom notification)
    setTimeout(() => {
      alert("🎉 Payment successful! Your premium features are now active.");
    }, 500);
  };

  const handlePremiumProposal = async (tender) => {
    try {
      // Create one-time payment for premium proposal
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 2500, // $25 for premium proposal
          currency: "usd",
          metadata: {
            type: "premium_proposal",
            tenderId: tender.id,
            userId: profile.id,
          },
        }),
      });

      const { clientSecret } = await response.json();
      setPaymentIntent(clientSecret);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  const handleQuickPayment = async (paymentOption) => {
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentOption.price * 100, // Convert to cents
          currency: "usd",
          metadata: {
            type: paymentOption.id,
            userId: profile.id,
            description: paymentOption.title,
          },
        }),
      });

      const { clientSecret } = await response.json();
      setPaymentIntent(clientSecret);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  // New feature handlers
  const handleSaveTender = (tenderId) => {
    setSavedTenders((prev) => {
      const newSaved = prev.includes(tenderId)
        ? prev.filter((id) => id !== tenderId)
        : [...prev, tenderId];

      // Save to localStorage
      localStorage.setItem("savedTenders", JSON.stringify(newSaved));

      // Update metrics
      metricsService.updateSavedTenders(newSaved);
      setUserMetrics(metricsService.getMetrics());

      return newSaved;
    });
  };

  const handleViewTenderDetails = (tender) => {
    setSelectedTenderForDetails(tender);
    setShowTenderDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowTenderDetails(false);
    setSelectedTenderForDetails(null);
  };

  const handleGenerateProposal = (tenderId, proposalContent) => {
    // Update metrics for proposal generation
    metricsService.updateActiveProposals(true);
    setUserMetrics(metricsService.getMetrics());

    // Update profile stats
    setProfile((prev) => ({
      ...prev,
      activeProposals: prev.activeProposals + 1,
    }));

    console.log(`Generated proposal for tender ${tenderId}:`, proposalContent);
  };

  const handleSubmitProposal = (tenderId, proposalContent) => {
    // Update metrics for proposal submission
    metricsService.updateActiveProposals(true);
    setUserMetrics(metricsService.getMetrics());

    // Add notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: `Proposal submitted for tender ${tenderId}`,
        time: "Just now",
        unread: true,
      },
      ...prev,
    ]);

    console.log(`Submitted proposal for tender ${tenderId}:`, proposalContent);
  };

  const handleDownloadPDF = (tenderId) => {
    console.log(`Downloaded PDF for tender ${tenderId}`);
  };

  const handleCheckoutPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
    setShowSubscriptionModal(false);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  const handlePaymentSuccessCheckout = (plan) => {
    setUserSubscription(plan);
    setShowCheckout(false);
    setSelectedPlan(null);

    // Add success notification
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: `Successfully subscribed to ${plan.name}!`,
        time: "Just now",
        unread: true,
      },
      ...prev,
    ]);
  };

  const renderDashboard = () => (
    <PersonalizedDashboard
      user={user}
      userData={userData}
      filteredTenders={filteredTenders}
      userMetrics={userMetrics}
    />
  );

  const renderTenders = () => (
    <div className="space-y-6">
      {/* Location and Country Selection */}
      <LocationSelector
        onLocationChange={handleLocationChange}
        onCountryChange={handleCountryChange}
        selectedCountries={selectedCountries}
        selectedLocation={selectedLocation}
      />

      {/* Data Source Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h4 className="text-sm font-medium text-gray-700">Data Source:</h4>
            <div className="flex space-x-2">
              {["database", "government", "hybrid"].map((source) => (
                <button
                  key={source}
                  onClick={() => handleSourceToggle(source)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    tenderSource === source
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {source === "database"
                    ? "💾 Database"
                    : source === "government"
                    ? "🏛️ Gov APIs"
                    : "🔄 Hybrid"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {backendStatus === "online" ? (
              <span className="flex items-center text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                APIs Online
              </span>
            ) : (
              <span className="flex items-center text-red-600 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                APIs Offline
              </span>
            )}

            {isLoadingGovTenders && (
              <div className="flex items-center text-blue-600 text-sm">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
        <div className="text-sm text-gray-500">
          {filteredTenders.length} tenders found
        </div>
      </div>

      {/* Tender Cards */}
      <div className="space-y-4">
        {filteredTenders.map((tender) => (
          <div
            key={tender.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {tender.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {tender.category}
                      </span>
                      <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        <Star className="h-3 w-3 mr-1" />
                        {Math.round(tender.similarity * 100)}% Match
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {tender.description}
                </p>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-sm">{tender.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-medium text-sm">
                        ${tender.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Time Left</p>
                      <p className="font-medium text-sm">{tender.timeLeft}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Competition</p>
                      <p className="font-medium text-sm">
                        {tender.bidsCount} bids
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements Tags */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {tender.requirements.map((req, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Open for Bids
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    High Competition
                  </div>
                  {tender.similarity > 0.9 && (
                    <div className="flex items-center text-blue-600">
                      <Zap className="h-4 w-4 mr-1" />
                      Perfect Match
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="ml-6 flex flex-col space-y-2 min-w-[160px]">
                <button
                  onClick={() => handleViewTenderDetails(tender)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTender(tender);
                    setActiveTab("ai-proposal");
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>AI Proposal</span>
                </button>
                <button
                  onClick={() => handleSaveTender(tender.id)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    savedTenders.includes(tender.id)
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {savedTenders.includes(tender.id) ? (
                    <>
                      <Heart className="h-4 w-4 fill-current" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More / Pagination */}
      {filteredTenders.length > 0 && (
        <div className="text-center pt-6">
          <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Load More Tenders
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredTenders.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tenders found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <UserProfile
      user={user}
      userData={userData}
      onUpdateProfile={(updatedData) => {
        setUserData((prev) => ({ ...prev, ...updatedData }));
      }}
    />
  );

  const renderAIProposal = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      {selectedTender ? (
        <>
          {/* Tender Overview */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  AI Proposal Generator
                </h2>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedTender.title}
                </h3>
                <p className="text-blue-100 mb-4">
                  {selectedTender.description}
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>${selectedTender.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{selectedTender.timeLeft} left</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    <span>
                      {Math.round(selectedTender.similarity * 100)}% Match
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-6 space-y-3">
                <button
                  onClick={() => generateProposal(selectedTender)}
                  disabled={isGenerating}
                  className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2 font-semibold transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Generate Standard</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handlePremiumProposal(selectedTender)}
                  className="w-full bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg hover:bg-yellow-500 flex items-center space-x-2 font-semibold transition-colors"
                >
                  <Crown className="h-5 w-5" />
                  <span>Premium AI ($25)</span>
                </button>

                <p className="text-xs text-blue-100 text-center">
                  Premium includes custom analysis, market research &
                  competitive insights
                </p>
              </div>
            </div>
          </div>

          {/* Requirements Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Tender Requirements
              </h3>
              <div className="space-y-3">
                {selectedTender.requirements.map((req, index) => {
                  const hasCapability = profile.capabilities.includes(req);
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        hasCapability ? "bg-green-50" : "bg-yellow-50"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          hasCapability ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                      <span
                        className={`flex-1 ${
                          hasCapability ? "text-green-800" : "text-yellow-800"
                        }`}
                      >
                        {req}
                      </span>
                      {hasCapability && (
                        <Star className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Your Capabilities
              </h3>
              <div className="space-y-3">
                {profile.capabilities.map((cap, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="flex-1 text-blue-800">{cap}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Experience</span>
                    <p className="font-semibold">{profile.experience} years</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate</span>
                    <p className="font-semibold">{profile.successRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Proposal */}
          {generatedProposal && (
            <div className="bg-white rounded-lg shadow">
              <div className="border-b p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Generated Proposal
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">AI-Generated</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  value={generatedProposal}
                  onChange={(e) => setGeneratedProposal(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                  placeholder="Your AI-generated proposal will appear here..."
                />

                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                  placeholder="Edit your proposal..."
                />

                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                  onClick={() => editProposal(proposalId, generatedProposal, userMessage)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>UPDATE PROPOSAL</span>
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Submit Proposal</span>
                  </button>
                  <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    onClick={() => generateProposal(selectedTender)}
                    disabled={isGenerating}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Proposal Generated Yet */}
          {!generatedProposal && !isGenerating && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Generate Your Proposal
              </h3>
              <p className="text-gray-600 mb-6">
                Click the "Generate with AI" button above to create a customized
                proposal based on your capabilities and the tender requirements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 font-medium">
                    AI-Powered
                  </p>
                  <p className="text-xs text-blue-600">Intelligent matching</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-medium">
                    Professional
                  </p>
                  <p className="text-xs text-green-600">Industry standards</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-800 font-medium">
                    Customized
                  </p>
                  <p className="text-xs text-purple-600">Your profile based</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Tender
          </h3>
          <p className="text-gray-600 mb-6">
            Choose a tender from the Tenders tab to generate an AI-powered
            proposal.
          </p>
          <button
            onClick={() => setActiveTab("tenders")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Tenders
          </button>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <PaymentHistory userSubscription={userSubscription} />
  );

  const renderSubscription = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          {userSubscription && (
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                {userSubscription.name} Plan Active
              </span>
            </div>
          )}
        </div>

        {userSubscription ? (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-green-900">
                    {userSubscription.name} Plan
                  </h3>
                  <p className="text-green-700 mt-1">
                    {userSubscription.description}
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    ${userSubscription.price}/month
                  </p>
                </div>
                <Crown className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Plan Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">
                  Included Features
                </h4>
                <div className="space-y-2">
                  {userSubscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Usage This Month</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      AI Proposals Generated
                    </span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Premium Features Used</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">API Calls Made</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-3">
                Billing Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="font-semibold">February 15, 2025</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">**** **** **** 1234</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Change Plan
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel Subscription
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Subscription
            </h3>
            <p className="text-gray-600 mb-6">
              Upgrade to a premium plan to unlock advanced AI features and
              unlimited proposals
            </p>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Choose a Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.unread
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
                {notification.unread && (
                  <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-800">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading State */}
      {isLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Login Screen */}
      {!isLoading && !user && <Login onLogin={handleLogin} />}

      {/* Main App - Only show when authenticated */}
      {!isLoading && user && (
        <>
          {/* Floating Quick Pay Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setActiveTab("payments")}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
              title="Quick Payment Options"
            >
              <CreditCard className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <Building className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    TenderForge
                  </h1>
                </div>

                <div className="flex items-center space-x-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {userData?.displayName || user?.displayName || "User"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userData?.companyName || "Company"}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {(userData?.displayName || user?.displayName || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Backend Status Indicator */}
                  <div
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      backendStatus === "online"
                        ? "bg-green-100 text-green-800"
                        : backendStatus === "offline"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        backendStatus === "online"
                          ? "bg-green-500"
                          : backendStatus === "offline"
                          ? "bg-red-500"
                          : "bg-yellow-500 animate-pulse"
                      }`}
                    ></div>
                    <span>
                      {backendStatus === "online"
                        ? "OpenAI Connected"
                        : backendStatus === "offline"
                        ? "OpenAI Offline"
                        : "Checking..."}
                    </span>
                  </div>

                  <div
                    className="relative cursor-pointer"
                    onClick={() => setActiveTab("notifications")}
                    title="View notifications"
                  >
                    <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notifications.filter((n) => n.unread).length}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex space-x-8">
              {/* Sidebar Navigation */}
              <nav className="w-64 bg-white rounded-lg shadow p-6">
                <ul className="space-y-2">
                  {[
                    { id: "dashboard", label: "Dashboard", icon: Building },
                    { id: "tenders", label: "Browse Tenders", icon: Search },
                    { id: "saved", label: "Saved Tenders", icon: Heart },
                    {
                      id: "ai-proposal",
                      label: "AI Proposals",
                      icon: FileText,
                    },
                    { id: "subscription", label: "Subscription", icon: Crown },
                    { id: "payments", label: "Payment History", icon: Receipt },
                    { id: "profile", label: "My Profile", icon: User },
                    { id: "notifications", label: "Notifications", icon: Bell },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                            activeTab === item.id
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Main Content */}
              <main className="flex-1">
                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "tenders" &&
                  !showTenderDetails &&
                  renderTenders()}
                {activeTab === "tenders" && showTenderDetails && (
                  <TenderDetails
                    tender={selectedTenderForDetails}
                    onBack={handleBackFromDetails}
                    onSaveTender={handleSaveTender}
                    onGenerateProposal={handleGenerateProposal}
                    onSubmitProposal={handleSubmitProposal}
                    onDownloadPDF={handleDownloadPDF}
                    savedTenders={savedTenders}
                  />
                )}
                {activeTab === "saved" && (
                  <SavedTenders
                    savedTenders={savedTenders}
                    allTenders={[...mockTenders, ...governmentTenders]}
                    onViewDetails={handleViewTenderDetails}
                    onRemoveSaved={handleSaveTender}
                    onGenerateProposal={(tender) => {
                      handleViewTenderDetails(tender);
                      // Auto-scroll to proposal section would be handled in TenderDetails
                    }}
                  />
                )}
                {activeTab === "profile" && renderProfile()}
                {activeTab === "ai-proposal" && renderAIProposal()}
                {activeTab === "subscription" && renderSubscription()}
                {activeTab === "payments" && renderPayments()}
                {activeTab === "notifications" && renderNotifications()}
              </main>
            </div>
          </div>

          {/* Payment Modal */}
          {showPaymentModal && paymentIntent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Complete Payment</h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    clientSecret={paymentIntent}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPaymentModal(false)}
                  />
                </Elements>
              </div>
            </div>
          )}

          {/* Subscription Plans Modal */}
          {showSubscriptionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-semibold">Choose Your Plan</h3>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6">
                  <SubscriptionPlans
                    onSelectPlan={handleSelectPlan}
                    onCheckout={handleCheckoutPlan}
                    currentPlan={userSubscription?.id}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Checkout Modal */}
          {showCheckout && selectedPlan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <CheckoutPage
                  selectedPlan={selectedPlan}
                  onBack={handleBackFromCheckout}
                  onPaymentSuccess={handlePaymentSuccessCheckout}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TenderForge;

// Also export as App for compatibility
export { TenderForge as App };

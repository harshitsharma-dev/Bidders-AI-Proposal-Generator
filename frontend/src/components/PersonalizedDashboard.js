import React, { useState, useEffect } from "react";
import {
  User,
  Building,
  Award,
  TrendingUp,
  FileText,
  DollarSign,
  Target,
  Calendar,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Zap,
} from "lucide-react";

const PersonalizedDashboard = ({
  user,
  userData,
  filteredTenders,
  userMetrics = {},
}) => {
  const [personalizedMetrics, setPersonalizedMetrics] = useState({
    relevantTenders: 0,
    matchScore: 0,
    potentialRevenue: 0,
    deadlinesSoon: 0,
  });

  const [personalizedTenders, setPersonalizedTenders] = useState([]);
  const [userStats, setUserStats] = useState({
    activeProposals:
      userMetrics.activeProposals || userData?.profile?.activeProposals || 0,
    recentWins: userMetrics.recentWins || userData?.profile?.recentWins || 0,
    successRate: userMetrics.successRate || userData?.profile?.successRate || 0,
    totalRevenue:
      userMetrics.totalRevenue || userData?.profile?.totalRevenue || 0,
    completedProjects:
      userMetrics.completedProjects ||
      userData?.profile?.completedProjects ||
      0,
  });

  useEffect(() => {
    if (filteredTenders && userData?.profile) {
      calculatePersonalizedMetrics();
      filterPersonalizedTenders();
    }
  }, [filteredTenders, userData]);

  useEffect(() => {
    // Update userStats when userMetrics changes
    setUserStats({
      activeProposals:
        userMetrics.activeProposals || userData?.profile?.activeProposals || 0,
      recentWins: userMetrics.recentWins || userData?.profile?.recentWins || 0,
      successRate:
        userMetrics.successRate || userData?.profile?.successRate || 0,
      totalRevenue:
        userMetrics.totalRevenue || userData?.profile?.totalRevenue || 0,
      completedProjects:
        userMetrics.completedProjects ||
        userData?.profile?.completedProjects ||
        0,
    });
  }, [userMetrics, userData]);

  const calculatePersonalizedMetrics = () => {
    const userCapabilities = userData?.profile?.capabilities || [];
    const userCountries = userData?.profile?.countries || [];

    let relevantCount = 0;
    let totalMatch = 0;
    let potentialRev = 0;
    let urgentDeadlines = 0;

    filteredTenders.forEach((tender) => {
      // Check relevance based on capabilities
      const capabilityMatch =
        tender.requirements?.some((req) =>
          userCapabilities.some(
            (cap) =>
              req.toLowerCase().includes(cap.toLowerCase()) ||
              cap.toLowerCase().includes(req.toLowerCase())
          )
        ) || false;

      // Check country match
      const countryMatch = userCountries.includes(
        tender.country?.toLowerCase()
      );

      if (capabilityMatch || countryMatch) {
        relevantCount++;

        // Calculate match score
        const capScore = capabilityMatch ? 0.7 : 0;
        const countryScore = countryMatch ? 0.3 : 0;
        totalMatch += capScore + countryScore;

        // Add to potential revenue
        potentialRev += tender.budget || 0;

        // Check urgent deadlines (within 30 days)
        const deadline = new Date(tender.deadline);
        const daysLeft = Math.ceil(
          (deadline - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft <= 30 && daysLeft > 0) {
          urgentDeadlines++;
        }
      }
    });

    setPersonalizedMetrics({
      relevantTenders: relevantCount,
      matchScore:
        relevantCount > 0 ? Math.round((totalMatch / relevantCount) * 100) : 0,
      potentialRevenue: potentialRev,
      deadlinesSoon: urgentDeadlines,
    });
  };

  const filterPersonalizedTenders = () => {
    const userCapabilities = userData?.profile?.capabilities || [];
    const userCountries = userData?.profile?.countries || [];

    const personalizedList = filteredTenders
      .map((tender) => {
        let score = 0;
        let reasons = [];

        // Capability matching
        const matchingCapabilities =
          tender.requirements?.filter((req) =>
            userCapabilities.some(
              (cap) =>
                req.toLowerCase().includes(cap.toLowerCase()) ||
                cap.toLowerCase().includes(req.toLowerCase())
            )
          ) || [];

        if (matchingCapabilities.length > 0) {
          score += matchingCapabilities.length * 0.3;
          reasons.push(`Matches ${matchingCapabilities.length} capabilities`);
        }

        // Country matching
        if (userCountries.includes(tender.country?.toLowerCase())) {
          score += 0.4;
          reasons.push("In your operating region");
        }

        // Budget range matching (based on user's previous projects)
        const avgProjectValue =
          userStats.totalRevenue / Math.max(userStats.completedProjects, 1);
        if (tender.budget && avgProjectValue > 0) {
          const budgetRatio = tender.budget / avgProjectValue;
          if (budgetRatio >= 0.5 && budgetRatio <= 2) {
            score += 0.2;
            reasons.push("Budget fits your experience");
          }
        }

        // Deadline urgency
        const deadline = new Date(tender.deadline);
        const daysLeft = Math.ceil(
          (deadline - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft <= 14 && daysLeft > 0) {
          score += 0.1;
          reasons.push("Urgent deadline");
        }

        return {
          ...tender,
          personalizedScore: Math.round(score * 100),
          matchReasons: reasons,
        };
      })
      .filter((tender) => tender.personalizedScore > 0)
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, 6); // Top 6 personalized matches

    setPersonalizedTenders(personalizedList);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userData?.displayName || user?.displayName || "there";

    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const getSubscriptionBadge = () => {
    const plan = userData?.profile?.subscription?.plan || "free";
    const badges = {
      free: { icon: User, color: "gray", text: "Free" },
      premium: { icon: Crown, color: "blue", text: "Premium" },
      enterprise: { icon: Zap, color: "purple", text: "Enterprise" },
    };

    const badge = badges[plan];
    const IconComponent = badge.icon;

    return (
      <div
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-700`}
      >
        <IconComponent className="w-3 h-3" />
        <span>{badge.text}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{getGreeting()}</h1>
            <p className="text-blue-100 text-lg">
              Welcome back to {userData?.companyName || "TenderForge"}
            </p>
            <div className="flex items-center space-x-4 mt-3">
              {getSubscriptionBadge()}
              <div className="text-sm text-blue-100">
                Last login:{" "}
                {new Date(userData?.lastLoginAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {personalizedMetrics.relevantTenders}
            </div>
            <div className="text-blue-100">Relevant Tenders</div>
          </div>
        </div>
      </div>

      {/* Personalized Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Match Score</p>
              <p className="text-3xl font-bold text-green-900">
                {personalizedMetrics.matchScore}%
              </p>
              <p className="text-xs text-green-500 mt-1">
                Based on your skills
              </p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Active Proposals
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {userStats.activeProposals}
              </p>
              <p className="text-xs text-blue-500 mt-1">In progress</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Potential Revenue
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {formatCurrency(personalizedMetrics.potentialRevenue)}
              </p>
              <p className="text-xs text-purple-500 mt-1">
                From relevant tenders
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Urgent Deadlines
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {personalizedMetrics.deadlinesSoon}
              </p>
              <p className="text-xs text-orange-500 mt-1">Within 30 days</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* User Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Success Rate
            </h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {userStats.successRate}%
          </div>
          <div className="text-sm text-gray-500">
            {userStats.recentWins} wins in last 30 days
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Projects
            </h3>
            <Award className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {userStats.completedProjects}
          </div>
          <div className="text-sm text-gray-500">Completed successfully</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Total Revenue
            </h3>
            <DollarSign className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(userStats.totalRevenue)}
          </div>
          <div className="text-sm text-gray-500">Lifetime earnings</div>
        </div>
      </div>

      {/* Personalized Tender Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Personalized Recommendations</span>
            </h3>
            <div className="text-sm text-gray-500">
              Based on your profile and experience
            </div>
          </div>
        </div>

        <div className="p-6">
          {personalizedTenders.length > 0 ? (
            <div className="grid gap-6">
              {personalizedTenders.map((tender) => (
                <div
                  key={tender.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {tender.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {tender.description}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tender.personalizedScore >= 80
                            ? "bg-green-100 text-green-700"
                            : tender.personalizedScore >= 60
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {tender.personalizedScore}% Match
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{tender.country}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(tender.budget)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{tender.timeLeft}</span>
                    </div>
                  </div>

                  {tender.matchReasons && tender.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tender.matchReasons.map((reason, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {tender.requirements?.slice(0, 3).map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {req}
                        </span>
                      ))}
                      {tender.requirements?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{tender.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      Generate Proposal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No personalized recommendations available yet.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Complete your profile to get better recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;

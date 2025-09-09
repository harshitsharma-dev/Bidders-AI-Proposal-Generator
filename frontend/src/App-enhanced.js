import React, { useState, useEffect } from 'react';
import { 
  Search, User, FileText, CreditCard, Bell, Star, MapPin, Calendar, 
  DollarSign, Building, Send, Eye, Filter, Plus, Trash2, Edit, 
  Zap, TrendingUp, Award, Globe, Users
} from 'lucide-react';
import TenderFirebaseService from './services/tenderService';

// Enhanced mock data with more realistic content
const enhancedMockTenders = [
  {
    id: 1,
    title: "AI-Powered Traffic Management System",
    description: "Develop and implement an AI-driven traffic management system for smart city initiative. Includes real-time traffic optimization, predictive analytics, and integration with existing infrastructure.",
    country: "USA",
    budget: 2800000,
    deadline: "2025-02-15",
    category: "Technology",
    requirements: ["AI/ML", "IoT Integration", "Cloud Computing", "Real-time Systems"],
    similarity: 0.94,
    status: "open",
    publishedDate: "2024-12-01",
    bidsCount: 23,
    timeLeft: "39 days"
  },
  {
    id: 2,
    title: "Sustainable Energy Infrastructure Development",
    description: "Design and construction of renewable energy infrastructure including solar farms, wind turbines, and energy storage systems for government facilities.",
    country: "UK",
    budget: 15500000,
    deadline: "2025-06-30",
    category: "Energy",
    requirements: ["Renewable Energy", "Project Management", "Electrical Engineering", "Environmental Compliance"],
    similarity: 0.89,
    status: "open",
    publishedDate: "2024-11-28",
    bidsCount: 45,
    timeLeft: "174 days"
  },
  {
    id: 3,
    title: "Cybersecurity Framework Implementation",
    description: "Comprehensive cybersecurity assessment and implementation of advanced security measures for critical government infrastructure and data protection.",
    country: "Canada",
    budget: 4200000,
    deadline: "2025-04-15",
    category: "Cybersecurity",
    requirements: ["Cybersecurity", "Compliance", "Risk Assessment", "Security Auditing"],
    similarity: 0.87,
    status: "open",
    publishedDate: "2024-12-05",
    bidsCount: 31,
    timeLeft: "98 days"
  },
  {
    id: 4,
    title: "Digital Healthcare Platform Development",
    description: "Create a comprehensive digital healthcare platform with telemedicine capabilities, patient management, and integration with existing hospital systems.",
    country: "Australia",
    budget: 6800000,
    deadline: "2025-05-20",
    category: "Healthcare",
    requirements: ["Healthcare IT", "HIPAA Compliance", "Mobile Development", "Database Management"],
    similarity: 0.91,
    status: "open",
    publishedDate: "2024-12-02",
    bidsCount: 18,
    timeLeft: "133 days"
  }
];

const enhancedMockProfile = {
  id: 1,
  companyName: "TechBuild Solutions",
  email: "info@techbuild.com",
  capabilities: ["AI/ML", "Cloud Computing", "Cybersecurity", "Project Management", "Software Development"],
  experience: 12,
  completedProjects: 89,
  successRate: 94.2,
  totalRevenue: 24500000,
  certifications: ["ISO 27001", "SOC 2 Type II", "AWS Certified", "Microsoft Gold Partner"],
  countries: ["USA", "Canada", "UK", "Australia"],
  recentWins: 8,
  activeProposals: 12
};

const TenderMarketplace = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTender, setSelectedTender] = useState(null);
  const [profile, setProfile] = useState(enhancedMockProfile);
  const [filteredTenders, setFilteredTenders] = useState(enhancedMockTenders);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "🎯 New AI tender matching your profile: 94% compatibility", time: "2 min ago", unread: true, type: "match" },
    { id: 2, message: "⏰ Proposal deadline approaching: Cybersecurity Framework (4 days left)", time: "1 hour ago", unread: true, type: "deadline" },
    { id: 3, message: "🎉 Congratulations! You won the Digital Healthcare Platform tender", time: "3 hours ago", unread: false, type: "success" },
    { id: 4, message: "💰 Payment received: $125,000 for Smart City project", time: "1 day ago", unread: false, type: "payment" }
  ]);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    country: '',
    category: '',
    budgetRange: '',
    sortBy: 'similarity'
  });

  // Enhanced filtering logic
  useEffect(() => {
    let filtered = enhancedMockTenders.filter(tender => {
      const matchesSearch = !searchQuery || 
        tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCountry = !filterOptions.country || tender.country === filterOptions.country;
      const matchesCategory = !filterOptions.category || tender.category === filterOptions.category;
      
      return matchesSearch && matchesCountry && matchesCategory;
    });

    // Sort results
    if (filterOptions.sortBy === 'similarity') {
      filtered.sort((a, b) => b.similarity - a.similarity);
    } else if (filterOptions.sortBy === 'budget') {
      filtered.sort((a, b) => b.budget - a.budget);
    } else if (filterOptions.sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    setFilteredTenders(filtered);
  }, [searchQuery, filterOptions]);

  // Enhanced AI proposal generation
  const generateProposal = async (tender) => {
    setIsGenerating(true);
    try {
      // Simulate API call to your backend
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const proposal = `
EXECUTIVE SUMMARY
${profile.companyName} is pleased to submit this comprehensive proposal for "${tender.title}". With ${profile.experience} years of proven experience and a remarkable ${profile.successRate}% success rate across ${profile.completedProjects} completed projects, we bring unparalleled expertise to deliver exceptional results for this ${tender.category.toLowerCase()} initiative.

PROJECT UNDERSTANDING & APPROACH
We understand this project requires ${tender.description.toLowerCase()}. Our technical approach leverages our core competencies in ${tender.requirements.slice(0, 3).join(', ')}, ensuring seamless integration and delivery excellence.

KEY DIFFERENTIATORS
✓ ${profile.successRate}% Project Success Rate
✓ $${(profile.totalRevenue / 1000000).toFixed(1)}M+ in Successfully Delivered Projects  
✓ Certified in ${profile.certifications.slice(0, 2).join(' & ')}
✓ Active in ${profile.countries.length} International Markets
✓ ${profile.recentWins} Recent Contract Wins

TECHNICAL METHODOLOGY
Phase 1: Requirements Analysis & System Design (Weeks 1-4)
- Comprehensive stakeholder consultation
- Technical architecture design
- Risk assessment and mitigation strategies

Phase 2: Development & Implementation (Weeks 5-16)
- Agile development methodology
- Regular milestone reviews and deliverables
- Quality assurance and testing protocols

Phase 3: Deployment & Knowledge Transfer (Weeks 17-20)
- Phased deployment approach
- Comprehensive training programs
- Documentation and support materials

INVESTMENT & VALUE PROPOSITION
Total Project Investment: $${tender.budget.toLocaleString()}
- Competitive pricing with transparent cost structure
- Fixed-price model with performance guarantees
- Post-delivery support and maintenance included

COMPLIANCE & CERTIFICATIONS
Our team maintains current certifications in ${profile.certifications.join(', ')}, ensuring full compliance with industry standards and regulatory requirements specific to ${tender.country}.

TIMELINE COMMITMENT
We commit to delivering this project by ${tender.deadline}, with regular milestone check-ins and progress reporting throughout the engagement.

We look forward to the opportunity to discuss how ${profile.companyName} can exceed your expectations for this critical ${tender.category.toLowerCase()} initiative.

Best regards,
${profile.companyName} Project Team
Contact: ${profile.email}
      `;
      
      setGeneratedProposal(proposal);
    } catch (error) {
      console.error('Error generating proposal:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced dashboard with better metrics
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Proposals</p>
              <p className="text-3xl font-bold">{profile.activeProposals}</p>
              <p className="text-blue-100 text-xs mt-1">+3 this week</p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold">{profile.successRate}%</p>
              <p className="text-green-100 text-xs mt-1">Industry avg: 67%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">${(profile.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-purple-100 text-xs mt-1">Lifetime earnings</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Recent Wins</p>
              <p className="text-3xl font-bold">{profile.recentWins}</p>
              <p className="text-orange-100 text-xs mt-1">Last 30 days</p>
            </div>
            <Award className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">🤖 AI-Powered Recommendations</h3>
            <p className="text-gray-600 text-sm">Personalized tenders based on your profile and success history</p>
          </div>
          <Zap className="h-6 w-6 text-yellow-500" />
        </div>

        <div className="space-y-4">
          {filteredTenders.slice(0, 3).map(tender => (
            <div key={tender.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg text-gray-900">{tender.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tender.similarity >= 0.9 ? 'bg-green-100 text-green-800' :
                      tender.similarity >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {Math.round(tender.similarity * 100)}% Match
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tender.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe className="h-4 w-4 mr-1 text-blue-500" />
                      {tender.country}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                      ${(tender.budget / 1000000).toFixed(1)}M
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                      {tender.timeLeft}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1 text-purple-500" />
                      {tender.bidsCount} bids
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tender.requirements.slice(0, 3).map((req, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {req}
                      </span>
                    ))}
                    {tender.requirements.length > 3 && (
                      <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs">
                        +{tender.requirements.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <button 
                    onClick={() => {setSelectedTender(tender); setActiveTab('ai-proposal');}}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Generate AI Proposal</span>
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

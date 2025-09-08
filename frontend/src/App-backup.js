import React, { useState, useEffect } from 'react';
import { Search, User, FileText, CreditCard, Bell, Star, MapPin, Calendar, DollarSign, Building, Send, Eye, Filter } from 'lucide-react';

// Mock data for demonstration
const mockTenders = [
  {
    id: 1,
    title: "Highway Construction Project - Phase 1",
    description: "Construction of 50km highway with modern infrastructure and safety systems",
    country: "USA",
    budget: 5000000,
    deadline: "2025-01-15",
    category: "Construction",
    requirements: ["Civil Engineering", "Road Construction", "Safety Systems"],
    similarity: 0.92,
    status: "open"
  },
  {
    id: 2,
    title: "IT Infrastructure Modernization",
    description: "Complete overhaul of government IT systems including cloud migration and cybersecurity",
    country: "UK",
    budget: 2500000,
    deadline: "2025-02-28",
    category: "Technology",
    requirements: ["Cloud Computing", "Cybersecurity", "System Integration"],
    similarity: 0.87,
    status: "open"
  },
  {
    id: 3,
    title: "Smart City IoT Implementation",
    description: "Deploy IoT sensors and smart city infrastructure across metropolitan area",
    country: "Singapore",
    budget: 8000000,
    deadline: "2025-03-30",
    category: "Technology",
    requirements: ["IoT", "Smart Systems", "Data Analytics"],
    similarity: 0.84,
    status: "open"
  }
];

const mockProfile = {
  id: 1,
  companyName: "TechBuild Solutions",
  email: "info@techbuild.com",
  capabilities: ["Construction", "Technology", "Project Management"],
  experience: 15,
  completedProjects: 127,
  successRate: 94,
  certifications: ["ISO 9001", "SOC 2", "OSHA Certified"],
  countries: ["USA", "UK", "Canada"]
};

const TenderMarketplace = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTender, setSelectedTender] = useState(null);
  const [profile, setProfile] = useState(mockProfile);
  const [filteredTenders, setFilteredTenders] = useState(mockTenders);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New tender matching your profile: Highway Construction", time: "5 min ago", unread: true },
    { id: 2, message: "Proposal deadline approaching for IT Infrastructure project", time: "1 hour ago", unread: true },
    { id: 3, message: "Payment received for Smart City project", time: "2 hours ago", unread: false }
  ]);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter tenders based on search
  useEffect(() => {
    const filtered = mockTenders.filter(tender => 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTenders(filtered);
  }, [searchQuery]);

  // Simulate AI proposal generation
  const generateProposal = (tender) => {
    setIsGenerating(true);
    setTimeout(() => {
      const proposal = `
PROPOSAL FOR: ${tender.title}

EXECUTIVE SUMMARY
${profile.companyName} is pleased to submit this proposal for ${tender.title}. With ${profile.experience} years of experience and a ${profile.successRate}% success rate across ${profile.completedProjects} completed projects, we are uniquely positioned to deliver this project successfully.

PROJECT UNDERSTANDING
We understand that this project involves ${tender.description.toLowerCase()}. Our team has extensive experience in ${tender.requirements.join(', ')} which directly aligns with your requirements.

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
- Certified in: ${profile.certifications.join(', ')}
- Active in markets: ${profile.countries.join(', ')}

TIMELINE & BUDGET
Based on the project scope, we propose a competitive approach that delivers maximum value within your budget of $${tender.budget.toLocaleString()}.

We look forward to discussing this opportunity further.

Best regards,
${profile.companyName}
      `;
      setGeneratedProposal(proposal);
      setIsGenerating(false);
    }, 2000);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Bids</p>
              <p className="text-3xl font-bold text-blue-900">12</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Won Projects</p>
              <p className="text-3xl font-bold text-green-900">127</p>
            </div>
            <Star className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Success Rate</p>
              <p className="text-3xl font-bold text-yellow-900">94%</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Revenue</p>
              <p className="text-3xl font-bold text-purple-900">$2.4M</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Recommended Tenders</h3>
        <div className="space-y-4">
          {filteredTenders.slice(0, 3).map(tender => (
            <div key={tender.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{tender.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{tender.description}</p>
                  <div className="flex items-center mt-3 space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tender.country}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${tender.budget.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {tender.deadline}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {Math.round(tender.similarity * 100)}% Match
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {setSelectedTender(tender); setActiveTab('tenders');}}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTenders = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tenders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="space-y-4">
        {filteredTenders.map(tender => (
          <div key={tender.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{tender.title}</h3>
                <p className="text-gray-600 mt-2">{tender.description}</p>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{tender.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">${tender.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium">{tender.deadline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{tender.category}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {tender.requirements.map((req, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="ml-6 text-right">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mb-3">
                  {Math.round(tender.similarity * 100)}% Match
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => {setSelectedTender(tender); setActiveTab('ai-proposal');}}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Generate Proposal</span>
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 flex items-center justify-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Company Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => setProfile({...profile, companyName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              value={profile.experience}
              onChange={(e) => setProfile({...profile, experience: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Completed Projects</label>
            <input
              type="number"
              value={profile.completedProjects}
              onChange={(e) => setProfile({...profile, completedProjects: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Core Capabilities</label>
          <div className="flex flex-wrap gap-2">
            {profile.capabilities.map((cap, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {cap}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
          <div className="flex flex-wrap gap-2">
            {profile.certifications.map((cert, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {cert}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Active Markets</label>
          <div className="flex flex-wrap gap-2">
            {profile.countries.map((country, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {country}
              </span>
            ))}
          </div>
        </div>

        <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Update Profile
        </button>
      </div>
    </div>
  );

  const renderAIProposal = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {selectedTender && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">AI Proposal Generator</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900">Selected Tender:</h3>
            <p className="text-blue-800">{selectedTender.title}</p>
            <p className="text-blue-600 text-sm mt-1">{selectedTender.description}</p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Proposal</h3>
            <button
              onClick={() => generateProposal(selectedTender)}
              disabled={isGenerating}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>

          {generatedProposal && (
            <div className="space-y-4">
              <textarea
                value={generatedProposal}
                onChange={(e) => setGeneratedProposal(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              
              <div className="flex space-x-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  Download PDF
                </button>
                <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                  Submit Proposal
                </button>
                <button className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                  Save Draft
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!selectedTender && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No Tender Selected</h3>
          <p className="text-gray-500 mt-2">Select a tender from the marketplace to generate a proposal.</p>
          <button 
            onClick={() => setActiveTab('tenders')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse Tenders
          </button>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Payment Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-900">$2,456,789</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">$145,230</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Available</p>
                <p className="text-2xl font-bold text-blue-900">$89,567</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { id: 1, project: "Highway Construction - Phase 1", amount: 125000, status: "completed", date: "2025-01-05" },
              { id: 2, project: "Smart City IoT Implementation", amount: 87500, status: "pending", date: "2025-01-03" },
              { id: 3, project: "IT Infrastructure Modernization", amount: 65000, status: "processing", date: "2024-12-28" }
            ].map(transaction => (
              <div key={transaction.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">{transaction.project}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${transaction.amount.toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="font-medium">**** **** **** 1234</p>
                  <p className="text-sm text-gray-500">Primary payment method</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600">
              + Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>
        
        <div className="space-y-4">
          {notifications.map(notification => (
            <div key={notification.id} className={`p-4 rounded-lg border ${
              notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TenderHub</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.filter(n => n.unread).length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{profile.companyName}</span>
              </div>
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
                { id: 'dashboard', label: 'Dashboard', icon: Building },
                { id: 'tenders', label: 'Browse Tenders', icon: Search },
                { id: 'ai-proposal', label: 'AI Proposals', icon: FileText },
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'notifications', label: 'Notifications', icon: Bell }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
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
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'tenders' && renderTenders()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'ai-proposal' && renderAIProposal()}
            {activeTab === 'payments' && renderPayments()}
            {activeTab === 'notifications' && renderNotifications()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TenderMarketplace;
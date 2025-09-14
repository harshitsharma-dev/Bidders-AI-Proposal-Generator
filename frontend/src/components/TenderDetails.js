import React, { useEffect, useRef, useState } from "react";
import ApiService from '../services/api';
import {
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Eye,
  FileText,
  Download,
  Send,
  Save,
  Heart,
  HeartOff,
  ChevronLeft,
  Clock,
  Users,
  Shield,
  MessageCircle,
  Bot,
  User,
  Star,
  X,
  Maximize2,
  Minimize2,
  Zap
} from "lucide-react";

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

const TenderDetails = ({
  tender,
  onBack,
  onSaveTender,
  onGenerateProposal,
  onSubmitProposal,
  onDownloadPDF,
  savedTenders,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [proposalGenerated, setProposalGenerated] = useState(false);
  const [proposalContent, setProposalContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [proposalId, setProposalId] = useState(null);

  // Chatbot states
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const isSaved = savedTenders?.includes(tender.id);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Focus chat input when chatbot opens
  useEffect(() => {
    if (showChatbot && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [showChatbot]);

  const generateProposal = async () => {
    setIsGenerating(true)
    setProposalContent("")
    try {
      console.log("Generating proposal for tender: ", tender.title)
      const response = await ApiService.generateProposal(tender,  mockProfile);

      if (response.success && response.proposal) {
        setProposalContent(response.proposal);
        setProposalId(response.id || null);
        setProposalGenerated(true);
        onGenerateProposal?.(tender.id, response.proposal);

        // Auto-show chatbot after generation
        setShowChatbot(true);
        setChatMessages([{
          id: Date.now(),
          type: "bot",
          message: "Great! I've generated your proposal. I'm here to help you refine and improve it. What would you like to adjust?",
          timestamp: new Date(),
          suggestions: [
            "Make it more technical",
            "Add more budget details",
            "Emphasize our experience",
            "Improve the executive summary",
          ]
        }]);
      }
    } catch (error) {
      console.error("Error generating proposal:", error);
      alert("Failed to generate proposal. Please try again.");
    } finally {
      setIsGenerating(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = {
      id: Date.now(),
      type: "user",
      message: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await ApiService.editProposal(proposalId, proposalContent, userMessage.message);

      if (response.success && response.data && response.data.proposal) {
        setProposalContent(response.data.proposal.content);

        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          message: "I've updated your proposal based on your feedback. Take a look and let me know if you'd like any further changes.",
          timestamp: new Date(),
          proposalUpdate: true,
          suggestions: [
            "Add more details to this section",
            "Adjust the timeline",
            "Modify the budget breakdown",
            "Change the tone"
          ]
        };

        setChatMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.message || "Failed to update proposal");
      }
    } catch (error) {
      console.error("Error in chat:", error)

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        message: "Sorry, I encountered an error while updating your proposal. Please try again or rephrase your request.",
        timestamp: new Date(),
        isError: true,
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setChatInput(suggestion);
    chatInputRef.current?.focus();
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }

  const clearChat = () => {
    setChatMessages([{
      id: Date.now(),
      type: "bot",
      message: "Let's start fresh! How would you like to improve your proposal?",
      timestamp: new Date(),
      suggestions: ["Make it more technical", "Add more budget details", "Emphasize our experience", "Improve the executive summary"]
    }])
  }

  const handleDownloadPDF = () => {
    const element = document.createElement("a");
    const file = new Blob([proposalContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `proposal-${tender.title
      .replace(/\s+/g, "-")
      .toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onDownloadPDF?.(tender.id);
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`draft-${tender.id}`, proposalContent);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleSubmitProposal = () => {
    onSubmitProposal?.(tender.id, proposalContent);
    alert("Proposal submitted successfully!");
  };

  // Chat message frontend component
  const ChatMessage = ({ message }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          message.type === 'user' 
            ? 'bg-blue-600 text-white' 
            : message.isError 
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600'
        }`}>
          {message.type === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
        </div>
        
        <div className={`rounded-lg px-3 py-2 ${
          message.type === 'user'
            ? 'bg-blue-600 text-white'
            : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-800'
        }`}>
          <p className="text-xs">{message.message}</p>
          {message.proposalUpdate && (
            <div className="mt-1 text-xs opacity-75">
              ✓ Proposal updated successfully
            </div>
          )}
          
          {message.suggestions && (
            <div className="mt-2 space-y-1">
              <p className="text-xs opacity-75">Quick suggestions:</p>
              <div className="flex flex-wrap gap-1">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs opacity-50 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Tenders
          </button>

          <button
            onClick={() => onSaveTender(tender.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isSaved
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isSaved ? (
              <HeartOff className="h-4 w-4 mr-2" />
            ) : (
              <Heart className="h-4 w-4 mr-2" />
            )}
            {isSaved ? "Remove from Saved" : "Save Tender"}
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                tender.status === "open"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {tender.status.toUpperCase()}
            </span>
            <div className="flex items-center ml-4 text-sm text-gray-500">
              <Star className="h-4 w-4 mr-1 text-yellow-400" />
              {Math.round(tender.similarity * 100)}% Match
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {tender.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{tender.country}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-5 w-5 mr-2" />
            <span>${tender.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{tender.deadline}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>{tender.timeLeft} left</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Eye className="h-4 w-4 mr-1" />
              <span>{tender.bidsCount} bids</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Building className="h-4 w-4 mr-1" />
              <span>{tender.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Project Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            {showFullDescription
              ? tender.description
              : `${tender.description.substring(0, 300)}...`}
          </p>
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showFullDescription ? "Show Less" : "Read More"}
          </button>
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Requirements</h2>
        <div className="flex flex-wrap gap-2">
          {tender.requirements.map((req, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {req}
            </span>
          ))}
        </div>
      </div>

      {/* AI Proposal Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">AI Proposal Generator</h2>

        {!proposalGenerated ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generate AI-Powered Proposal
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI will analyze the tender requirements and generate a
                comprehensive, professional proposal tailored to this
                opportunity.
              </p>
            </div>

            <button
              onClick={generateProposal}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Proposal...
                </div>
              ) : (
                "Generate AI Proposal"
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proposal Content Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Generated Proposal
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveDraft}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                      draftSaved
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {draftSaved ? "Saved!" : "Save"}
                  </button>
                  
                  <button
                    onClick={generateProposal}
                    className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Regenerate
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </button>

                  <button
                    onClick={handleSubmitProposal}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Submit
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto border">
                <pre className="whitespace-pre-wrap text-xs text-gray-800 font-mono">
                  {proposalContent}
                </pre>
              </div>
            </div>

            {/* AI Chat Assistant Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!showChatbot && (
                    <button
                      onClick={() => setShowChatbot(true)}
                      className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Start Chat
                    </button>
                  )}
                  
                  {showChatbot && (
                    <>
                      <button
                        onClick={clearChat}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded"
                      >
                        Clear
                      </button>
                      
                      <button
                        onClick={() => setShowChatbot(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {showChatbot ? (
                <div className="border rounded-lg bg-white h-96 flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chatMessages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    
                    {isChatLoading && (
                      <div className="flex justify-start mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bot className="h-3 w-3 text-gray-600" />
                          </div>
                          <div className="bg-gray-100 rounded-lg px-3 py-2">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="border-t p-3">
                    <div className="flex space-x-2">
                      <textarea
                        ref={chatInputRef}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me to modify your proposal..."
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-purple-500 focus:border-transparent text-xs"
                        rows={2}
                        disabled={isChatLoading}
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg bg-gray-50 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-3">
                      Chat with AI to refine your proposal
                    </p>
                    <button
                      onClick={() => setShowChatbot(true)}
                      className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm mx-auto"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetails;

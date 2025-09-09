import React, { useState } from "react";
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
  Star,
} from "lucide-react";

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

  const isSaved = savedTenders?.includes(tender.id);

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI proposal generation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const generatedProposal = `
EXECUTIVE SUMMARY

We are pleased to submit our comprehensive proposal for "${
        tender.title
      }". Our team brings extensive experience in ${tender.requirements.join(
        ", "
      )}, positioning us as the ideal partner for this critical project.

PROJECT UNDERSTANDING

Based on our analysis of the tender requirements, we understand the scope involves:
${tender.description}

Our approach will ensure compliance with all specified requirements while delivering exceptional value and innovation.

TECHNICAL APPROACH

Our solution framework includes:
${tender.requirements
  .map(
    (req, idx) => `
${idx + 1}. ${req} Implementation
   - Advanced methodologies and best practices
   - Proven technologies and frameworks
   - Quality assurance and testing protocols`
  )
  .join("")}

TEAM COMPOSITION

Our dedicated project team consists of:
- Project Manager: Senior professional with 10+ years experience
- Technical Lead: Expert in ${tender.requirements[0]}
- Specialist Engineers: Domain experts in ${tender.requirements
        .slice(1)
        .join(", ")}
- Quality Assurance Team: Ensuring deliverable excellence

TIMELINE & DELIVERABLES

Phase 1: Project Initiation and Planning (Weeks 1-2)
- Stakeholder alignment and requirement validation
- Detailed project plan development
- Risk assessment and mitigation strategies

Phase 2: Development and Implementation (Weeks 3-10)
- Core system development
- Integration and testing
- User training and documentation

Phase 3: Deployment and Support (Weeks 11-12)
- Production deployment
- Performance monitoring
- Ongoing support and maintenance

BUDGET BREAKDOWN

Our competitive pricing structure:
- Development: ${Math.round(tender.budget * 0.6).toLocaleString()} (60%)
- Project Management: ${Math.round(tender.budget * 0.15).toLocaleString()} (15%)
- Testing & QA: ${Math.round(tender.budget * 0.15).toLocaleString()} (15%)
- Documentation & Training: ${Math.round(
        tender.budget * 0.1
      ).toLocaleString()} (10%)

Total Project Cost: $${tender.budget.toLocaleString()}

RISK MANAGEMENT

We have identified and prepared mitigation strategies for:
- Technical complexity challenges
- Timeline adherence
- Resource availability
- Integration complexities

QUALITY ASSURANCE

Our commitment to quality includes:
- ISO 9001:2015 certified processes
- Comprehensive testing protocols
- Regular quality reviews and audits
- Continuous improvement methodologies

CONCLUSION

We are confident in our ability to deliver this project successfully, on time, and within budget. Our proven track record, technical expertise, and commitment to excellence make us the ideal partner for this engagement.

We look forward to the opportunity to discuss this proposal in detail and answer any questions you may have.

Respectfully submitted,
[Your Company Name]
Project Team
      `;

      setProposalContent(generatedProposal);
      setProposalGenerated(true);
      onGenerateProposal?.(tender.id, generatedProposal);
    } catch (error) {
      console.error("Error generating proposal:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // Create a simple text file for demo (in real app, would generate proper PDF)
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
    // Save proposal as draft
    localStorage.setItem(`draft-${tender.id}`, proposalContent);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleSubmitProposal = () => {
    onSubmitProposal?.(tender.id, proposalContent);
    alert("Proposal submitted successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
              onClick={handleGenerateProposal}
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
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Generated Proposal
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveDraft}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    draftSaved
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {draftSaved ? "Draft Saved!" : "Save Draft"}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>

                <button
                  onClick={handleSubmitProposal}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Proposal
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {proposalContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetails;

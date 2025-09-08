import React, { useState } from "react";
import {
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Star,
  Filter,
  Search,
  Trash2,
  FileText,
} from "lucide-react";

const SavedTenders = ({
  savedTenders,
  allTenders,
  onViewDetails,
  onRemoveSaved,
  onGenerateProposal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterCategory, setFilterCategory] = useState("all");

  // Get saved tender objects
  const savedTenderObjects = allTenders.filter((tender) =>
    savedTenders.includes(tender.id)
  );

  // Filter and sort saved tenders
  const filteredTenders = savedTenderObjects
    .filter((tender) => {
      const matchesSearch =
        tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || tender.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "budget":
          return b.budget - a.budget;
        case "deadline":
          return new Date(a.deadline) - new Date(b.deadline);
        case "similarity":
          return b.similarity - a.similarity;
        default:
          return b.id - a.id;
      }
    });

  const categories = [
    ...new Set(savedTenderObjects.map((tender) => tender.category)),
  ];

  if (savedTenders.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Saved Tenders
        </h3>
        <p className="text-gray-600">
          Browse tenders and save the ones you're interested in to view them
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Tenders</h2>
          <p className="text-gray-600">
            {savedTenders.length} tender{savedTenders.length !== 1 ? "s" : ""}{" "}
            saved
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search saved tenders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="budget">Sort by Budget</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="similarity">Sort by Match</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {filteredTenders.length} of {savedTenders.length} shown
          </div>
        </div>
      </div>

      {/* Saved Tenders List */}
      <div className="space-y-4">
        {filteredTenders.map((tender) => (
          <div
            key={tender.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
                        tender.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tender.status.toUpperCase()}
                    </span>
                    <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {Math.round(tender.similarity * 100)}% Match
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {tender.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tender.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tender.country}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-1" />$
                      {tender.budget.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {tender.deadline}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      {tender.bidsCount} bids
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tender.requirements.slice(0, 3).map((req, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {req}
                      </span>
                    ))}
                    {tender.requirements.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{tender.requirements.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => onViewDetails(tender)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onGenerateProposal(tender)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Generate Proposal
                  </button>

                  <button
                    onClick={() => onRemoveSaved(tender.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTenders.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tenders found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search term or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedTenders;

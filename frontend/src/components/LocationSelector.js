import React, { useState, useEffect } from "react";
import { Globe, MapPin, Search, Filter } from "lucide-react";

const LocationSelector = ({
  onLocationChange,
  onCountryChange,
  selectedCountries = [],
  selectedLocation = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localLocation, setLocalLocation] = useState(selectedLocation);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Available countries for government APIs
  const defaultCountries = [
    { code: "usa", name: "United States", flag: "🇺🇸", api: "SAM.gov" },
    { code: "uk", name: "United Kingdom", flag: "🇬🇧", api: "Find-a-Tender" },
    { code: "canada", name: "Canada", flag: "🇨🇦", api: "BuyandSell.gc.ca" },
    { code: "australia", name: "Australia", flag: "🇦🇺", api: "AusTender" },
  ];

  const popularLocations = [
    "New York, NY",
    "London, UK",
    "Toronto, Canada",
    "Sydney, Australia",
    "Washington, DC",
    "Manchester, UK",
    "Vancouver, Canada",
    "Melbourne, Australia",
    "California",
    "Texas",
    "Ontario",
    "New South Wales",
  ];

  useEffect(() => {
    setAvailableCountries(defaultCountries);
  }, []);

  const handleCountryToggle = (countryCode) => {
    const newSelectedCountries = selectedCountries.includes(countryCode)
      ? selectedCountries.filter((c) => c !== countryCode)
      : [...selectedCountries, countryCode];

    onCountryChange(newSelectedCountries);
  };

  const handleLocationChange = (location) => {
    setLocalLocation(location);
    onLocationChange(location);
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    onLocationChange(localLocation);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Location & Country Selection
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>{isExpanded ? "Collapse" : "Expand"}</span>
        </button>
      </div>

      {/* Country Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Select Countries for Tender Search
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableCountries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleCountryToggle(country.code)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedCountries.includes(country.code)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{country.flag}</div>
                <div className="text-sm font-medium">{country.name}</div>
                <div className="text-xs text-gray-500">{country.api}</div>
              </div>
            </button>
          ))}
        </div>

        {selectedCountries.length === 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              💡 Select at least one country to search government tender
              databases
            </p>
          </div>
        )}
      </div>

      {/* Location Search */}
      {isExpanded && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Specific Location (Optional)
          </h4>

          <form onSubmit={handleLocationSubmit} className="mb-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  placeholder="Enter city, state, or region..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </form>

          {/* Popular Locations */}
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-2">
              Popular Locations
            </h5>
            <div className="flex flex-wrap gap-2">
              {popularLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationChange(location)}
                  className={`px-3 py-2 text-sm rounded-full transition-colors ${
                    localLocation === location
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {localLocation && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                📍 Filtering tenders for: <strong>{localLocation}</strong>
                <button
                  onClick={() => handleLocationChange("")}
                  className="ml-2 text-green-600 hover:text-green-800 underline"
                >
                  Clear
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>Active Filters:</strong>
          <div className="mt-1">
            {selectedCountries.length > 0 ? (
              <span className="text-blue-600">
                Countries:{" "}
                {selectedCountries.map((c) => c.toUpperCase()).join(", ")}
              </span>
            ) : (
              <span className="text-gray-400">No countries selected</span>
            )}
            {localLocation && (
              <span className="text-green-600 ml-3">
                Location: {localLocation}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;

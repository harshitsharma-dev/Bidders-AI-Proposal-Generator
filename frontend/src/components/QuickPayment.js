import React, { useState } from "react";
import { CreditCard, Crown, Zap, Shield, Check, X } from "lucide-react";

const QuickPayment = ({ onPaymentSelect, userSubscription }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const paymentOptions = [
    {
      id: "premium_proposal",
      title: "Premium AI Proposal",
      price: 25,
      description:
        "Get an enhanced AI proposal with market research and competitive analysis",
      icon: Zap,
      color: "blue",
      features: [
        "Advanced AI analysis",
        "Market research included",
        "Competitive insights",
        "Custom formatting",
        "Priority generation",
      ],
    },
    {
      id: "tender_access",
      title: "Premium Tender Access",
      price: 15,
      description: "Unlock premium tender details and insider information",
      icon: Shield,
      color: "green",
      features: [
        "Full tender requirements",
        "Contact information",
        "Bid history data",
        "Success rate insights",
        "Early access notifications",
      ],
    },
    {
      id: "bulk_proposals",
      title: "Bulk Proposal Package",
      price: 99,
      description: "Generate 10 premium proposals at a discounted rate",
      icon: Crown,
      color: "purple",
      features: [
        "10 premium proposals",
        "Save $150 vs individual",
        "Valid for 6 months",
        "Priority queue",
        "Dedicated support",
      ],
      popular: true,
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700",
        accent: "text-blue-600",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        button: "bg-green-600 hover:bg-green-700",
        accent: "text-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        button: "bg-purple-600 hover:bg-purple-700",
        accent: "text-purple-600",
      },
    };
    return colors[color];
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    onPaymentSelect && onPaymentSelect(option);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
            Quick Payment Options
          </h3>
          <p className="text-gray-600 mt-1">
            Unlock premium features instantly
          </p>
        </div>
        {userSubscription && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {userSubscription.name} Plan Active
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const colors = getColorClasses(option.color);
          const isSelected = selectedOption?.id === option.id;

          return (
            <div
              key={option.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? `${colors.border} ring-2 ring-offset-2 ring-current`
                  : "border-gray-200"
              } ${colors.bg}`}
              onClick={() => handleSelectOption(option)}
            >
              {option.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${colors.bg}`}
                >
                  <Icon className={`h-6 w-6 ${colors.accent}`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {option.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {option.description}
                </p>
                <div className="text-2xl font-bold text-gray-900">
                  ${option.price}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    one-time
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                  colors.button
                } ${isSelected ? "ring-2 ring-offset-2 ring-current" : ""}`}
              >
                {isSelected ? "Selected" : `Pay $${option.price}`}
              </button>
            </div>
          );
        })}
      </div>

      {selectedOption && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">
                {selectedOption.title}
              </h4>
              <p className="text-sm text-gray-600">
                Ready to proceed with payment
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-900">
                ${selectedOption.price}
              </span>
              <button
                onClick={() => setSelectedOption(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">
          Accepted Payment Methods
        </h4>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              VISA
            </div>
            <span className="ml-2">Visa</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
              MC
            </div>
            <span className="ml-2">Mastercard</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
              AMEX
            </div>
            <span className="ml-2">American Express</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="ml-1">Secure & Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPayment;

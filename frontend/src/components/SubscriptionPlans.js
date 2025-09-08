import React, { useState } from "react";
import { Check, Star, Zap, Building, Crown } from "lucide-react";

const SubscriptionPlans = ({
  onSelectPlan,
  onCheckout,
  currentPlan = null,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 29,
      icon: Building,
      color: "blue",
      description: "Perfect for small companies getting started",
      features: [
        "10 AI proposals per month",
        "Basic tender matching",
        "Email support",
        "Standard templates",
        "Basic analytics",
      ],
      limitations: ["Limited proposal customization", "Basic support only"],
    },
    {
      id: "professional",
      name: "Professional",
      price: 99,
      icon: Star,
      color: "green",
      popular: true,
      description: "Most popular for growing businesses",
      features: [
        "Unlimited AI proposals",
        "Advanced tender matching",
        "Priority support",
        "Custom templates",
        "Advanced analytics",
        "Team collaboration",
        "Export capabilities",
      ],
      limitations: [],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 299,
      icon: Crown,
      color: "purple",
      description: "For large organizations with custom needs",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Dedicated account manager",
        "White-label solutions",
        "API access",
        "Custom workflows",
        "Advanced security",
        "Training & onboarding",
      ],
      limitations: [],
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);
    if (onCheckout) {
      onCheckout(plan);
    } else {
      onSelectPlan && onSelectPlan(plan);
    }
  };

  const getColorClasses = (color, selected = false) => {
    const colors = {
      blue: {
        border: selected ? "border-blue-500" : "border-blue-200",
        bg: "bg-blue-50",
        text: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700",
      },
      green: {
        border: selected ? "border-green-500" : "border-green-200",
        bg: "bg-green-50",
        text: "text-green-600",
        button: "bg-green-600 hover:bg-green-700",
      },
      purple: {
        border: selected ? "border-purple-500" : "border-purple-200",
        bg: "bg-purple-50",
        text: "text-purple-600",
        button: "bg-purple-600 hover:bg-purple-700",
      },
    };
    return colors[color];
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600">
          Unlock the full potential of AI-powered tender management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const colors = getColorClasses(plan.color, selectedPlan === plan.id);
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                colors.border
              } ${isSelected ? "scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className={`${colors.bg} p-4 rounded-lg mb-6`}>
                  <div className="flex items-center justify-center mb-2">
                    <Icon className={`h-8 w-8 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Billed monthly</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    colors.button
                  } ${isSelected ? "ring-2 ring-offset-2 ring-current" : ""}`}
                >
                  {isSelected ? "Selected" : `Choose ${plan.name}`}
                </button>

                {/* Annual Discount Notice */}
                <p className="text-xs text-center text-gray-500 mt-3">
                  Save 20% with annual billing
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-center mb-6">
          Feature Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="font-medium text-gray-900">Features</div>
          <div className="font-medium text-center text-blue-600">Basic</div>
          <div className="font-medium text-center text-green-600">
            Professional
          </div>
          <div className="font-medium text-center text-purple-600">
            Enterprise
          </div>

          {/* AI Proposals */}
          <div className="text-gray-700">AI Proposals</div>
          <div className="text-center">10/month</div>
          <div className="text-center">Unlimited</div>
          <div className="text-center">Unlimited</div>

          {/* Support */}
          <div className="text-gray-700">Support</div>
          <div className="text-center">Email</div>
          <div className="text-center">Priority</div>
          <div className="text-center">Dedicated</div>

          {/* Analytics */}
          <div className="text-gray-700">Analytics</div>
          <div className="text-center">Basic</div>
          <div className="text-center">Advanced</div>
          <div className="text-center">Custom</div>

          {/* API Access */}
          <div className="text-gray-700">API Access</div>
          <div className="text-center">-</div>
          <div className="text-center">-</div>
          <div className="text-center">✓</div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-1" />
            Instant activation
          </div>
          <div className="flex items-center">
            <Check className="h-4 w-4 mr-1" />
            30-day money back
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1" />
            Cancel anytime
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

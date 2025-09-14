import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Calendar,
  ArrowUp
} from 'lucide-react';

const SubscriptionStatus = ({ onUpgrade }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data.subscription);
      } else if (response.status === 404) {
        // No subscription found
        setSubscription(null);
      } else {
        throw new Error('Failed to fetch subscription details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading subscription details</span>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="mb-4">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 mb-4">
            Subscribe to generate and download AI proposals. Choose from our Base Plan ($20/month + GST) with 5 proposals or Premium Plan ($100/month + GST) with 20 proposals.
          </p>
          <button
            onClick={onUpgrade}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const proposalUsagePercentage = (subscription.proposalsGenerated / subscription.proposalLimit) * 100;
  const downloadUsagePercentage = (subscription.downloadsUsed / subscription.proposalLimit) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {subscription.planType.charAt(0) + subscription.planType.slice(1).toLowerCase()} Plan
              </h3>
              <p className="text-sm text-gray-600">
                {subscription.planType === 'BASE' ? '$20/month + GST' : '$100/month + GST'} • Active until {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Upgrade
          </button>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proposal Generation Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium text-gray-900">AI Proposals</span>
              </div>
              <span className={`text-sm font-medium ${getUsageColor(proposalUsagePercentage)}`}>
                {subscription.proposalsGenerated} / {subscription.proposalLimit}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(proposalUsagePercentage)}`}
                style={{ width: `${Math.min(proposalUsagePercentage, 100)}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-600">
              {subscription.remainingProposals} proposals remaining this month
            </p>
          </div>

          {/* Download Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium text-gray-900">Downloads</span>
              </div>
              <span className={`text-sm font-medium ${getUsageColor(downloadUsagePercentage)}`}>
                {subscription.downloadsUsed} / {subscription.proposalLimit}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(downloadUsagePercentage)}`}
                style={{ width: `${Math.min(downloadUsagePercentage, 100)}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-600">
              {subscription.remainingDownloads} downloads remaining this month
            </p>
          </div>
        </div>

        {/* Billing Period */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              Current billing period: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
            </span>
          </div>
        </div>

        {/* Usage Warnings */}
        {(proposalUsagePercentage >= 80 || downloadUsagePercentage >= 80) && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Usage Alert</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You're approaching your monthly limits. 
                  {subscription.planType === 'BASE' 
                    ? ' Consider upgrading to Premium Plan ($100/month + GST) for 20 proposals and downloads.'
                    : ' You\'ll need to wait for the next billing cycle or contact support for additional capacity.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {subscription.recentUsage && subscription.recentUsage.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Recent Activity
            </h4>
            <div className="space-y-2">
              {subscription.recentUsage.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {activity.type === 'PROPOSAL_GENERATION' ? (
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    ) : (
                      <Download className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <span className="text-gray-600">{activity.description}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;

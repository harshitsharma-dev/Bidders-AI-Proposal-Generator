import React, { useState } from 'react';
import { AlertCircle, Download, CreditCard, ArrowRight } from 'lucide-react';
import subscriptionService from '../services/subscriptionService';

const DownloadProtection = ({ proposalId, onUpgrade, onCancel }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [eligibility, setEligibility] = useState(null);

  const checkEligibilityAndDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      // Check download eligibility first
      const eligibilityResult = await subscriptionService.checkDownloadEligibility();
      
      if (!eligibilityResult.data.eligibility.canDownload) {
        setEligibility(eligibilityResult.data.eligibility);
        setIsDownloading(false);
        return;
      }

      // If eligible, proceed with download
      const downloadResult = await subscriptionService.downloadProposal(proposalId);
      
      // Handle successful download
      window.open(downloadResult.data.downloadUrl, '_blank');
      
      // Close the modal
      onCancel();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (eligibility && !eligibility.canDownload) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Subscription Required
                </h3>
                <p className="text-sm text-gray-600">
                  {eligibility.requiresSubscription 
                    ? "You need an active subscription to download proposals"
                    : eligibility.reason}
                </p>
              </div>
            </div>

            {/* Usage Stats */}
            {eligibility.limit && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Downloads Used</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {eligibility.used || 0} / {eligibility.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${((eligibility.used || 0) / eligibility.limit) * 100}%` }}
                  ></div>
                </div>
                {eligibility.planType && (
                  <p className="text-xs text-gray-500 mt-2">
                    Current Plan: {eligibility.planType} ({eligibility.limit} downloads/month)
                  </p>
                )}
              </div>
            )}

            {/* No Subscription Message */}
            {eligibility.requiresSubscription && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Choose a subscription plan:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Base Plan ($20/month + GST):</strong> 5 downloads</li>
                  <li>• <strong>Premium Plan ($100/month + GST):</strong> 20 downloads</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onUpgrade}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {eligibility.requiresSubscription ? 'Subscribe Now' : 'Upgrade Plan'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Download Proposal
              </h3>
              <p className="text-sm text-gray-600">
                Confirm proposal download
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Info */}
          <p className="text-sm text-gray-600 mb-6">
            This will count towards your monthly download limit. The proposal will be downloaded as a PDF file.
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isDownloading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={checkEligibilityAndDownload}
              disabled={isDownloading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadProtection;

// services/subscriptionService.js
import apiService from './api';

class SubscriptionService {
  // Create new subscription
  async createSubscription(planType, paymentMethodId, customerEmail) {
    try {
      const response = await apiService.post('/api/subscriptions', {
        planType,
        paymentMethodId,
        customerEmail
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create subscription');
    }
  }

  // Get current subscription
  async getSubscription() {
    try {
      const response = await apiService.get('/api/subscriptions');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No subscription found
      }
      throw new Error(error.response?.data?.message || 'Failed to get subscription');
    }
  }

  // Get usage analytics
  async getUsageAnalytics() {
    try {
      const response = await apiService.get('/api/subscriptions/analytics');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get usage analytics');
    }
  }

  // Check proposal generation eligibility
  async checkProposalEligibility() {
    try {
      const response = await apiService.get('/api/subscriptions/eligibility/proposals');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check proposal eligibility');
    }
  }

  // Check download eligibility
  async checkDownloadEligibility() {
    try {
      const response = await apiService.get('/api/subscriptions/eligibility/downloads');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check download eligibility');
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await apiService.delete('/api/subscriptions');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }

  // Download proposal
  async downloadProposal(proposalId) {
    try {
      const response = await apiService.post(`/api/proposals/${proposalId}/download`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        // Handle subscription limit reached
        throw new Error(error.response?.data?.message || 'Download limit reached');
      }
      throw new Error(error.response?.data?.message || 'Failed to download proposal');
    }
  }

  // Generate proposal with subscription check
  async generateProposal(proposalData) {
    try {
      const response = await apiService.post('/api/proposals/generate', proposalData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        // Handle subscription limit reached
        throw new Error(error.response?.data?.message || 'Proposal generation limit reached');
      }
      throw new Error(error.response?.data?.message || 'Failed to generate proposal');
    }
  }
}

export default new SubscriptionService();

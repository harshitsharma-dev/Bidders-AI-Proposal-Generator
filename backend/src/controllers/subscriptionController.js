// controllers/subscriptionController.js
const subscriptionService = require('../services/subscriptionService');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class SubscriptionController {
  // Create new subscription
  static async createSubscription(req, res) {
    try {
      const { planType, paymentMethodId, customerEmail } = req.body;
      const companyId = req.user.companyId; // Assuming this is set in auth middleware

      if (!planType || !paymentMethodId || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Plan type, payment method, and email are required'
        });
      }

      if (!['BASE', 'PREMIUM'].includes(planType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type. Must be BASE or PREMIUM'
        });
      }

      const result = await subscriptionService.createSubscription(
        companyId,
        planType,
        customerEmail,
        paymentMethodId
      );

      res.json({
        success: true,
        message: 'Subscription created successfully',
        data: {
          subscription: result.subscription,
          clientSecret: result.clientSecret
        }
      });

    } catch (error) {
      console.error('Error creating subscription:', error);
      
      if (error.message.includes('already has an active subscription')) {
        return res.status(409).json({
          success: false,
          message: 'Company already has an active subscription'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get subscription details
  static async getSubscription(req, res) {
    try {
      const companyId = req.user.companyId;

      const subscription = await subscriptionService.getSubscriptionDetails(companyId);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No active subscription found'
        });
      }

      res.json({
        success: true,
        data: { subscription }
      });

    } catch (error) {
      console.error('Error getting subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription details'
      });
    }
  }

  // Check proposal generation eligibility
  static async checkProposalEligibility(req, res) {
    try {
      const companyId = req.user.companyId;

      const eligibility = await subscriptionService.canGenerateProposal(companyId);

      res.json({
        success: true,
        data: { eligibility }
      });

    } catch (error) {
      console.error('Error checking proposal eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check proposal eligibility'
      });
    }
  }

  // Check download eligibility
  static async checkDownloadEligibility(req, res) {
    try {
      const companyId = req.user.companyId;

      const eligibility = await subscriptionService.canDownloadProposal(companyId);

      res.json({
        success: true,
        data: { eligibility }
      });

    } catch (error) {
      console.error('Error checking download eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check download eligibility'
      });
    }
  }

  // Cancel subscription
  static async cancelSubscription(req, res) {
    try {
      const companyId = req.user.companyId;

      await subscriptionService.cancelSubscription(companyId);

      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }

  // Handle Stripe webhooks
  static async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      await subscriptionService.handleSubscriptionWebhook(event);

      res.json({ received: true });

    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to handle webhook'
      });
    }
  }

  // Get usage analytics
  static async getUsageAnalytics(req, res) {
    try {
      const companyId = req.user.companyId;
      const { startDate, endDate } = req.query;

      // Get subscription details with usage
      const subscription = await subscriptionService.getSubscriptionDetails(companyId);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No active subscription found'
        });
      }

      // Calculate usage percentages
      const proposalUsagePercentage = (subscription.proposalsGenerated / subscription.proposalLimit) * 100;
      const downloadUsagePercentage = (subscription.downloadsUsed / subscription.proposalLimit) * 100;

      const analytics = {
        currentPlan: subscription.planType,
        billingPeriod: {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd
        },
        proposalUsage: {
          used: subscription.proposalsGenerated,
          limit: subscription.proposalLimit,
          remaining: subscription.remainingProposals,
          percentage: Math.round(proposalUsagePercentage)
        },
        downloadUsage: {
          used: subscription.downloadsUsed,
          limit: subscription.proposalLimit,
          remaining: subscription.remainingDownloads,
          percentage: Math.round(downloadUsagePercentage)
        },
        recentActivity: subscription.recentUsage
      };

      res.json({
        success: true,
        data: { analytics }
      });

    } catch (error) {
      console.error('Error getting usage analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get usage analytics'
      });
    }
  }
}

module.exports = SubscriptionController;

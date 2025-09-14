const express = require('express');
const { body } = require('express-validator');
const { authenticateUser } = require('../middleware/auth');
const SubscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Get subscription plans (public route)
router.get('/plans', SubscriptionController.getPlans);

// Create subscription (requires authentication)
router.post('/create',
  authenticateUser,
  [
    body('planType')
      .isIn(['BASE', 'PREMIUM'])
      .withMessage('Plan type must be either BASE or PREMIUM')
  ],
  SubscriptionController.createSubscription
);

// Get user subscription (requires authentication)
router.get('/user', authenticateUser, SubscriptionController.getUserSubscription);

// Check download eligibility (requires authentication)
router.get('/eligibility', authenticateUser, SubscriptionController.checkDownloadEligibility);

// Record download (requires authentication)
router.post('/record-download',
  authenticateUser,
  [
    body('proposalId')
      .notEmpty()
      .withMessage('Proposal ID is required')
  ],
  SubscriptionController.recordDownload
);

// Cancel subscription (requires authentication)
router.post('/cancel', authenticateUser, SubscriptionController.cancelSubscription);

// Get usage analytics (requires authentication)
router.get('/analytics', authenticateUser, SubscriptionController.getUsageAnalytics);

// Stripe webhook (no authentication required - uses webhook signature)
router.post('/webhook', 
  express.raw({ type: 'application/json' }), 
  SubscriptionController.handleWebhook
);

module.exports = router;

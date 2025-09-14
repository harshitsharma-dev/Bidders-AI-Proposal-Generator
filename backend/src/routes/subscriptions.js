// routes/subscriptions.js
const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/subscriptionController');
const { authenticateUser } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

// Create subscription
router.post('/', SubscriptionController.createSubscription);

// Get current subscription
router.get('/', SubscriptionController.getSubscription);

// Get usage analytics
router.get('/analytics', SubscriptionController.getUsageAnalytics);

// Check proposal generation eligibility
router.get('/eligibility/proposals', SubscriptionController.checkProposalEligibility);

// Check download eligibility
router.get('/eligibility/downloads', SubscriptionController.checkDownloadEligibility);

// Cancel subscription
router.delete('/', SubscriptionController.cancelSubscription);

// Webhook endpoint (no auth required)
router.post('/webhook', express.raw({type: 'application/json'}), SubscriptionController.handleWebhook);

module.exports = router;

// services/subscriptionService.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Only initialize Prisma if DATABASE_URL is properly configured
let prisma = null;
try {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('username:password')) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } else {
    console.log('⚠️  Database not configured - Subscription service running in mock mode');
  }
} catch (error) {
  console.log('⚠️  Prisma not available - Subscription service running in mock mode');
}

class SubscriptionService {
  constructor() {
    this.stripe = stripe;
  }

  // Create subscription with proper pricing
  async createSubscription(companyId, planType, customerEmail, paymentMethodId) {
    try {
      // Plan configuration - Updated pricing per requirements
      const planConfig = {
        BASE: {
          price: 20, // $20 USD base price
          proposalLimit: 5, // 5 AI proposal generations per month
          downloadLimit: 5, // 5 proposal downloads per month
          stripePriceId: process.env.STRIPE_BASE_PRICE_ID || 'price_base_plan',
          description: 'Base Plan - 5 AI proposals and downloads per month'
        },
        PREMIUM: {
          price: 100, // $100 USD base price  
          proposalLimit: 20, // 20 AI proposal generations per month
          downloadLimit: 20, // 20 proposal downloads per month
          stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_plan',
          description: 'Premium Plan - 20 AI proposals and downloads per month'
        }
      };

      const plan = planConfig[planType];
      if (!plan) {
        throw new Error('Invalid plan type');
      }

      // Create or retrieve Stripe customer
      let customer;
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { user: true }
      });

      if (!company) {
        throw new Error('Company not found');
      }

      // Check if customer already exists
      const existingSubscription = await prisma.subscription.findFirst({
        where: { 
          companyId,
          status: 'ACTIVE'
        }
      });

      if (existingSubscription) {
        throw new Error('Company already has an active subscription');
      }

      // Create Stripe customer
      customer = await this.stripe.customers.create({
        email: customerEmail,
        name: company.companyName,
        metadata: {
          companyId: companyId,
          userId: company.userId
        }
      });

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set as default payment method
      await this.stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

        // Calculate amount with GST (10% - adjust as needed for your jurisdiction)
        const baseAmount = plan.price * 100; // Convert to cents
        const gstRate = 0.10; // 10% GST - adjust based on your tax requirements
        const gstAmount = Math.round(baseAmount * gstRate);
        const totalAmount = baseAmount + gstAmount;      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planType} Plan`,
              description: plan.description,
              metadata: {
                proposals_limit: plan.proposalLimit.toString(),
                downloads_limit: plan.downloadLimit.toString()
              }
            },
            unit_amount: totalAmount,
            recurring: {
              interval: 'month'
            }
          }
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          companyId: companyId,
          planType: planType
        }
      });

      // Save subscription to database
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      const dbSubscription = await prisma.subscription.create({
        data: {
          companyId: companyId,
          planType: planType,
          status: 'ACTIVE',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customer.id,
          currentPeriodStart: currentPeriodStart,
          currentPeriodEnd: currentPeriodEnd,
          proposalLimit: plan.proposalLimit,
          downloadsUsed: 0,
          proposalsGenerated: 0,
          amount: BigInt(totalAmount),
          currency: 'USD'
        }
      });

      return {
        subscription: dbSubscription,
        stripeSubscription: subscription,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Check if user can generate proposal
  async canGenerateProposal(companyId) {
    try {
      if (!prisma) {
        // Mock response for development
        return {
          canGenerate: true,
          used: 0,
          limit: 5,
          remaining: 5
        };
      }

      const subscription = await prisma.subscription.findFirst({
        where: {
          companyId: companyId,
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: new Date()
          }
        }
      });

      if (!subscription) {
        return {
          canGenerate: false,
          reason: 'No active subscription found. Please subscribe to generate AI proposals.',
          requiresSubscription: true
        };
      }

      if (subscription.proposalsGenerated >= subscription.proposalLimit) {
        return {
          canGenerate: false,
          reason: `Monthly proposal generation limit of ${subscription.proposalLimit} reached. Upgrade your plan for more proposals.`,
          used: subscription.proposalsGenerated,
          limit: subscription.proposalLimit,
          planType: subscription.planType
        };
      }

      return {
        canGenerate: true,
        used: subscription.proposalsGenerated,
        limit: subscription.proposalLimit,
        remaining: subscription.proposalLimit - subscription.proposalsGenerated,
        planType: subscription.planType
      };

    } catch (error) {
      console.error('Error checking proposal generation eligibility:', error);
      throw error;
    }
  }

  // Check if user can download proposal
  async canDownloadProposal(companyId) {
    try {
      if (!prisma) {
        // Mock response for development
        return {
          canDownload: true,
          used: 0,
          limit: 5,
          remaining: 5
        };
      }

      const subscription = await prisma.subscription.findFirst({
        where: {
          companyId: companyId,
          status: 'ACTIVE',
          currentPeriodEnd: {
            gte: new Date()
          }
        }
      });

      if (!subscription) {
        return {
          canDownload: false,
          reason: 'No active subscription found. Please subscribe to download proposals.',
          requiresSubscription: true
        };
      }

      // Both BASE and PREMIUM plans use proposalLimit for downloads
      // BASE: 5 downloads, PREMIUM: 20 downloads
      if (subscription.downloadsUsed >= subscription.proposalLimit) {
        return {
          canDownload: false,
          reason: `Monthly download limit of ${subscription.proposalLimit} reached. Upgrade your plan for more downloads.`,
          used: subscription.downloadsUsed,
          limit: subscription.proposalLimit,
          planType: subscription.planType
        };
      }

      return {
        canDownload: true,
        used: subscription.downloadsUsed,
        limit: subscription.proposalLimit,
        remaining: subscription.proposalLimit - subscription.downloadsUsed,
        planType: subscription.planType
      };

    } catch (error) {
      console.error('Error checking download eligibility:', error);
      throw error;
    }
  }

  // Record proposal generation
  async recordProposalGeneration(companyId, proposalId) {
    try {
      if (!prisma) {
        console.log(`📊 Mock: Recorded proposal generation for company ${companyId}, proposal ${proposalId}`);
        return true;
      }

      const subscription = await prisma.subscription.findFirst({
        where: {
          companyId: companyId,
          status: 'ACTIVE'
        }
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Update subscription usage
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          proposalsGenerated: {
            increment: 1
          }
        }
      });

      // Create usage record
      await prisma.usageRecord.create({
        data: {
          companyId: companyId,
          subscriptionId: subscription.id,
          type: 'PROPOSAL_GENERATION',
          proposalId: proposalId,
          description: 'AI proposal generated'
        }
      });

      return true;
    } catch (error) {
      console.error('Error recording proposal generation:', error);
      throw error;
    }
  }

  // Record proposal download
  async recordProposalDownload(companyId, proposalId) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          companyId: companyId,
          status: 'ACTIVE'
        }
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Update subscription usage
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          downloadsUsed: {
            increment: 1
          }
        }
      });

      // Update proposal download timestamp
      await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          downloadedAt: new Date()
        }
      });

      // Create usage record
      await prisma.usageRecord.create({
        data: {
          companyId: companyId,
          subscriptionId: subscription.id,
          type: 'PROPOSAL_DOWNLOAD',
          proposalId: proposalId,
          description: 'Proposal downloaded'
        }
      });

      return true;
    } catch (error) {
      console.error('Error recording proposal download:', error);
      throw error;
    }
  }

  // Get subscription details
  async getSubscriptionDetails(companyId) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          companyId: companyId,
          status: 'ACTIVE'
        },
        include: {
          usageRecords: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!subscription) {
        return null;
      }

      return {
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        proposalLimit: subscription.proposalLimit,
        proposalsGenerated: subscription.proposalsGenerated,
        downloadsUsed: subscription.downloadsUsed,
        remainingProposals: subscription.proposalLimit - subscription.proposalsGenerated,
        remainingDownloads: subscription.proposalLimit - subscription.downloadsUsed,
        recentUsage: subscription.usageRecords
      };

    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(companyId) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          companyId: companyId,
          status: 'ACTIVE'
        }
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Cancel with Stripe
      if (subscription.stripeSubscriptionId) {
        await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }

      // Update in database
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED'
        }
      });

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Handle Stripe webhook for subscription events
  async handleSubscriptionWebhook(event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleSuccessfulPayment(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handleFailedPayment(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;
      }
    } catch (error) {
      console.error('Error handling subscription webhook:', error);
      throw error;
    }
  }

  async handleSuccessfulPayment(invoice) {
    const subscriptionId = invoice.subscription;
    
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'ACTIVE' }
    });
  }

  async handleFailedPayment(invoice) {
    const subscriptionId = invoice.subscription;
    
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'PAST_DUE' }
    });
  }

  async handleSubscriptionCancellation(subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'CANCELLED' }
    });
  }

  async handleSubscriptionUpdate(subscription) {
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        currentPeriodStart,
        currentPeriodEnd,
        status: subscription.status.toUpperCase()
      }
    });
  }
}

module.exports = new SubscriptionService();

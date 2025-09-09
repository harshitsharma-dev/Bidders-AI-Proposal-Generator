// services/paymentService.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { db } = require("../config/firebase");

class PaymentService {
  constructor() {
    this.stripe = stripe;
    this.collection = "payments";
  }

  // Enhanced payment intent creation with Firebase logging
  async createPaymentIntent(amount, currency = "usd", metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe expects cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store payment record in Firebase
      await this.savePaymentRecord({
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        status: "pending",
        metadata: metadata,
        createdAt: new Date().toISOString(),
      });

      return {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: currency,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }

  // Create Stripe customer
  async createCustomer(email, name, companyName) {
    try {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          company_name: companyName,
        },
      });

      return customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  // Create subscription for premium features
  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: metadata,
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      // Store subscription record
      await this.saveSubscriptionRecord({
        subscriptionId: subscription.id,
        customerId: customerId,
        priceId: priceId,
        status: subscription.status,
        metadata: metadata,
        createdAt: new Date().toISOString(),
      });

      return {
        subscription_id: subscription.id,
        client_secret: subscription.latest_invoice.payment_intent.client_secret,
      };
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSuccess(event.data.object);
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentFailed(event.data.object);
          break;

        case "invoice.payment_succeeded":
          await this.handleSubscriptionPayment(event.data.object);
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionCancellation(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error("Error handling webhook:", error);
      throw error;
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(paymentIntent) {
    try {
      await this.updatePaymentRecord(paymentIntent.id, {
        status: "succeeded",
        paidAt: new Date().toISOString(),
      });

      // Grant access based on payment metadata
      if (paymentIntent.metadata.type === "tender_submission") {
        await this.grantTenderAccess(paymentIntent.metadata);
      } else if (paymentIntent.metadata.type === "premium_proposal") {
        await this.grantPremiumAccess(paymentIntent.metadata);
      }

      console.log("Payment succeeded:", paymentIntent.id);
    } catch (error) {
      console.error("Error handling payment success:", error);
      throw error;
    }
  }

  // Handle failed payment
  async handlePaymentFailed(paymentIntent) {
    try {
      await this.updatePaymentRecord(paymentIntent.id, {
        status: "failed",
        failedAt: new Date().toISOString(),
      });

      console.log("Payment failed:", paymentIntent.id);
    } catch (error) {
      console.error("Error handling payment failure:", error);
      throw error;
    }
  }

  // Grant access methods
  async grantTenderAccess(metadata) {
    console.log("Granting tender access for:", metadata);
    // Implementation would update user permissions in Firebase
  }

  async grantPremiumAccess(metadata) {
    console.log("Granting premium access for:", metadata);
    // Implementation would update user premium status
  }

  // Firebase operations
  async savePaymentRecord(paymentData) {
    try {
      const docRef = await db.collection(this.collection).add(paymentData);
      return docRef.id;
    } catch (error) {
      console.error("Error saving payment record:", error);
      throw error;
    }
  }

  async updatePaymentRecord(paymentIntentId, updateData) {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("paymentIntentId", "==", paymentIntentId)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await doc.ref.update({
          ...updateData,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating payment record:", error);
      throw error;
    }
  }

  async saveSubscriptionRecord(subscriptionData) {
    try {
      const docRef = await db.collection("subscriptions").add(subscriptionData);
      return docRef.id;
    } catch (error) {
      console.error("Error saving subscription record:", error);
      throw error;
    }
  }

  // Existing methods (enhanced)
  async createConnectedAccount(companyData) {
    return await stripe.accounts.create({
      type: "standard",
      country: companyData.country,
      email: companyData.email,
      business_type: "company",
      company: {
        name: companyData.company_name,
      },
    });
  }

  async transferFunds(destinationAccount, amount, currency = "usd") {
    return await stripe.transfers.create({
      amount: amount * 100,
      currency,
      destination: destinationAccount,
    });
  }

  // Get payment history
  async getPaymentHistory(customerId) {
    try {
      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 100,
      });

      return payments.data;
    } catch (error) {
      console.error("Error getting payment history:", error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);

      await this.updateSubscriptionRecord(subscriptionId, {
        status: "canceled",
        canceledAt: new Date().toISOString(),
      });

      return subscription;
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  }
}

module.exports = new PaymentService();

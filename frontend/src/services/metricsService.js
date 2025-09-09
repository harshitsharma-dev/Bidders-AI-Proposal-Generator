// MetricsService - Handles dashboard metrics calculations and updates
class MetricsService {
  constructor() {
    this.metrics = {
      activeProposals: 0,
      recentWins: 0,
      successRate: 0,
      totalRevenue: 0,
      completedProjects: 0,
      savedTenders: 0,
      submittedProposals: 0,
      responsesReceived: 0,
      averageResponseTime: 0,
    };

    this.loadMetrics();
  }

  // Load metrics from localStorage
  loadMetrics() {
    const savedMetrics = localStorage.getItem("userMetrics");
    if (savedMetrics) {
      this.metrics = { ...this.metrics, ...JSON.parse(savedMetrics) };
    }
  }

  // Save metrics to localStorage
  saveMetrics() {
    localStorage.setItem("userMetrics", JSON.stringify(this.metrics));
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Update active proposals when a proposal is submitted
  updateActiveProposals(increment = true) {
    if (increment) {
      this.metrics.activeProposals += 1;
      this.metrics.submittedProposals += 1;
    } else {
      this.metrics.activeProposals = Math.max(
        0,
        this.metrics.activeProposals - 1
      );
    }
    this.saveMetrics();
    return this.metrics.activeProposals;
  }

  // Update recent wins when a proposal is accepted
  updateRecentWins(projectValue = 0) {
    this.metrics.recentWins += 1;
    this.metrics.totalRevenue += projectValue;
    this.metrics.completedProjects += 1;
    this.metrics.activeProposals = Math.max(
      0,
      this.metrics.activeProposals - 1
    );

    // Recalculate success rate
    this.updateSuccessRate();
    this.saveMetrics();
    return this.metrics.recentWins;
  }

  // Update success rate based on wins vs submissions
  updateSuccessRate() {
    if (this.metrics.submittedProposals > 0) {
      this.metrics.successRate = Math.round(
        (this.metrics.recentWins / this.metrics.submittedProposals) * 100
      );
    }
    this.saveMetrics();
    return this.metrics.successRate;
  }

  // Update saved tenders count
  updateSavedTenders(savedTendersArray) {
    this.metrics.savedTenders = savedTendersArray.length;
    this.saveMetrics();
    return this.metrics.savedTenders;
  }

  // Add response received (when client responds to proposal)
  addResponse(responseTimeInDays = 3) {
    this.metrics.responsesReceived += 1;

    // Update average response time
    const totalResponseTime =
      this.metrics.averageResponseTime * (this.metrics.responsesReceived - 1) +
      responseTimeInDays;
    this.metrics.averageResponseTime = parseFloat(
      (totalResponseTime / this.metrics.responsesReceived).toFixed(1)
    );

    this.saveMetrics();
    return this.metrics.responsesReceived;
  }

  // Simulate business growth over time
  simulateGrowth() {
    // Add some random activity to make dashboard look active
    const activities = [
      () => this.updateActiveProposals(true),
      () => this.addResponse(Math.floor(Math.random() * 5) + 1),
      () => {
        if (Math.random() > 0.7) {
          // 30% chance of winning
          this.updateRecentWins(Math.floor(Math.random() * 500000) + 50000);
        }
      },
    ];

    // Randomly execute one activity
    const randomActivity =
      activities[Math.floor(Math.random() * activities.length)];
    randomActivity();
  }

  // Reset metrics (for testing or new users)
  resetMetrics() {
    this.metrics = {
      activeProposals: 0,
      recentWins: 0,
      successRate: 0,
      totalRevenue: 0,
      completedProjects: 0,
      savedTenders: 0,
      submittedProposals: 0,
      responsesReceived: 0,
      averageResponseTime: 0,
    };
    this.saveMetrics();
  }

  // Initialize with some baseline data for new users
  initializeBaseline() {
    if (this.metrics.submittedProposals === 0) {
      this.metrics = {
        activeProposals: 3,
        recentWins: 2,
        successRate: 67,
        totalRevenue: 1250000,
        completedProjects: 8,
        savedTenders: 0,
        submittedProposals: 12,
        responsesReceived: 10,
        averageResponseTime: 2.3,
      };
      this.saveMetrics();
    }
  }

  // Get personalized insights based on current metrics
  getInsights() {
    const insights = [];

    if (this.metrics.successRate > 80) {
      insights.push({
        type: "positive",
        title: "Excellent Performance",
        message: `Your ${this.metrics.successRate}% success rate is exceptional!`,
      });
    } else if (this.metrics.successRate < 50) {
      insights.push({
        type: "improvement",
        title: "Opportunity for Growth",
        message:
          "Consider refining your proposal strategy to improve success rate.",
      });
    }

    if (this.metrics.activeProposals > 10) {
      insights.push({
        type: "warning",
        title: "High Workload",
        message: `You have ${this.metrics.activeProposals} active proposals. Consider capacity planning.`,
      });
    }

    if (this.metrics.averageResponseTime < 2) {
      insights.push({
        type: "positive",
        title: "Quick Responses",
        message: `Your ${this.metrics.averageResponseTime} day average response time is excellent!`,
      });
    }

    return insights;
  }

  // Get market performance compared to industry averages
  getMarketComparison() {
    return {
      successRate: {
        user: this.metrics.successRate,
        industry: 78,
        comparison: this.metrics.successRate > 78 ? "above" : "below",
      },
      responseTime: {
        user: this.metrics.averageResponseTime,
        industry: 3.2,
        comparison:
          this.metrics.averageResponseTime < 3.2 ? "better" : "slower",
      },
      projectValue: {
        user:
          this.metrics.completedProjects > 0
            ? Math.round(
                this.metrics.totalRevenue / this.metrics.completedProjects
              )
            : 0,
        industry: 156000,
        comparison:
          this.metrics.totalRevenue / this.metrics.completedProjects > 156000
            ? "above"
            : "below",
      },
    };
  }
}

// Create and export a singleton instance
const metricsService = new MetricsService();
export default metricsService;

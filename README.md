# TenderForge 🔨

**AI-Powered Tender Marketplace Platform**

TenderForge is a comprehensive platform that connects contractors with government and private sector tender opportunities worldwide, powered by artificial intelligence to forge winning proposals.

## 🚀 Features

### Core Platform
- **Global Tender Discovery**: Access tenders from USA (SAM.gov), UK (Find-a-Tender), Canada (BuyandSell.gc.ca), and Australia (AusTender)
- **AI-Powered Matching**: Intelligent tender matching based on your capabilities and experience
- **Real-time Data**: Live tender feeds from government APIs
- **Multi-country Support**: Browse opportunities across multiple jurisdictions

### AI Proposal Generation
- **Smart Proposals**: AI generates comprehensive, professional proposals tailored to each tender
- **PDF Export**: Download generated proposals as formatted documents
- **Draft Management**: Save and edit proposal drafts
- **One-click Submission**: Submit proposals directly through the platform

### User Management
- **Firebase Authentication**: Secure user accounts with email/password and Google sign-in
- **Personalized Dashboard**: Custom dashboard showing relevant metrics and opportunities
- **Profile Management**: Professional profiles with capabilities, experience, and preferences
- **Saved Tenders**: Bookmark interesting opportunities for later review

### Payment & Subscriptions
- **Flexible Plans**: Multiple subscription tiers with different feature sets
- **Stripe Integration**: Secure payment processing with comprehensive checkout
- **Payment History**: Track all transactions and billing information
- **Usage Analytics**: Monitor your platform usage and ROI

### Analytics & Insights
- **Performance Metrics**: Track proposal success rates, response times, and revenue
- **Market Intelligence**: Industry comparisons and competitive analysis
- **Growth Tracking**: Monitor business development over time
- **AI Recommendations**: Smart suggestions for improving success rates

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first styling framework
- **Lucide Icons** - Beautiful, customizable icons
- **Stripe Elements** - Secure payment forms
- **Firebase SDK** - Authentication and user management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma ORM** - Database management and queries
- **Government APIs** - Direct integration with official tender sources
- **JWT Authentication** - Secure API endpoints
- **Stripe API** - Payment processing

### Database
- **PostgreSQL** - Primary database for user data and preferences
- **Firebase Firestore** - User profiles and authentication data
- **Government APIs** - Live tender data sources

## 📁 Project Structure

```
tenderforge/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── TenderDetails.js
│   │   │   ├── SavedTenders.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── PersonalizedDashboard.js
│   │   │   ├── Login.js
│   │   │   ├── PaymentHistory.js
│   │   │   └── UserProfile.js
│   │   ├── services/        # API and business logic
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── metricsService.js
│   │   └── App.js          # Main application component
│   └── public/             # Static assets
├── backend/                # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Authentication, validation
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Helper functions
│   ├── prisma/            # Database schema and migrations
│   └── scrapers/          # Government API integrations
└── README.md              # This file
```

## 🌐 Government API Integration

TenderForge connects to official government tender databases:

- **USA**: SAM.gov - System for Award Management
- **UK**: Find-a-Tender Service - UK Government procurement
- **Canada**: BuyandSell.gc.ca - Canadian government contracts
- **Australia**: AusTender - Australian government tendering system

## 🔐 Security Features

- **Firebase Authentication** - Enterprise-grade user authentication
- **JWT Tokens** - Secure API access control
- **Stripe PCI Compliance** - Payment card industry standards
- **Data Encryption** - All sensitive data encrypted in transit and at rest
- **Government API Security** - Proper authentication with official sources

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Firebase project
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/tenderforge.git
   cd tenderforge
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend (.env)
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-jwt-secret"
   STRIPE_SECRET_KEY="sk_test_..."
   
   # Frontend (.env)
   REACT_APP_FIREBASE_API_KEY="..."
   REACT_APP_STRIPE_PUBLIC_KEY="pk_test_..."
   ```

4. **Set up database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Backend (port 3001)
   cd backend
   npm run dev
   
   # Frontend (port 3000)
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📊 Key Metrics

TenderForge tracks important business metrics:
- **Success Rate**: Percentage of submitted proposals that win contracts
- **Response Time**: Average time from tender discovery to proposal submission
- **Revenue Tracking**: Total contract value won through the platform
- **Market Coverage**: Number of jurisdictions and tender sources monitored

## 🎯 Use Cases

### For Contractors
- Discover relevant tender opportunities across multiple countries
- Generate professional proposals with AI assistance
- Track performance and improve success rates
- Manage the entire bidding process in one platform

### For Consultants
- Find high-value consulting opportunities in government sector
- Leverage AI to create compelling technical proposals
- Build a portfolio of successful government contracts
- Access market intelligence and competitive analysis

### For SMEs
- Compete with larger organizations using AI-powered proposals
- Access previously hard-to-find government opportunities
- Scale business development efforts efficiently
- Track ROI on business development investments

## 🔮 Future Roadmap

- **Advanced AI**: GPT-4 integration for even more sophisticated proposals
- **More Countries**: Expand to EU, Asia-Pacific, and other regions
- **Mobile App**: Native iOS and Android applications
- **Team Collaboration**: Multi-user accounts with role-based permissions
- **Proposal Templates**: Industry-specific proposal templates
- **CRM Integration**: Connect with Salesforce, HubSpot, and other CRMs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please see our Contributing Guidelines for details.

## 📞 Support

For support, email support@tenderforge.com or create an issue in this repository.

---

**Built with ❤️ by the TenderForge Team**

*Forging the future of government contracting, one proposal at a time.*

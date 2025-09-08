# TenderForge 🔨

**AI-Powered Government Tender Marketplace Platform**

TenderForge is a comprehensive platform that connects contractors with government and private sector tender opportunities worldwide, powered by artificial intelligence to forge winning proposals. Built with enterprise-grade security and scalable architecture.

## ⭐ **Key Highlights**

- 🔒 **Production-Ready Security**: JWT authentication with rate limiting
- 🤖 **AI-Powered Proposals**: OpenAI integration for intelligent proposal generation
- 🌍 **Global Tender Access**: Real government APIs (USA, UK, Canada, Australia)
- 💳 **Stripe Payments**: Secure subscription and payment processing
- 🚀 **Heroku Ready**: Configured for seamless cloud deployment

---

## 🔐 **Security Features**

### **Authentication & Authorization**
- **JWT Token Authentication**: Industry-standard secure authentication
- **Rate Limiting**: 2 AI proposals per hour per user to prevent abuse
- **Protected API Routes**: OpenAI endpoints secured behind authentication
- **Token Refresh**: Automatic token renewal for seamless user experience
- **Input Validation**: Comprehensive validation and sanitization

### **Production Security**
- **Environment Variables**: Secure API key management
- **CORS Protection**: Cross-origin request security
- **Helmet.js**: Security headers and protections
- **bcrypt Hashing**: Secure password storage
- **SQL Injection Protection**: Parameterized queries and validation

---

## 🚀 **Core Features**

### **AI Proposal Generation**
- **OpenAI Integration**: GPT-powered proposal generation
- **Rate Limited**: 2 proposals per hour per authenticated user
- **Customizable Templates**: Industry-specific proposal formats
- **PDF Export**: Professional document generation
- **Draft Management**: Save, edit, and refine proposals

### **Global Tender Discovery**
- **USA**: SAM.gov integration for federal opportunities
- **UK**: Find-a-Tender service integration
- **Canada**: BuyandSell.gc.ca procurement portal
- **Australia**: AusTender government contracts
- **Real-time Updates**: Live tender feeds and notifications

### **User Management**
- **Secure Registration**: JWT-based user accounts
- **Profile Management**: Company capabilities and preferences
- **Dashboard Analytics**: Performance metrics and insights
- **Notification System**: Real-time alerts and updates

### **Payment & Subscriptions**
- **Stripe Integration**: Secure payment processing
- **Flexible Plans**: Multiple subscription tiers
- **Usage Tracking**: Monitor API usage and costs
- **Payment History**: Comprehensive billing records

---

## 🛠 **Technology Stack**

### **Frontend**
- **React 19**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Beautiful, customizable icons
- **Secure Auth Service**: JWT token management
- **Responsive Design**: Mobile-first responsive layout

### **Backend**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **JWT Authentication**: Secure token-based authentication
- **bcrypt**: Password hashing and security
- **express-rate-limit**: API rate limiting and protection
- **CORS**: Cross-origin resource sharing
- **Helmet.js**: Security headers and protections

### **Database & APIs**
- **In-Memory Storage**: User management (easily upgradeable to database)
- **Government APIs**: Direct integration with official tender sources
- **OpenAI API**: GPT-powered proposal generation
- **Stripe API**: Payment processing and subscriptions

### **Security**
- **JWT Tokens**: Secure authentication with refresh capability
- **Rate Limiting**: 2 proposals per hour per user
- **Input Validation**: Comprehensive request validation
- **Environment Variables**: Secure configuration management

---

## 📁 **Project Structure**

```
tender-forge/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── TenderDetails.js
│   │   │   ├── SavedTenders.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── PersonalizedDashboard.js
│   │   │   └── UserProfile.js
│   │   ├── services/           # API services
│   │   │   ├── authService.js  # JWT authentication
│   │   │   └── metricsService.js
│   │   └── App.js              # Main application component
├── backend/                     # Node.js backend API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── tenderController.js
│   │   │   └── proposalController.js
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.js         # JWT authentication
│   │   ├── routes/             # API routes
│   │   │   ├── auth.js         # Authentication endpoints
│   │   │   ├── proposals.js    # Proposal generation
│   │   │   └── tenders.js      # Tender endpoints
│   │   ├── services/           # Business logic
│   │   │   ├── geminiService.js # AI integration
│   │   │   └── paymentService.js
│   │   └── app.js              # Express application
├── docs/                       # Documentation
│   ├── JWT_IMPLEMENTATION_COMPLETE.md
│   ├── DEPLOYMENT_SECURITY.md
│   └── UPDATES_COMPLETED.md
├── LICENSE                     # MIT License
└── README.md                   # This file
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
└── README.md                   # This file
```

---

## 🌐 **Government API Integration**

TenderForge connects to official government tender databases:

- **🇺🇸 USA**: SAM.gov - System for Award Management
- **🇬🇧 UK**: Find-a-Tender Service - UK Government procurement
- **🇨🇦 Canada**: BuyandSell.gc.ca - Canadian government contracts
- **🇦🇺 Australia**: AusTender - Australian government tendering system

---

## � **Quick Start**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- OpenAI API key
- Stripe account (optional)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manav250305/Tender-Forge.git
   cd Tender-Forge
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend  
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend (.env)
   cd backend
   cp .env.example .env
   
   # Configure your environment variables:
   JWT_SECRET=your-super-secure-jwt-secret-key
   OPENAI_API_KEY=your-openai-api-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   NODE_ENV=development
   PORT=3001
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health: http://localhost:3001/health

---

## 🔐 **Authentication & Security**

### **JWT Authentication Flow**
1. **Register/Login**: User creates account or signs in
2. **Token Generation**: Server generates JWT with user info
3. **Protected Requests**: Frontend sends token in Authorization header
4. **Rate Limiting**: 2 AI proposals per hour per authenticated user
5. **Token Refresh**: Automatic renewal for seamless experience

### **API Endpoints**
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
POST /api/auth/refresh     # Refresh token
POST /api/proposals/generate # Generate AI proposal (Protected)
GET  /api/proposals/my-proposals # Get user proposals (Protected)
```

### **Security Features**
- ✅ JWT token authentication
- ✅ bcrypt password hashing  
- ✅ Rate limiting (2 proposals/hour)
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Environment variable protection

---

## 🐳 **Deployment**

### **Heroku Deployment**

1. **Create Heroku app**
   ```bash
   heroku create your-tenderforge-app
   ```

2. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your-super-secure-jwt-secret-key
   heroku config:set OPENAI_API_KEY=your-openai-api-key
   heroku config:set NODE_ENV=production
   heroku config:set STRIPE_SECRET_KEY=your-stripe-secret-key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### **Environment Variables**
```env
# Required
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=production

# Optional
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
PORT=3001
```

---

## 📱 **API Documentation**

### **Authentication Endpoints**

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securePassword123"
}
```

#### Login User  
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123" 
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### **Proposal Endpoints**

#### Generate AI Proposal
```http
POST /api/proposals/generate
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "tenderTitle": "IT Infrastructure Upgrade",
  "tenderDescription": "Modernizing government IT systems...",
  "requirements": "Security clearance, 5+ years experience..."
}
```

#### Get User Proposals
```http
GET /api/proposals/my-proposals  
Authorization: Bearer <jwt-token>
```

---

## 🛠️ **Development**

### **Project Structure**
```
backend/
├── src/
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & rate limiting
│   ├── routes/            # API routes
│   ├── services/          # External integrations
│   └── utils/             # Helper functions
└── tests/                 # Test suites

frontend/
├── src/
│   ├── components/        # React components
│   ├── services/          # API client
│   ├── utils/            # Helper functions
│   └── styles/           # Tailwind CSS
```

### **Tech Stack**
- **Frontend**: React 19, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, JWT
- **AI**: OpenAI GPT-4
- **Payments**: Stripe
- **Deployment**: Heroku

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🚀 **About TenderForge**

Built with ❤️ to democratize government contracting. TenderForge empowers businesses of all sizes to compete for public sector opportunities with AI-powered proposal generation.

**Connect with us:**
- 🌐 Website: [tenderforge.ai](https://tenderforge.ai)
- 📧 Contact: [info@tenderforge.ai](mailto:info@tenderforge.ai)
- 💼 LinkedIn: [TenderForge AI](https://linkedin.com/company/tenderforge)

---

*Made with 🤖 AI assistance and human oversight*

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

_Forging the future of government contracting, one proposal at a time._

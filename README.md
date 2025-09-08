# TenderForge 🔨

**AI-Powered Government Tender Marketplace**

TenderForge connects contractors with government tender opportunities worldwide, using artificial intelligence to generate winning proposals. A comprehensive platform built for modern procurement needs.

## ⭐ **Key Features**

- 🤖 **AI-Powered Proposals**: Intelligent proposal generation using OpenAI
- 🌍 **Global Tender Access**: Real government APIs from USA, UK, Canada & Australia
- � **Secure Platform**: Enterprise-grade authentication and data protection
- 💳 **Payment Integration**: Stripe-powered subscription management

---

## 🚀 **Core Features**

### **AI Proposal Generation**
- **OpenAI Integration**: GPT-powered proposal generation
- **PDF Export**: Professional document generation
- **Draft Management**: Save, edit, and refine proposals

### **Global Tender Discovery**
- **USA**: SAM.gov integration for federal opportunities
- **UK**: Find-a-Tender service integration
- **Canada**: BuyandSell.gc.ca procurement portal
- **Australia**: AusTender government contracts
- **Real-time Updates**: Live tender feeds and notifications

### **User Management**
- **Secure Registration**: User accounts with authentication
- **Profile Management**: Company capabilities and preferences
- **Dashboard Analytics**: Performance metrics and insights
- **Notification System**: Real-time alerts and updates

### **Payment & Subscriptions**
- **Stripe Integration**: Secure payment processing
- **Flexible Plans**: Multiple subscription tiers
- **Usage Tracking**: Monitor API usage and costs

---

## 🛠 **Technology Stack**

### **Frontend**
- **React 19**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Beautiful, customizable icons
- **Responsive Design**: Mobile-first responsive layout

### **Backend**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Authentication**: Secure user management
- **Security**: Rate limiting and data protection

### **APIs & Integrations**
- **Government APIs**: Direct integration with official tender sources
- **OpenAI API**: GPT-powered proposal generation
- **Stripe API**: Payment processing and subscriptions

---

## 📁 **Project Structure**

```
tender-forge/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── services/           # API services
│   │   └── App.js              # Main application component
├── backend/                     # Node.js backend API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── app.js              # Express application
├── LICENSE                     # MIT License
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

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

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
   OPENAI_API_KEY=your-openai-api-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
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

---

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

## � **Use Cases**

### For Contractors
- Discover relevant tender opportunities across multiple countries
- Generate professional proposals with intelligent assistance
- Track performance and improve success rates
- Manage the entire bidding process in one platform

### For Consultants
- Find high-value consulting opportunities in government sector
- Create compelling technical proposals efficiently
- Build a portfolio of successful government contracts
- Access market intelligence and competitive analysis

### For SMEs
- Compete with larger organizations using advanced tools
- Access previously hard-to-find government opportunities
- Scale business development efforts efficiently
- Track ROI on business development investments

---

## 🔮 **Future Roadmap**

- **Enhanced AI**: More sophisticated proposal generation capabilities
- **Global Expansion**: EU, Asia-Pacific, and other regions
- **Mobile Applications**: Native iOS and Android apps
- **Team Collaboration**: Multi-user accounts with role-based permissions
- **Industry Templates**: Sector-specific proposal templates
- **CRM Integration**: Connect with Salesforce, HubSpot, and other platforms

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

Built to democratize government contracting, TenderForge empowers businesses of all sizes to compete for public sector opportunities through intelligent automation and comprehensive market access.

**Connect:**
- 🌐 **Live Demo**: [tenderforge.vercel.app](https://tenderforge.vercel.app)
- 💻 **GitHub**: [github.com/Manav250305/Tender-Forge](https://github.com/Manav250305/Tender-Forge)

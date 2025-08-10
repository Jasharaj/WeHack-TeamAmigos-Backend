# Case-Pilot Backend 🏛️⚖️

A comprehensive RESTful API backend for a legal case management system that bridges the gap between citizens and lawyers. This robust platform enables citizens to create and manage legal cases while providing lawyers with tools to review, accept, and handle case assignments efficiently.

## 🌟 Features

### Core Functionality
- **🔐 Advanced Authentication System**: JWT-based authentication with role-based access control
- **👥 Multi-User Support**: Separate registration and management for citizens and lawyers
- **📋 Comprehensive Case Management**: Full lifecycle case handling from creation to resolution
- **🤝 Dispute Resolution**: Built-in dispute management system
- **📄 Document Management**: Secure file uploads and storage with Cloudinary integration
- **⏰ Reminder System**: Automated reminders for important case dates and deadlines
- **📊 Reporting System**: Comprehensive reporting for case analytics and insights

### Advanced Features
- **🛡️ Role-Based Access Control**: Granular permissions for different user types
- **📱 RESTful API Design**: Clean, intuitive API endpoints following REST principles
- **☁️ Cloud Storage**: Cloudinary integration for secure document storage
- **🔍 Data Validation**: Comprehensive input validation and sanitization
- **🚀 Performance Optimized**: Efficient database queries and response handling
- **📈 Scalable Architecture**: Designed for horizontal scaling

## 🛠️ Tech Stack

### Backend Framework
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **ES6 Modules** - Modern JavaScript module system

### Database & Storage
- **MongoDB** - Primary database with Mongoose ODM
- **Cloudinary** - Cloud-based image and document storage
- **Multer** - File upload handling middleware

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt.js** - Password hashing and salting
- **Cookie Parser** - Cookie parsing middleware
- **CORS** - Cross-origin resource sharing

### Development Tools
- **nodemon** - Development server with auto-restart
- **dotenv** - Environment variable management

### Additional Libraries
- **Framer Motion** - Animation library (if used in frontend integration)
- **Lucide React** - Icon library
- **React Intersection Observer** - Performance optimization

## 📋 Prerequisites

- **Node.js** (v16 or higher recommended)
- **MongoDB** (local installation or Atlas cloud)
- **npm** or **yarn** package manager
- **Cloudinary Account** (for document uploads)
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Jasharaj/WeHack-TeamAmigos-Backend.git
cd WeHack-TeamAmigos-Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000

# Database Configuration
MONGO_URL=mongodb://localhost:27017/weHack
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/weHack

# JWT Configuration
JWT_SECRET_KEY=your_super_secure_jwt_secret_key_here

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Database Setup
Ensure MongoDB is running locally or your Atlas connection is configured properly.

### 5. Start the Application

#### Development Mode (with auto-restart)
```bash
npm run start-dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8000` by default.

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### 🔐 Authentication Endpoints

#### Register User
- **POST** `/auth/register`
- **Description**: Register a new citizen or lawyer
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "citizen", // or "lawyer"
  
  // Required for lawyers only
  "licenseNumber": "LAW123456",
  "specialization": "Criminal Law",
  "yearsOfExperience": 5
}
```

#### Login User
- **POST** `/auth/login`
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "citizen", // or "lawyer"
  "licenseNumber": "LAW123456" // Required for lawyers
}
```

#### Logout User
- **POST** `/auth/logout`
- **Description**: Logout user (client-side token removal)

#### Get All Users
- **GET** `/auth/all-users`
- **Description**: Retrieve all registered users (admin/debug purpose)

#### Delete All Users
- **DELETE** `/auth/delete-all-users`
- **Description**: Remove all users (admin/debug purpose)

### 👤 Citizen Endpoints

#### Get Citizen Profile
- **GET** `/citizen/profile`
- **Auth**: Required (Citizen only)
- **Description**: Get logged-in citizen's profile

#### Update Citizen Profile
- **PUT** `/citizen/profile`
- **Auth**: Required (Citizen only)
- **Description**: Update citizen profile information

#### Get Citizen Cases
- **GET** `/citizen/cases`
- **Auth**: Required (Citizen only)
- **Description**: Get all cases created by the citizen

### ⚖️ Lawyer Endpoints

#### Get All Lawyers
- **GET** `/lawyer`
- **Description**: Retrieve all registered lawyers

#### Get Lawyer Profile
- **GET** `/lawyer/:id`
- **Description**: Get specific lawyer's profile by ID

#### Update Lawyer Profile
- **PUT** `/lawyer/:id`
- **Auth**: Required (Lawyer only)
- **Description**: Update lawyer profile information

#### Delete Lawyer Account
- **DELETE** `/lawyer/:id`
- **Auth**: Required (Lawyer only)
- **Description**: Delete lawyer account

### 📋 Case Management Endpoints

#### Create New Case
- **POST** `/cases`
- **Auth**: Required (Citizen only)
- **Request Body**:
```json
{
  "title": "Property Dispute Case",
  "description": "Detailed description of the legal issue",
  "caseType": "property", // "civil", "criminal", "family", "property", "consumer", "others"
  "priority": "high", // "low", "medium", "high"
  "estimatedValue": 50000
}
```

#### Get All Cases
- **GET** `/cases`
- **Auth**: Required
- **Description**: Get cases filtered by user role

#### Get Case by ID
- **GET** `/cases/:id`
- **Auth**: Required
- **Description**: Get specific case details

#### Update Case
- **PUT** `/cases/:id`
- **Auth**: Required
- **Description**: Update case information

#### Assign Lawyer to Case
- **PUT** `/cases/:id/assign`
- **Auth**: Required (Lawyer only)
- **Description**: Accept or reject case assignment

#### Delete Case
- **DELETE** `/cases/:id`
- **Auth**: Required (Case owner only)
- **Description**: Delete a case

### 🤝 Dispute Management Endpoints

#### Create Dispute
- **POST** `/disputes`
- **Auth**: Required
- **Request Body**:
```json
{
  "title": "Billing Dispute",
  "description": "Disagreement on legal fees",
  "relatedCase": "case_id_here",
  "parties": ["user_id_1", "user_id_2"]
}
```

#### Get All Disputes
- **GET** `/disputes`
- **Auth**: Required
- **Description**: Get disputes related to user

#### Get Dispute by ID
- **GET** `/disputes/:id`
- **Auth**: Required
- **Description**: Get specific dispute details

#### Update Dispute
- **PUT** `/disputes/:id`
- **Auth**: Required
- **Description**: Update dispute status or information

#### Delete Dispute
- **DELETE** `/disputes/:id`
- **Auth**: Required
- **Description**: Remove a dispute

### 📄 Document Management Endpoints

#### Upload Document
- **POST** `/documents`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Description**: Upload case-related documents

#### Get All Documents
- **GET** `/documents`
- **Auth**: Required
- **Description**: Get user's uploaded documents

#### Get Document by ID
- **GET** `/documents/:id`
- **Auth**: Required
- **Description**: Get specific document details

#### Delete Document
- **DELETE** `/documents/:id`
- **Auth**: Required
- **Description**: Remove a document

### ⏰ Reminder Endpoints

#### Create Reminder
- **POST** `/reminders`
- **Auth**: Required
- **Request Body**:
```json
{
  "title": "Court Hearing",
  "description": "Reminder for upcoming court date",
  "dueDate": "2024-12-25T10:00:00Z",
  "relatedCase": "case_id_here",
  "priority": "high"
}
```

#### Get All Reminders
- **GET** `/reminders`
- **Auth**: Required
- **Description**: Get user's reminders

#### Get Reminder by ID
- **GET** `/reminders/:id`
- **Auth**: Required
- **Description**: Get specific reminder details

#### Update Reminder
- **PUT** `/reminders/:id`
- **Auth**: Required
- **Description**: Update reminder information

#### Delete Reminder
- **DELETE** `/reminders/:id`
- **Auth**: Required
- **Description**: Remove a reminder

### 📊 Report Endpoints

#### Generate Report
- **POST** `/reports`
- **Auth**: Required
- **Request Body**:
```json
{
  "title": "Monthly Case Summary",
  "description": "Summary of cases handled this month",
  "reportType": "monthly_summary",
  "relatedCase": "case_id_here"
}
```

#### Get All Reports
- **GET** `/reports`
- **Auth**: Required
- **Description**: Get user's generated reports

#### Get Report by ID
- **GET** `/reports/:id`
- **Auth**: Required
- **Description**: Get specific report details

#### Delete Report
- **DELETE** `/reports/:id`
- **Auth**: Required
- **Description**: Remove a report

## 💾 Data Models

### 👤 Citizen Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (default: 'citizen'),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  cases: [ObjectId], // References to Case documents
  createdAt: Date,
  updatedAt: Date
}
```

### ⚖️ Lawyer Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (default: 'lawyer'),
  licenseNumber: String (unique),
  specialization: String,
  yearsOfExperience: Number,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  casesAssigned: [ObjectId], // References to Case documents
  rating: Number (default: 0),
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### 📋 Case Schema
```javascript
{
  title: String,
  description: String,
  caseType: String, // enum: ["civil", "criminal", "family", "property", "consumer", "others"]
  status: String, // enum: ["pending", "assigned", "in_progress", "resolved", "closed", "rejected"]
  priority: String, // enum: ["low", "medium", "high"]
  citizen: ObjectId, // Reference to Citizen
  lawyer: ObjectId, // Reference to Lawyer
  estimatedValue: Number,
  actualValue: Number,
  documents: [ObjectId], // References to Document documents
  reminders: [ObjectId], // References to Reminder documents
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date
}
```

### 🤝 Dispute Schema
```javascript
{
  title: String,
  description: String,
  status: String, // enum: ["open", "in_progress", "resolved", "closed"]
  priority: String, // enum: ["low", "medium", "high"]
  relatedCase: ObjectId, // Reference to Case
  parties: [ObjectId], // References to Users involved
  createdBy: ObjectId, // Reference to User who created
  resolution: String,
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### 📄 Document Schema
```javascript
{
  filename: String,
  originalName: String,
  url: String, // Cloudinary URL
  cloudinaryId: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: ObjectId, // Reference to User
  relatedCase: ObjectId, // Reference to Case
  documentType: String, // enum: ["evidence", "contract", "identification", "other"]
  isPublic: Boolean (default: false),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### ⏰ Reminder Schema
```javascript
{
  title: String,
  description: String,
  dueDate: Date,
  isCompleted: Boolean (default: false),
  priority: String, // enum: ["low", "medium", "high"]
  reminderType: String, // enum: ["court_date", "deadline", "meeting", "follow_up", "other"]
  user: ObjectId, // Reference to User (citizen or lawyer)
  relatedCase: ObjectId, // Reference to Case
  notificationSent: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### 📊 Report Schema
```javascript
{
  title: String,
  description: String,
  reportType: String, // enum: ["case_summary", "monthly_report", "performance_report", "custom"]
  data: Object, // Flexible schema for report data
  createdBy: ObjectId, // Reference to User
  relatedCase: ObjectId, // Reference to Case (optional)
  dateRange: {
    from: Date,
    to: Date
  },
  isPublic: Boolean (default: false),
  fileUrl: String, // If exported as PDF/Excel
  createdAt: Date,
  updatedAt: Date
}
```

### Lawyer
- name
- email
- password
- phone
- role (default: 'lawyer')
- casesAssigned (references to Case model)
- createdAt

### Case
- title
- description
- caseType (enum: "civil", "criminal", "family", "property", "consumer", "others")
- status (enum: "rejected", "pending", "in progress", "resolved", "closed")
- citizen (reference to Citizen model)
- lawyer (reference to Lawyer model)
- createdAt
- updatedAt

## 🔐 Authentication and Authorization

### JWT Token System
The API uses **JSON Web Tokens (JWT)** for stateless authentication. Upon successful login, users receive a JWT token that must be included in the Authorization header for protected routes.

#### Token Structure
```
Authorization: Bearer <jwt_token>
```

#### Token Payload
```json
{
  "id": "user_id",
  "role": "citizen|lawyer",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control (RBAC)
- **Citizens**: Can create cases, view their own cases, manage their profile
- **Lawyers**: Can view available cases, accept/reject assignments, manage assigned cases
- **Admin** (future): Full system access and user management

### Protected Routes
Most endpoints require authentication. The middleware `authenticate` verifies the JWT token, while `restrict` checks user roles.

## 🏗️ Project Structure

```
WeHack-TeamAmigos-Backend/
├── 📁 auth/
│   └── verifyToken.js          # Authentication middleware
├── 📁 config/
│   └── cloudinary.js          # Cloudinary configuration
├── 📁 controllers/
│   ├── authController.js       # Authentication logic
│   ├── caseController.js       # Case management
│   ├── citizenController.js    # Citizen operations
│   ├── disputeController.js    # Dispute handling
│   ├── documentController.js   # Document management
│   ├── lawyerController.js     # Lawyer operations
│   ├── reminderController.js   # Reminder system
│   └── reportController.js     # Reporting system
├── 📁 models/
│   ├── CaseSchema.js          # Case data model
│   ├── CitizenSchema.js       # Citizen data model
│   ├── DisputeSchema.js       # Dispute data model
│   ├── DocumentSchema.js      # Document data model
│   ├── LawyerSchema.js        # Lawyer data model
│   ├── ReminderSchema.js      # Reminder data model
│   └── ReportSchema.js        # Report data model
├── 📁 routes/
│   ├── auth.js                # Authentication routes
│   ├── case.js                # Case management routes
│   ├── citizen.js             # Citizen routes
│   ├── dispute.js             # Dispute routes
│   ├── document.js            # Document routes
│   ├── lawyer.js              # Lawyer routes
│   ├── reminder.js            # Reminder routes
│   └── report.js              # Report routes
├── 📁 uploads/                # Local file storage (if not using Cloudinary)
├── .env                       # Environment variables (not tracked)
├── .gitignore                 # Git ignore rules
├── index.js                   # Application entry point
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
└── README.md                  # This file
```

## 🚨 Error Handling

The API follows a consistent error response format:

### Error Response Structure
```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (in development)"
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created successfully
- **400** - Bad request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not found
- **500** - Internal server error

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## 🧪 Testing

### Manual Testing with Postman/Insomnia
1. Import the API endpoints
2. Set up environment variables for base URL and authentication token
3. Test authentication flow first
4. Test protected routes with valid tokens
5. Verify role-based access restrictions

### Example Test Sequence
1. Register a citizen and lawyer
2. Login both users and save tokens
3. Create a case as citizen
4. View available cases as lawyer
5. Assign lawyer to case
6. Upload documents for the case
7. Create reminders and reports

## 🔧 Development Guidelines

### Code Style
- Use ES6+ features and modules
- Follow RESTful API conventions
- Implement proper error handling
- Add input validation for all endpoints
- Use meaningful variable and function names

### Database Best Practices
- Use Mongoose schema validation
- Implement proper indexing for frequently queried fields
- Use population for related documents
- Handle database connection errors gracefully

### Security Considerations
- Never store plain text passwords
- Implement rate limiting (future enhancement)
- Validate and sanitize all inputs
- Use HTTPS in production
- Keep dependencies updated

## 🚀 Deployment

### Local Development
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community@5.0  # macOS

# Start the application
npm run start-dev
```

### Production Deployment

#### Environment Variables for Production
```env
NODE_ENV=production
PORT=80
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/wehack
JWT_SECRET_KEY=super_secure_production_secret
CLOUDINARY_CLOUD_NAME=production_cloud_name
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret
```

#### Recommended Hosting Platforms
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Full control with custom configuration
- **Digital Ocean** - Cost-effective VPS hosting
- **Vercel/Netlify** - For API endpoints (with serverless functions)

## 📈 Future Enhancements

### Planned Features
- [ ] **Real-time Notifications** - WebSocket integration for instant updates
- [ ] **Email System** - Automated email notifications for case updates
- [ ] **Payment Integration** - Secure payment processing for legal fees
- [ ] **Video Conferencing** - Integrated video calls for consultations
- [ ] **AI-Powered Case Analysis** - Machine learning for case outcome predictions
- [ ] **Mobile App Support** - React Native mobile application
- [ ] **Advanced Analytics** - Comprehensive reporting and analytics dashboard
- [ ] **Multi-language Support** - Internationalization for global use

### Technical Improvements
- [ ] **API Rate Limiting** - Prevent abuse and ensure fair usage
- [ ] **Caching Layer** - Redis integration for improved performance
- [ ] **API Documentation** - Swagger/OpenAPI documentation
- [ ] **Unit Testing** - Comprehensive test coverage with Jest
- [ ] **Load Balancing** - Horizontal scaling support
- [ ] **Monitoring** - Application performance monitoring
- [ ] **Backup System** - Automated database backups

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting
- Write clear, concise commit messages

## 📄 License

This project is licensed under the **ISC License**. See the LICENSE file for details.

## 👥 Team

### WeHack Team Amigos
- **Project Lead**: [Jasharaj](https://github.com/Jasharaj)
- **Developer**: [Swayam-code](https://github.com/Swayam-code)

## 📞 Support & Contact

For support, questions, or feedback:

- **Email**: swayam123code@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/Jasharaj/WeHack-TeamAmigos-Backend/issues)
- **Project Repository**: [WeHack-TeamAmigos-Backend](https://github.com/Jasharaj/WeHack-TeamAmigos-Backend)

## 🙏 Acknowledgments

- Thanks to the WeHack organizing team for the opportunity
- MongoDB and Mongoose communities for excellent documentation
- Cloudinary for reliable file storage solutions
- All contributors who helped improve this project

---

**Made with ❤️ by Team Amigos for WeHack**

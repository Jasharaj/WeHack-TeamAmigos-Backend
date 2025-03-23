# WeHack Backend API

A RESTful API backend for a legal case management system that connects citizens with lawyers. This system allows citizens to create legal cases and lawyers to accept or reject case assignments.

## Features

- User authentication (JWT-based) for citizens and lawyers
- Role-based access control
- Case management system
- RESTful API endpoints for citizens and lawyers
- MongoDB integration for data persistence

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt.js for password hashing
- dotenv for environment variables

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd backend-weHack
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8000
   MONGO_URL=mongodb://localhost:27017/weHack
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

## Running the Application

### Development Mode
```
npm run start-dev
```

### Production Mode
```
npm start
```

## API Endpoints

### Authentication

- **POST /api/v1/auth/register** - Register a new user (citizen or lawyer)
- **POST /api/v1/auth/login** - Login a user
- **POST /api/v1/auth/logout** - Logout a user

### Citizens

- **GET /api/v1/citizen** - Get all citizens (admin only)
- **GET /api/v1/citizen/:id** - Get citizen by ID
- **PUT /api/v1/citizen/:id** - Update citizen profile
- **DELETE /api/v1/citizen/:id** - Delete citizen account

### Lawyers

- **GET /api/v1/lawyer** - Get all lawyers
- **GET /api/v1/lawyer/:id** - Get lawyer by ID
- **PUT /api/v1/lawyer/:id** - Update lawyer profile
- **DELETE /api/v1/lawyer/:id** - Delete lawyer account

### Cases

- **POST /api/v1/cases** - Create a new case (citizen only)
- **GET /api/v1/cases** - Get all cases (filtered by role)
- **GET /api/v1/cases/:id** - Get case by ID
- **PUT /api/v1/cases/:id** - Update case details
- **PUT /api/v1/cases/:id/assign** - Assign lawyer to case (accept/reject)

## Data Models

### Citizen
- name
- email
- password
- phone
- role (default: 'citizen')
- cases (references to Case model)
- createdAt

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

## Authentication and Authorization

The API uses JWT (JSON Web Tokens) for authentication. The token is generated upon successful login and must be included in the Authorization header for protected routes.

Example:
```
Authorization: Bearer <token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in JSON format:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Success Responses

Successful responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {} // Response data
}
```

## License

ISC

## Author

Jasharaj

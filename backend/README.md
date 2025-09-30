# NSS IIIT Raichur Backend

A comprehensive backend system for managing NSS (National Service Scheme) activities at IIIT Raichur, including student registrations, event management, attendance tracking, and administrative functions.

## 🚀 Features

### Admin Dashboard
- **Comprehensive Statistics**: Real-time metrics including total students, events, hours, and pending approvals
- **Student Management**: Approve/reject student registrations, view all students with filtering
- **Event Management**: Create, view, and manage events with attendance tracking
- **Attendance Upload**: Bulk upload attendance via Excel files with template support
- **Export Functionality**: Export students, events, and attendance data to Excel
- **Reports**: Generate hours reports with filtering and analytics

### Student Management
- Student registration and approval workflow
- Automatic hours calculation based on event participation
- Branch-wise and year-wise statistics
- Search and filter capabilities

### Event Management
- Create events with detailed information
- Track event attendance and participation
- Event type categorization
- Automatic attendee management

### File Upload & Export
- Excel file upload for bulk attendance
- Template generation for consistent data format
- Multiple export formats (Excel, JSON)
- Bulk export functionality

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**: Multer + XLSX
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nss_iiit_raichur
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not running)
   mongod
   
   # Create admin user
   npm run create-admin
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@iiitrc.ac.in",
  "password": "password",
  "passKey": "NSS2024@IIITR"
}
```

#### Admin Registration
```http
POST /api/admin/register
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@iiitrc.ac.in",
  "password": "password",
  "passKey": "NSS2024@IIITR"
}
```

### Dashboard Endpoints

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 284,
      "approvedStudents": 276,
      "pendingStudents": 8,
      "totalEvents": 52,
      "activeEvents": 5,
      "totalHours": 12450,
      "recentRegistrations": 15
    },
    "topPerformers": [...],
    "eventTypeStats": [...],
    "monthlyStats": [...],
    "branchStats": [...]
  }
}
```

#### Get All Students
```http
GET /api/admin/students?page=1&limit=50&approved=true&sortBy=totalHours&order=desc&search=john
Authorization: Bearer <token>
```

#### Get Pending Students
```http
GET /api/admin/pending-students?page=1&limit=20
Authorization: Bearer <token>
```

### Student Management

#### Approve Student
```http
PATCH /api/admin/approve/:studentId
Authorization: Bearer <token>
```

#### Reject Student
```http
PATCH /api/admin/reject/:studentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Incomplete information"
}
```

### Event Management

#### Create Event
```http
POST /api/admin/create-event
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tree Plantation Drive",
  "description": "Planting trees in campus",
  "date": "2024-03-15T09:00:00.000Z",
  "givenHours": 4,
  "location": "Campus Ground",
  "type": "community_service",
  "maxAttendees": 50
}
```

#### Get Event Attendance
```http
GET /api/admin/event-attendance/:eventId
Authorization: Bearer <token>
```

### File Operations

#### Upload Attendance Excel
```http
POST /api/admin/upload-attendance
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <excel_file>
```

#### Download Template
```http
GET /api/admin/upload-template
Authorization: Bearer <token>
```

#### Export Students
```http
GET /api/admin/export-students?approved=true&format=excel
Authorization: Bearer <token>
```

#### Bulk Export
```http
POST /api/admin/bulk-export
Authorization: Bearer <token>
Content-Type: application/json

{
  "exportType": "students",
  "filters": {
    "approved": true,
    "branch": "CS"
  }
}
```

#### Hours Report
```http
GET /api/admin/hours-report?startDate=2024-01-01&endDate=2024-12-31&branch=CS&year=3
Authorization: Bearer <token>
```

## 📊 Excel Upload Format

### Attendance Template
The system expects Excel files with the following columns:

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| student_id | Student roll number | Yes | CS23B1001 |
| event_name | Name of the event | Yes | Tree Plantation Drive |
| hours | Hours spent | No* | 4 |

*If hours not provided, system uses event's default hours

### Sample Data
```
student_id,event_name,hours
CS23B1001,Tree Plantation Drive,4
CS23B1002,Blood Donation Camp,6
CS23B1003,Orphanage Visit,5
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Various HTTP headers for security
- **File Upload Security**: File type and size validation

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## 🗄️ Database Models

### Student Model
```typescript
{
  name: string;
  rollNo: string;
  email: string;
  phone?: string;
  year?: number;
  branch?: string;
  approved: boolean;
  totalHours: number;
  events: Array<{
    eventId: ObjectId;
    hours: number;
    attendedAt: Date;
  }>;
  registeredAt: Date;
  approvedAt?: Date;
  approvedBy?: ObjectId;
  isActive: boolean;
}
```

### Event Model
```typescript
{
  name: string;
  description: string;
  date: Date;
  givenHours: number;
  location?: string;
  type: 'community_service' | 'awareness' | 'donation' | 'cleaning' | 'education' | 'other';
  attendees: ObjectId[];
  maxAttendees?: number;
  isActive: boolean;
  createdBy: ObjectId;
}
```

### Admin Model
```typescript
{
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
}
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## 📈 Monitoring & Logging

The application uses Winston for logging with the following levels:
- **Error**: Application errors and exceptions
- **Warn**: Warning messages
- **Info**: General information
- **Debug**: Detailed debugging information

Logs are stored in the `logs/` directory with daily rotation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0
- Initial release with basic functionality
- Student registration and approval
- Event management
- Basic attendance tracking

### v1.1.0
- Enhanced admin dashboard
- Excel upload functionality
- Export capabilities
- Comprehensive reporting
- Improved security features
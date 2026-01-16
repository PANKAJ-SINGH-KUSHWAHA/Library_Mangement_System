# Library Management System

A full-stack web application for managing library operations, including book inventory, member management, borrowing records, and fine tracking.

## 🎯 Features

### Member Features
- User registration and authentication
- Email verification
- Password reset functionality
- View available books
- Borrow and return books
- Track borrowed books
- View and pay fines
- Profile management

### Admin Features
- User management
- Book inventory management (add, edit, delete)
- Borrow records management
- Fine tracking and management
- Generate reports
- System settings

## 🏗️ Project Architecture

### Backend
- **Framework**: Spring Boot
- **Language**: Java
- **Database**: MySQL/PostgreSQL
- **Build Tool**: Maven
- **Authentication**: JWT
- **API**: RESTful endpoints

### Frontend
- **Framework**: React + Vite
- **Language**: JavaScript (ES6+)
- **State Management**: React Context API
- **Build Tool**: Vite
- **Styling**: CSS
- **HTTP Client**: Axios

## 📋 Prerequisites

- Java 11 or higher
- Node.js 14 or higher
- npm or yarn
- MySQL 8.0 or PostgreSQL 12+
- Maven 3.6+

## 🚀 Installation & Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Configure database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/library_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. Build the project:
   ```bash
   mvn clean install
   ```

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

   The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with backend URL:
   ```
   VITE_API_URL=http://localhost:8080
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

### Backend (`backend/`)
- `src/main/java/com/pankaj/backend/`
  - `controller/` - REST API endpoints
  - `service/` - Business logic
  - `entity/` - JPA entities
  - `repository/` - Data access layer
  - `dto/` - Data transfer objects
  - `security/` - Authentication & authorization
  - `config/` - Configuration classes
  - `exception/` - Custom exceptions
  - `scheduler/` - Scheduled tasks

### Frontend (`frontend/`)
- `src/`
  - `components/` - Reusable React components
  - `pages/` - Page components
  - `api/` - API integration
  - `services/` - Business logic services
  - `context/` - React Context providers
  - `utils/` - Utility functions
  - `assets/` - Static assets

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication. Users must:
1. Register or login
2. Receive a JWT token
3. Include the token in API requests for protected endpoints

## 📚 API Endpoints

Key endpoints include:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/books` - List all books
- `POST /api/borrows` - Borrow a book
- `POST /api/returns` - Return a book
- `GET /api/fines` - Get user fines

## 🛠️ Development

### Running Tests

Backend tests:
```bash
cd backend
mvn test
```

Frontend tests:
```bash
cd frontend
npm test
```

### Code Quality

- Backend uses Maven for dependency management
- Frontend uses ESLint for code quality
- Both follow standard coding conventions

## 📦 Build & Deployment

### Build for Production

Backend:
```bash
mvn clean package
```

Frontend:
```bash
npm run build
```

## 🐛 Troubleshooting

- **Database Connection Error**: Verify database credentials in `application.properties`
- **CORS Issues**: Check Spring Security CORS configuration
- **Port Already in Use**: Change port in `application.properties` or `vite.config.js`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Contact & Support

For issues, questions, or suggestions, please create an issue in the repository or contact the development team.

---


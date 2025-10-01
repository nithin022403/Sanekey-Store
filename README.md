# Sanekey Store - E-commerce Platform

A full-stack e-commerce platform built with React frontend and Java Spring Boot backend.

## 🏗️ Architecture

```
├── frontend/ (React + TypeScript)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React Context providers
│   │   ├── types/              # TypeScript type definitions
│   │   └── lib/                # Utility libraries
│   └── public/                 # Static assets
│
├── backend/ (Spring Boot)
│   ├── src/main/java/com/sanekey/
│   │   ├── config/             # Spring Security & JWT config
│   │   ├── controller/         # REST API controllers
│   │   ├── model/              # JPA entities
│   │   ├── repository/         # Data access layer
│   │   ├── service/            # Business logic layer
│   │   └── exception/          # Error handling
│   └── src/main/resources/     # Configuration files
│
└── database/                   # Database schema & migrations
```

## 🚀 Features

### Frontend (React)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Authentication**: Login/Register with JWT tokens
- **Shopping Cart**: Add/remove items, quantity management
- **Product Catalog**: Browse, search, and filter products
- **Checkout Process**: Multi-step checkout with payment integration
- **User Profile**: Profile management and order history

### Backend (Java Spring Boot)
- **RESTful APIs**: Complete CRUD operations
- **Authentication & Authorization**: JWT-based security
- **Payment Integration**: Stripe and PayPal support
- **Database**: MySQL with JPA/Hibernate
- **Security**: Spring Security with role-based access
- **Error Handling**: Comprehensive exception management

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Java 17**
- **Spring Boot 3.2**
- **Spring Security** for authentication
- **Spring Data JPA** for database operations
- **MySQL** database
- **JWT** for token-based authentication
- **Stripe & PayPal** for payments

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

### Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE sanekey_store;

# Run schema script
mysql -u root -p sanekey_store < database/sanekey.sql
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the root directory:
```env
# Database
DATABASE_URL="mysql://root:password@localhost:3307/sanekey_store"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION_MS=86400000

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"

# PayPal
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
PAYPAL_ENVIRONMENT="sandbox"
```

### Application Properties
Update `backend/src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3307/sanekey_store
spring.datasource.username=root
spring.datasource.password=nithin123

# JWT Configuration
sanekey.app.jwtSecret=your-secret-key-here
sanekey.app.jwtExpirationMs=86400000
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/validate` - Validate JWT token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/all` - Get all users (Admin only)

### Payment Processing
- `POST /api/payments/stripe/create` - Create Stripe payment
- `POST /api/payments/paypal/create` - Create PayPal payment
- `POST /api/payments/stripe/confirm` - Confirm Stripe payment
- `POST /api/payments/paypal/confirm` - Confirm PayPal payment
- `GET /api/payments/history` - Get payment history

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'),
    method ENUM('STRIPE', 'PAYPAL', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING'),
    transaction_id VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **Role-based Access Control**: User and Admin roles
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## 💳 Payment Integration

### Stripe Integration
- Create payment intents
- Handle webhooks
- Process refunds
- Manage payment methods

### PayPal Integration
- Create orders
- Capture payments
- Handle callbacks
- Process refunds

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to hosting service
# (Netlify, Vercel, etc.)
```

### Backend Deployment
```bash
# Build JAR file
mvn clean package

# Run production build
java -jar target/sanekey-store-0.0.1-SNAPSHOT.jar
```

## 📝 API Documentation

The API follows RESTful conventions with the following response format:

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/endpoint"
}
```

## 🧪 Testing

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Backend Testing
```bash
# Run unit tests
mvn test

# Run integration tests
mvn verify
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis caching for frequently accessed data
- **Lazy Loading**: JPA lazy loading for better performance
- **Pagination**: Paginated API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Developer**: React/TypeScript specialist
- **Backend Developer**: Java/Spring Boot expert
- **DevOps Engineer**: Deployment and infrastructure
- **UI/UX Designer**: User interface and experience

## 📞 Support

For support, email support@sanekey.com or join our Slack channel.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added payment integration
- **v1.2.0** - Enhanced security and performance
- **v2.0.0** - Major UI overhaul and new features

---

**Built with ❤️ by the Sanekey Team**

git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/nithin022403/Sanekey-Store.git
git push -u origin main
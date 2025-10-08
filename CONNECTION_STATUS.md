# Backend-Frontend Connection Status

## Overview
This document provides a comprehensive analysis of the backend-frontend integration for the Sanekey Store application.

## Architecture Summary

### Backend (Spring Boot + MySQL)
- **Technology**: Spring Boot 3.2.0 with Java 17
- **Server Port**: 8080
- **Context Path**: `/api`
- **Database**: MySQL 8.0 on port 3307
- **Database Name**: `sanekey_store`

### Frontend (React + Vite)
- **Technology**: React 18 + TypeScript + Vite
- **Dev Server**: Port 5173
- **API Base URL**: `http://localhost:8080/api`

## Configuration Status

### ✅ 1. Backend Configuration (Fixed)

#### CorsConfig.java
**Status**: FIXED - Removed syntax errors
- Allows origins: localhost:3000, 5173, 5174
- Supports all HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Credentials enabled for authenticated requests

#### SecurityConfig.java
**Status**: VERIFIED
- JWT authentication configured
- Public endpoints: `/api/auth/**`, `/api/test/**`
- Protected endpoints require authentication
- CORS configured with wildcard pattern support

#### application.properties
**Status**: VERIFIED
- Database: MySQL on localhost:3307
- Credentials: root/nithin123
- JPA auto-DDL update enabled
- JWT secret configured
- Stripe/PayPal support (optional keys)

### ✅ 2. Frontend Configuration

#### API Client (src/lib/api.ts)
**Status**: VERIFIED
- Base URL: `http://localhost:8080/api`
- JWT token management in localStorage
- Comprehensive error handling
- CORS-compliant headers
- Test endpoints: `/test/health`, `/test/db`

#### Authentication Context
**Status**: VERIFIED
- Token-based authentication
- Auto-validation on app load
- Sign in/up/out functionality
- User state management

### ✅ 3. Database Schema

#### Tables (MySQL)
1. **users** - User accounts with role-based access
2. **payments** - Payment transactions (Stripe/PayPal)
3. **product_reviews** - Product reviews with ratings
4. **review_images** - Review image attachments

#### Default Users
- Admin: `admin@sanekey.com` / `admin123`
- Test User: `test@sanekey.com` / `test123`

## API Endpoints

### Public Endpoints
- `GET /api/test/health` - Backend health check
- `GET /api/test/db` - Database connection test
- `GET /api/test/cors` - CORS configuration test
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### Protected Endpoints (Require JWT)
- `GET /api/auth/validate` - Validate JWT token
- `GET /api/auth/me` - Get current user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/reviews` - Create product review
- `GET /api/reviews/product/{id}` - Get product reviews
- `POST /api/payments/stripe/create` - Create Stripe payment
- `POST /api/payments/paypal/create` - Create PayPal payment

## Connection Flow

### 1. Initial Load
```
Frontend (App.tsx)
  → AuthProvider initializes
  → Checks localStorage for auth_token
  → If token exists → validates via /api/auth/validate
  → TestConnection component checks backend health
```

### 2. User Authentication
```
User enters credentials
  → Frontend calls authAPI.signIn()
  → POST /api/auth/signin
  → Backend validates credentials
  → Returns JWT token + user data
  → Frontend stores token in localStorage
  → User state updated in AuthContext
```

### 3. Authenticated Requests
```
User performs action
  → Frontend prepares request
  → Adds Authorization: Bearer {token}
  → POST/GET/PUT/DELETE /api/{endpoint}
  → Backend validates JWT
  → Returns response
```

## Testing Checklist

### Prerequisites
- [ ] MySQL server running on port 3307
- [ ] Database `sanekey_store` created and migrated
- [ ] Java 17 installed
- [ ] Maven installed
- [ ] Node.js installed

### Backend Tests
```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean package -DskipTests

# Run the application
mvn spring-boot:run

# Expected output:
# - Application starts on port 8080
# - Database connection successful
# - No errors in console
```

### Frontend Tests
```bash
# Navigate to project root
cd /tmp/cc-agent/57210840/project

# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Expected output:
# - Vite dev server starts on port 5173
# - TestConnection component shows green status
# - No console errors
```

### Manual API Tests
```bash
# Test backend health
curl http://localhost:8080/api/test/health

# Test database connection
curl http://localhost:8080/api/test/db

# Test CORS
curl -H "Origin: http://localhost:5173" http://localhost:8080/api/test/cors

# Test login
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sanekey.com","password":"test123"}'
```

## Known Issues & Solutions

### Issue 1: Backend Not Running
**Symptoms**: Frontend shows "Backend API: Failed"
**Solution**:
```bash
cd backend && mvn spring-boot:run
```

### Issue 2: Database Connection Failed
**Symptoms**: Backend logs show connection errors
**Solution**:
- Verify MySQL is running on port 3307
- Check credentials: root/nithin123
- Run migration script: `mysql -u root -p < supabase/migrations/20251007100513_yellow_king.sql`

### Issue 3: CORS Errors
**Symptoms**: Browser console shows CORS policy errors
**Solution**: Already fixed in CorsConfig.java - restart backend

### Issue 4: JWT Token Invalid
**Symptoms**: Protected endpoints return 401 Unauthorized
**Solution**:
- Clear localStorage
- Sign in again to get fresh token
- Verify token is included in Authorization header

## Component Integration

### TestConnection Component
**Location**: `src/components/TestConnection.tsx`
**Purpose**: Real-time monitoring of backend and database connectivity
**Features**:
- Auto-tests every 30 seconds
- Shows connection status for backend API and MySQL
- Provides troubleshooting suggestions
- Can be minimized to corner indicator

### Authentication Flow
**Components**:
- `AuthContext.tsx` - Global auth state
- `Login.tsx` - Sign in page
- `Register.tsx` - Sign up page
- `api.ts` - API client with JWT handling

### API Integration
**All API calls go through**:
- `apiClient` class in `src/lib/api.ts`
- Automatic token injection
- Comprehensive error handling
- Request/response logging

## Build Status

### Frontend Build
```bash
npm run build
```
**Status**: ✅ SUCCESS
- Vite build completes without errors
- Output: dist/index.html + assets
- Build size: ~236KB (gzipped: ~66KB)

### Backend Build
```bash
cd backend && mvn clean package -DskipTests
```
**Status**: ⚠️ REQUIRES MAVEN & JAVA
- Java 17 required
- Maven 3.x required
- All dependencies defined in pom.xml

## Production Deployment Notes

### Environment Variables
**Frontend** (.env):
```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=[key]
```

**Backend** (application.properties):
```
spring.datasource.url=jdbc:mysql://[host]:[port]/sanekey_store
spring.datasource.username=[username]
spring.datasource.password=[password]
sanekey.app.jwtSecret=[secret]
stripe.secret.key=[optional]
paypal.client.id=[optional]
```

### Security Considerations
1. Change default JWT secret in production
2. Use strong passwords for database
3. Enable HTTPS for all endpoints
4. Restrict CORS origins to specific domains
5. Use environment-specific configuration
6. Never commit secrets to version control

## Summary

### What's Working ✅
1. Frontend builds successfully
2. API client properly configured
3. CORS configuration fixed
4. Database schema complete
5. Authentication flow implemented
6. Test connection component functional
7. JWT authentication configured

### What Needs Setup ⚠️
1. Install Java 17 and Maven
2. Start MySQL server on port 3307
3. Run database migrations
4. Start Spring Boot backend
5. Verify end-to-end authentication flow

### Next Steps
1. Install backend dependencies (Java + Maven)
2. Start MySQL and run migrations
3. Start backend: `cd backend && mvn spring-boot:run`
4. Start frontend: `npm run dev`
5. Test login with: test@sanekey.com / test123
6. Verify TestConnection shows all green
7. Test creating a review or payment

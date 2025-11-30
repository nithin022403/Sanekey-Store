# End-to-End Setup Guide

This guide covers the complete setup for connecting the frontend to Supabase backend with authentication and product reviews.

## Overview

The application is now fully integrated with **Supabase** for:
- ✅ User Authentication (Sign Up/Sign In/Sign Out)
- ✅ Product Reviews (Create, Edit, Delete, View)
- ✅ Helpful Votes on Reviews
- ✅ Row Level Security (RLS) for data protection
- ✅ Product Zoom (3x magnification)
- ✅ 360° Product View with zoom

## Prerequisites

1. **Supabase Account**: Create one at https://supabase.com
2. **Environment Variables**: Already configured in `.env` file

## Setup Steps

### 1. Database Setup (Already Configured)

The database schema has been created with:
- `products` - Product catalog
- `user_profiles` - User information
- `product_reviews` - Customer reviews
- `review_images` - Images attached to reviews
- `review_helpful_votes` - Helpful votes tracking

All tables have **Row Level Security (RLS)** enabled for security.

### 2. Authentication Setup

The app uses Supabase Authentication which is:
- **Email/Password based**
- **Secure by default** with RLS policies
- **Token-based** with automatic refresh

#### User Flow:
1. User visits the app
2. User clicks "Sign in" or "Sign up" in navbar
3. Supabase handles authentication securely
4. User is redirected to homepage after login
5. User can now write, edit, and delete reviews

### 3. Frontend Configuration

#### Environment Variables (`.env`)
```
VITE_SUPABASE_URL=https://xzyynkrvzcgmhfzvvdvm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Key Components:

**Supabase Auth Context** (`src/context/SupabaseAuthContext.tsx`)
- Manages user authentication state
- Handles sign up, sign in, sign out
- Persists session across page reloads

**Supabase API Client** (`src/lib/supabase-api.ts`)
- `createReview()` - Create new product review
- `updateReview()` - Edit existing review
- `deleteReview()` - Delete review
- `getProductReviews()` - Fetch product reviews
- `getProductRatingSummary()` - Get rating statistics
- `markReviewAsHelpful()` - Vote on review helpfulness
- `canUserReviewProduct()` - Check if user already reviewed

## Testing End-to-End

### Test 1: User Registration
```
1. Go to app home page
2. Click "Sign up" button in navbar
3. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Sign up"
5. Should be redirected to home as authenticated user
6. User name should appear in navbar
```

### Test 2: User Sign In
```
1. If logged in, click user profile icon → Sign out
2. Click "Sign in" button in navbar
3. Fill in:
   - Email: test@example.com
   - Password: password123
4. Click "Sign in"
5. Should be redirected to home as authenticated user
```

### Test 3: Product Review Creation
```
1. Make sure you're signed in
2. Click "Products" in navbar
3. Click any product to view details
4. Scroll to "Customer Reviews" section
5. Click "Write a Review" button
6. Fill in:
   - Rating: 5 stars (click stars)
   - Title: "Great product!"
   - Comment: "This product exceeded my expectations..."
7. Click "Submit Review"
8. Your review should appear immediately
```

### Test 4: Edit Review
```
1. Scroll to your review
2. Click the pencil (edit) icon
3. Modify the content
4. Click "Update Review"
5. Changes should appear immediately
```

### Test 5: Delete Review
```
1. Find your review
2. Click the trash (delete) icon
3. Confirm deletion
4. Review should be removed immediately
```

### Test 6: Mark Review as Helpful
```
1. Find any review
2. Click "Helpful (count)" button
3. Count should increase
4. You can only vote once per review
```

### Test 7: Filter Reviews by Rating
```
1. In reviews section, find filter dropdown
2. Select "5 Stars"
3. Only 5-star reviews should display
4. Change filter to see other ratings
```

### Test 8: Sort Reviews
```
1. In reviews section, find sort dropdown
2. Options:
   - Newest First (default)
   - Oldest First
   - Most Helpful
   - Highest Rating
3. Reviews should reorder accordingly
```

### Test 9: Product Zoom
```
1. View any product detail
2. Hover over the main product image
3. Zoom controls appear (±, percentage display)
4. Scroll mouse wheel to zoom
5. Click thumbnails to change image (zoom resets)
6. In 360° view, zoom works with scroll too
```

### Test 10: Sign Out
```
1. Click user profile icon in navbar (top right)
2. Click "Sign out"
3. Should be redirected to home
4. Navbar should show "Sign in" button
5. Cannot access protected features
```

## Data Flow Diagram

```
Frontend (React)
    ↓
Supabase Client (@supabase/supabase-js)
    ↓
Supabase REST API
    ↓
PostgreSQL Database
    ↓
RLS Policies (Security Layer)
```

## Security Features

1. **Row Level Security (RLS)**
   - Each user can only see/edit their own reviews
   - Reviews are public but only owners can modify
   - Products are publicly readable

2. **Authentication**
   - JWT tokens automatically managed
   - Session persisted securely
   - Auto-logout on sign out

3. **Data Validation**
   - All inputs validated before sending to database
   - Ratings validated (1-5 stars)
   - Comments validated for required fields

## API Endpoints

All API calls go through Supabase client:

**Reviews**
```
GET /product_reviews?product_id=<id>&rating=<rating>
POST /product_reviews
PATCH /product_reviews/<id>
DELETE /product_reviews/<id>
```

**Review Images**
```
POST /review_images
DELETE /review_images/<id>
```

**Helpful Votes**
```
POST /review_helpful_votes
DELETE /review_helpful_votes/<id>
```

## Troubleshooting

### Issue: "User not authenticated" error
**Solution**: Make sure you're signed in. Check navbar for your user name.

### Issue: Reviews not loading
**Solution**:
1. Check browser console for errors
2. Verify Supabase URL and keys in `.env`
3. Ensure network connection is active

### Issue: Can't create review twice
**Solution**: Each user can only have one review per product. Edit your existing review instead.

### Issue: Changes not appearing immediately
**Solution**:
1. Refresh the page (F5)
2. Check browser console for errors
3. Verify you're signed in as the correct user

## Performance Notes

- Reviews load on demand (lazy loading)
- Images are optimized (max 3x zoom)
- Rating summary calculated server-side
- Helpful votes cached and updated in real-time

## Next Steps

1. **Add more products** to database
2. **Customize product images**
3. **Implement payments** (Stripe/PayPal)
4. **Add order management**
5. **Create admin dashboard**

## Support

For issues or questions, check:
1. Browser console (F12)
2. Network tab for API calls
3. Supabase dashboard for database logs
4. Supabase docs: https://supabase.com/docs

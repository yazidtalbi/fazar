# Pre-Launch Checklist

This document outlines all remaining tasks and requirements before launching the Afus marketplace application.

## 🔴 Critical (Must Complete Before Launch)

### Infrastructure & Security

- [ ] **Supabase Storage Bucket Setup**
  - [x] Migration created (`019_storage_setup.sql`) - Run this in Supabase SQL Editor
  - [ ] Create `product-media` bucket in Supabase (or run migration)
  - [ ] Configure storage policies (included in migration)
    - [ ] Public read access for product images/videos
    - [ ] Authenticated write access for sellers
    - [ ] Public read access for review images
    - [ ] Authenticated write access for review images
    - [ ] Public read access for store logos/cover images
    - [ ] Authenticated write access for store media
  - [ ] Test file uploads and retrieval
  - [x] File size limits configured (images: 10MB, videos: 100MB in code, 5MB for reviews)
  - [ ] Configure CORS if needed

- [ ] **Environment Variables Verification**
  - [x] Documentation created (`docs/ENVIRONMENT_SETUP.md`)
  - [x] Verification script created (`scripts/verify-setup.ts`) - Run `npm run verify-setup`
  - [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
  - [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
  - [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly (server-side only)
  - [ ] Ensure all environment variables are configured in production (Vercel/deployment platform)
  - [ ] Never commit service role key to repository

- [ ] **Database Security Audit**
  - [ ] Review all RLS policies for correctness
  - [ ] Test RLS policies with different user roles (buyer, seller, admin)
  - [ ] Verify users can only access their own data
  - [ ] Verify sellers can only manage their own products/orders
  - [ ] Test edge cases (users with both buyer and seller profiles)
  - [ ] Ensure order creation functions are secure

- [ ] **Authentication & Authorization**
  - [ ] Test password reset flow (if implemented)
  - [ ] Test email verification flow (if implemented)
  - [ ] Verify OAuth providers (Google, Apple) are properly configured
  - [ ] Test session management and token refresh
  - [ ] Verify protected routes are properly secured
  - [ ] Test logout functionality

### Core Functionality Testing

- [ ] **Product Management**
  - [ ] Test product creation end-to-end
  - [ ] Test product editing
  - [ ] Test product deletion
  - [ ] Verify media uploads work correctly
  - [ ] Test product variations and personalizations
  - [ ] Verify product status changes (active/draft)
  - [ ] Test product promotion/unpromotion
  - [ ] Verify promotion date ranges work correctly

- [ ] **Order Management**
  - [ ] Test complete checkout flow (cart → checkout → order creation)
  - [ ] Verify order number generation is unique
  - [ ] Test order status updates (seller side)
  - [ ] Verify order detail pages display correctly
  - [ ] Test order cancellation (if implemented)
  - [ ] Verify COD payment flow
  - [ ] Test order history for buyers
  - [ ] Test order management for sellers

- [ ] **Reviews & Ratings**
  - [ ] Test review submission from order page
  - [ ] Test review update functionality
  - [ ] Verify review images upload correctly
  - [ ] Test review display on product pages
  - [ ] Test review display on store pages
  - [ ] Verify average rating calculations
  - [ ] Test review count displays

- [ ] **Store Management**
  - [ ] Test store creation during onboarding
  - [ ] Test store settings updates
  - [ ] Verify store slug uniqueness
  - [ ] Test store contact system (WhatsApp/Instagram/Facebook)
  - [ ] Verify store logo and cover image uploads
  - [ ] Test store page display

- [ ] **Search & Discovery**
  - [ ] Test search functionality
  - [ ] Test category filtering
  - [ ] Test sorting options
  - [ ] Verify search results are accurate
  - [ ] Test store discovery section
  - [ ] Verify popular stores display
  - [ ] Test new arrivals section

### Payment & Financial

- [ ] **Credits System** (if applicable)
  - [ ] Test credit purchase flow
  - [ ] Test credit balance display
  - [ ] Test credit transaction history
  - [ ] Verify credit deduction for promotions
  - [ ] Test credit refunds (if applicable)

- [ ] **Pricing & Promotions**
  - [ ] Test promotion pricing calculations
  - [ ] Verify discount displays on product cards
  - [ ] Test promotion expiration handling
  - [ ] Verify promotion date ranges

## 🟡 Important (Should Complete Before Launch)

### User Experience

- [ ] **Mobile Responsiveness**
  - [ ] Test all pages on mobile devices
  - [ ] Verify mobile navigation works correctly
  - [ ] Test product card displays on mobile
  - [ ] Verify masonry grid on mobile
  - [ ] Test checkout flow on mobile
  - [ ] Verify forms are mobile-friendly

- [ ] **Performance Optimization**
  - [ ] Optimize image sizes and formats
  - [ ] Implement lazy loading for images
  - [ ] Test page load times
  - [ ] Optimize database queries
  - [ ] Implement caching where appropriate
  - [ ] Test with slow network connections
  - [ ] Verify bundle size is reasonable

- [ ] **Error Handling**
  - [ ] Add error boundaries for React components
  - [ ] Implement proper error messages for users
  - [ ] Test error scenarios (network failures, invalid data, etc.)
  - [ ] Add loading states for async operations
  - [ ] Verify error logging (if implemented)

- [ ] **Accessibility**
  - [ ] Test keyboard navigation
  - [ ] Verify screen reader compatibility
  - [ ] Check color contrast ratios
  - [ ] Test with accessibility tools
  - [ ] Add proper ARIA labels where needed

### Content & Localization

- [ ] **Content Review**
  - [ ] Review all French text for accuracy
  - [ ] Verify all placeholder text is replaced
  - [ ] Check for typos and grammatical errors
  - [ ] Verify button labels and CTAs are clear
  - [ ] Review error messages

- [ ] **Images & Media**
  - [ ] Verify all placeholder images are replaced
  - [ ] Test image fallbacks
  - [ ] Verify video playback works
  - [ ] Test media loading states

### Analytics & Monitoring

- [ ] **Analytics Setup** (if applicable)
  - [ ] Set up Google Analytics or similar
  - [ ] Configure event tracking
  - [ ] Test analytics integration

- [ ] **Error Monitoring**
  - [ ] Set up error tracking (Sentry, LogRocket, etc.)
  - [ ] Configure error alerts
  - [ ] Test error reporting

- [ ] **Performance Monitoring**
  - [ ] Set up performance monitoring
  - [ ] Configure performance alerts
  - [ ] Test monitoring integration

## 🟢 Nice to Have (Can Complete Post-Launch)

### Additional Features

- [ ] **Email Notifications**
  - [ ] Order confirmation emails
  - [ ] Order status update emails
  - [ ] Promotion expiration reminders
  - [ ] Welcome emails for new users

- [ ] **Advanced Search**
  - [ ] Price range filters
  - [ ] Material filters
  - [ ] Location filters
  - [ ] Advanced sorting options

- [ ] **Social Features**
  - [ ] Product sharing functionality
  - [ ] Social media integration
  - [ ] Referral system

- [ ] **Enhanced User Features**
  - [ ] Wishlist improvements
  - [ ] Product recommendations
  - [ ] Recently viewed products
  - [ ] Order tracking integration

### Admin Features

- [ ] **Admin Dashboard**
  - [ ] User management
  - [ ] Store management
  - [ ] Product moderation
  - [ ] Review moderation
  - [ ] Analytics dashboard

- [ ] **Content Management**
  - [ ] Category management
  - [ ] Featured products
  - [ ] Homepage content management

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] **Code Review**
  - [ ] Review all code for security issues
  - [ ] Remove console.logs and debug code
  - [ ] Remove test data and mock content
  - [ ] Verify no hardcoded credentials

- [ ] **Build Verification**
  - [ ] Run `npm run build` successfully
  - [ ] Fix all TypeScript errors
  - [ ] Fix all linting errors
  - [ ] Test production build locally

- [ ] **Database Migration**
  - [ ] Review all migrations
  - [ ] Test migrations on staging environment
  - [ ] Create migration rollback plan
  - [ ] Backup production database before migration

- [ ] **Environment Setup**
  - [ ] Set up production Supabase project
  - [ ] Configure production environment variables
  - [ ] Set up production storage buckets
  - [ ] Configure production RLS policies

### Deployment

- [ ] **Deployment Platform Setup**
  - [ ] Configure Vercel/deployment platform
  - [ ] Set up custom domain
  - [ ] Configure SSL certificates
  - [ ] Set up CDN (if applicable)

- [ ] **Post-Deployment Verification**
  - [ ] Test all critical user flows
  - [ ] Verify all API endpoints work
  - [ ] Test file uploads
  - [ ] Verify email sending (if implemented)
  - [ ] Check error logs
  - [ ] Monitor performance

## 🔒 Security Checklist

- [ ] **Input Validation**
  - [ ] Verify all user inputs are validated
  - [ ] Test SQL injection prevention
  - [ ] Test XSS prevention
  - [ ] Verify file upload validation

- [ ] **Authentication Security**
  - [ ] Verify password requirements
  - [ ] Test session timeout
  - [ ] Verify CSRF protection
  - [ ] Test rate limiting on auth endpoints

- [ ] **Data Protection**
  - [ ] Verify sensitive data is encrypted
  - [ ] Test data access controls
  - [ ] Verify GDPR compliance (if applicable)
  - [ ] Review privacy policy

## 📝 Documentation

- [ ] **User Documentation**
  - [ ] Create user guide for buyers
  - [ ] Create seller guide
  - [ ] Add FAQ section
  - [ ] Create help center content

- [ ] **Technical Documentation**
  - [ ] Update README with setup instructions
  - [ ] Document API endpoints
  - [ ] Document database schema
  - [ ] Create deployment guide

- [ ] **Legal Documents**
  - [ ] Terms of Service
  - [ ] Privacy Policy
  - [ ] Cookie Policy (if applicable)
  - [ ] Return/Refund Policy

## 🧪 Testing

### Manual Testing

- [ ] **User Flows**
  - [ ] Complete buyer journey (signup → browse → cart → checkout → order)
  - [ ] Complete seller journey (signup → onboarding → create product → manage orders)
  - [ ] Test review submission flow
  - [ ] Test store discovery flow

- [ ] **Edge Cases**
  - [ ] Test with empty states (no products, no orders, etc.)
  - [ ] Test with large datasets
  - [ ] Test concurrent operations
  - [ ] Test error scenarios

### Browser & Device Testing

- [ ] **Desktop Browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Mobile Devices**
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Test on various screen sizes

## 🚀 Launch Day Checklist

- [ ] **Final Verification**
  - [ ] All critical items completed
  - [ ] All important items completed
  - [ ] Database backups created
  - [ ] Rollback plan prepared

- [ ] **Monitoring Setup**
  - [ ] Error monitoring active
  - [ ] Performance monitoring active
  - [ ] Uptime monitoring active
  - [ ] Alert notifications configured

- [ ] **Team Preparation**
  - [ ] Support team briefed
  - [ ] On-call schedule established
  - [ ] Launch communication plan ready

- [ ] **Post-Launch**
  - [ ] Monitor error logs
  - [ ] Monitor user feedback
  - [ ] Track key metrics
  - [ ] Be ready to hotfix critical issues

## 📊 Success Metrics to Track

- [ ] User registrations
- [ ] Store creations
- [ ] Product listings
- [ ] Orders placed
- [ ] Conversion rates
- [ ] Average order value
- [ ] User retention
- [ ] Page load times
- [ ] Error rates

---

## Notes

- This checklist should be reviewed and updated regularly
- Mark items as complete as they are finished
- Prioritize critical items first
- Some items may be optional depending on launch timeline
- Consider doing a soft launch with limited users first


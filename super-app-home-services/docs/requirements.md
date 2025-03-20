# Super App for Home Services - Croatia MVP

## Project Overview
A mobile application connecting users in Croatia with home service providers (cleaning, repairs, childcare, etc.) with built-in foundations for multi-language support.

## Core Functional Requirements

### User Management
- User registration and authentication system
- Profile creation for both customers and service providers
- Profile editing and management
- User roles: Customer, Service Provider, Admin

### Service Listing and Discovery
- Browsable service categories
- Search functionality with filters
- Service listings with details (name, description, price, provider rating)
- Multi-language content support starting with Croatian

### Booking System
- Calendar-based availability view
- Booking creation and management
- Booking confirmation process
- Notification system for booking status updates

### Payment Processing
- Secure payment integration via Stripe Connect
- Automated platform fee deduction (15% commission)
- Payment transfer to service providers
- Transaction history and receipts

### Multi-language Foundation
- Initial implementation in Croatian
- Architecture to support easy addition of other languages
- Externalized text resources

## User Stories

### As a Customer
- I want to register and create a profile
- I want to browse available service categories
- I want to search for specific services with filters
- I want to view detailed information about a service
- I want to book a service for a specific date and time
- I want to pay securely for services
- I want to view my booking history and status
- I want to rate and review service providers

### As a Service Provider
- I want to register and create a business profile
- I want to list my services with descriptions and pricing
- I want to manage my availability calendar
- I want to receive notifications about new bookings
- I want to confirm or reject booking requests
- I want to receive payments minus the platform commission
- I want to view my service performance and ratings

## Technical Requirements
- Mobile application built with Expo React Native
- PHP RESTful API using functional programming principles
- MySQL database with multi-language support
- Stripe Connect integration for payment processing
- Internationalization (i18n) foundations

## System Architecture (Simplified)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Mobile App │ ─────>│  PHP API    │ ─────>│   MySQL     │
│  (React     │<───── │  (RESTful)  │<───── │  Database   │
│   Native)   │       │             │       │             │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   Stripe    │
                      │   Connect   │
                      │             │
                      └─────────────┘
```

## MVP Scope Limitations
- Supporting Croatian language only initially
- Limited to most common home service categories
- Basic notification system without push notifications
- Simple rating system without detailed reviews
- Limited analytics for service providers

## Future Expansion Considerations
- Additional languages (English, Serbian, Bosnian)
- Advanced search and recommendation algorithms
- Enhanced provider analytics dashboard
- Mobile push notifications
- In-app messaging between users and providers 
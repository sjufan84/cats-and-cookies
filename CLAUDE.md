# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Commands

- `npx drizzle-kit generate:pg` - Generate PostgreSQL migrations
- `npx drizzle-kit push:pg` - Push schema changes to database
- `npx drizzle-kit studio` - Open Drizzle Studio for database management

## Architecture Overview

This is a Next.js 15 e-commerce application for selling cookies and baked goods with the following key architectural components:

### Database Architecture
- **PostgreSQL** with **Drizzle ORM** as the database layer
- Schema defined in `db/schema.ts` with relations between users, products, customers, orders, and order items
- **Product Units System**: Products support multiple pricing tiers (individual, half-dozen, dozen) via `productUnits` table
- **Stripe Integration**: Products and customers are synced with Stripe via `stripeProductId`, `stripePriceId`, `stripeCustomerId` fields

### Frontend Architecture
- **Next.js App Router** with TypeScript
- **shadcn/ui** components with Tailwind CSS for styling
- **Context-based state management**: `cart-context.tsx`, `wishlist-context.tsx`
- **Dark mode support** via `next-themes` and theme provider

### Payment & E-commerce
- **Stripe** integration for payments, webhooks, and product management
- **Multi-step checkout** process with payment intents
- **Admin dashboard** for product management, order tracking, and Stripe operations
- **Recipe system**: Products can store structured recipe data using schema.org format

### Key Features
- **Recipe Management**: AI-powered recipe extraction from images with structured data validation
- **Product Units**: Flexible pricing system supporting different quantities
- **Stripe Webhooks**: Automated order status updates and customer synchronization
- **File Upload**: Image handling via Google Cloud Storage integration
- **Admin Panel**: Full CRUD operations for products with Stripe sync

### Important Patterns
- All API routes use TypeScript and Zod for validation
- Database operations use Drizzle ORM with prepared statements
- Stripe operations are centralized in `lib/stripe-*.ts` files
- Components follow the shadcn/ui pattern with proper TypeScript typing
- Environment variables are required for DATABASE_URL and STRIPE_SECRET_KEY

### Recipe Schema
The application uses a comprehensive recipe schema (`lib/recipe-schema.ts`) based on schema.org format for:
- Structured recipe data with ingredients, instructions, and nutritional information
- AI extraction confidence scoring
- Allergen tracking and dietary restrictions
- Instacart integration potential

### Environment Setup
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API secret key
- Additional Stripe and Google Cloud Storage variables for full functionality
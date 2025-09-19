# PLAN.md: Cats & Cookies Development Plan

## 1. Project Overview

**Project Name:** Cats & Cookies
**Client:** Sage, age 12
**Vision:** To create a beautiful, simple, and intuitive e-commerce website for Sage to sell her homemade cookies and baked goods. The site should be easy for her to manage and delightful for customers to use.

**Core Features:**
-   A visually appealing storefront to showcase current and past offerings.
-   Prominent featuring of weekly special cookies.
-   Simple and secure checkout process using Stripe.
-   An admin dashboard for Sage to manage products and view orders.

## 2. Theme & UI/UX

The UI should be **clean, elegant, playful, and intuitive**.

-   **Mascots:** The brand revolves around Sage's two Maine Coon cats, Teddy (gray) and Millie (orange). Their illustrations or photos should be used tastefully throughout the site to add personality.
-   **Color Palette:** A warm and inviting palette is recommended. Think soft pinks, creamy whites, and warm grays, with vibrant accents for calls-to-action. The current placeholder theme uses a pink accent, which can be refined.
-   **Typography:** The `Geist` font family is already set up. It's a clean and modern choice. Ensure headings and body text are legible and have a clear hierarchy.
-   **Tone:** The language should be friendly, warm, and personal, reflecting the homemade nature of the products.

## 3. Tech Stack & Architecture

This project is a full-stack application built with modern web technologies, designed for scalability and ease of development.

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Component Library:** [shadcn/ui](https://ui.shadcn.com/)
-   **Database:** PostgreSQL
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
-   **Payments:** [Stripe](https://stripe.com/)
-   **Deployment:** [Vercel](https://vercel.com/)

**Architecture:**
-   The frontend is built with React components and Next.js pages.
-   The backend logic is handled by Next.js API Routes (or Server Actions).
-   The database schema is defined in `db/schema.ts` and managed with `drizzle-kit` for migrations.
-   Stripe integration is handled on the backend for security, with Stripe Elements used on the frontend for the payment form.

## 4. Development Tasks

Here is a breakdown of tasks that can be delegated to the engineering team.

### Frontend
-   **Task F1: Finalize UI/UX Design**
    -   Collaborate with a designer (or the client) to create high-fidelity mockups based on the theme guidelines.
    -   Develop a style guide in Figma or a similar tool.
-   **Task F2: Implement Header & Footer**
    -   The placeholder components `Header.tsx` and `Footer.tsx` are created. Refine their design and ensure they are fully responsive.
-   **Task F3: Build out the Homepage**
    -   The homepage is scaffolded in `app/page.tsx`.
    -   Fetch and display featured products from the database.
    -   Ensure the design is engaging and responsive.
-   **Task F4: Create Product Pages**
    -   The dynamic page `app/products/[id]/page.tsx` is created.
    -   Fetch product data based on the ID from the URL.
    -   Display product images, description, price, and an "Add to Cart" button.
-   **Task F5: Implement Shopping Cart**
    -   The `app/cart/page.tsx` is created.
    -   Implement client-side state management for the cart (e.g., using React Context or a library like Zustand).
    -   Allow users to view, update quantities, and remove items from the cart.
-   **Task F6: Build the Checkout Flow**
    -   The `app/checkout/page.tsx` is created.
    -   Integrate Stripe Elements for the payment form.
    -   Collect customer shipping information.
    -   On successful payment, redirect to an order confirmation page.
-   **Task F7: Develop the "Our Story" Page**
    -   The `app/about/page.tsx` is created.
    -   Enhance the page with actual photos of Sage, Teddy, and Millie.
-   **Task F8: Admin Dashboard UI**
    -   The `app/admin/page.tsx` is created.
    -   Design and build a UI for Sage to view orders and manage products (add, edit, delete).

### Backend
-   **Task B1: Set up Database & Migrations**
    -   The schema is in `db/schema.ts`.
    -   Set up `drizzle-kit` to generate and run database migrations.
    -   Seed the database with initial product data for testing.
-   **Task B2: Implement Product API**
    -   Create API endpoints (or Server Actions) for CRUD operations on products.
    -   `GET /api/products` - a list of all products.
    -   `GET /api/products/featured` - a list of featured products.
    -   `GET /api/products/:id` - a single product.
    -   `POST /api/products` - create a new product (admin only).
    -   `PUT /api/products/:id` - update a product (admin only).
    -   `DELETE /api/products/:id` - delete a product (admin only).
-   **Task B3: Implement Order API**
    -   Create API endpoints for handling orders.
    -   `POST /api/checkout` - create a Stripe Checkout session.
    -   `POST /api/webhooks/stripe` - handle the `checkout.session.completed` event from Stripe to create an order in the database.
-   **Task B4: Implement Admin Authentication**
    -   Add authentication for the admin dashboard.
    -   A simple solution like NextAuth.js with a credentials provider can be used.
    -   Protect the admin API routes and pages.

### DevOps & Deployment
-   **Task D1: Set up Environment Variables**
    -   Create a `.env.example` file listing all required environment variables (`DATABASE_URL`, `STRIPE_SECRET_KEY`, `NEXTAUTH_SECRET`, etc.).
    -   Configure these variables in Vercel for deployment.
-   **Task D2: Configure Vercel Deployment**
    -   The project is already set up to be deployed on Vercel.
    -   Connect the GitHub repository to a new Vercel project.
    -   Ensure the build command (`next build`) runs successfully.
-   **Task D3: Set up a Staging Environment**
    -   Use Vercel's preview deployments for testing changes before they go to production.

## 5. Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install`
3.  **Set up your local environment:**
    -   Create a `.env` file and populate it with the necessary variables (see `.env.example`).
    -   You will need a local PostgreSQL database and a Stripe test account.
4.  **Run the development server:** `npm run dev`

This plan provides a clear path forward. Let's build something amazing for Sage!

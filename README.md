# myCloud

A self-hosted cloud storage application for signing in, uploading, organizing, sharing, and expanding personal file storage from a responsive dashboard.

![myCloud landing page](./public/screenshots/landing-desktop.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [License](#license)

## Overview

myCloud is a full-stack Next.js application that combines Firebase Authentication, Firestore metadata, Cloudflare R2 object storage, Resend email delivery, and Stripe Checkout to provide a private cloud storage experience.

Users can authenticate with email/password or Google, upload files directly to R2 through presigned URLs, manage files from a dashboard, share files by email, and purchase additional storage capacity.

## Features

- Email/password authentication with Firebase email verification
- Google sign-in through Firebase Authentication
- Protected dashboard with server-verified Firebase sessions
- Direct-to-R2 uploads using presigned S3-compatible URLs
- File filtering by type, search, sorting, starring, trash, restore, and permanent delete
- Signed file preview/download URLs
- Storage usage tracking with a 1 GB base quota
- Stripe Checkout for additional storage plans
- Responsive dashboard with desktop sidebar and mobile drawer
- Light/dark theme support

## Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Framework          | Next.js 16 App Router                       |
| Runtime UI         | React 19, TypeScript                        |
| Styling            | Tailwind CSS v4, MUI v9, Emotion            |
| Authentication     | Firebase Authentication, Firebase Admin SDK |
| Database           | Cloud Firestore                             |
| Object Storage     | Cloudflare R2 via AWS S3 SDK                |
| Payments           | Stripe Checkout and webhooks                |
| Forms & Validation | React Hook Form, Zod                        |
| Tooling            | ESLint, Prettier, Husky, lint-staged        |

## Screenshots

### Landing Page

![Landing page on desktop](./public/screenshots/landing-desktop.png)

### Dashboard

![Dashboard on desktop](./public/screenshots/dashboard-desktop.png)

### Mobile Dashboard

![Dashboard on mobile](./public/screenshots/dashboard-mobile.png)

### Sign In

![Sign-in page](./public/screenshots/sign-in-desktop.png)

### Sign Up

![Sign-up page](./public/screenshots/sign-up-desktop.png)

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- Firebase project with Authentication and Firestore enabled
- Cloudflare R2 bucket and S3-compatible credentials
- Resend API key
- Stripe account and webhook signing secret

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file in the project root and add the variables listed in [Environment Variables](#environment-variables).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm run start
```

## Environment Variables

All environment variables should be stored in `.env.local` for local development.

| Variable                                   | Required    | Description                                      |
| ------------------------------------------ | ----------- | ------------------------------------------------ |
| `NEXT_PUBLIC_FIREBASE_API`                 | Yes         | Firebase web API key                             |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Yes         | Firebase auth domain                             |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Yes         | Firebase project ID                              |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Yes         | Firebase storage bucket                          |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes         | Firebase messaging sender ID                     |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Yes         | Firebase app ID                                  |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | Optional    | Firebase analytics measurement ID                |
| `FIREBASE_PROJECT_ID`                      | Yes         | Firebase Admin project ID                        |
| `FIREBASE_CLIENT_EMAIL`                    | Yes         | Firebase Admin service account email             |
| `FIREBASE_PRIVATE_KEY`                     | Yes         | Firebase Admin private key                       |
| `R2_ENDPOINT`                              | Yes         | Cloudflare R2 S3-compatible endpoint             |
| `R2_ACCESS_KEY_ID`                         | Yes         | Cloudflare R2 access key ID                      |
| `R2_SECRET_ACCESS_KEY`                     | Yes         | Cloudflare R2 secret access key                  |
| `R2_BUCKET_NAME`                           | Yes         | Cloudflare R2 bucket name                        |
| `R2_PUBLIC_URL`                            | Yes         | Public URL prefix for stored objects             |
| `RESEND_API`                               | Yes         | Resend API key                                   |
| `STRIPE_SECRET_KEY`                        | Yes         | Stripe secret key                                |
| `STRIPE_WEBHOOK_SECRET`                    | Yes         | Stripe webhook signing secret                    |
| `NEXT_PUBLIC_APP_URL`                      | Recommended | Public application URL for Stripe redirect links |

When storing `FIREBASE_PRIVATE_KEY`, preserve newlines as escaped `\n` characters if your environment provider requires single-line values.

## Architecture

### Authentication and Sessions

Firebase Authentication handles client sign-in and registration. After sign-in, the app sends the Firebase ID token to a Server Action, verifies it with the Firebase Admin SDK, upserts the user document in Firestore, and stores the token in an HTTP-only session cookie.

Server Components and Server Actions read that cookie through `lib/utils/session.ts` to protect authenticated pages and mutations.

### File Uploads

1. The client requests a presigned upload URL from a Server Action.
2. The browser uploads the file directly to Cloudflare R2.
3. The client calls another Server Action to save file metadata in Firestore.
4. Dashboard data refreshes with signed read URLs and updated storage totals.

This keeps large file bytes out of the Next.js server path and lets R2 handle object storage directly.

### Billing

Storage plans are defined in `lib/billing/storage-plans.ts`. Stripe Checkout creates payment sessions, and the webhook route updates the user's purchased storage after successful checkout completion.

## Project Structure

```text
.
├── app/
│   ├── (auth)/                  # Sign-in, sign-up, and password recovery
│   ├── api/stripe/              # Stripe Checkout and webhook routes
│   ├── dashboard/               # Authenticated storage dashboard
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Public landing page
├── components/                  # Shared UI components
├── lib/
│   ├── actions/                 # Server Actions
│   ├── billing/                 # Storage plans and Stripe helpers
│   ├── firebase/                # Firebase client and admin setup
│   ├── r2/                      # Cloudflare R2 client and upload helpers
│   ├── types/                   # Shared TypeScript types
│   └── utils/                   # Session, OTP, hashing, and serialization helpers
├── public/                      # Static assets and screenshots
├── eslint.config.mjs            # ESLint configuration
├── next.config.js               # Next.js configuration
├── postcss.config.mjs           # PostCSS/Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Scripts and dependencies
```

## Available Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start the local development server |
| `npm run build`  | Create a production build          |
| `npm run start`  | Start the production server        |
| `npm run lint`   | Run ESLint                         |
| `npm run format` | Format files with Prettier         |
| `npm run all`    | Format, lint, and build            |

## License

No license file is currently included. Add a `LICENSE` file before publishing or distributing this project.

# Overview

Penkora is a modern, responsive Content Management System (CMS) built with React, TypeScript, and Express. The application is designed for seamless content creation and management across desktop, tablet, and mobile devices. It features a comprehensive admin interface with dashboard analytics, content management, media library, user management, and layout customization tools.

The project is currently in active development, with foundational components and UI established but requiring implementation of core backend functionality, database integration, and proper routing systems.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing (needs implementation for proper URL-based navigation)
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **UI Components**: Radix UI primitives with custom shadcn/ui components for consistent design system
- **Styling**: Tailwind CSS with custom design tokens and theme variables for light/dark mode support
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints and middleware
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Session Management**: Planned integration with connect-pg-simple for PostgreSQL-based sessions
- **Development Tools**: Hot module replacement and error overlay for enhanced developer experience

## Design System
- **Component Library**: Custom components built on Radix UI primitives following Fluent Design principles
- **Typography**: Inter font family with systematic weight and size scales
- **Color System**: CSS custom properties with automatic light/dark mode switching
- **Responsive Design**: Mobile-first approach with collapsible sidebar and adaptive layouts
- **Accessibility**: ARIA-compliant components with keyboard navigation and screen reader support

## Data Layer
- **Database Schema**: Drizzle schema definitions in shared/schema.ts with PostgreSQL-specific types
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development (needs PostgreSQL integration)
- **API Design**: RESTful endpoints with standardized error handling and JSON responses

## Development Architecture
- **Monorepo Structure**: Shared code between client and server with TypeScript path mapping
- **Hot Reloading**: Vite development server with Express middleware integration
- **Error Handling**: Comprehensive error boundaries and development-mode logging
- **Type Safety**: Strict TypeScript configuration with shared types between frontend and backend

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection via Neon's serverless driver
- **drizzle-orm & drizzle-kit**: Type-safe ORM with schema migrations and PostgreSQL dialect support
- **@tanstack/react-query**: Server state management, caching, and data synchronization
- **wouter**: Lightweight routing library for client-side navigation

## UI and Design Dependencies
- **@radix-ui/react-***: Comprehensive collection of unstyled, accessible UI primitives (accordion, dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework with custom design system configuration
- **class-variance-authority & clsx**: Dynamic className composition and variant management
- **lucide-react**: Modern icon library with consistent design language

## Development and Build Tools
- **vite**: Fast build tool with hot module replacement and optimized bundling
- **typescript**: Static type checking and enhanced developer experience
- **@replit/vite-plugin-***: Replit-specific development tools and error handling

## Form and Validation
- **react-hook-form & @hookform/resolvers**: Form state management with validation
- **zod & drizzle-zod**: Runtime type validation and schema inference

## Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **cmdk**: Command palette and search interface components
- **nanoid**: Unique ID generation for client-side operations

Note: The application is configured to use PostgreSQL via Neon's serverless platform, with Drizzle ORM handling database operations and migrations. Session management will be implemented using PostgreSQL-backed sessions once the database integration is completed.
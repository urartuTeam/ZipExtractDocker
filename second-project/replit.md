# Organization Management System

## Overview
This is a full-stack web application for managing organizational structures and projects. The system allows users to handle organizational units (organizations, departments, management positions), employees, and projects, with visualization capabilities for organizational charts and project team structures.

The application uses a modern React frontend with a Node.js Express backend, connected to a PostgreSQL database using Drizzle ORM. It features a clean UI built with shadcn/ui components and Tailwind CSS.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: Wouter (lightweight alternative to React Router)
- **Drag and Drop**: React DnD for interactive organization chart manipulation

### Backend
- **Runtime**: Node.js with Express
- **API**: RESTful API endpoints for all CRUD operations
- **Database Access**: Drizzle ORM for type-safe database queries

### Database
- **Type**: PostgreSQL (via Neon serverless)
- **Schema**: Entities for organizational units, employees, projects, and relationships
- **ORM**: Drizzle ORM with schema validation through Zod

### Authentication
No authentication is currently implemented, but the system is structured to easily add it.

## Key Components

### Database Schema
- `org_units`: Represents organizational entities (organizations, departments, management, positions)
- `employees`: Stores employee information with relationships to positions and departments
- `projects`: Manages project data
- `project_roles`: Defines roles within projects
- `employee_project_roles`: Maps employees to project roles

### API Structure
- `/api/org-units`: Endpoints for managing organizational units
- `/api/employees`: Endpoints for employee management
- `/api/projects`: Endpoints for project management

### Frontend Structure
- **Main Views**:
  - HR View: For managing organizational structure and employees
  - Project View: For managing projects and team assignments
- **Component Organization**:
  - `/components/ui`: Reusable UI components from shadcn/ui
  - `/components/hr`: Components specific to HR functionality
  - `/components/project`: Components specific to project management
  - `/lib`: Utility functions and shared logic
  - `/hooks`: Custom React hooks

## Data Flow

1. **Organization Management**:
   - User interacts with the organization chart
   - Drag-and-drop operations update the relationship between organizational units
   - Changes are sent to the server via API calls
   - The database is updated with new relationships
   - The UI refreshes to show the updated structure

2. **Employee Management**:
   - Employees can be created, viewed, updated, and assigned to positions
   - Employees can be moved between departments or positions via drag-and-drop
   - Changes are persisted through API calls

3. **Project Management**:
   - Projects can be created and managed with team structures
   - Employees can be assigned to specific roles within projects
   - Project views display the team structure and responsibilities

## External Dependencies

### Frontend Libraries
- **shadcn/ui**: Component library for UI elements
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management
- **React DnD**: Drag and drop functionality
- **Wouter**: Client-side routing
- **date-fns**: Date manipulation utilities

### Backend Libraries
- **Express**: Web server framework
- **Drizzle ORM**: Database ORM
- **Neon Database SDK**: PostgreSQL serverless client
- **Zod**: Schema validation

## Deployment Strategy

The application is configured for deployment on Replit with automatic scaling:

1. **Development Mode**:
   - `npm run dev` starts the application in development mode
   - Vite provides hot module reloading for frontend development
   - Backend runs with tsx for TypeScript execution without compilation

2. **Production Build**:
   - `npm run build` creates optimized production builds
   - Frontend: Vite builds and optimizes React code 
   - Backend: esbuild creates a bundled server package

3. **Production Runtime**:
   - `npm run start` runs the production build
   - Express serves the static frontend files
   - API routes handle all data operations

## Database Setup

The application uses Drizzle ORM with PostgreSQL. The schema is defined in `shared/schema.ts` and migrations can be created and applied using Drizzle Kit:

1. **Schema Definition**: Types and tables are defined in `shared/schema.ts`
2. **Database Connection**: Configured in `server/db.ts` using Neon's serverless PostgreSQL
3. **Migrations**: Can be pushed using `npm run db:push`

The system is designed to be fully type-safe from database to frontend thanks to shared TypeScript types.
# Admin Dashboard Components

This directory contains modular components for the admin dashboard, providing comprehensive management capabilities for the school website.

## Components Overview

### Core Components

- **`Sidebar.tsx`** - Navigation sidebar with menu items
- **`Header.tsx`** - Top header with notifications and logout
- **`DashboardContent.tsx`** - Main dashboard view with stats and activities
- **`UsersTable.tsx`** - User management table with CRUD operations
- **`ContentTable.tsx`** - Content management table for news and announcements

### Supporting Components

- **`StatsCards.tsx`** - Statistical overview cards
- **`ActivityList.tsx`** - Recent activity feed
- **`UserModal.tsx`** - Modal for adding/editing users with blur backdrop
- **`ContentModal.tsx`** - Modal for creating/editing content with blur backdrop

### Type Definitions

- **`types.ts`** - TypeScript interfaces and types for type safety

## Features

### Dashboard Overview
- Real-time statistics (students, teachers, OSIS, active content)
- Recent activity feed
- Quick action buttons

### User Management
- View all users with role-based filtering
- Add new users (students, teachers, staff)
- Edit existing user information
- Delete users with confirmation
- Search functionality
- Export capabilities

### Content Management
- Manage news and announcements
- View content by type and status
- Add new content with rich text
- Edit existing content
- View content statistics

### Notifications
- Real-time notification system
- Unread notification counter
- Detailed notification dropdown

## Usage

```tsx
import {
  Sidebar,
  Header,
  DashboardContent,
  UsersTable,
  ContentTable,
  UserModal,
  ContentModal
} from '@/components/dashboard/admin';

// Use components in your dashboard page
```

## Modal Features

- **Blur Backdrop**: All modals use `bg-black bg-opacity-20 backdrop-blur-sm` for modern UI
- **Responsive Design**: Modals adapt to different screen sizes
- **Form Validation**: Built-in form validation for user inputs
- **Type Safety**: Full TypeScript support with proper interfaces

## Styling

Components use Tailwind CSS with consistent design patterns:
- Gray color scheme for professional appearance
- Hover states for interactive elements
- Responsive grid layouts
- Shadow and border styling for depth

## State Management

Each component manages its own state while receiving necessary data through props, following React best practices for component composition.

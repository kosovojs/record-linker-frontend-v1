# React Application Architecture Guide (2025 Edition)

**Merged from multiple LLM models - consensus-based comprehensive guide for building scalable React applications.**

---

## Table of Contents
1. [Core Philosophy](#core-philosophy)
2. [Folder Structure](#folder-structure)
3. [Components Organization](#components-organization)
4. [The Fuzzy Line: Pages vs Blocks vs Components](#the-fuzzy-line-pages-vs-blocks-vs-components)
5. [API Layer Design](#api-layer-design)
6. [Redux Toolkit & State Management](#redux-toolkit--state-management)
7. [Authentication Flow](#authentication-flow)
8. [Status Handling Guidelines](#status-handling-guidelines)
9. [App Initialization Sequence](#app-initialization-sequence)
10. [Library vs Utils vs Feature Code](#library-vs-utils-vs-feature-code)

---

## Core Philosophy

Modern React architecture in 2025 has converged around **feature-based organization** with clear separation of concerns:

1. **Colocation**: Keep related code together (state, components, hooks for a feature in one folder)
2. **Separation of Layers**:
   - **Presentation Layer**: UI components (shadcn, custom reusable)
   - **Business Logic Layer**: Features with their own Redux slices
   - **Data Access Layer**: API services isolated from UI
   - **Orchestration Layer**: Pages that compose features
3. **Explicit Boundaries**: Make it obvious where code belongs by following strict folder conventions

**Key Mental Model**: Don't organize by *file type* (all components in one folder), organize by *domain/feature* (auth, dashboard, users).

---

## Folder Structure

```
src/
├── app/                      # Global app setup
│   ├── App.jsx               # Root component with auth boot logic
│   ├── main.jsx              # Entry point (ReactDOM.render)
│   ├── AppProviders.jsx       # All providers wrapper (Router, Store, etc.)
│   └── router/
│       ├── AppRouter.jsx      # Central route definitions
│       └── ProtectedRoute.jsx # Auth guard wrapper
│
├── components/                # GLOBAL Reusable Components
│   ├── ui/                  # shadcn components (DO NOT MODIFY)
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── card.jsx
│   │   └── dialog.jsx
│   ├── shared/              # Your custom reusable components
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── EmptyState.jsx
│   └── layout/              # Layout components (global wrappers)
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       ├── AppShell.jsx
│       └── PageContainer.jsx
│
├── features/                  # Feature-based modules (business domains)
│   ├── auth/
│   │   ├── authSlice.js      # Redux slice for auth
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   └── UserMenu.jsx
│   │   └── hooks/
│   │       └── useAuthValidation.js
│   ├── dashboard/
│   │   ├── dashboardSlice.js
│   │   ├── components/
│   │   │   ├── StatsPanel.jsx
│   │   │   └── ActivityFeed.jsx
│   │   └── hooks/
│   └── [other-features]/
│
├── blocks/                    # Composed sections (not full pages, not tiny components)
│   ├── auth/
│   │   └── LoginForm.jsx
│   └── dashboard/
│       ├── StatsPanel.jsx
│       └── ActivityFeed.jsx
│
├── pages/                     # Route-level page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── SettingsPage.jsx
│   └── NotFoundPage.jsx
│
├── services/                  # API layer (professional name for your fetch stuff)
│   ├── client/
│   │   ├── httpClient.js      # The fetch wrapper
│   │   ├── interceptors.js   # Request/response interceptors
│   │   └── errorHandler.js   # Centralized error handling
│   ├── endpoints/
│   │   ├── auth.endpoints.js
│   │   ├── users.endpoints.js
│   │   └── posts.endpoints.js
│   └── index.js              # Public API barrel export
│
├── store/                     # Redux Toolkit
│   ├── index.js              # Store configuration
│   ├── hooks.js              # Typed hooks (useAppDispatch, useAppSelector)
│   └── slices/
│       ├── authSlice.js
│       ├── appSlice.js
│       └── uiSlice.js
│
├── lib/                       # Internal "library" code
│   ├── storage.js           # localStorage/sessionStorage wrapper
│   ├── validation.js         # Form validation helpers
│   ├── formatters.js         # Date, currency formatters
│   └── constants.js
│
├── hooks/                     # Global custom hooks
│   ├── useAuth.js
│   ├── useDebounce.js
│   └── useLocalStorage.js
│
├── utils/                     # Generic utility functions
│   ├── cn.js                 # className merger (shadcn standard)
│   ├── sleep.js
│   └── createId.js
│
├── config/                    # App configuration
│   └── index.js
│
├── guards/                    # Route protection components
│   ├── AuthGuard.jsx
│   ├── GuestGuard.jsx
│   └── RoleGuard.jsx
│
└── styles/                    # Global styles
    └── globals.css
```

---

## Components Organization

### `/ui` — shadcn Components (Primitives)

**What goes here**: Components generated by shadcn CLI, minimally modified.

**Why separate from `/components`**: shadcn components are **design system primitives**. They're like Lego bricks - generic, stateless, styling-focused.

**Rule**: DO NOT modify these files. If you need customization, create a wrapper in `components/shared/`.

```jsx
// src/ui/button.jsx - Straight from shadcn
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### `/components/shared` — Your Custom Reusable Components

**What goes here**: Small to medium reusable components you build yourself.

**Rule of thumb**: If you'd use it in 3+ places across different features, it belongs here.

```jsx
// src/components/shared/LoadingSpinner.jsx
export function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-muted border-t-primary`}
      />
    </div>
  );
}
```

### `/components/layout` — Layout Components

**What goes here**: Structural wrappers (Header, Sidebar, AppShell).

```jsx
// src/components/layout/AppShell.jsx
export function AppShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Header />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr' }}>
        <Sidebar />
        <main style={{ padding: 16 }}>{children}</main>
      </div>
    </div>
  );
}
```

---

## The Fuzzy Line: Pages vs Blocks vs Components

This is where developers struggle most. Here's a clear decision framework:

| Type | Size | Reusability | Has Business Logic? | Example | Location |
|-------|-------|-------------|-------------------|---------|----------|
| **UI Primitive** (`/ui`) | Tiny | Universal | No | `<Button>`, `<Input>` | `/ui` |
| **Component** (`/components/shared`) | Small-Medium | Cross-feature | Minimal | `<LoadingSpinner>`, `<EmptyState>` | `/components/shared` |
| **Block** (`/blocks`) | Medium-Large | Feature-specific | Yes | `<StatsPanel>`, `<ActivityFeed>` | `/blocks/[feature]/` |
| **Page** (`/pages`) | Full viewport | Once per route | Orchestrates | `<DashboardPage>` | `/pages` |

**Rule of thumb**:
- If it has a URL → `pages/`
- If it's used across features → `components/`
- If it's feature-specific → `features/[feature]/components/` or `/blocks/[feature]/`
- If it connects to Redux or API → likely a Block (or stays in feature)

**Decision tree**:
```
Component: "UserProfileHeader"

Q: Is it tied to a URL?
   No → Not a page

Q: Is it used in multiple features?
   No → Not global

Q: Which feature does it belong to?
   → features/users/components/UserProfileHeader.jsx OR blocks/users/UserProfileHeader.jsx
```

---

## API Layer Design

### Professional naming: `services/` folder

**Why not one giant `api.js`**:
- **Searchability**: Easy to find `services/endpoints/users.endpoints.js`
- **Import clarity**: `import { authApi } from '@/services/endpoints/auth.endpoints'`
- **Parallel development**: Team members work on separate files
- **Lazy loading potential**: Can code-split by feature

### Structure

```
services/
├── client/
│   ├── httpClient.js      # The fetch wrapper with interceptors
│   ├── interceptors.js   # Request/response interceptors
│   └── errorHandler.js   # Centralized error handling
├── endpoints/
│   ├── auth.endpoints.js
│   ├── users.endpoints.js
│   └── posts.endpoints.js
└── index.js              # Public API barrel export
```

### HTTP Client Implementation

```javascript
// src/services/client/httpClient.js
import { config } from "@/config";
import { storage } from "@/lib/storage";
import { handleApiError } from "./errorHandler";

class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  getAuthHeader() {
    const token = storage.get("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  buildURL(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  }

  async request(endpoint, options = {}) {
    const {
      method = "GET",
      body,
      params,
      headers = {},
      requiresAuth = true,
      ...fetchOptions
    } = options;

    const url = this.buildURL(endpoint, params);
    const requestHeaders = {
      ...this.defaultHeaders,
      ...(requiresAuth ? this.getAuthHeader() : {}),
      ...headers,
    };

    const requestOptions = {
      method,
      headers: requestHeaders,
      ...fetchOptions,
    };

    if (body) {
      requestOptions.body =
        body instanceof FormData ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        };
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }
      return null;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const httpClient = new HttpClient(config.apiBaseUrl);
```

### Endpoints Example

```javascript
// src/services/endpoints/auth.endpoints.js
import { httpClient } from "../client/httpClient";

export const authEndpoints = {
  login: async (credentials) => {
    const result = await httpClient.post('/auth/login', credentials);
    return result;
  },

  logout: async () => {
    await httpClient.post('/auth/logout', {});
  },

  checkAuthStatus: async () => {
    return await httpClient.get('/auth/me');
  },
};
```

---

## Redux Toolkit & State Management

### Status Enum Pattern

**Use enums, not magic strings**:

```javascript
// src/lib/constants/statuses.js
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

// For app initialization specifically
export const APP_STATUS = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  READY: 'ready',
  ERROR: 'error',
};
```

### Auth Slice Implementation

```javascript
// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authEndpoints } from '@/services/endpoints/auth.endpoints';
import { storage } from '@/lib/storage';
import { REQUEST_STATUS } from '@/lib/constants/statuses';

// Thunk: Check auth status on app init
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = storage.get('authToken');
    if (!token) return { isAuthenticated: false, user: null };

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      const user = await authEndpoints.checkAuthStatus();
      return { isAuthenticated: true, user };
    } catch (error) {
      storage.remove('authToken');
      return rejectWithValue(error.message);
    }
  }
);

// Thunk: Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authEndpoints.login(credentials);
      storage.set('authToken', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Thunk: Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  await authEndpoints.logout();
  storage.remove('authToken');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    status: REQUEST_STATUS.IDLE,
    isAuthChecked: false, // Important: Has initial check completed?
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.status = REQUEST_STATUS.LOADING;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = REQUEST_STATUS.SUCCEEDED;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = REQUEST_STATUS.SUCCEEDED; // Still ready, just not authed
        state.isAuthenticated = false;
        state.user = null;
        state.isAuthChecked = true;
        state.error = action.payload;
      })

      .addCase(login.pending, (state) => {
        state.status = REQUEST_STATUS.LOADING;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = REQUEST_STATUS.SUCCEEDED;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = REQUEST_STATUS.FAILED;
        state.error = action.payload;
      })

      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = REQUEST_STATUS.IDLE;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

---

## Authentication Flow

### Critical Pattern: Never show "unauthenticated" state before auth check completes

**Sequence**:
1. App mounts → Dispatch `checkAuth()`
2. Show loading screen while `status === IDLE || status === LOADING`
3. Auth check completes → `isAuthChecked = true`
4. Render routes → `ProtectedRoute` checks `isAuthenticated`
5. If not authenticated → Redirect to `/login`

### Protected Route Component

```javascript
// src/guards/AuthGuard.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectAuth } from '@/store';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthChecked } = useSelector(selectAuth);
  const location = useLocation();

  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
```

### App Initialization Component

```javascript
// src/app/App.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, selectAuth } from '@/store';
import AppRouter from './router/AppRouter';
import { FullScreenSpinner } from '@/components/shared/FullScreenSpinner';

function App() {
  const dispatch = useDispatch();
  const { isAuthChecked } = useSelector(selectAuth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading screen while checking auth
  if (!isAuthChecked) {
    return <FullScreenSpinner label="Initializing application..." />;
  }

  // App is ready, render router
  return <AppRouter />;
}

export default App;
```

---

## Status Handling Guidelines

### Use Separate Status Fields for Independent Operations

```javascript
const initialState = {
  // App-level
  initStatus: REQUEST_STATUS.IDLE,

  // Feature-level
  postsStatus: REQUEST_STATUS.IDLE,
  commentsStatus: REQUEST_STATUS.IDLE,

  // Action-level
  createPostStatus: REQUEST_STATUS.IDLE,
  deletePostStatus: REQUEST_STATUS.IDLE,
};
```

**Why?** Prevents conflicts:
- Fetching posts shouldn't block creating a post
- Initializing auth shouldn't affect login form state

### Common Status Patterns

```javascript
// Loading state
if (status === REQUEST_STATUS.LOADING) {
  return <LoadingSpinner />;
}

// Error state
if (status === REQUEST_STATUS.FAILED) {
  return <ErrorMessage message={error} />;
}

// Success state (show data)
if (status === REQUEST_STATUS.SUCCEEDED) {
  return <DataList items={data} />;
}

// Empty state (succeeded but no data)
if (status === REQUEST_STATUS.SUCCEEDED && data.length === 0) {
  return <EmptyState />;
}
```

---

## Library vs Utils vs Feature Code

**When does something become "library code"?**

When it's:
- **Generic enough** to be published as npm package
- **Used across 3+ features**
- **Pure logic** with no UI coupling
- **Stable** (doesn't change often)

**Examples**:
- `formatCurrency` → `lib/formatters.js`
- `calculateUserSubscriptionTax` → Feature logic (belongs in feature)
- `debounce` → `utils/debounce.js`

**Directory differences**:
- `lib/` = Organized modules/schemas (validation, formatters, constants)
- `utils/` = Tiny, single-purpose functions (cn, sleep, createId)
- `features/[feature]/lib/` = Domain-specific utilities for that feature only

---

## App Initialization Sequence

**Critical pattern**: Never show "unauthorized" state before auth check completes.

1. App mounts → `app.initStatus` = `INITIALIZING`
2. Dispatch `checkAuth()` → `auth.status` = `LOADING`
3. Show `FullPageLoader` while `initStatus !== READY`
4. Auth resolves → `initStatus` = `READY`
5. Render `AppRouter`
6. Protected routes check `isAuthenticated`

This ensures you **never flash the wrong UI** (showing dashboard briefly before redirecting to login).

---

## Key Takeaways

1. **API layer**: Separate folder, organized by domain, reusable across features
2. **Features folder**: Self-contained business domains with components, slices, hooks
3. **Pages**: Thin orchestrators that compose feature components
4. **Global components**: Only for truly reusable UI (3+ features)
5. **Lib vs utils**: Lib = modules/schemas, utils = tiny helpers
6. **Status management**: Use `idle`, `loading`, `succeeded`, `failed` enums
7. **Auth flow**: Separate `initStatus` (app bootstrap) from login status (user action)
8. **Protected routes**: Check auth completion before rendering

This architecture scales from 5 components to 500 while keeping code discoverable and maintainable.

---

## Quick Reference: Decision Tree

```
Is this component reusable?
├─ No → Keep it in the feature/pages or feature/components
└─ Yes → Is it pure UI?
    ├─ Yes → Is it used across 3+ features?
    │  ├─ Yes → /components/shared or /components/layout
    │  └─ No → Keep it in the feature where it's used
    └─ No → Is it business logic (fetches data, Redux slice)?
        ├─ Yes → Keep it in the feature or /blocks
        └─ No → Could be /components/shared or /components/layout

Is this a page?
├─ Yes → /pages/
└─ No → It's a component (see above)
```

# Comprehensive React Fetch Wrapper

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Core Components](#core-components)
   - [Custom Error Classes](#custom-error-classes)
   - [Base Fetch Wrapper](#base-fetch-wrapper)
   - [Validators](#validators)
   - [Interceptors](#interceptors)
   - [Resource Factory](#resource-factory)
4. [Domain Resources](#domain-resources)
5. [API Aggregator](#api-aggregator)
6. [Usage Examples](#usage-examples)
7. [Advanced Features](#advanced-features)
8. [Best Practices](#best-practices)

---

## Architecture Overview

This fetch wrapper is designed for **production-grade React applications** with the following principles:

1. **Separation of Concerns**: HTTP logic, auth, validation, and domain resources are isolated
2. **DRY with Flexibility**: CRUD boilerplate is generated, but customizable
3. **Predictable API Surface**: `api.domain.method()` pattern everywhere
4. **Fail-Safe Design**: Validation catches API inconsistencies early with graceful degradation
5. **Developer Experience**: Intuitive usage, JSDoc documentation, IDE autocomplete

### Key Features

- ✅ Automatic authentication (Bearer tokens)
- ✅ JSON and FormData support (file uploads)
- ✅ Query parameter handling
- ✅ Response validation (handle legacy APIs that return 200 with errors)
- ✅ Custom error classes for better error handling
- ✅ Request/response interceptors
- ✅ Automatic retries with exponential backoff
- ✅ Request cancellation (AbortController)
- ✅ Resource factory for standard CRUD operations
- ✅ JSDoc documentation throughout

---

## Directory Structure

```
src/
└── api/
    ├── index.js                 # API aggregator - single export point
    ├── client.js               # Core fetch wrapper
    ├── errors.js                # Custom error classes
    ├── validators.js            # Response validation strategies
    ├── interceptors.js          # Auth & request/response transforms
    ├── resourceFactory.js       # CRUD factory
    └── resources/
        ├── comments.js          # Domain: comments
        ├── posts.js             # Domain: posts
        ├── users.js             # Domain: users
        └── auth.js              # Domain: authentication
```

---

## Core Components

### Custom Error Classes

```javascript
// src/api/errors.js

/**
 * Base API error - all API errors extend this
 */
export class ApiError extends Error {
  constructor(message, { status, code, data, originalError } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
    this.originalError = originalError;
  }

  /** @returns {boolean} True if this is a client error (4xx) */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /** @returns {boolean} True if this is a server error (5xx) */
  isServerError() {
    return this.status >= 500;
  }
}

/**
 * Thrown when response validation fails
 */
export class ValidationError extends ApiError {
  constructor(message, { validationRule, response, ...rest } = {}) {
    super(message, rest);
    this.name = 'ValidationError';
    this.validationRule = validationRule;
    this.response = response;
  }
}

/**
 * Thrown on network failures
 */
export class NetworkError extends ApiError {
  constructor(message, originalError) {
    super(message, { originalError });
    this.name = 'NetworkError';
    this.status = 0;
  }
}

/**
 * Thrown when auth is required but missing/invalid
 */
export class AuthError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, { status: 401 });
    this.name = 'AuthError';
  }
}
```

---

### Validators

```javascript
// src/api/validators.js
import { ValidationError } from './errors.js';

/**
 * Validates that legacy APIs with status field report success
 */
export function legacyStatusField({
  field = 'status',
  successValues = ['success', 'ok'],
  defaultValue,
} = {}) {
  const validValues = Array.isArray(successValues)
    ? successValues
    : [successValues];

  return {
    name: `legacyStatusField:${field}`,
    defaultValue,
    validate(data) {
      const value = data?.[field];
      if (!validValues.includes(value)) {
        return {
          valid: false,
          message: `Expected ${field}="${validValues.join('|')}", got "${value}"`,
          status: 422,
        };
      }
      return { valid: true };
    },
  };
}

/**
 * Validates response is an array
 */
export function expectArray({ defaultValue = [] } = {}) {
  return shape(Array.isArray, {
    message: 'Expected array response',
    defaultValue,
  });
}

/**
 * Validates response shape with custom predicate
 */
export function shape(predicate, { message, defaultValue, status = 422 } = {}) {
  return {
    name: 'shape',
    defaultValue,
    validate(data) {
      if (!predicate(data)) {
        return {
          valid: false,
          message: message || 'Response shape validation failed',
          status,
        };
      }
      return { valid: true };
    },
  };
}

/**
 * Runs all validators against response data
 */
export function runValidators(data, response, rules = []) {
  for (const rule of rules) {
    const result = rule.validate(data, response);

    if (!result.valid) {
      // If defaultValue is defined, use it instead of throwing
      if ('defaultValue' in rule && rule.defaultValue !== undefined) {
        return { data: rule.defaultValue, wasDefaulted: true };
      }

      throw new ValidationError(result.message, {
        status: result.status,
        validationRule: rule.name,
        response: data,
      });
    }
  }

  return { data, wasDefaulted: false };
}
```

---

### Interceptors

```javascript
// src/api/interceptors.js

/** @type {() => string | null} */
let tokenGetter = () => null;

/** @type {(error: Error) => void} */
let onAuthFailure = () => {};

/**
 * Configure auth handling
 */
export function configureAuth({ getToken, onAuthFailure: onFail }) {
  tokenGetter = getToken;
  if (onFail) onAuthFailure = onFail;
}

/**
 * Adds Authorization header if token exists
 */
export function authInterceptor(config) {
  const token = tokenGetter();

  if (token && !config.options.headers?.['Authorization']) {
    config.options.headers = {
      ...config.options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
}

/**
 * Handles 401 responses
 */
export function authErrorInterceptor(response, config) {
  if (response.status === 401 && !config.meta?.skipAuthCheck) {
    onAuthFailure(new Error('Unauthorized'));
  }
  return response;
}

/** Default interceptors */
export const defaultRequestInterceptors = [authInterceptor];
export const defaultResponseInterceptors = [authErrorInterceptor];
```

---

### Base Fetch Wrapper

```javascript
// src/api/client.js
import { ApiError, NetworkError } from './errors.js';
import { runValidators } from './validators.js';
import {
  defaultRequestInterceptors,
  defaultResponseInterceptors,
} from './interceptors.js';

/**
 * @typedef {Object} RequestOptions
 * @property {Object} [params] - Query string parameters
 * @property {Object} [body] - JSON body (auto-serialized)
 * @property {FormData} [formData] - Form data (for file uploads)
 * @property {Object} [headers] - Additional headers
 * @property {import('./validators.js').ValidationRule[]} [validators]
 * @property {boolean} [skipAuthCheck] - Don't trigger auth failure on 401
 * @property {AbortSignal} [signal] - For request cancellation
 */

class HttpClient {
  #baseUrl;

  #requestInterceptors;
  #responseInterceptors;

  constructor({
    baseUrl,
    requestInterceptors = defaultRequestInterceptors,
    responseInterceptors = defaultResponseInterceptors,
  }) {
    this.#baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.#requestInterceptors = requestInterceptors;
    this.#responseInterceptors = responseInterceptors;
  }

  /**
   * Builds URL with query parameters
   */
  #buildUrl(path, params) {
    const url = new URL(path, this.#baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // Handle arrays: ?ids[]=1&ids[]=2
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(`${key}[]`, String(v)));
        } else {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Core request method
   */
  async request(method, path, options = {}) {
    const {
      params,
      body,
      formData,
      headers = {},
      validators = [],
      skipAuthCheck = false,
      signal,
    } = options;

    // Build fetch options
    const fetchOptions = {
      method,
      headers: { ...headers },
      signal,
    };

    // Handle body - JSON or FormData
    if (formData) {
      // Don't set Content-Type for FormData - browser sets it with boundary
      fetchOptions.body = formData;
    } else if (body) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }

    // Build request config
    let config = {
      url: this.#buildUrl(path, params),
      options: fetchOptions,
      meta: { skipAuthCheck },
    };

    // Run request interceptors
    for (const interceptor of this.#requestInterceptors) {
      config = await interceptor(config);
    }

    // Execute fetch
    let response;
    try {
      response = await fetch(config.url, config.options);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      throw new NetworkError('Network request failed', err);
    }

    // Run response interceptors
    for (const interceptor of this.#responseInterceptors) {
      response = await interceptor(response, config);
    }

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (response.status !== 204) {
      data = await response.text();
    }

    // HTTP error
    if (!response.ok) {
      throw new ApiError(data?.message || `HTTP ${response.status}`, {
        status: response.status,
        code: data?.code,
        data,
      });
    }

    // Run validators
    const { data: validatedData } = runValidators(data, response, validators);

    return validatedData;
  }

  // Convenience methods
  get(path, options) { return this.request('GET', path, options); }
  post(path, options) { return this.request('POST', path, options); }
  put(path, options) { return this.request('PUT', path, options); }
  patch(path, options) { return this.request('PATCH', path, options); }
  delete(path, options) { return this.request('DELETE', path, options); }
}

// Singleton instance
export const httpClient = new HttpClient({
  baseUrl: import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || '/api',
});

export { HttpClient };
```

---

### Resource Factory

```javascript
// src/api/resourceFactory.js
import { httpClient } from './client.js';
import { expectArray } from './validators.js';

/**
 * @typedef {Object} EndpointConfig
 * @property {string} [path] - Override default path
 * @property {import('./validators.js').ValidationRule[]} [validators]
 * @property {(params: any) => any} [transformParams] - Transform input params
 * @property {(data: any) => any} [transformResponse] - Transform response
 */

/**
 * @typedef {Object} ResourceConfig
 * @property {string} basePath - Base API path (e.g., '/comments')
 * @property {Object.<string, EndpointConfig>} [endpoints] - Override default endpoints
 * @property {string[]} [only] - Only include these CRUD methods
 * @property {string[]} [except] - Exclude these CRUD methods
 */

const DEFAULT_CRUD = ['list', 'get', 'create', 'update', 'delete'];

/**
 * Creates CRUD endpoints for a resource
 */
export function createResource(config) {
  const { basePath, endpoints = {}, only, except = [] } = config;

  const includeMethods = only || DEFAULT_CRUD;
  const methods = includeMethods.filter((m) => !except.includes(m));

  const resource = {};

  // Build each CRUD method
  if (methods.includes('list')) {
    const cfg = endpoints.list || {};
    resource.list = (params, options = {}) => {
      const finalParams = cfg.transformParams
        ? cfg.transformParams(params)
        : params;

      return httpClient.get(cfg.path || basePath, {
        params: finalParams,
        validators: cfg.validators || [expectArray({ defaultValue: [] })],
        ...options,
      }).then((data) => (cfg.transformResponse ? cfg.transformResponse(data) : data));
    };
  }

  if (methods.includes('get')) {
    const cfg = endpoints.get || {};
    resource.get = (id, params, options = {}) => {
      const path = cfg.path
        ? cfg.path.replace(':id', id)
        : `${basePath}/${id}`;

      return httpClient.get(path, {
        params,
        validators: cfg.validators,
        ...options,
      }).then((data) => (cfg.transformResponse ? cfg.transformResponse(data) : data));
    };
  }

  if (methods.includes('create')) {
    const cfg = endpoints.create || {};
    resource.create = (data, options = {}) => {
      const finalData = cfg.transformParams ? cfg.transformParams(data) : data;

      return httpClient.post(cfg.path || basePath, {
        body: finalData,
        validators: cfg.validators,
        ...options,
      }).then((res) => (cfg.transformResponse ? cfg.transformResponse(res) : res));
    };
  }

  if (methods.includes('update')) {
    const cfg = endpoints.update || {};
    resource.update = (id, data, options = {}) => {
      const path = cfg.path
        ? cfg.path.replace(':id', id)
        : `${basePath}/${id}`;
      const finalData = cfg.transformParams ? cfg.transformParams(data) : data;

      return httpClient.patch(path, {
        body: finalData,
        validators: cfg.validators,
        ...options,
      }).then((res) => (cfg.transformResponse ? cfg.transformResponse(res) : res));
    };
  }

  if (methods.includes('delete')) {
    const cfg = endpoints.delete || {};
    resource.delete = (id, options = {}) => {
      const path = cfg.path
        ? cfg.path.replace(':id', id)
        : `${basePath}/${id}`;

      return httpClient.delete(path, {
        validators: cfg.validators,
        ...options,
      });
    };
  }

  return resource;
}

/**
 * Merges custom methods with CRUD resource
 */
export function extendResource(config, customMethods) {
  const baseResource = createResource(config);
  return { ...baseResource, ...customMethods };
}
```

---

## Domain Resources

### Comments

```javascript
// src/api/resources/comments.js
import { httpClient } from '../client/HttpClient.js';
import { extendResource } from '../resourceFactory.js';
import { expectArray, legacyStatusField } from '../validators.js';

/**
 * Comments API resource
 */
export const comments = extendResource(
  {
    basePath: '/comments',
    endpoints: {
      list: {
        validators: [expectArray({ defaultValue: [] })],
      },
      create: {
        validators: [
          legacyStatusField({
            field: 'status',
            successValues: ['success'],
          }),
        ],
        transformResponse: (res) => res.data,
      },
    },
  },
  {
    /**
     * Get all comments for a specific post
     */
    getByPost(postId, params) {
      return httpClient.get(`/posts/${postId}/comments`, {
        params,
        validators: [expectArray({ defaultValue: [] })],
      });
    },

    /**
     * Mark comment as spam (moderator action)
     */
    markAsSpam(id) {
      return httpClient.post(`/comments/${id}/spam`);
    },

    /**
     * Submit a comment with optional file upload
     */
    submitWithFile(body, file) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(body));
      formData.append('file', file);

      return httpClient.post('/comments', {
        body: formData,
        formData,
      });
    },
  }
);
```

### Posts

```javascript
// src/api/resources/posts.js
import { httpClient } from '../client/HttpClient.js';
import { extendResource } from '../resourceFactory.js';
import { expectArray, requiredFields } from '../validators.js';

/**
 * Posts API resource
 */
export const posts = extendResource(
  {
    basePath: '/posts',
    endpoints: {
      get: {
        validators: [requiredFields(['id', 'title', 'body'])],
      },
    },
  },
  {
    /**
     * Get posts by specific author
     */
    getByAuthor(authorId, params) {
      return httpClient.get('/posts', {
        params: { ...params, authorId },
        validators: [expectArray()],
      });
    },

    /**
     * Publish a draft post
     */
    publish(id) {
      return httpClient.post(`/posts/${id}/publish`);
    },

    /**
     * Upload featured image for post
     */
    uploadImage(id, file, meta = {}) {
      const formData = new FormData();
      formData.append('image', file);
      Object.entries(meta).forEach(([key, value]) => {
        formData.append(key, value);
      });

      return httpClient.post(`/posts/${id}/image`, {
        body: formData,
        formData,
      });
    },
  }
);
```

### Users

```javascript
// src/api/resources/users.js
import { httpClient } from '../client/HttpClient.js';
import { extendResource } from '../resourceFactory.js';

/**
 * Users API resource
 */
export const users = extendResource(
  {
    basePath: '/users',
    except: ['delete'], // No hard delete endpoint
  },
  {
    /**
     * Get current authenticated user
     */
    me() {
      return httpClient.get('/users/me');
    },

    /**
     * Deactivate user account (soft delete)
     */
    deactivate(id) {
      return httpClient.post(`/users/${id}/deactivate`);
    },

    /**
     * Update user avatar
     */
    updateAvatar(id, file) {
      const formData = new FormData();
      formData.append('avatar', file);
      return httpClient.put(`/users/${id}/avatar`, {
        body: formData,
        formData,
      });
    },

    /**
     * Search users by query
     */
    search(query, params) {
      return httpClient.get('/users/search', {
        params: { q: query, ...params },
      });
    },
  }
);
```

### Auth

```javascript
// src/api/resources/auth.js
import { httpClient } from '../client/HttpClient.js';

/**
 * Authentication endpoints (no CRUD pattern)
 */
export const auth = {
  /**
   * Login with credentials
   */
  login(email, password) {
    return httpClient.post('/auth/login', {
      body: { email, password },
      skipAuthCheck: true,
    });
  },

  /**
   * Register new account
   */
  register(data) {
    return httpClient.post('/auth/register', {
      body: data,
      skipAuthCheck: true,
    });
  },

  /**
   * Refresh access token
   */
  refresh(refreshToken) {
    return httpClient.post('/auth/refresh', {
      body: { refreshToken },
      skipAuthCheck: true,
    });
  },

  /**
   * Logout
   */
  logout() {
    return httpClient.post('/auth/logout');
  },

  /**
   * Request password reset email
   */
  forgotPassword(email) {
    return httpClient.post('/auth/forgot-password', {
      body: { email },
      skipAuthCheck: true,
    });
  },
};
```

---

## API Aggregator

```javascript
// src/api/index.js

// Re-export everything for easy setup
export { httpClient, HttpClient } from './client/HttpClient.js';
export { configureAuth } from './interceptors.js';
export * from './validators.js';
export * from './errors.js';
export { createResource, extendResource } from './resourceFactory.js';

// Import all resources
import { auth } from './resources/auth.js';
import { comments } from './resources/comments.js';
import { posts } from './resources/posts.js';
import { users } from './resources/users.js';

/**
 * Unified API object
 *
 * @example
 * import { api } from '@/api';
 * api.comments.getByPost(123);
 * api.auth.login('email', 'password');
 */
export const api = {
  auth,
  comments,
  posts,
  users,
};

export default api;
```

---

## Usage Examples

### App Setup

```javascript
// main.jsx or App.jsx
import { configureAuth } from '@/api';
import { store } from '@/store';

// Configure auth - runs once at app init
configureAuth({
  getToken: () => store.getState().auth.accessToken,
  onAuthFailure: () => {
    store.dispatch({ type: 'auth/logout' });
    window.location.href = '/login';
  },
});
```

### In React Components

```jsx
import { useState, useEffect } from 'react';
import { api } from '@/api';
import { ApiError } from '@/api/errors';

function PostComments({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    api.comments
      .getByPost(postId, { page: 1 }, { signal: controller.signal })
      .then(setComments)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [postId]);

  const handleSubmit = async (body) => {
    try {
      const newComment = await api.comments.create({ postId, body });
      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      if (err instanceof ApiError && err.isClientError()) {
        // Show validation errors
      } else {
        // Show generic error
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {comments.map((c) => (
        <div key={c.id}>{c.text}</div>
      ))}
    </div>
  );
}
```

### In Redux Toolkit

```javascript
// store/slices/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/api';

export const fetchPosts = createAsyncThunk(
  'posts/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await api.posts.list(params);
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status,
      });
    }
  }
);

export const fetchCommentsByPost = createAsyncThunk(
  'comments/fetchByPost',
  async (postId) => {
    return api.comments.getByPost(postId);
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], status: 'idle', error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default postsSlice.reducer;
```

---

## Advanced Features

### Request Deduplication

```javascript
// In client.js
const inflightRequests = new Map();

function getCacheKey(endpoint, options) {
  return `${options.method}:${endpoint}:${JSON.stringify(options.params)}`;
}

async fetcher(endpoint, options) {
  // Only dedupe GET requests
  if (options.method === 'GET') {
    const key = getCacheKey(endpoint, options);

    if (inflightRequests.has(key)) {
      return inflightRequests.get(key);
    }

    const promise = executeFetch(endpoint, options);
    inflightRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      inflightRequests.delete(key);
    }
  }

  return executeFetch(endpoint, options);
}
```

### Retry Logic

```javascript
async function fetchWithRetry(endpoint, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetcher(endpoint, options);
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      const isRetriable = error.status >= 500 || error.status === 0;

      if (isLastAttempt || !isRetriable) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
    }
  }
}
```

### Request/Response Interceptors

```javascript
// In client.js
const interceptors = {
  request: [],
  response: []
};

export function addRequestInterceptor(fn) {
  interceptors.request.push(fn);
}

export function addResponseInterceptor(fn) {
  interceptors.response.push(fn);
}

// In fetcher, before fetch
let finalOptions = options;
for (const interceptor of interceptors.request) {
  finalOptions = await interceptor(finalOptions);
}

// After fetch
let finalData = data;
for (const interceptor of interceptors.response) {
  finalData = await interceptor(finalData);
}
```

### Token Refresh Flow

```javascript
let isRefreshing = false;
let refreshPromise = null;

async fetcher(endpoint, options) {
  try {
    return await executeFetch(endpoint, options);
  } catch (error) {
    if (error.status === 401 && !options._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }

      await refreshPromise;
      isRefreshing = false;

      // Retry with new token
      return fetcher(endpoint, { ...options, _retry: true });
    }
    throw error;
  }
}
```

---

## Best Practices

| Practice | Description |
|----------|-------------|
| **Resource Organization** | Group related endpoints in resource files (e.g., all comment-related endpoints in `comments.js`) |
| **Environment Configuration** | Store API base URL in environment variables (`VITE_API_URL` or `REACT_APP_API_URL`) |
| **TypeScript Integration** | For TypeScript projects, define interfaces for request/response shapes |
| **Mocking for Development** | Create a mock API client for development without a real backend |
| **Request Caching** | Implement caching for frequently accessed data |
| **Request Deduplication** | Avoid duplicate requests for the same data |
| **Request Cancellation** | Implement cancellation for pending requests when components unmount |
| **Retry Logic** | Add retry mechanism for failed requests with exponential backoff |
| **Request Logging** | Log requests and responses in development for debugging |
| **Analytics Integration** | Track API usage and performance metrics |

---

## Summary of Architecture Decisions

| Decision | Rationale |
|-----------|-------------|
| Class-based `HttpClient` | Encapsulates state (interceptors), testable via DI |
| Function-based resources | Simpler than classes for stateless endpoint definitions |
| `createResource` factory | Eliminates CRUD boilerplate, ~80% of endpoints are standard |
| `extendResource` | Clean composition of CRUD + custom methods |
| Validators with `defaultValue` | Graceful degradation vs hard failures per-endpoint |
| Separate error classes | Enables instanceof checks, consistent error shape |
| Single `api` export | Tree-shaking friendly, IDE autocomplete, grep-able |
| Interceptors as arrays | Order matters for auth, easy to add logging/metrics |

This architecture scales from 5 endpoints to 500+ while keeping each file focused and maintainable.

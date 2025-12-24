# Professional Fetch Wrapper Architecture for React

This document synthesizes best practices for building a robust, maintainable, and scalable API layer in React projects. It follows a domain-driven, layered architecture designed to survive years of product growth.

## 🎯 Architecture Philosophy

The core idea is to separate concerns into four distinct layers:
1.  **Transport Layer**: Raw `fetch` wrapper (auth, headers, error normalization).
2.  **Factory Layer**: Reusable CRUD logic to keep code DRY.
3.  **Service Layer**: Domain-specific modules (Comments, Posts) that extend the factory.
4.  **Interface Layer**: A single entry point for the entire application.

---

## 📂 Recommended Project Structure

```
src/
└── api/
    ├── index.js              # API aggregator (Public API surface)
    ├── core/
    │   ├── client.js         # Core fetch wrapper
    │   ├── factory.js        # CRUD resource generator
    │   ├── validators.js     # Response validation rules
    │   └── errors.js         # Custom error classes
    ├── utils/
    │   └── query-string.js   # URL parameter serialization
    └── services/
        ├── auth.js           # Auth domain logic
        ├── comments.js       # Comments domain logic
        └── posts.js          # Posts domain logic
```

---

## 🧱 Step 1: Core Transport Layer (`core/client.js`)

This layer handles the "dirty work" of HTTP requests: auth tokens, query string serialization, FormData detection, and error normalization.

```javascript
// src/api/core/client.js
import { buildQueryString } from '../utils/query-string';
import { ApiError } from './errors';

/**
 * Main Request Wrapper
 */
export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers = {},
    auth = true,
    validator,
    fallbackValue = undefined,
    ...customConfig
  } = options;

  const baseUrl = process.env.REACT_APP_API_URL || '/api/v1';
  let url = `${baseUrl}${endpoint}`;

  // 1. Handle Query Params
  if (params) {
    url += buildQueryString(params);
  }

  // 2. Build Headers
  const finalHeaders = {
    'Accept': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // 3. Handle Body & Content-Type
  let finalBody;
  if (body instanceof FormData) {
    finalBody = body; // Browser sets Content-Type with boundary
  } else if (body) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      ...customConfig,
    });

    // 4. Initial HTTP Check
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status, errorData);
    }

    const data = await response.json();

    // 5. Validation & Legacy Error Handling
    if (validator) {
      const isValid = validator.check(data);
      if (!isValid) {
        if (fallbackValue !== undefined) return fallbackValue;
        throw new ApiError(validator.message || 'Validation Failed', 200, data);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network Error', 0);
  }
}
```

---

## 🛠 Step 2: Validation & Error Layer (`core/errors.js` & `core/validators.js`)

Handle "Legacy 200" errors (APIs returning 200 OK with `{ status: "error" }`) and normalize them.

```javascript
// src/api/core/errors.js
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isApiError = true;
  }
}

// src/api/core/validators.js
export const validators = {
  legacyStatus: {
    check: (data) => data?.status !== 'error' && data?.success !== false,
    message: 'API Logical Error'
  },
  ensureArray: {
    check: (data) => Array.isArray(data),
    message: 'Expected array response'
  }
};
```

---

## 🔧 Step 3: Utility Layer (`utils/query-string.js`)

A smart serializer for URL parameters.

```javascript
// src/api/utils/query-string.js
/**
 * Build query string from object, handling arrays and nulls.
 */
export function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) return '';
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
    } else {
      searchParams.append(key, value);
    }
  });
  
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}
```

---

## 🏗 Step 4: Factory Layer (`core/factory.js`)

Avoid repeating CRUD logic for every resource.

```javascript
// src/api/core/factory.js
import { request } from './client';

export const createCRUDEndpoints = (resourceUrl, baseConfig = {}) => ({
  list: (params) => request(resourceUrl, { method: 'GET', params, ...baseConfig }),
  get: (id) => request(`${resourceUrl}/${id}`, { method: 'GET', ...baseConfig }),
  create: (body) => request(resourceUrl, { method: 'POST', body, ...baseConfig }),
  update: (id, body) => request(`${resourceUrl}/${id}`, { method: 'PATCH', body, ...baseConfig }),
  remove: (id) => request(`${resourceUrl}/${id}`, { method: 'DELETE', ...baseConfig }),
});
```

---

## 🧩 Step 5: Domain Services (`services/*.js`)

Organize endpoints by domain. Mix automated CRUD with specific business logic.

```javascript
// src/api/services/comments.js
import { request } from '../core/client';
import { createCRUDEndpoints } from '../core/factory';
import { validators } from '../core/validators';

const RESOURCE = '/comments';

const defaults = createCRUDEndpoints(RESOURCE, {
  validator: validators.legacyStatus
});

export const commentsApi = {
  ...defaults,

  /**
   * Get comments for a specific post
   * @param {string|number} postId
   */
  getByPost: (postId) => request(`${RESOURCE}/post/${postId}`, {
    method: 'GET',
    fallbackValue: [] // Graceful degradation
  }),

  /**
   * Upload attachment with FormData
   */
  uploadAttachment: (commentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`${RESOURCE}/${commentId}/attachment`, {
      method: 'POST',
      body: formData
    });
  }
};
```

---

## 🔗 Step 6: Public API Entry Point (`api/index.js`)

The singleton object used by the rest of the application.

```javascript
// src/api/index.js
import { authApi } from './services/auth';
import { commentsApi } from './services/comments';
import { postsApi } from './services/posts';

export const api = {
  auth: authApi,
  comments: commentsApi,
  posts: postsApi,
};
```

---

## 🚀 Usage Examples

### In Components (with hooks)
```javascript
useEffect(() => {
  api.comments.getByPost(postId)
    .then(setComments)
    .catch(err => console.error(err.message));
}, [postId]);
```

### In Redux Slices (RTK)
```javascript
export const fetchComments = createAsyncThunk('comments/fetchAll', async (postId) => {
  return await api.comments.getByPost(postId);
});
```

---

## 💡 Best Practices Summary
- **Domain-based grouping**: Keep locality of reference (all `comments` logic together).
- **JSDoc Documentation**: Vital for IDE autocomplete and onboarding.
- **FormData Detection**: Automatically handle `multipart/form-data` by checking `instanceof FormData`.
- **Legacy Error Normalization**: Use validators to catch logical errors hidden in 200 responses.
- **Graceful Degradation**: Use `fallbackValue` to prevent UI crashes on non-critical failures.
- **Centralized Auth**: Handle token injection in the core client.

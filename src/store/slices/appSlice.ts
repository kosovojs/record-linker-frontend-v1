import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  // Auth placeholder for future
  isAuthChecked: boolean
  isAuthenticated: boolean
  user: null | { uuid: string; email: string; name: string }

  // Global app state
  isLoading: boolean
  error: string | null
}

const initialState: AppState = {
  isAuthChecked: true, // Set to true for now (no auth)
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    // Future auth actions
    setUser: (state, action: PayloadAction<AppState['user']>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setLoading, setError, clearError, setUser, logout } = appSlice.actions

// Selectors
export const selectIsAuthChecked = (state: { app: AppState }) => state.app.isAuthChecked
export const selectIsAuthenticated = (state: { app: AppState }) => state.app.isAuthenticated
export const selectUser = (state: { app: AppState }) => state.app.user
export const selectIsLoading = (state: { app: AppState }) => state.app.isLoading
export const selectError = (state: { app: AppState }) => state.app.error

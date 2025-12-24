import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface User {
  uuid: string
  email: string
  name: string
}

export interface AppState {
  // Auth placeholder for future
  isAuthChecked: boolean
  isAuthenticated: boolean
  user: User | null

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
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { actions } = appSlice

// Selectors - take the slice state directly, will be composed in index
export const selectors = {
  isAuthChecked: (state: { app: AppState }) => state.app.isAuthChecked,
  isAuthenticated: (state: { app: AppState }) => state.app.isAuthenticated,
  user: (state: { app: AppState }) => state.app.user,
  isLoading: (state: { app: AppState }) => state.app.isLoading,
  error: (state: { app: AppState }) => state.app.error,
}

export default appSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

interface User {
  uuid: string
  email: string
  name: string
}

interface AppState {
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

export const selectors = {
  isAuthChecked: (state: RootState) => state.app.isAuthChecked,
  isAuthenticated: (state: RootState) => state.app.isAuthenticated,
  user: (state: RootState) => state.app.user,
  isLoading: (state: RootState) => state.app.isLoading,
  error: (state: RootState) => state.app.error,
}

export default appSlice.reducer

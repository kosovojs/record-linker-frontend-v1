import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

interface UiState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
}

const initialState: UiState = {
  sidebarCollapsed: false,
  theme: 'system',
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setTheme: (state, action: PayloadAction<UiState['theme']>) => {
      state.theme = action.payload
    },
  },
})

export const { actions } = uiSlice

export const selectors = {
  sidebarCollapsed: (state: RootState) => state.ui.sidebarCollapsed,
  theme: (state: RootState) => state.ui.theme,
}

export default uiSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface UiState {
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

// Selectors - take the slice state directly, will be composed in index
export const selectors = {
  sidebarCollapsed: (state: { ui: UiState }) => state.ui.sidebarCollapsed,
  theme: (state: { ui: UiState }) => state.ui.theme,
}

export default uiSlice.reducer

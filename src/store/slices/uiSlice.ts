import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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

export const { toggleSidebar, setSidebarCollapsed, setTheme } = uiSlice.actions

// Selectors
export const selectSidebarCollapsed = (state: { ui: UiState }) => state.ui.sidebarCollapsed
export const selectTheme = (state: { ui: UiState }) => state.ui.theme

import { configureStore } from '@reduxjs/toolkit'
import { uiSlice, appSlice } from './slices'

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    app: appSlice.reducer,
  },
  devTools: import.meta.env.DEV,
})

// Infer types from store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

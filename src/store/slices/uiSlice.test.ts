import { describe, it, expect } from 'vitest'
import uiReducer, { actions, selectors, type UiState } from './uiSlice'

describe('uiSlice', () => {
  const initialState: UiState = {
    sidebarCollapsed: false,
    theme: 'system',
  }

  describe('reducers', () => {
    describe('toggleSidebar', () => {
      it('should toggle sidebar from false to true', () => {
        const state = uiReducer(initialState, actions.toggleSidebar())
        expect(state.sidebarCollapsed).toBe(true)
      })

      it('should toggle sidebar from true to false', () => {
        const collapsedState = { ...initialState, sidebarCollapsed: true }
        const state = uiReducer(collapsedState, actions.toggleSidebar())
        expect(state.sidebarCollapsed).toBe(false)
      })
    })

    describe('setSidebarCollapsed', () => {
      it('should set sidebar collapsed to true', () => {
        const state = uiReducer(initialState, actions.setSidebarCollapsed(true))
        expect(state.sidebarCollapsed).toBe(true)
      })

      it('should set sidebar collapsed to false', () => {
        const collapsedState = { ...initialState, sidebarCollapsed: true }
        const state = uiReducer(collapsedState, actions.setSidebarCollapsed(false))
        expect(state.sidebarCollapsed).toBe(false)
      })
    })

    describe('setTheme', () => {
      it('should set theme to light', () => {
        const state = uiReducer(initialState, actions.setTheme('light'))
        expect(state.theme).toBe('light')
      })

      it('should set theme to dark', () => {
        const state = uiReducer(initialState, actions.setTheme('dark'))
        expect(state.theme).toBe('dark')
      })

      it('should set theme to system', () => {
        const darkState = { ...initialState, theme: 'dark' as const }
        const state = uiReducer(darkState, actions.setTheme('system'))
        expect(state.theme).toBe('system')
      })
    })
  })

  describe('selectors', () => {
    const rootState = { ui: initialState }

    it('sidebarCollapsed should return sidebarCollapsed state', () => {
      expect(selectors.sidebarCollapsed(rootState)).toBe(false)
    })

    it('theme should return theme state', () => {
      expect(selectors.theme(rootState)).toBe('system')
    })

    it('selectors work with updated state', () => {
      const updatedState = {
        ui: {
          sidebarCollapsed: true,
          theme: 'dark' as const,
        },
      }

      expect(selectors.sidebarCollapsed(updatedState)).toBe(true)
      expect(selectors.theme(updatedState)).toBe('dark')
    })
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = uiReducer(undefined, { type: 'unknown' })
      expect(state.sidebarCollapsed).toBe(false)
      expect(state.theme).toBe('system')
    })
  })
})

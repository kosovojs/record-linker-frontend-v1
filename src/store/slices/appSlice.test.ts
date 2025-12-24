import { describe, it, expect } from 'vitest'
import appReducer, { actions, selectors, type AppState } from './appSlice'

describe('appSlice', () => {
  const initialState: AppState = {
    isAuthChecked: true,
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  }

  describe('reducers', () => {
    describe('setLoading', () => {
      it('should set loading to true', () => {
        const state = appReducer(initialState, actions.setLoading(true))
        expect(state.isLoading).toBe(true)
      })

      it('should set loading to false', () => {
        const loadingState = { ...initialState, isLoading: true }
        const state = appReducer(loadingState, actions.setLoading(false))
        expect(state.isLoading).toBe(false)
      })
    })

    describe('setError', () => {
      it('should set error message', () => {
        const state = appReducer(initialState, actions.setError('Something went wrong'))
        expect(state.error).toBe('Something went wrong')
      })

      it('should set error to null', () => {
        const errorState = { ...initialState, error: 'Previous error' }
        const state = appReducer(errorState, actions.setError(null))
        expect(state.error).toBeNull()
      })
    })

    describe('clearError', () => {
      it('should clear error', () => {
        const errorState = { ...initialState, error: 'Some error' }
        const state = appReducer(errorState, actions.clearError())
        expect(state.error).toBeNull()
      })
    })

    describe('setUser', () => {
      it('should set user and mark as authenticated', () => {
        const user = { uuid: '123', email: 'test@example.com', name: 'Test User' }
        const state = appReducer(initialState, actions.setUser(user))

        expect(state.user).toEqual(user)
        expect(state.isAuthenticated).toBe(true)
      })

      it('should clear user and mark as unauthenticated when null', () => {
        const authenticatedState: AppState = {
          ...initialState,
          isAuthenticated: true,
          user: { uuid: '123', email: 'test@example.com', name: 'Test' },
        }
        const state = appReducer(authenticatedState, actions.setUser(null))

        expect(state.user).toBeNull()
        expect(state.isAuthenticated).toBe(false)
      })
    })

    describe('logout', () => {
      it('should clear user and set authenticated to false', () => {
        const authenticatedState: AppState = {
          ...initialState,
          isAuthenticated: true,
          user: { uuid: '123', email: 'test@example.com', name: 'Test' },
        }
        const state = appReducer(authenticatedState, actions.logout())

        expect(state.user).toBeNull()
        expect(state.isAuthenticated).toBe(false)
      })
    })
  })

  describe('selectors', () => {
    const rootState = { app: initialState }

    it('isAuthChecked should return isAuthChecked', () => {
      expect(selectors.isAuthChecked(rootState)).toBe(true)
    })

    it('isAuthenticated should return isAuthenticated', () => {
      expect(selectors.isAuthenticated(rootState)).toBe(false)
    })

    it('user should return user', () => {
      expect(selectors.user(rootState)).toBeNull()
    })

    it('isLoading should return isLoading', () => {
      expect(selectors.isLoading(rootState)).toBe(false)
    })

    it('error should return error', () => {
      expect(selectors.error(rootState)).toBeNull()
    })

    it('selectors work with updated state', () => {
      const updatedState = {
        app: {
          ...initialState,
          isAuthenticated: true,
          user: { uuid: '123', email: 'test@example.com', name: 'Test' },
          isLoading: true,
          error: 'Some error',
        },
      }

      expect(selectors.isAuthenticated(updatedState)).toBe(true)
      expect(selectors.user(updatedState)).toEqual({ uuid: '123', email: 'test@example.com', name: 'Test' })
      expect(selectors.isLoading(updatedState)).toBe(true)
      expect(selectors.error(updatedState)).toBe('Some error')
    })
  })
})

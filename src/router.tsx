import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  lazyRouteComponent,
} from '@tanstack/react-router'
import { RootLayout } from '@/components/layout/RootLayout'

// Define routes
const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(
    () => import('@/features/dashboard/pages/DashboardPage'),
    'DashboardPage'
  ),
})

const datasetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/datasets',
  component: Outlet,
})

const datasetsIndexRoute = createRoute({
  getParentRoute: () => datasetsRoute,
  path: '/',
  component: lazyRouteComponent(
    () => import('@/features/datasets/pages/DatasetsListPage'),
    'DatasetsListPage'
  ),
})

const datasetDetailRoute = createRoute({
  getParentRoute: () => datasetsRoute,
  path: '/$uuid',
  component: lazyRouteComponent(
    () => import('@/features/datasets/pages/DatasetDetailPage'),
    'DatasetDetailPage'
  ),
})

const propertiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/properties',
  component: lazyRouteComponent(
    () => import('@/features/properties/pages/PropertiesPage'),
    'PropertiesPage'
  ),
})

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  datasetsRoute.addChildren([
    datasetsIndexRoute,
    datasetDetailRoute,
  ]),
  propertiesRoute,
])

// Create and export router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

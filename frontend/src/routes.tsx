import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import App from './App'
import HomePage from './pages/HomePage'
import OnboardingPage from './pages/OnboardingPage'

const rootRoute = createRootRoute({
  component: App,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
})

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/builder',
  component: HomePage,
})

const routeTree = rootRoute.addChildren([indexRoute, onboardingRoute, builderRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
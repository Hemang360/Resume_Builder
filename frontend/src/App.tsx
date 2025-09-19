import { Router, RouterProvider, createRoute, createRootRoute } from '@tanstack/react-router'

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Resume Builder</h1>
        <div className="text-center text-muted-foreground">
          Welcome to your resume builder application
        </div>
      </div>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>Home Page</div>,
})

const routeTree = rootRoute.addChildren([indexRoute])

const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
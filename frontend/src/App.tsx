import { Outlet } from '@tanstack/react-router'
import { ResumeProvider } from './contexts/ResumeContext'

function App() {
  // Get resume ID from URL params if editing existing resume
  const resumeId = new URLSearchParams(window.location.search).get('id') || undefined

  return (
    <ResumeProvider resumeId={resumeId}>
      <Outlet />
    </ResumeProvider>
  )
}

export default App
import { Outlet } from '@tanstack/react-router'
import { ResumeProvider } from './contexts/ResumeContext'
import { ToastProvider } from './components/ui/toast'
import DraftDialog from './components/DraftDialog'
import ResumeRouter from './components/ResumeRouter'

// Storage utility to load current resume ID
const loadCurrentResumeId = (): string | null => {
  try {
    return localStorage.getItem('current_resume_id')
  } catch (error) {
    console.warn('Failed to load current resume ID from localStorage:', error)
    return null
  }
}

function App() {
  // Get resume ID from URL params first, then fallback to localStorage
  const urlResumeId = new URLSearchParams(window.location.search).get('id')
  const storedResumeId = loadCurrentResumeId()
  const resumeId = urlResumeId || storedResumeId || undefined

  return (
    <ToastProvider>
      <ResumeProvider resumeId={resumeId}>
        <ResumeRouter>
          <Outlet />
          <DraftDialog />
        </ResumeRouter>
      </ResumeProvider>
    </ToastProvider>
  )
}

export default App
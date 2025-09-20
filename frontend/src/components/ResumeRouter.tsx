import React, { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useResumeContext } from '@/contexts/ResumeContext'

interface ResumeRouterProps {
  children: React.ReactNode
}

const ResumeRouter: React.FC<ResumeRouterProps> = ({ children }) => {
  const navigate = useNavigate()
  const { resume, isLoading } = useResumeContext()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // Prevent multiple processing of the same resume state
    const resumeKey = `${resume.id}-${JSON.stringify(resume.content)}`
    if (hasProcessedRef.current === resumeKey) {
      return
    }

    // Check if we have a resume with meaningful content
    // This should be more conservative - only consider it complete if there's substantial content
    const hasMeaningfulContent = (content: any) => {
      if (!content || typeof content !== 'object') return false
      
      // Don't consider it complete with just basic personal info
      // Check if there's substantial content beyond basic details
      const substantialFields = ['education', 'skills', 'experience', 'projects', 'essays', 'extracurriculars']
      for (const field of substantialFields) {
        if (content[field] && (
          (Array.isArray(content[field]) && content[field].length > 0) ||
          (typeof content[field] === 'object' && Object.keys(content[field]).length > 0)
        )) {
          return true
        }
      }
      
      return false
    }

    const currentPath = window.location.pathname

    // If we have a resume ID but no meaningful content, clear the stored resume ID
    // BUT only if we're not in the onboarding process
    if (resume.id && resume.content && !hasMeaningfulContent(resume.content)) {
      if (currentPath !== '/onboarding') {
        console.log('Resume has ID but no meaningful content, clearing stored resume ID')
        localStorage.removeItem('current_resume_id')
      }
    }

    // If we have a resume with meaningful content, redirect to builder
    // BUT only if we're not currently in the onboarding process
    if (resume.id && resume.content && hasMeaningfulContent(resume.content)) {
      // Don't redirect if we're in the onboarding process
      if (currentPath === '/onboarding') {
        return
      }
      
      // Only redirect if we're not already on the builder page
      if (currentPath !== '/builder') {
        navigate({ to: '/builder' })
      }
    }

    // Mark this resume state as processed
    hasProcessedRef.current = resumeKey
  }, [resume, isLoading, navigate])

  return <>{children}</>
}

export default ResumeRouter


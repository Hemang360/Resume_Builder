import React from 'react'
import ProgressiveQuestion from '@/components/ProgressiveQuestion'
import ResumePreview from '@/components/ResumePreview'

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
        {/* Left Column - Progressive Questions */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Build Your Resume
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Answer a few questions and we'll create a professional resume for you
            </p>
          </div>
          
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
            <ProgressiveQuestion />
          </div>
        </div>

        {/* Right Column - Resume Preview */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Live Preview
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              See your resume update in real-time as you fill out the form
            </p>
          </div>
          
          <div className="flex-1 sticky top-24">
            <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
import React, { useRef, useMemo } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useResumeContext } from '@/contexts/ResumeContext'
import { Button } from '@/components/ui/button'
import { Download, FileText, Mail, Phone, MapPin, Globe, Calendar, Award } from 'lucide-react'
import './ResumePreview.css'

const ResumePreview: React.FC = () => {
  const { resume, isLoading } = useResumeContext()
  const componentRef = useRef<HTMLDivElement>(null)

  // Helper function to get full name
  const getFullName = (content: Record<string, unknown>): string => {
    const personalInfo = content?.personalInfo as Record<string, unknown> || {}
    const firstName = personalInfo?.firstName as string || ''
    const lastName = personalInfo?.lastName as string || ''
    return `${firstName} ${lastName}`.trim() || 'Resume'
  }

  // Configure react-to-print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${getFullName(resume.content)}-Resume`,
    onAfterPrint: () => console.log('PDF generation completed'),
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `
  })

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    try {
      return new Date(dateString).getFullYear().toString()
    } catch {
      return dateString
    }
  }

  // Helper function to calculate word count
  const getWordCount = (text: string): number => {
    return text?.trim() ? text.trim().split(/\s+/).length : 0
  }

  // Memoized content processing for performance
  const processedContent = useMemo(() => {
    const content = resume.content || {}
    
    return {
      personalInfo: content.personalInfo || {},
      education: Array.isArray(content.education) ? content.education : (content.education ? [content.education] : []),
      skills: Array.isArray(content.skills) ? content.skills : [],
      extracurriculars: Array.isArray(content.extracurriculars) ? content.extracurriculars : [],
      projects: Array.isArray(content.projects) ? content.projects : (content.projects ? [content.projects] : []),
      essays: content.essays || {},
      academics: content.academics || {},
      careerInterests: Array.isArray(content.careerInterests) ? content.careerInterests : []
    }
  }, [resume.content])

  if (isLoading) {
    return (
      <div className="resume-preview-container">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="resume-preview-container">
      {/* Download Button */}
      <div className="download-button-container no-print">
        <Button
          onClick={handlePrint}
          className="flex items-center gap-2 mb-4 shadow-lg"
          size="lg"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Resume Content */}
      <div ref={componentRef} className="resume-content" id="resume-to-print">
        <article className="resume-document">
          {/* Header Section */}
          <header className="resume-header">
            <div className="name-section">
              <h1 className="full-name">
                {getFullName(processedContent)}
              </h1>
              
              <div className="contact-info">
                {processedContent.personalInfo.email && (
                  <div className="contact-item">
                    <Mail className="contact-icon" size={14} />
                    <span>{processedContent.personalInfo.email}</span>
                  </div>
                )}
                
                {processedContent.personalInfo.phone && (
                  <div className="contact-item">
                    <Phone className="contact-icon" size={14} />
                    <span>{processedContent.personalInfo.phone}</span>
                  </div>
                )}
                
                {processedContent.personalInfo.location && (
                  <div className="contact-item">
                    <MapPin className="contact-icon" size={14} />
                    <span>{processedContent.personalInfo.location}</span>
                  </div>
                )}
                
                {processedContent.personalInfo.website && (
                  <div className="contact-item">
                    <Globe className="contact-icon" size={14} />
                    <span>{processedContent.personalInfo.website}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Education Section */}
          {processedContent.education.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">Education</h2>
               <div className="section-content">
                 {processedContent.education.map((edu, index) => {
                   if (!edu) return null
                   return (
                     <div key={index} className="education-item">
                       <div className="education-header">
                         <div className="education-main">
                           <h3 className="institution-name">
                             {edu.institution || 'High School'}
                           </h3>
                           {edu.degree && (
                             <p className="degree">{edu.degree}</p>
                           )}
                           {edu.gpa && (
                             <p className="gpa">
                               {edu.gpa.includes('%') ? `Grade: ${edu.gpa}` : `GPA: ${edu.gpa}`}
                             </p>
                           )}
                         </div>
                         <div className="education-dates">
                           {edu.endDate && (
                             <span className="graduation-date">
                               <Calendar className="date-icon" size={12} />
                               Expected {formatDate(edu.endDate)}
                             </span>
                           )}
                         </div>
                       </div>
                       {edu.description && (
                         <p className="education-description">{edu.description}</p>
                       )}
                     </div>
                   )
                 })}
              </div>
            </section>
          )}

          {/* Academic Achievements Section */}
          {(processedContent.academics.satScore || processedContent.academics.toeflScore) && (
            <section className="resume-section">
              <h2 className="section-title">Test Scores</h2>
              <div className="section-content">
                <div className="test-scores">
                  {processedContent.academics.satScore && (
                    <div className="test-score-item">
                      <Award className="test-icon" size={16} />
                      <span className="test-name">SAT:</span>
                      <span className="test-score">{processedContent.academics.satScore}</span>
                    </div>
                  )}
                  {processedContent.academics.toeflScore && (
                    <div className="test-score-item">
                      <Award className="test-icon" size={16} />
                      <span className="test-name">
                        {processedContent.academics.toeflScore.includes('.') ? 'IELTS:' : 'TOEFL:'}
                      </span>
                      <span className="test-score">{processedContent.academics.toeflScore}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Leadership Essay Section */}
          {processedContent.essays.leadership && (
            <section className="resume-section">
              <h2 className="section-title">Leadership Experience</h2>
              <div className="section-content">
                <div className="essay-content">
                  <p className="essay-text">{processedContent.essays.leadership}</p>
                  <div className="essay-meta">
                    <span className="word-count">
                      {getWordCount(processedContent.essays.leadership)} words
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

           {/* Projects Section */}
           {processedContent.projects.length > 0 && processedContent.projects[0]?.title && (
             <section className="resume-section">
               <h2 className="section-title">Notable Projects</h2>
               <div className="section-content">
                 {processedContent.projects.map((project, index) => {
                   if (!project) return null
                   return (
                     <div key={index} className="project-item">
                       <h3 className="project-title">{project.title}</h3>
                       {project.description && (
                         <p className="project-description">{project.description}</p>
                       )}
                       {project.technologies && (
                         <div className="project-technologies">
                           <span className="tech-label">Technologies:</span>
                           <span className="tech-list">{project.technologies}</span>
                         </div>
                       )}
                     </div>
                   )
                 })}
               </div>
             </section>
           )}

          {/* Extracurricular Activities Section */}
          {processedContent.extracurriculars.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">Extracurricular Activities</h2>
              <div className="section-content">
                <div className="activities-grid">
                  {processedContent.extracurriculars.map((activity, index) => (
                    <div key={index} className="activity-item">
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Skills Section */}
          {processedContent.skills.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">Skills</h2>
              <div className="section-content">
                 <div className="skills-grid">
                   {processedContent.skills.map((skill, index) => (
                     <div key={index} className="skill-item">
                       {typeof skill === 'string' ? skill : (skill as { name?: string }).name || String(skill)}
                     </div>
                   ))}
                 </div>
              </div>
            </section>
          )}

          {/* Career Interests Section */}
          {processedContent.careerInterests.length > 0 && (
            <section className="resume-section">
              <h2 className="section-title">Career Interests</h2>
              <div className="section-content">
                <div className="interests-list">
                  {processedContent.careerInterests.join(' • ')}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!getFullName(processedContent) && processedContent.education.length === 0 && (
            <div className="empty-state">
              <FileText className="empty-icon" size={48} />
              <h2 className="empty-title">Your Resume Preview</h2>
              <p className="empty-description">
                Start filling out the form to see your resume come to life!
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}

export default ResumePreview
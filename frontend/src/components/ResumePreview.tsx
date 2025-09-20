import React, { useMemo } from 'react'
import { useResumeContext } from '@/contexts/ResumeContext'
import { FileText, Mail, Phone, MapPin, Globe, Calendar, Award } from 'lucide-react'
import './ResumePreview.css'

const ResumePreview: React.FC = () => {
  const { resume, isLoading } = useResumeContext()

  // Helper function to get full name
  const getFullName = (content: Record<string, unknown>): string => {
    const personalInfo = content?.personalInfo as Record<string, unknown> || {}
    const firstName = personalInfo?.firstName as string || ''
    const lastName = personalInfo?.lastName as string || ''
    return `${firstName} ${lastName}`.trim() || 'Resume'
  }



  // Memoized content processing for performance
  const processedContent = useMemo(() => {
    const content = resume.content || {}
    
    // Handle education data - convert object with numeric keys to array
    let educationArray: Record<string, unknown>[] = []
    if (Array.isArray(content.education)) {
      educationArray = content.education as Record<string, unknown>[]
    } else if (content.education && typeof content.education === 'object') {
      // Convert object with numeric keys to array
      const educationObj = content.education as Record<string, unknown>
      educationArray = Object.keys(educationObj)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(key => educationObj[key])
        .filter(item => item !== null && item !== undefined) as Record<string, unknown>[]
    }
    
    return {
      personalInfo: content.personalInfo || {},
      education: educationArray,
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
      {/* Resume Content */}
      <div className="resume-content" id="resume-to-print">
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
                   const institution = edu.institution as string
                   const degree = edu.degree as string
                   const gpa = edu.gpa as string
                   const graduationYear = edu.graduationYear as string
                   const description = edu.description as string
                   
                   return (
                     <div key={index} className="education-item">
                       <div className="education-header">
                         <div className="education-main">
                           <h3 className="institution-name">
                             {institution || 'High School'}
                           </h3>
                           {degree && (
                             <p className="degree">{degree}</p>
                           )}
                           {gpa && (
                             <p className="gpa">
                               {gpa.includes('%') ? `Grade: ${gpa}` : `GPA: ${gpa}`}
                             </p>
                           )}
                         </div>
                         <div className="education-dates">
                           {graduationYear && (
                             <span className="graduation-date">
                               <Calendar className="date-icon" size={12} />
                               Expected {graduationYear}
                             </span>
                           )}
                         </div>
                       </div>
                       {description && (
                         <p className="education-description">{description}</p>
                       )}
                     </div>
                   )
                 })}
              </div>
            </section>
          )}

          {/* Academic Achievements Section */}
          {(processedContent.academics.satScore || processedContent.academics.actScore || processedContent.academics.toeflScore || processedContent.academics.ieltsScore) && (
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
                  {processedContent.academics.actScore && (
                    <div className="test-score-item">
                      <Award className="test-icon" size={16} />
                      <span className="test-name">ACT:</span>
                      <span className="test-score">{processedContent.academics.actScore}</span>
                    </div>
                  )}
                  {processedContent.academics.toeflScore && (
                    <div className="test-score-item">
                      <Award className="test-icon" size={16} />
                      <span className="test-name">TOEFL:</span>
                      <span className="test-score">{processedContent.academics.toeflScore}</span>
                    </div>
                  )}
                  {processedContent.academics.ieltsScore && (
                    <div className="test-score-item">
                      <Award className="test-icon" size={16} />
                      <span className="test-name">IELTS:</span>
                      <span className="test-score">{processedContent.academics.ieltsScore}</span>
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
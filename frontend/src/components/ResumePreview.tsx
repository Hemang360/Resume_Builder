import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone } from 'lucide-react'
import { useResumeContext } from '@/contexts/ResumeContext'

const ResumePreview: React.FC = () => {
  const { resume } = useResumeContext()
  const { personalInfo, summary, experience, skills, education } = resume.content

  return (
    <Card className="w-full h-full shadow-lg border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-0">
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {personalInfo?.name || 'Your Name'}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            {personalInfo?.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {personalInfo.email}
              </div>
            )}
            {personalInfo?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {personalInfo.phone}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Professional Summary */}
        {summary && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
              Professional Summary
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={exp.id || index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {exp.position || 'Position'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {exp.company || 'Company'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ''}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={skill.id || index} variant="secondary" className="text-xs">
                  {typeof skill === 'string' ? skill : skill.name || 'Skill'}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, index) => (
                <div key={edu.id || index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {edu.degree || 'Degree'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {edu.institution || 'Institution'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {edu.endDate || ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

export default ResumePreview
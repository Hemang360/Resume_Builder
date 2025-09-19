import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin } from 'lucide-react'

const ResumePreview: React.FC = () => {
  return (
    <Card className="w-full h-full shadow-lg border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-0">
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            John Doe
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              john@example.com
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              +1 (555) 123-4567
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Professional Summary */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
            Professional Summary
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Experienced software engineer with 5+ years developing web applications using modern 
            technologies. Passionate about creating scalable solutions and leading development teams 
            to deliver high-quality products.
          </p>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
            Experience
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    Senior Software Engineer
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Tech Corp
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  2020 - 2023
                </span>
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
                <li className="relative before:content-['•'] before:absolute before:-left-4">
                  Developed web applications using React and Node.js
                </li>
                <li className="relative before:content-['•'] before:absolute before:-left-4">
                  Led a team of 3 developers on multiple projects
                </li>
                <li className="relative before:content-['•'] before:absolute before:-left-4">
                  Improved application performance by 40%
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker', 'AWS'].map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 pb-1 border-b border-slate-200 dark:border-slate-700">
            Education
          </h2>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  Bachelor of Computer Science
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  University of Technology
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                2019
              </span>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

export default ResumePreview
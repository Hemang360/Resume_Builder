export interface PersonalInfo {
  name?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  linkedin?: string
}

export interface Experience {
  id?: string
  company?: string
  position?: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  description?: string
}

export interface Education {
  id?: string
  institution?: string
  degree?: string
  field?: string
  startDate?: string
  endDate?: string
  gpa?: string
  description?: string
}

export interface Skill {
  id?: string
  name?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  category?: string
}

export interface Project {
  id?: string
  name?: string
  description?: string
  technologies?: string[]
  url?: string
  startDate?: string
  endDate?: string
}

export interface Reference {
  id?: string
  name?: string
  position?: string
  company?: string
  email?: string
  phone?: string
}

export interface ResumeContent extends Record<string, unknown> {
  personalInfo?: PersonalInfo
  summary?: string
  experience?: Experience[]
  education?: Education[]
  skills?: Skill[]
  languages?: string[]
  certifications?: string[]
  projects?: Project[]
  references?: Reference[]
}

export interface Resume {
  id?: string
  content: ResumeContent
  created_at?: string
  updated_at?: string
}

export interface ResumeState {
  resume: Resume
  isLoading: boolean
  isSaving: boolean
  lastSaved?: Date
  error?: string
  hasUnsavedChanges: boolean
}
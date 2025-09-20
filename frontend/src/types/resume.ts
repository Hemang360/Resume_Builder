export interface PersonalInfo {
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  location?: string
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
  title?: string
  description?: string
  technologies?: string
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

export interface Academics {
  satScore?: string
  toeflScore?: string
  gpa?: string
}

export interface Essays {
  leadership?: string
  personalStatement?: string
  whyThisSchool?: string
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
  essays?: Essays
  academics?: Academics
  extracurriculars?: string[]
  careerInterests?: string[]
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
  hasPendingDraft: boolean
  showDraftDialog: boolean
}

export interface PendingEdit {
  path: string
  value: unknown
  timestamp: number
}

export interface LocalStorageData {
  resumeId?: string
  pendingEdits: PendingEdit[]
  historyStack: Resume[]
  historyIndex: number
  lastModified: number
  version: number // For schema versioning
}

export interface DraftDialogData {
  serverResume: Resume
  localEdits: PendingEdit[]
  mergedContent: ResumeContent
}
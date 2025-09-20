import { Question } from '@/types/questions'

export const enhancedHighSchoolQuestions: Question[] = [
  {
    id: 'first_name',
    type: 'text',
    title: "What's your first name?",
    subtitle: "This will appear on your university applications",
    placeholder: "Enter your first name",
    jsonPath: 'personalInfo.firstName',
    required: true,
    validation: [
      { type: 'required', message: 'First name is required' }
    ],
    tooltip: {
      title: 'Legal First Name',
      content: 'Use your legal first name exactly as it appears on your passport or official documents.',
      tips: [
        'Must match your passport/ID exactly',
        'Don\'t use nicknames or shortened versions',
        'Include middle names if they\'re part of your legal first name'
      ],
      admissionNote: 'Universities use this for official records and visa documentation. Consistency across all documents is crucial.'
    }
  },
  {
    id: 'email',
    type: 'text',
    inputType: 'email',
    title: "What's your email address?",
    subtitle: "We'll use this for application updates and university communications",
    placeholder: "your.email@example.com",
    jsonPath: 'personalInfo.email',
    required: true,
    validation: [
      { type: 'required', message: 'Email address is required' },
      { type: 'email', message: 'Please enter a valid email address' }
    ],
    tooltip: {
      title: 'Professional Email Address',
      content: 'Use a professional email address that you check regularly. Avoid casual or inappropriate email addresses.',
      tips: [
        'Use your name (firstname.lastname@email.com)',
        'Avoid numbers unless necessary',
        'Check this email daily during application season',
        'Consider creating a dedicated email for applications'
      ],
      examples: [
        'john.smith@gmail.com',
        'j.smith2025@outlook.com',
        'johnsmith.college@yahoo.com'
      ],
      admissionNote: 'This will be your primary communication channel with universities. Admissions officers will use this for important deadlines and decisions.'
    }
  },
  {
    id: 'sat_score',
    type: 'text',
    inputType: 'number',
    format: 'sat',
    title: "What's your SAT score?",
    subtitle: "Enter your highest total SAT score (optional if you took ACT instead)",
    placeholder: "1450",
    jsonPath: 'academics.satScore',
    validation: [
      { type: 'satScore', message: 'SAT scores range from 400-1600' }
    ],
    tooltip: {
      title: 'SAT Score Requirements',
      content: 'Most competitive international universities consider SAT scores as a key factor for admissions and scholarships.',
      tips: [
        'Use your highest single-sitting or superscore',
        'Scores above 1400 are competitive for top universities',
        'Submit official scores directly from College Board',
        'Consider retaking if below target university averages'
      ],
      examples: ['1450', '1520', '1380'],
      admissionNote: 'Universities use SAT scores to assess academic readiness and compare international students. Higher scores often correlate with better scholarship opportunities.'
    }
  },
  {
    id: 'toefl_score',
    type: 'text',
    inputType: 'number',
    format: 'toefl',
    title: "Do you have a TOEFL score?",
    subtitle: "Required for non-native English speakers applying to English-taught programs",
    placeholder: "105",
    jsonPath: 'academics.toeflScore',
    validation: [
      { type: 'toeflScore', message: 'TOEFL iBT scores range from 0-120' }
    ],
    tooltip: {
      title: 'TOEFL Requirements for International Students',
      content: 'TOEFL iBT demonstrates your English proficiency for academic success in English-speaking universities.',
      tips: [
        'Minimum 80-90 for most universities',
        'Top universities typically require 100+',
        'Some programs may require higher scores',
        'Valid for 2 years from test date'
      ],
      examples: ['105', '95', '112'],
      admissionNote: 'Universities use TOEFL to ensure you can succeed in English-medium instruction. Higher scores may exempt you from additional English courses.'
    }
  },
  {
    id: 'school_name',
    type: 'text',
    inputType: 'text',
    title: "What's the name of your high school?",
    subtitle: "Enter the full name of your current or most recent high school",
    placeholder: "Delhi Public School, New Delhi",
    jsonPath: 'education.0.institution',
    required: true,
    validation: [
      { type: 'required', message: 'School name is required' }
    ],
    tooltip: {
      title: 'High School Information',
      content: 'Your high school name helps universities understand your academic background and context.',
      tips: [
        'Use the official name of your school',
        'Include the city if it helps identify the school',
        'Use the name as it appears on your transcript',
        'Include any distinguishing details (e.g., "International", "Public", "Private")'
      ],
      examples: ['Delhi Public School', 'St. Xavier\'s High School', 'Kendriya Vidyalaya', 'International School of Mumbai'],
      admissionNote: 'Universities use this information to understand your educational context and may research your school\'s academic standards.'
    }
  },
  {
    id: 'gpa',
    type: 'text',
    inputType: 'text',
    format: 'gpa',
    title: "What's your GPA or percentage?",
    subtitle: "Enter your cumulative GPA (4.0 scale) or percentage from your transcript",
    placeholder: "3.85 or 92%",
    jsonPath: 'education.0.gpa',
    required: true,
    validation: [
      { type: 'required', message: 'GPA or percentage is required' },
      { type: 'gpaFormat', message: 'Enter GPA (0.0-4.0) or percentage (0-100%)' }
    ],
    tooltip: {
      title: 'Academic Performance Record',
      content: 'Your GPA/percentage shows consistent academic performance throughout high school.',
      tips: [
        'Use cumulative GPA through most recent semester',
        'Convert percentage to 4.0 scale if needed',
        'Include only academic subjects if possible',
        'Be consistent with the scale used on your transcript'
      ],
      examples: ['3.85', '92%', '3.7', '88%'],
      admissionNote: 'Universities evaluate academic consistency and rigor. A strong GPA demonstrates your ability to handle university-level coursework.'
    }
  },
  {
    id: 'graduation_year',
    type: 'text',
    inputType: 'number',
    title: "What year do you graduate from high school?",
    subtitle: "Enter your expected or actual graduation year",
    placeholder: "2024",
    jsonPath: 'education.0.graduationYear',
    required: true,
    validation: [
      { type: 'required', message: 'Graduation year is required' },
      { type: 'minValue', value: 2020, message: 'Graduation year must be 2020 or later' },
      { type: 'maxValue', value: 2030, message: 'Graduation year must be 2030 or earlier' }
    ],
    tooltip: {
      title: 'Graduation Year',
      content: 'Your graduation year helps universities understand your academic timeline and plan for your enrollment.',
      tips: [
        'Enter the year you expect to complete high school',
        'Use the same year as your graduation date',
        'This helps universities plan application deadlines',
        'Be consistent with your graduation date'
      ],
      examples: ['2024', '2025', '2026'],
      admissionNote: 'Universities use this information to coordinate application timelines and enrollment periods.'
    }
  },
  {
    id: 'leadership_essay',
    type: 'textarea',
    title: "Describe a leadership experience",
    subtitle: "Tell us about a time when you took initiative or led others",
    placeholder: "During my junior year, I noticed that many students were struggling with math concepts. I decided to start a peer tutoring program...",
    minWords: 100,
    maxWords: 200,
    targetWords: 150,
    rows: 8,
    showWordCount: true,
    essayType: 'leadership',
    jsonPath: 'essays.leadership',
    required: true,
    validation: [
      { type: 'required', message: 'Leadership essay is required' },
      { type: 'minWords', value: 100, message: 'Please write at least 100 words' },
      { type: 'maxWords', value: 200, message: 'Please keep your response under 200 words' }
    ],
    tooltip: {
      title: 'Leadership Experience Essay',
      content: 'Universities want to see evidence of initiative, problem-solving, and positive impact on others.',
      tips: [
        'Focus on a specific situation with clear beginning, middle, and end',
        'Describe your specific actions and decisions',
        'Quantify the impact when possible',
        'Reflect on what you learned about leadership',
        'Show how this experience shaped your character'
      ],
      examples: [
        'Leading a community service project that helped 200+ families',
        'Starting a study group that improved class test scores by 15%',
        'Organizing a school fundraiser that raised $5000 for charity'
      ],
      admissionNote: 'Admissions officers look for students who will contribute positively to campus life. They want to see initiative, responsibility, and the ability to motivate others toward a common goal.'
    }
  },
  {
    id: 'extracurriculars',
    type: 'chip-multi-select',
    title: "What extracurricular activities are you involved in?",
    subtitle: "Select all that apply - these show your interests beyond academics",
    placeholder: "Search or add activities...",
    jsonPath: 'extracurriculars',
    maxSelections: 10,
    minSelections: 2,
    options: [
      "Student Government",
      "Debate Team",
      "Model United Nations",
      "National Honor Society",
      "Volunteer Work",
      "Community Service",
      "Music Band/Orchestra",
      "Choir",
      "Drama Club",
      "Art Club",
      "Basketball",
      "Soccer",
      "Tennis",
      "Swimming",
      "Track and Field",
      "Robotics Club",
      "Computer Science Club",
      "Math Olympiad",
      "Science Fair",
      "Environmental Club",
      "Language Club",
      "Cultural Club",
      "Tutoring",
      "Part-time Job",
      "Internship",
      "Research Project",
      "Chess Club",
      "Photography Club",
      "Yearbook Committee",
      "School Newspaper"
    ],
    validation: [
      { type: 'minSelections', value: 2, message: 'Please select at least 2 activities to show your diverse interests' }
    ],
    tooltip: {
      title: 'Extracurricular Activities',
      content: 'Universities value well-rounded students who contribute beyond academics.',
      tips: [
        'Focus on quality over quantity - depth of involvement matters',
        'Include leadership roles and achievements',
        'Show sustained commitment (multiple years)',
        'Mix different types: academic, service, creative, athletic',
        'Add unique activities that aren\'t listed'
      ],
      admissionNote: 'Admissions officers look for passion, commitment, and leadership. They prefer students who deeply engage in a few activities rather than superficially participate in many.'
    }
  },
  {
    id: 'skills',
    type: 'chip-multi-select',
    title: "What are your key skills?",
    subtitle: "Include both technical skills and soft skills that make you unique",
    placeholder: "Search or add skills...",
    jsonPath: 'skills',
    maxSelections: 12,
    minSelections: 3,
    options: [
      "Leadership",
      "Public Speaking",
      "Critical Thinking",
      "Problem Solving",
      "Communication",
      "Teamwork",
      "Time Management",
      "Research",
      "Writing",
      "Programming",
      "Python",
      "Java",
      "JavaScript",
      "HTML/CSS",
      "Data Analysis",
      "Statistics",
      "Microsoft Office",
      "Google Workspace",
      "Adobe Creative Suite",
      "Video Editing",
      "Graphic Design",
      "Social Media Management",
      "Event Planning",
      "Fundraising",
      "Tutoring",
      "Mentoring",
      "Customer Service",
      "Sales",
      "Marketing",
      "Foreign Languages",
      "Spanish",
      "French",
      "Mandarin",
      "German",
      "Music Performance",
      "Art/Drawing",
      "Photography",
      "Laboratory Skills",
      "Mathematics",
      "Science Research"
    ],
    validation: [
      { type: 'minSelections', value: 3, message: 'Please select at least 3 skills' }
    ],
    tooltip: {
      title: 'Skills and Competencies',
      content: 'Highlight skills that differentiate you and relate to your intended field of study.',
      tips: [
        'Mix technical and soft skills',
        'Include skills you can demonstrate with examples',
        'Focus on skills relevant to your intended major',
        'Add unique skills not commonly found',
        'Consider skills from work, internships, or projects'
      ],
      admissionNote: 'Universities want students who bring diverse capabilities. Technical skills show academic preparation, while soft skills predict success in collaborative environments.'
    }
  }
]

// Filter out duplicate questions that are already collected in TypeformOnboarding
export const highSchoolStudentQuestions = enhancedHighSchoolQuestions.filter(
  question => !['first_name', 'email'].includes(question.id)
)

// Keep the original for other uses
export const allHighSchoolStudentQuestions = enhancedHighSchoolQuestions
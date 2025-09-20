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
    id: 'graduation_date',
    type: 'date',
    dateType: 'graduation',
    title: "When do you graduate from high school?",
    subtitle: "Select your expected or actual graduation date",
    jsonPath: 'education.0.graduationDate',
    minYear: 2020,
    maxYear: 2030,
    required: true,
    validation: [
      { type: 'required', message: 'Graduation date is required' },
      { type: 'dateRange', message: 'Please select a valid graduation date' }
    ],
    tooltip: {
      title: 'Graduation Timeline',
      content: 'Your graduation date helps universities plan for your enrollment and determines application deadlines.',
      admissionNote: 'Universities need this to coordinate with visa processing timelines and enrollment periods.'
    }
  },
  {
    id: 'leadership_essay',
    type: 'textarea',
    title: "Describe a leadership experience",
    subtitle: "Tell us about a time when you took initiative or led others",
    placeholder: "During my junior year, I noticed that many students were struggling with math concepts. I decided to start a peer tutoring program...",
    minWords: 100,
    maxWords: 400,
    targetWords: 250,
    rows: 8,
    showWordCount: true,
    essayType: 'leadership',
    jsonPath: 'essays.leadership',
    required: true,
    validation: [
      { type: 'required', message: 'Leadership essay is required' },
      { type: 'minWords', value: 100, message: 'Please write at least 100 words' },
      { type: 'maxWords', value: 400, message: 'Please keep your response under 400 words' }
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

export const highSchoolStudentQuestions = enhancedHighSchoolQuestions
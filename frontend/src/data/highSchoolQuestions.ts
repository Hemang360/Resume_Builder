import { Question } from '@/types/questions'

export const highSchoolStudentQuestions: Question[] = [
  {
    id: 'first_name',
    type: 'text',
    title: "What's your first name?",
    subtitle: "This will appear on your college applications",
    placeholder: "Enter your first name",
    jsonPath: 'personalInfo.firstName',
    required: true,
    validation: [
      { type: 'required', message: 'First name is required' }
    ]
  },
  {
    id: 'last_name',
    type: 'text',
    title: "And your last name?",
    placeholder: "Enter your last name",
    jsonPath: 'personalInfo.lastName',
    required: true,
    validation: [
      { type: 'required', message: 'Last name is required' }
    ]
  },
  {
    id: 'email',
    type: 'text',
    inputType: 'email',
    title: "What's your email address?",
    subtitle: "We'll use this to keep you updated on your application progress",
    placeholder: "your.email@example.com",
    jsonPath: 'personalInfo.email',
    required: true,
    validation: [
      { type: 'required', message: 'Email address is required' },
      { type: 'email', message: 'Please enter a valid email address' }
    ]
  },
  {
    id: 'location',
    type: 'text',
    title: "Where are you located?",
    subtitle: "City, State/Province, Country",
    placeholder: "New York, NY, USA",
    jsonPath: 'personalInfo.location',
    required: true,
    validation: [
      { type: 'required', message: 'Location is required' }
    ]
  },
  {
    id: 'high_school',
    type: 'text',
    title: "What's the name of your high school?",
    placeholder: "Abraham Lincoln High School",
    jsonPath: 'education.0.institution',
    required: true,
    validation: [
      { type: 'required', message: 'High school name is required' }
    ]
  },
  {
    id: 'gpa',
    type: 'text',
    inputType: 'number',
    title: "What's your GPA or percentage?",
    subtitle: "Enter your cumulative GPA (4.0 scale) or percentage",
    placeholder: "3.85 or 92%",
    jsonPath: 'education.0.gpa',
    required: true,
    validation: [
      { type: 'required', message: 'GPA or percentage is required' }
    ]
  },
  {
    id: 'sat_score',
    type: 'text',
    inputType: 'number',
    title: "What's your SAT score?",
    subtitle: "Enter your total SAT score (optional if you took ACT instead)",
    placeholder: "1450",
    jsonPath: 'academics.satScore',
    validation: [
      { type: 'numeric', message: 'Please enter numbers only' },
      { type: 'minValue', value: 400, message: 'SAT score must be at least 400' },
      { type: 'maxValue', value: 1600, message: 'SAT score cannot exceed 1600' }
    ]
  },
  {
    id: 'toefl_score',
    type: 'text',
    inputType: 'number',
    title: "Do you have a TOEFL or IELTS score?",
    subtitle: "Required for non-native English speakers (leave blank if not applicable)",
    placeholder: "105 (TOEFL) or 7.5 (IELTS)",
    jsonPath: 'academics.toeflScore',
    validation: [
      { type: 'numeric', message: 'Please enter numbers only' }
    ]
  },
  {
    id: 'extracurriculars',
    type: 'chip-multi-select',
    title: "What extracurricular activities are you involved in?",
    subtitle: "Select all that apply, or add your own",
    placeholder: "Search or add activities...",
    jsonPath: 'extracurriculars',
    maxSelections: 10,
    options: [
      "Student Government",
      "Debate Team",
      "Drama Club",
      "Chess Club",
      "Music Band/Orchestra",
      "Choir",
      "Basketball",
      "Soccer",
      "Tennis",
      "Swimming",
      "Track and Field",
      "Volleyball",
      "National Honor Society",
      "Key Club",
      "Robotics Club",
      "Computer Science Club",
      "Math Olympiad",
      "Science Olympiad",
      "Model UN",
      "Volunteer Work",
      "Community Service",
      "Tutoring",
      "Part-time Job",
      "Internship",
      "Art Club",
      "Photography Club",
      "Yearbook Committee",
      "School Newspaper",
      "Environmental Club",
      "Language Club",
      "Cultural Club"
    ],
    validation: [
      { type: 'required', message: 'Please select at least one extracurricular activity' }
    ]
  },
  {
    id: 'leadership_essay',
    type: 'textarea',
    title: "Describe a leadership experience",
    subtitle: "Tell us about a time when you took initiative or led others (150 words max)",
    placeholder: "During my junior year, I noticed that many students were struggling with math concepts. I decided to start a peer tutoring program...",
    maxWords: 150,
    rows: 8,
    jsonPath: 'essays.leadership',
    required: true,
    validation: [
      { type: 'required', message: 'Leadership essay is required' },
      { type: 'minWords', value: 50, message: 'Please write at least 50 words' },
      { type: 'maxWords', value: 150, message: 'Please keep your response under 150 words' }
    ]
  },
  {
    id: 'skills',
    type: 'chip-multi-select',
    title: "What are your key skills?",
    subtitle: "Include both technical and soft skills",
    placeholder: "Search or add skills...",
    jsonPath: 'skills',
    maxSelections: 15,
    options: [
      "Leadership",
      "Communication",
      "Problem Solving",
      "Critical Thinking",
      "Time Management",
      "Teamwork",
      "Public Speaking",
      "Writing",
      "Research",
      "Organization",
      "Programming",
      "Python",
      "Java",
      "JavaScript",
      "HTML/CSS",
      "Microsoft Office",
      "Google Workspace",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Video Editing",
      "Social Media Management",
      "Data Analysis",
      "Statistics",
      "Mathematics",
      "Science Research",
      "Laboratory Skills",
      "Foreign Languages",
      "Spanish",
      "French",
      "Mandarin",
      "German",
      "Music Performance",
      "Art/Drawing",
      "Photography",
      "Event Planning",
      "Fundraising",
      "Customer Service",
      "Sales"
    ],
    validation: [
      { type: 'required', message: 'Please select at least 3 skills' }
    ]
  },
  {
    id: 'project_title',
    type: 'text',
    title: "What's your most significant project or achievement?",
    subtitle: "This could be academic, personal, or extracurricular",
    placeholder: "Mobile App for Local Food Bank",
    jsonPath: 'projects.0.title',
    required: true,
    validation: [
      { type: 'required', message: 'Project title is required' }
    ]
  },
  {
    id: 'project_description',
    type: 'textarea',
    title: "Tell us about this project",
    subtitle: "Describe what you did, what you learned, and the impact it had",
    placeholder: "I developed a mobile application that helps connect local food banks with donors. The app allows users to see real-time inventory needs and schedule donations...",
    maxWords: 200,
    rows: 6,
    jsonPath: 'projects.0.description',
    required: true,
    validation: [
      { type: 'required', message: 'Project description is required' },
      { type: 'minWords', value: 30, message: 'Please provide more detail (at least 30 words)' },
      { type: 'maxWords', value: 200, message: 'Please keep your description under 200 words' }
    ]
  },
  {
    id: 'career_interests',
    type: 'chip-multi-select',
    title: "What career fields interest you?",
    subtitle: "Select areas you'd like to explore in college and beyond",
    placeholder: "Search or add career interests...",
    jsonPath: 'careerInterests',
    maxSelections: 8,
    options: [
      "Engineering",
      "Computer Science",
      "Medicine",
      "Law",
      "Business",
      "Finance",
      "Marketing",
      "Education",
      "Psychology",
      "Biology",
      "Chemistry",
      "Physics",
      "Mathematics",
      "Environmental Science",
      "Architecture",
      "Art & Design",
      "Music",
      "Journalism",
      "International Relations",
      "Political Science",
      "Economics",
      "Social Work",
      "Public Health",
      "Nursing",
      "Veterinary Science",
      "Agriculture",
      "Aviation",
      "Hospitality",
      "Culinary Arts",
      "Fashion Design",
      "Film & Media",
      "Sports Management",
      "Entrepreneurship"
    ],
    validation: [
      { type: 'required', message: 'Please select at least one career interest' }
    ]
  }
]
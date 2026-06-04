const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const HAS_KEY = API_KEY && API_KEY !== 'your_gemini_api_key_here';

let genAI = null;
if (HAS_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
  } catch (err) {
    console.error('Error initializing GoogleGenerativeAI client:', err.message);
  }
} else {
  console.warn('WARNING: GEMINI_API_KEY not configured. Falling back to local AI simulators.');
}

/**
 * Clean and parse JSON from Gemini response. Handles potential markdown wrappers.
 */
function parseJSONResponse(text) {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return JSON.parse(cleaned.trim());
  } catch (error) {
    console.error('Failed to parse JSON response from Gemini:', text, error);
    throw new Error('AI returned an invalid JSON response shape');
  }
}

/**
 * Generate ATS Resume parsing analysis
 */
const analyzeResume = async (resumeText) => {
  if (!HAS_KEY || !genAI) {
    return getMockResumeAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Analyze the following resume text. Respond with a JSON object containing:
      - atsScore: (integer between 0 and 100 representing how well the resume is optimized)
      - extractedSkills: (array of strings representing technical and soft skills found)
      - education: (array of objects, each containing: school, degree, fieldOfStudy, year)
      - projects: (array of objects, each containing: title, description, technologies)
      - experience: (array of objects, each containing: company, role, duration, description)
      - feedback: (string summarizing strengths, weaknesses, and format issues)
      - missingSkills: (array of strings representing standard skills for their profile that are missing)
      - suggestions: (array of strings detailing actionable improvements)

      Resume Text:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini analyzeResume failed, falling back to mock:', error.message);
    return getMockResumeAnalysis();
  }
};

/**
 * Compare Resume text with Job Description
 */
const analyzeJobMatch = async (resumeText, jobDescription) => {
  if (!HAS_KEY || !genAI) {
    return getMockJobMatchAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Compare the following resume text against the job description. Respond with a JSON object containing:
      - matchScore: (integer between 0 and 100 showing compatibility)
      - missingSkills: (array of strings containing skills explicitly mentioned in the Job Description but missing from the resume)
      - suggestions: (string summarizing clear suggestions to optimize the resume to fit this Job Description better)

      Resume Text:
      ${resumeText}

      Job Description:
      ${jobDescription}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini analyzeJobMatch failed, falling back to mock:', error.message);
    return getMockJobMatchAnalysis();
  }
};

/**
 * Generate 10 technical interview questions
 */
const generateInterviewQuestions = async (category) => {
  if (!HAS_KEY || !genAI) {
    return getMockInterviewQuestions(category);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Generate exactly 10 diverse technical interview questions for a candidate specializing in the category: "${category}".
      Respond with a JSON array of strings containing the questions. Do not add any keys or markdown wrapping outside of the array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini generateQuestions failed, falling back to mock:', error.message);
    return getMockInterviewQuestions(category);
  }
};

/**
 * Evaluate an interview answer
 */
const evaluateInterviewAnswer = async (question, answer) => {
  if (!HAS_KEY || !genAI) {
    return getMockAnswerEvaluation();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Evaluate the user's answer to the technical interview question. Respond with a JSON object containing:
      - correctnessScore: (integer between 0 and 100 rating accuracy)
      - technicalDepthScore: (integer between 0 and 100 rating technical details and concepts used)
      - communicationScore: (integer between 0 and 100 rating clarity and structure)
      - overallScore: (integer between 0 and 100, average weighting)
      - aiFeedback: (string detailing what was good, what was missing, and a model correct response)

      Question:
      ${question}

      User's Answer:
      ${answer}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini evaluateAnswer failed, falling back to mock:', error.message);
    return getMockAnswerEvaluation();
  }
};

/**
 * Generate Skill Gap Analysis
 */
const analyzeSkillGap = async (targetRole, currentSkillsStr) => {
  if (!HAS_KEY || !genAI) {
    return getMockSkillGap(targetRole, currentSkillsStr);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Analyze the skill gap for a candidate aiming to become a "${targetRole}".
      Their current skills are: "${currentSkillsStr}".
      Respond with a JSON object containing:
      - currentSkills: (array of strings summarizing their input skills)
      - missingSkills: (array of strings listing critical missing skills required for a "${targetRole}")
      - requiredSkills: (array of strings listing standard industry expectations for "${targetRole}")
      - recommendations: (string with links/topics/suggestions to close this skill gap)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini analyzeSkillGap failed, falling back to mock:', error.message);
    return getMockSkillGap(targetRole, currentSkillsStr);
  }
};

/**
 * Generate 6-month roadmap
 */
const generateRoadmap = async (targetRole, missingSkillsStr) => {
  if (!HAS_KEY || !genAI) {
    return getMockRoadmap(targetRole);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Generate a detailed, personalized 6-month learning roadmap for someone trying to transition to a "${targetRole}".
      They need to focus on acquiring these missing skills: "${missingSkillsStr}".
      Respond with a JSON array of exactly 6 objects, representing Month 1 to Month 6. Each object must contain:
      - month: (string, e.g. "Month 1")
      - topic: (string, the core learning concept)
      - details: (string, detailed breakdown of milestones, projects to build, and recommended learning goals)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseJSONResponse(response.text());
  } catch (error) {
    console.error('Gemini generateRoadmap failed, falling back to mock:', error.message);
    return getMockRoadmap(targetRole);
  }
};

/**
 * Real-time career chatbot response
 */
const getChatbotResponse = async (chatHistory, userMessage) => {
  if (!HAS_KEY || !genAI) {
    return getMockChatResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format history for Gemini chat:
    // [{ role: 'user'|'model', parts: [{ text: '...' }] }]
    const formattedHistory = chatHistory.map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: 'You are a helpful, professional AI Career Copilot. You assist users with technical questions (React, Node, etc.), resume improvements, interview preparation, and professional roadmap guidance.',
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini chatbot response failed, falling back to mock:', error.message);
    return getMockChatResponse(userMessage);
  }
};

// ==========================================
// MOCK DATA GENERATORS (FALLBACKS)
// ==========================================

function getMockResumeAnalysis() {
  return {
    atsScore: 78,
    extractedSkills: ['JavaScript', 'HTML5', 'CSS3', 'React.js', 'Git', 'Webpack'],
    education: [
      {
        school: 'State University of Technology',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        year: '2023',
      },
    ],
    projects: [
      {
        title: 'Personal Portfolio Webpage',
        description: 'Designed responsive portfolio using HTML and vanilla CSS.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
      },
    ],
    experience: [
      {
        company: 'WebTech Solutions',
        role: 'Frontend Intern',
        duration: '6 Months',
        description: 'Developed reusable UI layouts and solved styling issues.',
      },
    ],
    feedback: 'Overall the resume format is solid, but the project descriptions lack quantifiable impact and technical depth. Skills section is heavily focused on frontend; lacks backend databases or modern state management solutions.',
    missingSkills: ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'Redux Toolkit', 'Tailwind CSS'],
    suggestions: [
      'Include metrics in experience bullet points (e.g., Optimized loading speeds by 20%)',
      'Add backend projects to highlight full stack capabilities',
      'Incorporate modern CSS frameworks like Tailwind CSS',
    ],
  };
}

function getMockJobMatchAnalysis() {
  return {
    matchScore: 65,
    missingSkills: ['Node.js', 'Express.js', 'SQL', 'RESTful APIs', 'Docker'],
    suggestions: 'The job description places high emphasis on building and deploying backend RESTful services. Your resume is highly frontend-focused. Create a full stack project utilizing Express.js and MySQL, and write a summary stating your interest/proficiency in building scalable APIs.',
  };
}

function getMockInterviewQuestions(category) {
  const normalized = (category || '').trim();

  const frontendQuestions = [
    "Describe the difference between block, inline, and inline-block display values in CSS.",
    "What is semantic HTML and why is it important for accessibility and SEO?",
    "Explain the concept of event delegation in JavaScript and why you would use it.",
    "What is the critical rendering path and how can you optimize it for faster page loads?",
    "How do cookies, localStorage, and sessionStorage differ in capacity and lifecycle?",
    "What are CSS variables (custom properties) and how do they compare to Sass variables?",
    "Explain the difference between CORS and JSONP and how to handle cross-origin requests.",
    "What are web vitals (LCP, FID, CLS) and how do you improve them in a web app?",
    "What is a closure in JavaScript? Explain a real-world use case.",
    "How does the JS Event Loop orchestrate asynchronous actions and call stacks?"
  ];

  const reactQuestions = [
    "What are the core differences between the Virtual DOM and the Real DOM in React?",
    "Explain the lifecycle methods of class components vs. corresponding useEffect hooks.",
    "What is the reconciliation process and what role do 'keys' play in rendering lists?",
    "What is the difference between controlled and uncontrolled inputs in React forms?",
    "When and why would you use useMemo, useCallback, and React.memo?",
    "Explain the Context API and how it differs from state managers like Redux or Zustand.",
    "How do you handle error boundaries in React to prevent the whole app from crashing?",
    "What is a custom hook in React and how does it help reuse stateful logic?",
    "How does React fiber handle concurrency and prioritize rendering tasks?",
    "Describe strategies for optimizing React bundle sizes, such as lazy loading and code splitting."
  ];

  const mernQuestions = [
    "Explain the MERN architecture stack and how the client and server communicate.",
    "How do you set up indexes in MongoDB to optimize slow query performances?",
    "What is mongoose middleware (pre/post hooks) and how can you use it for password hashing?",
    "Describe the difference between SQL relations and MongoDB embedding vs. referencing.",
    "How do you handle JWT token-based authentication and secure session storage in MERN?",
    "Explain MongoDB aggregation pipelines and how they compare to basic find queries.",
    "How does Express middleware work? Create a custom logger middleware.",
    "How would you handle real-time socket connections inside a MERN application?",
    "What is CORS and how do you configure it in an Express backend for a React frontend?",
    "How do you structure folders and build clean MVC systems in full-stack projects?"
  ];

  const nodeQuestions = [
    "How does Node.js handle concurrency despite being single-threaded? Explain Event Loop.",
    "What are Node.js streams and how do they improve performance when reading huge files?",
    "Explain the difference between process.nextTick(), setImmediate(), and setTimeout().",
    "How do you manage cluster modules in Node.js to take advantage of multi-core systems?",
    "Describe security practices for Node servers (e.g. rate limiting, helmet headers, sanitization).",
    "How does the require module resolution algorithm work under the hood in Node?",
    "What is the difference between buffer and string in Node, and when do you use buffers?",
    "How do you debug memory leaks in Node.js applications in a production environment?",
    "What are child processes and how do they differ from worker threads in Node?",
    "How do you configure database pool limits to prevent connection leakage in Express?"
  ];

  const javaQuestions = [
    "Explain the memory areas allocated in the JVM (Stack, Heap, Method Area) and garbage collection.",
    "What is the difference between abstract classes and interfaces in Java 8+?",
    "How does Spring Boot handle dependency injection and what is inversion of control (IoC)?",
    "Explain Java multithreading and how synchronized blocks/locks prevent race conditions.",
    "What is Hibernate caching (L1 vs. L2 caches) and how does it optimize database roundtrips?",
    "Describe the difference between checking exceptions vs. unchecking exceptions in Java.",
    "What is the significance of equals() and hashCode() contracts in HashMap operations?",
    "What are design patterns in Spring (e.g. Singleton, Prototype, Factory, Template)?",
    "Explain the Java Stream API and how intermediate operations differ from terminal ones.",
    "How do you handle transactional rollback limits using @Transactional in Spring?"
  ];

  const pythonQuestions = [
    "How does memory management work in Python? Explain Reference Counting and garbage collection.",
    "What are Python decorators and how do you write a custom decorator to measure execution time?",
    "Explain the difference between lists and tuples in Python in terms of memory and mutability.",
    "What are generators in Python and how does the 'yield' keyword save memory?",
    "Describe how virtual environments work in Python and why we use them.",
    "How does Django ORM handle lazy loading vs. eager loading (select_related / prefetch_related)?",
    "Explain the Global Interpreter Lock (GIL) and how it affects multi-core CPU tasks in Python.",
    "What are list comprehensions and generator expressions? Compare their performance.",
    "Describe the difference between Flask and Django architectures and when to choose each.",
    "How do you write clean unit tests in Python using unittest or pytest frameworks?"
  ];

  if (normalized.includes('React')) return reactQuestions;
  if (normalized.includes('MERN')) return mernQuestions;
  if (normalized.includes('Node')) return nodeQuestions;
  if (normalized.includes('Java')) return javaQuestions;
  if (normalized.includes('Python')) return pythonQuestions;
  return frontendQuestions; // Default fallback to general frontend developer
}

function getMockAnswerEvaluation() {
  return {
    correctnessScore: 82,
    technicalDepthScore: 75,
    communicationScore: 90,
    overallScore: 82,
    aiFeedback: 'Your answer explains the high-level concepts beautifully and communicates the core idea clearly. However, it lacks deep technical terminology (e.g. key matching, reconciliation process, call stack). To improve, explain the underlying mechanism in detail and mention how the engine optimizes re-renders.',
  };
}

function getMockSkillGap(targetRole, currentSkillsStr) {
  const current = currentSkillsStr.split(',').map(s => s.trim()).filter(Boolean);
  return {
    currentSkills: current.length ? current : ['JavaScript', 'React'],
    missingSkills: ['Node.js', 'Express.js', 'MySQL', 'Sequelize ORM', 'Docker', 'AWS Basics', 'System Design'],
    requiredSkills: [...new Set([...current, 'Node.js', 'Express.js', 'MySQL', 'Sequelize ORM', 'Docker', 'AWS Basics', 'System Design'])],
    recommendations: `To become a fully qualified ${targetRole}, you should transition from building client-only apps to building production-ready server APIs. Start by learning Node.js event architecture, building API layers with Express, integrating Sequelize ORM for database relations, and deploying containerized services with Docker.`,
  };
}

function getMockRoadmap(targetRole) {
  return [
    {
      month: 'Month 1',
      topic: 'Advanced JavaScript & Backend Foundations',
      details: 'Master ES6+, Event Loop, Promises, and Node.js core modules. Build a basic file-server.',
    },
    {
      month: 'Month 2',
      topic: 'RESTful API Engineering with Express.js',
      details: 'Understand routing, request/response cycles, middlewares, error-handling and express-validator.',
    },
    {
      month: 'Month 3',
      topic: 'Relational Database Design with MySQL & Sequelize',
      details: 'Learn database normalization, write raw SQL joins, and build complex tables and models using Sequelize ORM.',
    },
    {
      month: 'Month 4',
      topic: 'Authentication & Security Best Practices',
      details: 'Implement secure login flows using bcrypt, JWT token mechanisms, Refresh tokens in HttpOnly cookies, and RBAC.',
    },
    {
      month: 'Month 5',
      topic: 'Real-Time Interactivity & Testing',
      details: 'Implement Socket.io for bidirectional communication. Write unit/integration tests using Jest or Mocha.',
    },
    {
      month: 'Month 6',
      topic: 'Deployment, Containers, and DevOps Basics',
      details: 'Dockerize your backend. Learn AWS EC2/RDS or Render + Vercel for platform hosting. Set up a basic CI/CD flow.',
    },
  ];
}

function getMockChatResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('react')) {
    return 'React is a popular component-based frontend library. Key topics to master include Hooks (useState, useEffect, useContext, useMemo), state managers (Redux, Zustand), and performance profiling (Virtual DOM reconciliation, lazy loading). Let me know if you want a sample react code or interview question!';
  }
  if (msg.includes('node') || msg.includes('express')) {
    return 'Node.js is an asynchronous event-driven JavaScript runtime built on Chrome\'s V8 engine. Express.js is a minimal, flexible Node web framework providing robust routing and middleware architectures. Always use centralized error handlers and validation middleware for clean code.';
  }
  if (msg.includes('resume') || msg.includes('cv')) {
    return 'To optimize your resume: 1. Keep it to a clean single page. 2. Highlight quantified outcomes (e.g. reduced load time by 30%). 3. Emphasize target skills in a specific dedicated section. 4. Match the keywords from job descriptions to beat the ATS filter.';
  }
  return 'I am your Career Copilot! I can answer technical questions, check resume keywords, generate custom study roadmaps, or evaluate mock interview answers. Ask me anything about engineering roles!';
}

module.exports = {
  analyzeResume,
  analyzeJobMatch,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  analyzeSkillGap,
  generateRoadmap,
  getChatbotResponse,
};

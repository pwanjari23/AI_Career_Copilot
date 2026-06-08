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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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
    return getMockAnswerEvaluation(question, answer);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
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
    return getMockAnswerEvaluation(question, answer);
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Generate a detailed, personalized 6-month learning roadmap for someone trying to transition to a "${targetRole}".
      They need to focus on acquiring these missing skills: "${missingSkillsStr}".
      Respond with a JSON array of exactly 6 objects, representing Month 1 to Month 6. Each object must contain:
      - month: (string, e.g. "Month 1")
      - topic: (string, the core learning concept)
      - details: (string, detailed breakdown of milestones, projects to build, and recommended learning goals)
      - links: (array of objects, each object containing: "title" (string, the name of the resource or website) and "url" (string, a valid URL to high-quality free study material/documentation, e.g. MDN Web Docs, freeCodeCamp, official docs, or YouTube tutorial))
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
    return getMockChatResponse(chatHistory, userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are a helpful, professional AI Career Copilot. You assist users with technical questions (React, Node, etc.), resume improvements, interview preparation, and professional roadmap guidance.',
    });

    // Format history for Gemini chat:
    // [{ role: 'user'|'model', parts: [{ text: '...' }] }]
    const formattedHistory = chatHistory.map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini chatbot response failed, falling back to mock:', error.message);
    return getMockChatResponse(chatHistory, userMessage);
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

const MOCK_QUESTION_DATA = {
  // Frontend
  "Describe the difference between block, inline, and inline-block display values in CSS.": {
    keywords: ["block", "inline", "inline-block", "width", "height", "margin", "padding", "flow"],
    modelAnswer: "Block takes 100% width, starts on a new line, and respects all box properties. Inline stays in line, only takes content width, and ignores height and vertical margins. Inline-block flows inline but allows setting width, height, margins, and paddings."
  },
  "What is semantic HTML and why is it important for accessibility and SEO?": {
    keywords: ["semantic", "meaning", "accessibility", "seo", "header", "nav", "article", "section", "screen reader"],
    modelAnswer: "Semantic HTML uses elements that clearly describe their meaning (e.g., <header>, <nav>, <article>, <main>). It is crucial for screen readers and SEO as it provides structure to web pages."
  },
  "Explain the concept of event delegation in JavaScript and why you would use it.": {
    keywords: ["delegation", "bubble", "parent", "listener", "target", "memory", "event"],
    modelAnswer: "Event delegation is a technique where a single event listener is attached to a parent element to handle events on its child elements via event bubbling. This saves memory and handles dynamic children."
  },
  "What is the critical rendering path and how can you optimize it for faster page loads?": {
    keywords: ["critical", "render", "path", "dom", "cssom", "layout", "paint", "optimize", "async", "defer"],
    modelAnswer: "The Critical Rendering Path is the sequence of steps the browser takes to convert HTML, CSS, and JS into pixels on screen. Optimize it by minimizing resources, using async/defer, and using media queries to block render-blocking CSS."
  },
  "How do cookies, localStorage, and sessionStorage differ in capacity and lifecycle?": {
    keywords: ["cookie", "localstorage", "sessionstorage", "capacity", "expiry", "session", "server"],
    modelAnswer: "Cookies hold ~4KB, expire after set time, and are sent to the server. LocalStorage holds ~5-10MB, persists forever until cleared. SessionStorage holds ~5-10MB and expires when the browser tab is closed."
  },
  "What are CSS variables (custom properties) and how do they compare to Sass variables?": {
    keywords: ["css variables", "custom properties", "sass", "runtime", "compile", "dynamic"],
    modelAnswer: "CSS variables are dynamic, change at runtime, and respect DOM inheritance. Sass variables are static, evaluated at compilation time, and don't exist in the browser."
  },
  "Explain the difference between CORS and JSONP and how to handle cross-origin requests.": {
    keywords: ["cors", "jsonp", "cross-origin", "header", "origin", "script"],
    modelAnswer: "CORS is a secure mechanism using HTTP headers to permit cross-origin requests. JSONP is a legacy workaround using script tags to fetch JSON, which only supports GET and has security risks."
  },
  "What are web vitals (LCP, FID, CLS) and how do you improve them in a web app?": {
    keywords: ["web vitals", "lcp", "fid", "cls", "performance", "paint", "delay", "shift"],
    modelAnswer: "Web Vitals measure user experience: LCP (Largest Contentful Paint - load performance), FID (First Input Delay - interactivity), and CLS (Cumulative Layout Shift - visual stability). Improve them via lazy loading, optimized assets, and reserved dimensions."
  },
  "What is a closure in JavaScript? Explain a real-world use case.": {
    keywords: ["closure", "lexical", "scope", "inner", "outer", "private", "state"],
    modelAnswer: "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). Real-world use cases include data privacy (private variables) and factory functions."
  },
  "How does the JS Event Loop orchestrate asynchronous actions and call stacks?": {
    keywords: ["event loop", "call stack", "microtask", "macrotask", "queue", "callback", "promise"],
    modelAnswer: "The Event Loop continuously checks if the Call Stack is empty. If it is, it pushes callbacks from the microtask queue (Promises) followed by the macrotask/callback queue (setTimeout) to the stack."
  },

  // React
  "What are the core differences between the Virtual DOM and the Real DOM in React?": {
    keywords: ["virtual dom", "real dom", "diff", "reconciliation", "memory", "performance", "batch"],
    modelAnswer: "The Virtual DOM is a lightweight memory representation of the Real DOM. React uses diffing and reconciliation to find updates and batch changes, rendering them to the Real DOM efficiently."
  },
  "Explain the lifecycle methods of class components vs. corresponding useEffect hooks.": {
    keywords: ["lifecycle", "componentdidmount", "componentdidupdate", "componentwillunmount", "useeffect", "dependency", "cleanup"],
    modelAnswer: "Class components use componentDidMount, componentDidUpdate, and componentWillUnmount. React functional components use useEffect: empty dependencies array matches componentDidMount; active dependencies match componentDidUpdate; return cleanup function matches componentWillUnmount."
  },
  "What is the reconciliation process and what role do 'keys' play in rendering lists?": {
    keywords: ["reconciliation", "key", "diff", "list", "identify", "render", "re-order"],
    modelAnswer: "Reconciliation is React's algorithm to update the DOM. Keys help React identify which items in a list have changed, been added, or been removed, avoiding unnecessary re-renders."
  },
  "What is the difference between controlled and uncontrolled inputs in React forms?": {
    keywords: ["controlled", "uncontrolled", "usestate", "ref", "value", "state", "dom"],
    modelAnswer: "Controlled inputs have their value driven by React state using onChange. Uncontrolled inputs store their value in the DOM directly and are accessed using refs."
  },
  "When and why would you use useMemo, useCallback, and React.memo?": {
    keywords: ["usememo", "usecallback", "react.memo", "memoize", "re-render", "performance", "prop", "reference"],
    modelAnswer: "useMemo caches the result of an expensive calculation. useCallback caches a callback function. React.memo caches a functional component to prevent re-renders when props don't change."
  },
  "Explain the Context API and how it differs from state managers like Redux or Zustand.": {
    keywords: ["context", "redux", "zustand", "prop drilling", "store", "global", "performance", "re-render"],
    modelAnswer: "Context API is built-in for solving prop-drilling in small/medium apps but can cause full sub-tree re-renders. Redux/Zustand use external stores and selectors to optimize performance and manage complex global states."
  },
  "How do you handle error boundaries in React to prevent the whole app from crashing?": {
    keywords: ["error boundary", "componentdidcatch", "getderivedstatefromerror", "class", "crash", "fallback"],
    modelAnswer: "Error boundaries are class components implementing getDerivedStateFromError or componentDidCatch. They catch JavaScript errors anywhere in their child component tree and display a fallback UI."
  },
  "What is a custom hook in React and how does it help reuse stateful logic?": {
    keywords: ["custom hook", "use", "reuse", "stateful", "logic", "function"],
    modelAnswer: "A custom hook is a JS function whose name starts with 'use' and can call other hooks. It allows you to extract component logic into reusable functions."
  },
  "How does React fiber handle concurrency and prioritize rendering tasks?": {
    keywords: ["fiber", "concurrency", "prioritize", "reconciliation", "scheduler", "pause", "chunk"],
    modelAnswer: "React Fiber is a rewrite of the reconciler. It splits rendering work into incremental chunks, allowing the scheduler to pause, resume, or abort updates based on task priority (e.g., animations vs data fetching)."
  },
  "Describe strategies for optimizing React bundle sizes, such as lazy loading and code splitting.": {
    keywords: ["lazy", "code splitting", "suspense", "bundle", "import", "webpack", "tree shaking"],
    modelAnswer: "Use React.lazy and Suspense for code splitting. Implement dynamic imports to split routes. Ensure tree-shaking is active, compress assets, and use analyzer tools to eliminate bloated dependencies."
  },

  // MERN
  "Explain the MERN architecture stack and how the client and server communicate.": {
    keywords: ["mongodb", "express", "react", "node", "http", "api", "json", "rest", "client", "server"],
    modelAnswer: "MERN stands for MongoDB (database), Express.js (backend server), React (frontend), and Node.js (runtime). The React client makes HTTP REST API requests to the Express server, which queries MongoDB and returns JSON responses."
  },
  "How do you set up indexes in MongoDB to optimize slow query performances?": {
    keywords: ["index", "mongodb", "query", "performance", "explain", "scan", "key", "createindex"],
    modelAnswer: "Use db.collection.createIndex({ field: 1 }) to create indexes on query fields. This reduces document scan time from collection scan to index scan. Use explain() to analyze queries."
  },
  "What is mongoose middleware (pre/post hooks) and how can you use it for password hashing?": {
    keywords: ["mongoose", "middleware", "pre", "post", "bcrypt", "hash", "save"],
    modelAnswer: "Mongoose middleware runs functions before (pre) or after (post) database operations. For password hashing, use a pre-save hook to hash the plain text password using bcrypt before writing to MongoDB."
  },
  "Describe the difference between SQL relations and MongoDB embedding vs. referencing.": {
    keywords: ["sql", "mongodb", "embed", "reference", "relation", "join", "document", "foreign key"],
    modelAnswer: "SQL uses structured tables with relationships and joins. MongoDB allows embedding (storing nested documents for fast reads) or referencing (storing ObjectIds, mimicking foreign keys for normalized data)."
  },
  "How do you handle JWT token-based authentication and secure session storage in MERN?": {
    keywords: ["jwt", "token", "authentication", "cookie", "httponly", "header", "localstorage", "refresh"],
    modelAnswer: "Upon login, send an Access Token (stored in memory/localstorage) and a Refresh Token (stored in a secure HttpOnly cookie). Attach the access token as a Bearer token in request headers."
  },
  "Explain MongoDB aggregation pipelines and how they compare to basic find queries.": {
    keywords: ["aggregation", "pipeline", "stage", "match", "group", "project", "find"],
    modelAnswer: "Aggregation pipelines allow complex multi-stage data processing ($match, $group, $sort) in MongoDB. Simple find queries only filter and project, whereas aggregations transform data on the DB server."
  },
  "How does Express middleware work? Create a custom logger middleware.": {
    keywords: ["express", "middleware", "req", "res", "next", "function", "logger"],
    modelAnswer: "Express middleware is a function that has access to req, res, and next. It processes requests before they hit endpoints. Example: const logger = (req, res, next) => { console.log(req.method); next(); };"
  },
  "How would you handle real-time socket connections inside a MERN application?": {
    keywords: ["socket", "real-time", "socket.io", "connection", "emit", "on", "websocket", "server", "client"],
    modelAnswer: "Set up socket.io on the Express server and use socket.io-client in React. Establish a connection, listen to events with socket.on(), and send updates in real time using socket.emit()."
  },
  "What is CORS and how do you configure it in an Express backend for a React frontend?": {
    keywords: ["cors", "origin", "header", "express", "credentials", "middleware", "whitelist"],
    modelAnswer: "CORS (Cross-Origin Resource Sharing) is a security mechanism. Configure it in Express using the 'cors' middleware, passing configuration options like origin whitelist and credentials:true."
  },
  "How do you structure folders and build clean MVC systems in full-stack projects?": {
    keywords: ["structure", "mvc", "model", "view", "controller", "route", "folder", "clean"],
    modelAnswer: "Separate code into dedicated folders: models (schemas), controllers (logic), routes (endpoints), and middlewares (verifications). This maintains MVC (Model-View-Controller) segregation."
  },

  // Node
  "How does Node.js handle concurrency despite being single-threaded? Explain Event Loop.": {
    keywords: ["event loop", "single thread", "concurrency", "callback", "non-blocking", "libuv", "asynchronous", "thread pool"],
    modelAnswer: "Node delegate I/O tasks to the operating system or its thread pool (libuv). When async operations finish, they place callbacks in queues. The Event Loop pulls callbacks and runs them on the single main thread."
  },
  "What are Node.js streams and how do they improve performance when reading huge files?": {
    keywords: ["stream", "performance", "buffer", "chunk", "pipe", "read", "write", "memory"],
    modelAnswer: "Streams process data in small sequential chunks instead of loading the entire file into memory (buffers). This keeps memory consumption extremely low when handling large files."
  },
  "Explain the difference between process.nextTick(), setImmediate(), and setTimeout().": {
    keywords: ["nexttick", "setimmediate", "settimeout", "event loop", "microtask", "macrotask", "phase"],
    modelAnswer: "process.nextTick fires immediately after the current operation (before the event loop continues). setImmediate runs in the check phase of the event loop. setTimeout runs in the timers phase after delay."
  },
  "How do you manage cluster modules in Node.js to take advantage of multi-core systems?": {
    keywords: ["cluster", "core", "fork", "worker", "primary", "port sharing", "multi-process"],
    modelAnswer: "Node's cluster module allows spinning up multiple instances of the server (workers) that share the same port. Use cluster.fork() for each CPU core to distribute network loads."
  },
  "Describe security practices for Node servers (e.g. rate limiting, helmet headers, sanitization).": {
    keywords: ["security", "helmet", "rate limit", "sanitization", "cors", "xss", "csrf", "sanitize"],
    modelAnswer: "Use Helmet middleware to set secure HTTP headers, express-rate-limit to block DDoS, sanitize user input to prevent SQLi/XSS, and use secure HTTPOnly cookies for tokens."
  },
  "How does the require module resolution algorithm work under the hood in Node?": {
    keywords: ["require", "module", "node_modules", "resolve", "cache", "core", "file"],
    modelAnswer: "require checks core modules, then local files (.js, .json, .node), then searches node_modules recursively up the tree. Once loaded, it caches the module exports."
  },
  "What is the difference between buffer and string in Node, and when do you use buffers?": {
    keywords: ["buffer", "string", "binary", "raw memory", "encoding", "stream"],
    modelAnswer: "A string is a UTF-8 character representation. A buffer represents raw binary data allocated outside the V8 heap. Use buffers for raw I/O like files, images, or network socket streams."
  },
  "How do you debug memory leaks in Node.js applications in a production environment?": {
    keywords: ["memory leak", "debug", "heap dump", "profiler", "chrome devtools", "leak", "gc"],
    modelAnswer: "Take heap snapshots using packages like heapdump, analyze them in Chrome DevTools to find growing object structures, and run Node with the inspector enabled."
  },
  "What are child processes and how do they differ from worker threads in Node?": {
    keywords: ["child process", "worker thread", "ipc", "memory sharing", "v8", "multi-process"],
    modelAnswer: "Child processes spin up entirely new OS processes (with their own memory and V8 instance), communicating via IPC. Worker threads run in the same process and can share memory."
  },
  "How do you configure database pool limits to prevent connection leakage in Express?": {
    keywords: ["pool", "database", "connection", "leak", "limit", "max", "sequelize", "mysql"],
    modelAnswer: "Set max connections in your database pool options (e.g. max: 10). Always close unused queries and handle errors to return connections back to the pool, preventing leakage."
  },

  // Java
  "Explain the memory areas allocated in the JVM (Stack, Heap, Method Area) and garbage collection.": {
    keywords: ["jvm", "stack", "heap", "method area", "garbage collection", "thread", "gc"],
    modelAnswer: "JVM Stack holds local variables and method execution frames per thread. Heap holds all objects shared across threads. Method Area holds class metadata. Garbage Collection reclaims unreachable Heap memory."
  },
  "What is the difference between abstract classes and interfaces in Java 8+?": {
    keywords: ["abstract class", "interface", "default", "multiple inheritance", "state", "variables"],
    modelAnswer: "Abstract classes can hold state (instance variables) and constructors. Interfaces cannot hold state (only constants) and support multiple inheritance. Since Java 8, interfaces can have default and static methods."
  },
  "How does Spring Boot handle dependency injection and what is inversion of control (IoC)?": {
    keywords: ["spring boot", "dependency injection", "ioc", "bean", "autowired", "container"],
    modelAnswer: "Inversion of Control (IoC) means delegating object lifecycle management to the framework container. Dependency Injection (DI) is Spring injecting dependent beans using @Autowired or constructors."
  },
  "Explain Java multithreading and how synchronized blocks/locks prevent race conditions.": {
    keywords: ["multithreading", "synchronized", "lock", "race condition", "thread", "thread-safe"],
    modelAnswer: "Java threads run concurrently. When multiple threads edit shared variables, race conditions occur. Mark methods or code blocks as 'synchronized' or use Locks to restrict access to one thread at a time."
  },
  "What is Hibernate caching (L1 vs. L2 caches) and how does it optimize database roundtrips?": {
    keywords: ["hibernate", "cache", "l1", "l2", "session", "sessionfactory", "database"],
    modelAnswer: "L1 cache is mandatory and bound to the current Hibernate Session. L2 cache is optional, shared across sessions (SessionFactory). Caching saves db queries by storing retrieved entities in memory."
  },
  "Describe the difference between checking exceptions vs. unchecking exceptions in Java.": {
    keywords: ["checked exception", "unchecked exception", "runtimeexception", "throwable", "try-catch"],
    modelAnswer: "Checked exceptions are checked at compile-time and must be caught or declared (throws). Unchecked exceptions extend RuntimeException, are checked at runtime, and usually indicate programming errors."
  },
  "What is the significance of equals() and hashCode() contracts in HashMap operations?": {
    keywords: ["equals", "hashcode", "hashmap", "collision", "contract", "bucket"],
    modelAnswer: "HashMap uses hashCode() to determine the storage bucket and equals() to find the exact key in case of collisions. If two objects are equal according to equals(), they must return the same hashCode()."
  },
  "What are design patterns in Spring (e.g. Singleton, Prototype, Factory, Template)?": {
    keywords: ["design pattern", "singleton", "prototype", "factory", "template", "spring"],
    modelAnswer: "Spring uses Singleton (default bean scope), Prototype (new bean instance per request), Factory (BeanFactory), and Template patterns (JdbcTemplate) to simplify standard operations."
  },
  "Explain the Java Stream API and how intermediate operations differ from terminal ones.": {
    keywords: ["stream", "intermediate", "terminal", "lazy", "filter", "map", "collect"],
    modelAnswer: "Java Streams process collections in a functional style. Intermediate operations (filter, map) are lazy and return another stream. Terminal operations (collect, forEach) trigger the processing and return a result."
  },
  "How do you handle transactional rollback limits using @Transactional in Spring?": {
    keywords: ["transactional", "rollback", "spring", "exception", "rollbackfor"],
    modelAnswer: "Mark methods with @Transactional. By default, Spring rolls back for unchecked (Runtime) exceptions. To roll back for checked exceptions, configure @Transactional(rollbackFor = Exception.class)."
  },

  // Python
  "How does memory management work in Python? Explain Reference Counting and garbage collection.": {
    keywords: ["memory", "python", "reference count", "garbage collection", "cycle", "ref"],
    modelAnswer: "Python uses reference counting to destroy objects when their references fall to 0. A cyclic garbage collector periodically searches and cleans up self-referencing reference cycles."
  },
  "What are Python decorators and how do you write a custom decorator to measure execution time?": {
    keywords: ["decorator", "wrapper", "function", "time", "@", "wrap"],
    modelAnswer: "A decorator takes a function, adds functionality, and returns it. Write a wrapper function inside the decorator that logs time before and after calling the function, then returns the wrapper."
  },
  "Explain the difference between lists and tuples in Python in terms of memory and mutability.": {
    keywords: ["list", "tuple", "mutable", "immutable", "memory", "bracket"],
    modelAnswer: "Lists are mutable (can be edited), require more memory, and are declared with square brackets. Tuples are immutable (cannot be edited), consume less memory, and are declared with parentheses."
  },
  "What are generators in Python and how does the 'yield' keyword save memory?": {
    keywords: ["generator", "yield", "memory", "lazy", "iterator", "state"],
    modelAnswer: "Generators return an iterator that yields values one at a time (lazy evaluation). The 'yield' keyword pauses execution and retains state, avoiding loading whole lists into memory."
  },
  "Describe how virtual environments work in Python and why we use them.": {
    keywords: ["virtual environment", "venv", "pip", "isolate", "dependency", "directory"],
    modelAnswer: "Virtual environments isolate project-specific dependencies into a standalone directory. This avoids dependency version conflicts between different Python projects on the same machine."
  },
  "How does Django ORM handle lazy loading vs. eager loading (select_related / prefetch_related)?": {
    keywords: ["django", "orm", "lazy", "eager", "select_related", "prefetch_related", "join", "query"],
    modelAnswer: "Django defaults to lazy loading (fetching foreign keys on demand, causing N+1 query issues). Eager loading uses select_related (SQL JOIN for single relations) or prefetch_related (separate lookup for many-to-many)."
  },
  "Explain the Global Interpreter Lock (GIL) and how it affects multi-core CPU tasks in Python.": {
    keywords: ["gil", "lock", "thread", "concurrency", "cpu bound", "multiprocessing"],
    modelAnswer: "The GIL is a mutex guarding Python interpreter execution, allowing only one thread to execute Python bytecode at a time. This limits CPU-bound multi-threaded tasks. Use multiprocessing instead."
  },
  "What are list comprehensions and generator expressions? Compare their performance.": {
    keywords: ["list comprehension", "generator expression", "memory", "performance", "tuple", "bracket"],
    modelAnswer: "List comprehensions create full lists in memory immediately. Generator expressions (in parentheses) return a generator object, producing values lazily. Generator expressions are much more memory-efficient."
  },
  "Describe the difference between Flask and Django architectures and when to choose each.": {
    keywords: ["flask", "django", "microframework", "monolith", "batteries included", "mvc"],
    modelAnswer: "Flask is a minimal, lightweight microframework letting you choose tools. Django is a batteries-included full-stack monolith providing ORM, admin panel, and auth by default. Choose Django for large apps."
  },
  "How do you write clean unit tests in Python using unittest or pytest frameworks?": {
    keywords: ["test", "unittest", "pytest", "assert", "mock", "fixture"],
    modelAnswer: "Create test classes extending unittest.TestCase or use pytest functions with simple 'assert' statements. Use mock library to fake database or external API calls, and pytest fixtures for clean setup."
  }
};

function getMockAnswerEvaluation(question, answer) {
  const normalizeText = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const qStr = normalizeText(question);
  const aStr = (answer || '').trim().toLowerCase();

  let matchedKey = null;
  for (const key of Object.keys(MOCK_QUESTION_DATA)) {
    if (qStr.includes(normalizeText(key)) || normalizeText(key).includes(qStr)) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    const hasCodeTerms = /const|let|function|def|class|import|return|value|method|api|database|query|sql|react|node|html|css/i.test(aStr);
    if (aStr.length < 15 || !hasCodeTerms) {
      return {
        correctnessScore: 0,
        technicalDepthScore: 0,
        communicationScore: 30,
        overallScore: 0,
        aiFeedback: "Your answer appears to be irrelevant or lacks technical content. Score is set to 0. Please provide a relevant technical response to the question."
      };
    }

    return {
      correctnessScore: 60,
      technicalDepthScore: 50,
      communicationScore: 70,
      overallScore: 60,
      aiFeedback: "Your answer contains general technical terms, but we could not match it to a specific question key. Please elaborate with more specific examples and implementation details."
    };
  }

  const data = MOCK_QUESTION_DATA[matchedKey];
  const keywords = data.keywords;
  const modelAnswer = data.modelAnswer;

  let matchCount = 0;
  const matchedWords = [];
  keywords.forEach(kw => {
    if (aStr.includes(kw)) {
      matchCount++;
      matchedWords.push(kw);
    }
  });

  const totalKeywords = keywords.length;
  const keywordRatio = matchCount / totalKeywords;

  if (matchCount === 0) {
    return {
      correctnessScore: 0,
      technicalDepthScore: 0,
      communicationScore: 10,
      overallScore: 0,
      aiFeedback: `Incorrect answer. The concepts mentioned do not align with the question.\n\nExpected Concepts: ${keywords.join(', ')}.\n\nModel Correct Answer:\n${modelAnswer}`
    };
  }

  const correctnessScore = Math.min(100, Math.round(keywordRatio * 100));
  const technicalDepthScore = Math.min(100, Math.round((matchCount / Math.max(3, totalKeywords - 2)) * 100));
  const communicationScore = Math.min(100, Math.round((aStr.length / 120) * 100));

  const overallScore = Math.round((correctnessScore * 0.5) + (technicalDepthScore * 0.3) + (communicationScore * 0.2));

  let feedback = `Evaluation Results:\n`;
  feedback += `- Identified relevant technical concepts: ${matchedWords.join(', ')}.\n`;
  if (matchCount < totalKeywords) {
    const missing = keywords.filter(kw => !matchedWords.includes(kw));
    feedback += `- Missing key topics to mention: ${missing.slice(0, 3).join(', ')}.\n`;
  }
  feedback += `\nModel Correct Answer:\n${modelAnswer}`;

  return {
    correctnessScore,
    technicalDepthScore,
    communicationScore,
    overallScore,
    aiFeedback: feedback
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
      links: [
        { title: 'MDN Web Docs - JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
        { title: 'Node.js Core Documentation', url: 'https://nodejs.org/en/docs/' }
      ]
    },
    {
      month: 'Month 2',
      topic: 'RESTful API Engineering with Express.js',
      details: 'Understand routing, request/response cycles, middlewares, error-handling and express-validator.',
      links: [
        { title: 'Express.js Getting Started Guide', url: 'https://expressjs.com/en/starter/installing.html' },
        { title: 'freeCodeCamp - Express & Node Tutorial', url: 'https://www.freecodecamp.org/news/freecodecamp-nodejs-express-course/' }
      ]
    },
    {
      month: 'Month 3',
      topic: 'Relational Database Design with MySQL & Sequelize',
      details: 'Learn database normalization, write raw SQL joins, and build complex tables and models using Sequelize ORM.',
      links: [
        { title: 'Sequelize ORM Documentation', url: 'https://sequelize.org/' },
        { title: 'W3Schools - SQL Tutorial', url: 'https://www.w3schools.com/sql/' }
      ]
    },
    {
      month: 'Month 4',
      topic: 'Authentication & Security Best Practices',
      details: 'Implement secure login flows using bcrypt, JWT token mechanisms, Refresh tokens in HttpOnly cookies, and RBAC.',
      links: [
        { title: 'JWT.io Introduction to JSON Web Tokens', url: 'https://jwt.io/introduction' },
        { title: 'OWASP Top Ten Security Risks', url: 'https://owasp.org/www-project-top-ten/' }
      ]
    },
    {
      month: 'Month 5',
      topic: 'Real-Time Interactivity & Testing',
      details: 'Implement Socket.io for bidirectional communication. Write unit/integration tests using Jest or Mocha.',
      links: [
        { title: 'Socket.io Get Started Tutorial', url: 'https://socket.io/get-started/chat' },
        { title: 'Jest Testing Framework Docs', url: 'https://jestjs.io/' }
      ]
    },
    {
      month: 'Month 6',
      topic: 'Deployment, Containers, and DevOps Basics',
      details: 'Dockerize your backend. Learn AWS EC2/RDS or Render + Vercel for platform hosting. Set up a basic CI/CD flow.',
      links: [
        { title: 'Docker Overview Guide', url: 'https://docs.docker.com/get-started/docker-overview/' },
        { title: 'Render Deployment Documentation', url: 'https://docs.render.com/' }
      ]
    },
  ];
}

function getMockChatResponse(chatHistory, userMessage) {
  const msg = (userMessage || '').toLowerCase().trim();

  // Helper to detect last discussed topic from conversation history
  const detectTopic = (text) => {
    const t = (text || '').toLowerCase();
    if (t.includes('react') || t.includes('virtual dom') || t.includes('hook')) return 'react';
    if (t.includes('node') || t.includes('express') || t.includes('event loop') || t.includes('stream')) return 'node';
    if (t.includes('mongodb') || t.includes('mongoose') || t.includes('sql') || t.includes('database')) return 'database';
    if (t.includes('resume') || t.includes('cv') || t.includes('portfolio') || t.includes('profile')) return 'resume';
    if (t.includes('interview') || t.includes('question') || t.includes('mock')) return 'interview';
    return 'general';
  };

  const lastModelMsg = chatHistory && chatHistory.slice().reverse().find(h => h.role === 'model' || h.role === 'assistant');
  const contextTopic = lastModelMsg ? detectTopic(lastModelMsg.text) : 'general';

  // 1. Handling Greetings & Meta questions
  if (msg === 'hi' || msg === 'hello' || msg === 'hey' || msg.startsWith('hello ') || msg.startsWith('hi ')) {
    return "Hello! I am your AI Career Copilot. I can assist you with technical coding questions, mock interview preparation, resume reviews, and custom learning roadmaps. What are you working on today?";
  }

  if (msg.includes('how are you') || msg.includes('how\'s it going')) {
    return "I'm doing great, thank you for asking! Ready to help you level up your engineering skills or optimize your resume. What can I do for you today?";
  }

  if (msg.includes('who are you') || msg.includes('what are you') || msg.includes('your name') || msg.includes('mentor')) {
    return "I am the AI Career Copilot—your 24/7 technical mentor. I can help explain programming concepts (React, Node, SQL, Python), review CVs, generate study paths, or practice code questions with you.";
  }

  // 1.5. Identify requests for lists of questions
  const isAskingForQuestions = msg.includes('questions') || msg.includes('interview') || msg.includes('quiz') || msg.includes('ask me');
  if (isAskingForQuestions && (msg.includes('react') || msg.includes('node') || msg.includes('express') || msg.includes('mern') || msg.includes('java') || msg.includes('python') || msg.includes('frontend') || msg.includes('list') || msg.includes('give me'))) {
    let category = 'Frontend';
    let questionsList = [];
    if (msg.includes('react')) {
      category = 'React';
      questionsList = getMockInterviewQuestions('React');
    } else if (msg.includes('node') || msg.includes('express')) {
      category = 'Node.js';
      questionsList = getMockInterviewQuestions('Node');
    } else if (msg.includes('mern')) {
      category = 'MERN Stack';
      questionsList = getMockInterviewQuestions('MERN');
    } else if (msg.includes('java')) {
      category = 'Java';
      questionsList = getMockInterviewQuestions('Java');
    } else if (msg.includes('python')) {
      category = 'Python';
      questionsList = getMockInterviewQuestions('Python');
    } else {
      questionsList = getMockInterviewQuestions('Frontend');
    }

    return `Here are the top 10 mock interview questions for a **${category}** position:

${questionsList.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

Feel free to write your answer to any of these questions here, and I will evaluate it for you!`;
  }

  // 2. Identify code/example requests
  const isAskingForExample = msg.includes('example') || msg.includes('code') || msg.includes('snippet') || msg.includes('show me') || msg.includes('write a') || msg.includes('how to write');
  const isAskingForMore = msg.includes('more') || msg.includes('elaborate') || msg.includes('explain') || msg.includes('why') || msg.includes('how');

  if (isAskingForExample) {
    if (msg.includes('react') || contextTopic === 'react') {
      return `Here is a clean React functional component example using standard state and side effect hooks:
\`\`\`jsx
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch request
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading Profile...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="text-gray-500">{user.email}</p>
    </div>
  );
};

export default UserProfile;
\`\`\`
Is there any specific hook (like \`useMemo\` or \`useCallback\`) or prop detail you want me to add?`;
    }

    if (msg.includes('node') || msg.includes('express') || contextTopic === 'node') {
      return `Here is a complete Express.js server boilerplate showing routing, JSON body parsing, and central error-handling middleware:
\`\`\`javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON requests
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy' });
});

// Centralized Error-handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
\`\`\`
Let me know if you want to connect a database (like MySQL/Sequelize or MongoDB/Mongoose) to this server!`;
    }

    if (msg.includes('database') || msg.includes('sql') || msg.includes('mongodb') || msg.includes('mongoose') || contextTopic === 'database') {
      return `Here is an example SQL query for fetching users and their aggregate order counts:
\`\`\`sql
SELECT 
  users.id, 
  users.fullName, 
  COUNT(orders.id) AS totalOrders, 
  SUM(orders.amount) AS totalSpent
FROM users
LEFT JOIN orders ON users.id = orders.userId
GROUP BY users.id, users.fullName
HAVING totalOrders > 5
ORDER BY totalSpent DESC;
\`\`\`
Or if you are using **MongoDB Mongoose**, here is a standard model schema definition:
\`\`\`javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
\`\`\`
Would you like to see how to write a join or aggregate matching document data?`;
    }
  }

  // 3. Elaborations and Explanations
  if (isAskingForMore) {
    if (msg.includes('react') || contextTopic === 'react') {
      return `React's architecture centers around **reusable components** and the **Virtual DOM**. Here are the core concepts:
### 1. The Virtual DOM
- Updates to the browser's Real DOM are slow. React keeps a virtual copy in memory.
- When state changes, React runs a diffing algorithm (Reconciliation) and updates only the modified items in the browser.

### 2. Functional Hooks
- \`useState\`: Manages local state.
- \`useEffect\`: Coordinates side effects (subscriptions, fetching, cleanup).
- \`useContext\`: Shares values globally, preventing prop drilling.

What hooks or performance optimization tricks would you like to discuss next?`;
    }

    if (msg.includes('node') || msg.includes('express') || contextTopic === 'node') {
      return `Node.js's primary strength is its **Asynchronous, Event-Driven** architecture:
### 1. The Event Loop
- Despite being single-threaded, Node manages concurrent operations by offloading I/O to system calls or the libuv thread pool.
- When tasks finish, callbacks enter queues and execute sequentially on the main thread.

### 2. Stream Pipeline
- Streams read or write files in small chunks instead of buffering everything to memory.
- e.g. \`readStream.pipe(writeStream)\` keeps the memory footprint extremely low.

What async pattern or event-loop phase would you like to review?`;
    }

    if (msg.includes('resume') || msg.includes('cv') || contextTopic === 'resume') {
      return `To optimize your resume for applicant tracking systems (ATS):
### 1. Simple Layouts
- Use a single-column format. Avoid complex sidebars, graphics, tables, or header icons, which confuse ATS scanners.
- Save as simple PDF or DOCX format.

### 2. Focus on Impact (XYZ Formula)
- Structure bullet points using: *Accomplished [X], measured by [Y], by doing [Z]*.
- *Example*: "Reduced API latency by 30% [Y] by implementing Redis caching and query indexing [Z] on user profiles [X]."

Which resume section (skills layout, descriptions, summary) would you like to analyze or structure?`;
    }
  }

  // 4. Topic-Specific Handlers
  if (msg.includes('react')) {
    return `React is a component-driven frontend library. Key topics to master include:
- **Hooks** (\`useState\`, \`useEffect\`, \`useContext\`, \`useMemo\`)
- **State Management** (Redux Toolkit, Zustand, Context API)
- **Performance** (Virtual DOM, reconciliation, lazy loading, code-splitting)

Would you like to see a sample React code snippet or practice interview questions?`;
  }

  if (msg.includes('node') || msg.includes('express')) {
    return `Node.js is an asynchronous, event-driven JavaScript runtime built on Chrome's V8 engine. Express.js is a minimal framework for building web APIs.
Key concepts:
- **The Event Loop** (non-blocking thread concurrency)
- **Middleware** (intercepting req/res lifecycle hooks)
- **Streams & Buffers** (memory-efficient raw binary file handling)

Would you like to see an Express server boilerplate with routing and error middleware?`;
  }

  if (msg.includes('resume') || msg.includes('cv')) {
    return `To optimize your resume for ATS:
1. **Single Page**: Keep it concise.
2. **Quantifiable Metrics**: Showcase impact (e.g., "reduced latency by 30%").
3. **Core Skills**: Dedicate a section listing your key tech stack (React, Node, MySQL).
4. **Keyword Matching**: Match terms from the target job description.

Would you like me to analyze a sample resume paragraph or share layout formats?`;
  }

  if (msg.includes('database') || msg.includes('sql') || msg.includes('mongodb') || msg.includes('mysql')) {
    return `Databases are categorised into:
- **Relational (SQL)**: Structured tables, relations, and joins (MySQL, PostgreSQL).
- **Non-Relational (NoSQL)**: Document-based, fast writes, dynamic fields (MongoDB).

Would you like to see how to write a raw SQL JOIN query or a MongoDB aggregation pipeline?`;
  }

  if (msg.includes('interview') || msg.includes('questions')) {
    return `I can help you prepare for technical interviews. Tell me what position or category you are targeting (e.g., React Developer, Node Developer, MERN Developer, Python Developer), and we can run a mock practice round!`;
  }

  // 5. Default Fallback
  return `I am your AI Career Copilot. I can answer technical questions, explain software engineering concepts, optimize resume sections, or mock-evaluate coding answers. 

To help me give a precise answer, could you tell me more about:
1. The language or framework you are using (e.g., React, Node, Python, Java, SQL).
2. The specific task you are working on.
3. Or if you need advice on resume formatting, mock interviews, or study plans!`;
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

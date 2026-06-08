# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.













Here is the complete list of developer specializations, core learning topics, and mock interview questions defined in the project:

### 1. Frontend Developer
* **Core Topics to Learn**: HTML5, CSS3, Core JavaScript (ES6+), Browser APIs, Web Optimization, CSS Layout (Block/Inline/Inline-Block), Semantic HTML, Event Delegation, Critical Rendering Path, Client Storage (Cookies/localStorage/sessionStorage), CSS Variables vs. Sass, CORS & JSONP, Web Vitals (LCP, FID, CLS), JS Closures, and the JS Event Loop.
* **Mock Interview Questions**:
  1. Describe the difference between block, inline, and inline-block display values in CSS.
  2. What is semantic HTML and why is it important for accessibility and SEO?
  3. Explain the concept of event delegation in JavaScript and why you would use it.
  4. What is the critical rendering path and how can you optimize it for faster page loads?
  5. How do cookies, localStorage, and sessionStorage differ in capacity and lifecycle?
  6. What are CSS variables (custom properties) and how do they compare to Sass variables?
  7. Explain the difference between CORS and JSONP and how to handle cross-origin requests.
  8. What are web vitals (LCP, FID, CLS) and how do you improve them in a web app?
  9. What is a closure in JavaScript? Explain a real-world use case.
  10. How does the JS Event Loop orchestrate asynchronous actions and call stacks?

---

### 2. React Developer
* **Core Topics to Learn**: JSX, Hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`), Context API, Redux/Zustand, Virtual DOM, Reconciliation, Lazy Loading & Code Splitting (`Suspense`), Controlled vs. Uncontrolled Inputs, Error Boundaries, React Fiber architecture.
* **Mock Interview Questions**:
  1. What are the core differences between the Virtual DOM and the Real DOM in React?
  2. Explain the lifecycle methods of class components vs. corresponding useEffect hooks.
  3. What is the reconciliation process and what role do 'keys' play in rendering lists?
  4. What is the difference between controlled and uncontrolled inputs in React forms?
  5. When and why would you use useMemo, useCallback, and React.memo?
  6. Explain the Context API and how it differs from state managers like Redux or Zustand.
  7. How do you handle error boundaries in React to prevent the whole app from crashing?
  8. What is a custom hook in React and how does it help reuse stateful logic?
  9. How does React fiber handle concurrency and prioritize rendering tasks?
  10. Describe strategies for optimizing React bundle sizes, such as lazy loading and code splitting.

---

### 3. MERN Developer
* **Core Topics to Learn**: MongoDB, Express.js, React.js, Node.js, RESTful API design, database indexing, Mongoose Middleware (password hashing), SQL vs. NoSQL (referencing vs. embedding), JWT Token Authentication, MongoDB Aggregation pipelines, Socket.io real-time communication, CORS, MVC architecture.
* **Mock Interview Questions**:
  1. Explain the MERN architecture stack and how the client and server communicate.
  2. How do you set up indexes in MongoDB to optimize slow query performances?
  3. What is mongoose middleware (pre/post hooks) and how can you use it for password hashing?
  4. Describe the difference between SQL relations and MongoDB embedding vs. referencing.
  5. How do you handle JWT token-based authentication and secure session storage in MERN?
  6. Explain MongoDB aggregation pipelines and how they compare to basic find queries.
  7. How does Express middleware work? Create a custom logger middleware.
  8. How would you handle real-time socket connections inside a MERN application?
  9. What is CORS and how do you configure it in an Express backend for a React frontend?
  10. How do you structure folders and build clean MVC systems in full-stack projects?

---

### 4. Node Developer
* **Core Topics to Learn**: Asynchronous concurrency, Event Loop phases, Node.js Streams (handling large files), `process.nextTick` vs `setImmediate`, Cluster modules (multi-core utilization), Server security (Rate limiting, Helmet headers, sanitation), module resolution, memory leak profiling, Child Processes vs. Worker Threads, database pool connection limits.
* **Mock Interview Questions**:
  1. How does Node.js handle concurrency despite being single-threaded? Explain Event Loop.
  2. What are Node.js streams and how do they improve performance when reading huge files?
  3. Explain the difference between process.nextTick(), setImmediate(), and setTimeout().
  4. How do you manage cluster modules in Node.js to take advantage of multi-core systems?
  5. Describe security practices for Node servers (e.g. rate limiting, helmet headers, sanitization).
  6. How does the require module resolution algorithm work under the hood in Node?
  7. What is the difference between buffer and string in Node, and when do you use buffers?
  8. How do you handle debugging memory leaks in Node.js applications in a production environment?
  9. What are child processes and how do they differ from worker threads in Node?
  10. How do you configure database pool limits to prevent connection leakage in Express?

---

### 5. Java Developer
* **Core Topics to Learn**: OOP principles, JVM Memory Allocation (Stack, Heap, Method Area), Garbage Collection, Abstract Classes vs. Interfaces, Spring Boot Dependency Injection, Inversion of Control (IoC), Multithreading & Concurrency (synchronization/locks), Hibernate Caching (L1 vs. L2), checked vs. unchecked Exceptions, `equals()` and `hashCode()` contracts, Java Stream API, `@Transactional` rollbacks.
* **Mock Interview Questions**:
  1. Explain the memory areas allocated in the JVM (Stack, Heap, Method Area) and garbage collection.
  2. What is the difference between abstract classes and interfaces in Java 8+?
  3. How does Spring Boot handle dependency injection and what is inversion of control (IoC)?
  4. Explain Java multithreading and how synchronized blocks/locks prevent race conditions.
  5. What is Hibernate caching (L1 vs. L2 caches) and how does it optimize database roundtrips?
  6. Describe the difference between checking exceptions vs. unchecking exceptions in Java.
  7. What is the significance of equals() and hashCode() contracts in HashMap operations?
  8. What are design patterns in Spring (e.g. Singleton, Prototype, Factory, Template)?
  9. Explain the Java Stream API and how intermediate operations differ from terminal ones.
  10. How do you handle transactional rollback limits using @Transactional in Spring?

---

### 6. Python Developer
* **Core Topics to Learn**: Python memory management, Reference Counting, Garbage Collection, Custom Decorators (timing execution), List vs. Tuple mutability/memory profiles, Generators (`yield`), virtual environments, Django ORM loading (lazy vs. eager/`select_related`/`prefetch_related`), Global Interpreter Lock (GIL), List comprehensions vs. generator expressions, Flask vs. Django, testing (`unittest`/`pytest`).
* **Mock Interview Questions**:
  1. How does memory management work in Python? Explain Reference Counting and garbage collection.
  2. What are Python decorators and how do you write a custom decorator to measure execution time?
  3. Explain the difference between lists and tuples in Python in terms of memory and mutability.
  4. What are generators in Python and how does the 'yield' keyword save memory?
  5. Describe how virtual environments work in Python and why we use them.
  6. How does Django ORM handle lazy loading vs. eager loading (select_related / prefetch_related)?
  7. Explain the Global Interpreter Lock (GIL) and how it affects multi-core CPU tasks in Python.
  8. What are list comprehensions and generator expressions? Compare their performance.
  9. Describe the difference between Flask and Django architectures and when to choose each.
  10. How do you write clean unit tests in Python using unittest or pytest frameworks?
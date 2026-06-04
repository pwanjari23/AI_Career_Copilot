import React, { useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { Award, ArrowRight, MessageSquare, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, BarChart } from 'lucide-react';

const CATEGORIES = [
  { name: 'Frontend Developer', desc: 'HTML5, CSS3, Core JS, Browser APIs, Web Optimization' },
  { name: 'React Developer', desc: 'JSX, Hooks, Context, Redux, Reconciliation, Lazy loading' },
  { name: 'MERN Developer', desc: 'MongoDB, Express, React, Node.js, REST APIs, Associations' },
  { name: 'Node Developer', desc: 'Event Loop, Streams, Clusters, Express, Server security' },
  { name: 'Java Developer', desc: 'OOP, JVM, Spring Boot, Multithreading, Hibernate, MVC' },
  { name: 'Python Developer', desc: 'Django, Flask, PEP8, Generators, Decorators, Web scraping' },
];

const MockInterview = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Active session states
  const [session, setSession] = useState(null); // { interviewId, questions: [{id, question}] }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  
  // Answer evaluation states
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState(null); // { questionRecord, completed }
  const [answeredMap, setAnsweredMap] = useState([]); // Array of evaluation records
  const [interviewComplete, setInterviewComplete] = useState(false);

  const handleStart = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/interviews/start', { category });
      setSession(res.data.data);
      setCurrentIndex(0);
      setAnswerText('');
      setEvaluation(null);
      setAnsweredMap([]);
      setInterviewComplete(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || submittingAnswer) return;

    setSubmittingAnswer(true);
    setError(null);

    const questionObj = session.questions[currentIndex];

    try {
      const res = await api.post(`/interviews/${session.interviewId}/answer`, {
        answerId: questionObj.id,
        answer: answerText,
      });

      const evalData = res.data.data;
      setEvaluation(evalData.questionRecord);
      setAnsweredMap((prev) => [...prev, evalData.questionRecord]);

      if (evalData.completed) {
        setInterviewComplete(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate your answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setAnswerText('');
    setEvaluation(null);
  };

  // Color logic for individual metric scores
  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400';
    return 'bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400';
  };

  // 1. Selector View
  if (!session) {
    return (
      <div className="space-y-8 text-left">
        <div>
          <h2 className="text-2xl font-bold font-sans">AI Mock Interview Platform</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select a developer specialization. Gemini will generate 10 customized technical questions to evaluate you.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedCategory(cat.name)}
              className={`glass-card p-6 bg-white dark:bg-darkCard rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                selectedCategory === cat.name
                  ? 'border-primary-500 ring-2 ring-primary-500/20'
                  : 'border-gray-200/50 dark:border-gray-800/50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${selectedCategory === cat.name ? 'bg-primary-500 text-white' : 'bg-primary-500/10 text-primary-500'}`}>
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{cat.name}</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed min-h-[40px]">
                {cat.desc}
              </p>
              {selectedCategory === cat.name && (
                <div className="absolute top-2 right-2 text-primary-500 font-bold text-xs">
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => handleStart(selectedCategory)}
            disabled={!selectedCategory}
            loading={loading}
            className="px-8"
          >
            <span>Start Mock Interview</span>
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // 2. Completed Overview View
  if (interviewComplete && evaluation) {
    const totalScore = answeredMap.reduce((sum, q) => sum + q.score, 0);
    const avgScore = Math.round(totalScore / answeredMap.length);

    return (
      <div className="space-y-8 text-left animate-fade-in max-w-4xl mx-auto">
        <Card className="text-center py-8 space-y-4">
          <div className="h-20 w-20 bg-emerald-500/15 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
            🏆
          </div>
          <h2 className="text-3xl font-extrabold font-sans">Interview Completed!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            You successfully completed the AI Mock Interview for <strong className="font-semibold">{session.category}</strong>.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
              <span className="block text-xs font-bold text-gray-400 uppercase">Total Questions</span>
              <span className="text-xl font-bold">10</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
              <span className="block text-xs font-bold text-gray-400 uppercase">Answered</span>
              <span className="text-xl font-bold">10</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
              <span className="block text-xs font-bold text-gray-400 uppercase">Avg Score</span>
              <span className="text-xl font-bold text-emerald-500">{avgScore}%</span>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={() => setSession(null)} className="px-8">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Take Another Interview</span>
            </Button>
          </div>
        </Card>

        {/* Detailed Question Review Accordion */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Detailed Question-by-Question Review</h3>
          {answeredMap.map((rec, index) => (
            <Card key={index} className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-primary-500 uppercase">Question {index + 1}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getScoreBadgeClass(rec.score)}`}>
                  Score: {rec.score}%
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{rec.question}</h4>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 font-light">
                <span className="font-semibold block mb-1">Your Answer:</span>
                {rec.answer}
              </div>
              <div className="p-3 rounded-xl bg-primary-50/20 dark:bg-primary-950/15 border border-primary-500/10 text-xs leading-relaxed font-light">
                <span className="font-semibold text-primary-500 block mb-1">AI Evaluator Feedback:</span>
                {rec.aiFeedback}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 3. Question Runner View
  const currentQuestion = session.questions[currentIndex];

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">
            {session.category} Mock Session
          </span>
          <h3 className="text-lg font-bold">Question {currentIndex + 1} of 10</h3>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
          Progress: {Math.round(((currentIndex) / 10) * 100)}%
        </span>
      </div>

      <Card className="space-y-4">
        <h4 className="text-xl font-bold font-sans text-gray-900 dark:text-white">
          {currentQuestion.question}
        </h4>

        {evaluation ? (
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
            {/* Evaluation Score bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                <span className="text-xs font-bold text-gray-400 block mb-1">Correctness</span>
                <span className={`text-lg font-bold ${getScoreBadgeClass(evaluation.correctnessScore)}`}>
                  {evaluation.correctnessScore}%
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                <span className="text-xs font-bold text-gray-400 block mb-1">Tech Depth</span>
                <span className={`text-lg font-bold ${getScoreBadgeClass(evaluation.technicalDepthScore)}`}>
                  {evaluation.technicalDepthScore}%
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                <span className="text-xs font-bold text-gray-400 block mb-1">Communication</span>
                <span className={`text-lg font-bold ${getScoreBadgeClass(evaluation.communicationScore)}`}>
                  {evaluation.communicationScore}%
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                <span className="text-xs font-bold text-gray-400 block mb-1">Overall</span>
                <span className={`text-lg font-bold ${getScoreBadgeClass(evaluation.score)}`}>
                  {evaluation.score}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary-50/20 dark:bg-primary-950/15 border border-primary-500/10 space-y-1.5">
              <h5 className="font-bold text-sm text-primary-500 flex items-center space-x-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>AI Evaluator Feedback</span>
              </h5>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                {evaluation.aiFeedback}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            <textarea
              rows="6"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              placeholder="Type your technical answer here..."
            ></textarea>
          </div>
        )}

        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          {evaluation ? (
            currentIndex < 9 ? (
              <Button onClick={handleNext}>
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => setInterviewComplete(true)} variant="primary">
                <span>View Final Review</span>
                <BarChart className="h-4 w-4 ml-2" />
              </Button>
            )
          ) : (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!answerText.trim()}
              loading={submittingAnswer}
              className="px-8"
            >
              <span>Submit Answer</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MockInterview;

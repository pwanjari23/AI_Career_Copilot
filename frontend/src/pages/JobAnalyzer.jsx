import React, { useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { AlertCircle, Sparkles, CheckCircle, HelpCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobAnalyzer = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/jobs', { jobDescription });
      setResult(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to analyze job description. Make sure you have uploaded a resume first.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/10';
    if (score >= 60) return 'text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-950/10';
    return 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950/10';
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-2xl font-bold font-sans">Job Description Matcher</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Compare your uploaded resume against a specific job description to optimize compatibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Paste Box */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-bold">Target Job Description</h3>
            <p className="text-xs text-gray-400">
              Paste the text content of the job description (e.g. from LinkedIn or Indeed).
            </p>
            <textarea
              rows="12"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              placeholder="Paste job requirements, skills, and duties here..."
            ></textarea>

            {error && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl space-y-2">
                <p className="font-semibold">{error}</p>
                {error.includes('upload') && (
                  <Link to="/resume-analyzer" className="inline-block font-bold underline hover:text-red-600">
                    Upload Resume Now
                  </Link>
                )}
              </div>
            )}

            <Button
              onClick={handleCompare}
              disabled={!jobDescription.trim()}
              loading={loading}
              className="w-full"
            >
              Check Compatibility
            </Button>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Score card */}
              <Card className="flex flex-col sm:flex-row items-center gap-6 p-8">
                <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(result.matchScore)}`}>
                  <span className="text-3xl font-black">{result.matchScore}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Match Score</span>
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="text-xl font-bold flex items-center justify-center sm:justify-start space-x-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span>Suggestions for Alignment</span>
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                    {result.suggestions}
                  </p>
                </div>
              </Card>

              {/* Missing Skills */}
              <Card className="space-y-4">
                <h4 className="font-bold flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <CheckCircle className="h-5 w-5 text-rose-500" />
                  <span>Missing skills in your CV for this role</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills && result.missingSkills.length > 0 ? (
                    result.missingSkills.map((skill, index) => (
                      <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">All skills specified in the Job Description match your resume. Excellent!</span>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center text-gray-400 h-full">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
              <h4 className="mt-4 font-bold text-lg text-gray-600 dark:text-gray-400">No Job Description Analyzed</h4>
              <p className="text-sm max-w-sm mt-2 text-gray-400">
                Paste the target job description in the left-hand editor and click compare to run match scoring.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobAnalyzer;

import React, { useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { AlertCircle, Target, CheckCircle, HelpCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

const SkillGap = () => {
  const [targetRole, setTargetRole] = useState('');
  const [customSkills, setCustomSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!targetRole.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // If customSkills is provided, split by comma. Otherwise let backend extract from resume
    const currentSkills = customSkills.trim()
      ? customSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      const res = await api.post('/skills', { targetRole, currentSkills });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze skill gap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-2xl font-bold font-sans">Skill Gap Diagnostics</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Pinpoint precisely which capabilities you need to acquire to fit your dream development role.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary-500" />
              <span>Target Role Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="e.g. Senior React Developer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Current Skills (Optional)
              </label>
              <span className="block text-[10px] text-gray-400 mb-2 leading-normal">
                Comma-separated. Leave empty to auto-extract from your latest uploaded resume.
              </span>
              <input
                type="text"
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="e.g. HTML, CSS, JavaScript, React"
              />
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!targetRole.trim()}
              loading={loading}
              className="w-full"
            >
              Analyze Skill Gap
            </Button>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current skills */}
                <Card className="space-y-4">
                  <h4 className="font-bold flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span>Your Match Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.currentSkills && result.currentSkills.length > 0 ? (
                      result.currentSkills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">None declared or parsed.</span>
                    )}
                  </div>
                </Card>

                {/* Missing skills */}
                <Card className="space-y-4">
                  <h4 className="font-bold flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                    <span>Skills You Need to Learn</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills && result.missingSkills.length > 0 ? (
                      result.missingSkills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-500 font-semibold">0 gap! Ready for the job.</span>
                    )}
                  </div>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="space-y-3">
                <h4 className="font-bold flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <BookOpen className="h-5 w-5 text-primary-500" />
                  <span>AI Learning Strategy</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light whitespace-pre-line">
                  {result.recommendations}
                </p>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center text-gray-400 h-full">
              <Target className="h-16 w-16 text-gray-300 dark:text-gray-700" />
              <h4 className="mt-4 font-bold text-lg text-gray-600 dark:text-gray-400">Run Gap Analysis</h4>
              <p className="text-sm max-w-sm mt-2 text-gray-400">
                Input your target engineering title in the left-hand form to compute skill requirements and recommendations.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGap;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { UploadCloud, FileText, CheckCircle, Info, Sparkles, TrendingUp, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resumes, setResumes] = useState([]);

  const fetchLatestAndHistory = async () => {
    try {
      const resLatest = await api.get('/resumes/latest');
      if (resLatest.data.data) {
        setLatestAnalysis(resLatest.data.data);
      }
      
      const resList = await api.get('/resumes');
      if (resList.data.data) {
        setResumes(resList.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch resume information:', err.message);
    }
  };

  useEffect(() => {
    fetchLatestAndHistory();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLatestAnalysis(res.data.data);
      setFile(null);
      fetchLatestAndHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during resume analysis.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/resumes');
      setLatestAnalysis(null);
      setResumes([]);
      setShowConfirmModal(false);
    } catch (err) {
      setError('Failed to clear resume history.');
      setShowConfirmModal(false);
    }
  };

  // Color logic for ATS score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/10';
    if (score >= 60) return 'text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-950/10';
    return 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950/10';
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans">AI Resume Analyzer</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Check your ATS scoring, extract profile summaries, and optimize keywords.
          </p>
        </div>
        {latestAnalysis && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all self-start md:self-center"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Resume History</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Upload Resume</h3>
            </div>

            {!user?.isPro && user?.role !== 'admin' && (
              <div className="p-3.5 rounded-xl bg-primary-500/5 dark:bg-primary-500/10 text-xs border border-primary-500/20 flex justify-between items-center font-bold">
                <span className="text-gray-500 dark:text-gray-400">Analyses Slots:</span>
                <span className="text-primary-500">{resumes.length} / 3 Used</span>
              </div>
            )}

            {!user?.isPro && user?.role !== 'admin' && resumes.length >= 3 ? (
              <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center space-y-4">
                <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Starter Limit Reached
                  </p>
                  <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                    You have parsed all 3 free resumes. Upgrade to Pro for unlimited PDF analyses.
                  </p>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full py-2.5 bg-gradient-to-r from-primary-500 to-indigo-650 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl text-center shadow-md shadow-primary-500/20"
                >
                  Upgrade to Pro
                </Link>
              </div>
            ) : (
              <>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    dragActive ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10' : 'border-gray-300 dark:border-gray-800'
                  }`}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
                    <div className="h-12 w-12 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mx-auto">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Only PDF format is supported (Max 5MB)
                      </p>
                    </div>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="h-5 w-5 text-primary-500" />
                      <span className="truncate text-gray-700 dark:text-gray-300">{file.name}</span>
                    </div>
                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                      ✕
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file}
                  loading={uploading}
                  className="w-full"
                >
                  Start AI Analysis
                </Button>
              </>
            )}
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {latestAnalysis ? (
            <div className="space-y-6 animate-fade-in">
              {/* Overall Score Banner */}
              <Card className="flex flex-col sm:flex-row items-center gap-6 p-8">
                <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(latestAnalysis.atsScore)}`}>
                  <span className="text-3xl font-black">{latestAnalysis.atsScore}</span>
                  <span className="text-xs uppercase font-bold tracking-wider">ATS Score</span>
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="text-xl font-bold flex items-center justify-center sm:justify-start space-x-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span>AI Feedback Summary</span>
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                    {latestAnalysis.feedback}
                  </p>
                </div>
              </Card>

              {/* Skills Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="space-y-4">
                  <h4 className="font-bold flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span>Extracted Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(latestAnalysis.extractedSkills || []).map((skill, index) => (
                      <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h4 className="font-bold flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-rose-500" />
                    <span>Missing Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {/* fallback parsed missing skills or simulated recommendations */}
                    {latestAnalysis.missingSkills && latestAnalysis.missingSkills.length > 0 ? (
                      latestAnalysis.missingSkills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">All key skills found! Great job.</span>
                    )}
                  </div>
                </Card>
              </div>

              {/* Education, Experience & Projects */}
              <Card className="space-y-6">
                <h4 className="font-bold flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <Info className="h-5 w-5 text-primary-500" />
                  <span>Parsed CV Information</span>
                </h4>

                {/* Experience */}
                {latestAnalysis.experience && latestAnalysis.experience.length > 0 && (
                  <div className="space-y-3 text-left">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</h5>
                    {latestAnalysis.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1">
                        <div className="flex justify-between font-bold text-sm">
                          <span className="text-gray-800 dark:text-gray-200">{exp.role}</span>
                          <span className="text-primary-500 font-medium">{exp.duration}</span>
                        </div>
                        <p className="text-xs text-gray-500">{exp.company}</p>
                        <p className="text-xs text-gray-400 font-light leading-relaxed mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {latestAnalysis.projects && latestAnalysis.projects.length > 0 && (
                  <div className="space-y-3 text-left">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Projects</h5>
                    {latestAnalysis.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 space-y-1">
                        <div className="flex justify-between font-bold text-sm">
                          <span className="text-gray-800 dark:text-gray-200">{proj.title}</span>
                          <span className="text-xs text-gray-400">{(proj.technologies || []).join(', ')}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-light leading-relaxed mt-2">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700" />
              <h4 className="mt-4 font-bold text-lg text-gray-600 dark:text-gray-400">No Resume Uploaded Yet</h4>
              <p className="text-sm max-w-sm mt-2 text-gray-400">
                Upload your resume in PDF format to run ATS scoring, check missing skills, and read feedback.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 max-w-sm w-full shadow-2xl animate-scale-in text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-red-100 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clear Resume History?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                This will permanently delete all your uploaded resumes, files, and ATS analysis reports from the system. This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 rounded-xl"
                onClick={handleClearHistory}
              >
                Yes, Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;

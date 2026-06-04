import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import { DashboardSkeleton } from '../components/Skeleton';
import { FileText, Award, AlertCircle, Compass, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const { cards, charts } = stats || {
    cards: { resumeScore: 0, totalInterviews: 0, avgInterviewScore: 0, skillGapPercentage: 0, roadmapProgress: 0 },
    charts: { interviewChart: [], skillChart: { role: '', currentCount: 0, missingCount: 0 }, weeklyActivityChart: [] }
  };

  // 1. Line Chart: Interview Performance
  const interviewLabels = charts.interviewChart.map((i) => i.date);
  const interviewData = charts.interviewChart.map((i) => i.score);
  const hasInterviews = interviewData.length > 0;

  const interviewChartData = {
    labels: hasInterviews ? interviewLabels : ['No data'],
    datasets: [
      {
        label: 'Interview Score',
        data: hasInterviews ? interviewData : [0],
        borderColor: '#536dfe',
        backgroundColor: 'rgba(83, 109, 254, 0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#536dfe',
        pointHoverRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(156, 163, 175, 0.08)' } },
      x: { grid: { display: false } },
    },
  };

  // 2. Bar Chart: Weekly Activity
  const activityLabels = charts.weeklyActivityChart.map((a) => a.day);
  const activityData = charts.weeklyActivityChart.map((a) => a.count);

  const activityChartData = {
    labels: activityLabels,
    datasets: [
      {
        label: 'Activities count',
        data: activityData,
        backgroundColor: '#38bdf8',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(156, 163, 175, 0.08)' } },
      x: { grid: { display: false } },
    },
  };

  // 3. Doughnut Chart: Skill Gap Breakdown
  const hasSkills = charts.skillChart.currentCount > 0 || charts.skillChart.missingCount > 0;
  
  const skillChartData = {
    labels: ['Current Skills', 'Missing Skills'],
    datasets: [
      {
        data: hasSkills
          ? [charts.skillChart.currentCount, charts.skillChart.missingCount]
          : [1, 0],
        backgroundColor: hasSkills ? ['#10b981', '#f43f5e'] : ['#e5e7eb', '#ffffff'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, fontSize: 10 } },
    },
    cutout: '72%',
  };

  return (
    <div className="space-y-5 text-left">
      {/* Welcome Banner */}
      <div className="p-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5 text-center sm:text-left">
          <h2 className="text-sm font-bold flex items-center justify-center sm:justify-start space-x-1.5">
            <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
            <span>AI Copilot Engine Active</span>
          </h2>
          <p className="text-xs font-light text-primary-100 max-w-lg">
            Analyzing target title: <strong className="font-semibold">{user?.targetRole || 'Not Specified (Update Profile)'}</strong>. Let's look at your progress.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="flex items-center space-x-3 p-3.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">ATS Score</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{cards.resumeScore}%</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-3 p-3.5">
          <div className="p-2 bg-primary-500/10 text-primary-500 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Interviews</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{cards.totalInterviews}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-3 p-3.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Avg Grade</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{cards.avgInterviewScore}%</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-3 p-3.5">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Skill Gap</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{cards.skillGapPercentage}%</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-3 p-3.5 col-span-2 sm:col-span-1">
          <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Roadmaps</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{cards.roadmapProgress}%</p>
          </div>
        </Card>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Performance */}
        <Card className="lg:col-span-2 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Interview Performance History</h3>
          <div className="h-56 relative">
            {hasInterviews ? (
              <Line data={interviewChartData} options={lineOptions} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <p className="text-xs">No interviews completed yet.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Skill Gap */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Skills Ratio Breakdown</h3>
          <div className="h-56 relative">
            <Doughnut data={skillChartData} options={doughnutOptions} />
          </div>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Weekly Activity Log</h3>
        <div className="h-52">
          <Bar data={activityChartData} options={barOptions} />
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

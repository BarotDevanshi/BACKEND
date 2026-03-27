import { useState, useEffect } from 'react';
import { getMoods, getTasks, getSleep, getProgress } from '../services/api';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Filler, Tooltip, Legend,
  RadialLinearScale,
} from 'chart.js';
import { FiTarget, FiTrendingUp, FiZap } from 'react-icons/fi';
import { BiSmile, BiMoon } from 'react-icons/bi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Filler, Tooltip, Legend, RadialLinearScale);

const MOOD_VALUES = { happy: 5, neutral: 4, sad: 2, stressed: 1, angry: 0 };
const MOOD_COLORS = { happy: '#4ADE80', neutral: '#60A5FA', sad: '#F87171', stressed: '#FBBF24', angry: '#EF4444' };

export default function Dashboard() {
  const [moods, setMoods] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [moodRes, taskRes, sleepRes, progRes] = await Promise.all([
        getMoods(), getTasks(), getSleep(), getProgress(),
      ]);
      setMoods(moodRes.data.data || []);
      setTasks(taskRes.data.data || []);
      setSleepData(sleepRes.data.data || []);
      setProgress(progRes.data.data || null);
    } catch {}
    setLoading(false);
  };

  if (loading) return <div className="loading-spinner" style={{ marginTop: '40px' }}></div>;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const dopamine = Math.min(100, completionRate + (progress?.streak || 0) * 5);

  // ── Monthly Heatmap ──────────────────────────────────────────────────────
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const moodByDay = {};
  moods.forEach(m => {
    const d = new Date(m.createdAt);
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      moodByDay[d.getDate()] = m.mood;
    }
  });

  // ── Weekly Mood & Task Data ───────────────────────────────────────────────
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Only show days Mon → today (exclude future days)
  const todayJsDay = today.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const todayIdx = todayJsDay === 0 ? 6 : todayJsDay - 1; // convert to Mon=0..Sun=6
  const visibleDays = daysOfWeek.slice(0, todayIdx + 1);

  const completedTasksByDay = Array(7).fill(0);
  const totalTasksByDay = Array(7).fill(0);
  const moodByDayOfWeek = Array(7).fill(0);
  const moodCountByDayOfWeek = Array(7).fill(0);

  tasks.forEach(t => {
    const d = new Date(t.updatedAt || t.createdAt);
    const diffDays = Math.floor((today - d) / 86400000);
    if (diffDays < 7) {
      const dayStr = d.toLocaleDateString('en', { weekday: 'short' });
      const idx = daysOfWeek.indexOf(dayStr);
      if (idx !== -1) {
        totalTasksByDay[idx] += 1;
        if (t.status === 'completed') completedTasksByDay[idx] += 1;
      }
    }
  });

  moods.forEach(m => {
    const d = new Date(m.createdAt);
    const diffDays = Math.floor((today - d) / 86400000);
    if (diffDays < 7) {
      const dayStr = d.toLocaleDateString('en', { weekday: 'short' });
      const idx = daysOfWeek.indexOf(dayStr);
      if (idx !== -1) {
        moodByDayOfWeek[idx] += (MOOD_VALUES[m.mood] ?? 3);
        moodCountByDayOfWeek[idx] += 1;
      }
    }
  });

  const avgMoodByDay = moodByDayOfWeek.map((val, idx) => {
    return moodCountByDayOfWeek[idx] > 0 ? Math.round(val / moodCountByDayOfWeek[idx]) : null;
  });

  // Sliced to visible days only
  const visibleTotal     = totalTasksByDay.slice(0, todayIdx + 1);
  const visibleCompleted = completedTasksByDay.slice(0, todayIdx + 1);
  const visibleMoodCount = moodCountByDayOfWeek.slice(0, todayIdx + 1);

  // Clustered bar chart — two bars side by side per day
  const taskBarChartData = {
    labels: visibleDays,
    datasets: [
      {
        label: 'Total',
        data: visibleTotal,
        backgroundColor: '#68c3ff',   // light violet
        borderRadius: 5,
        barPercentage: 0.75,
        categoryPercentage: 0.65,
      },
      {
        label: 'Completed',
        data: visibleCompleted,
        backgroundColor: '#3873f1',   // dark violet
        borderRadius: 5,
        barPercentage: 0.75,
        categoryPercentage: 0.65,
      },
    ]
  };

  const moodChartData = {
    labels: visibleDays,
    datasets: [{
      label: 'Mood Inputs',
      data: visibleMoodCount,
      borderColor: '#C08497',
      backgroundColor: '#f3b6c4',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#DB2777',
      pointBorderColor: '#9D174D',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      spanGaps: true,
    }],
  };

  // ── Sleep Bar Chart ──────────────────────────────────────────────────────
  const recent7Sleep = sleepData.slice(0, 7).reverse();
  const sleepChartData = {
    labels: recent7Sleep.length > 0 ? recent7Sleep.map((_, i) => `Day ${i + 1}`) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Hours', data: recent7Sleep.length > 0 ? recent7Sleep.map(s => parseFloat((s.duration || 0).toFixed(1))) : Array(7).fill(0), backgroundColor: '#18bc85', borderRadius: 8 }],
  };

  const moodLineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#1F2937',
        titleFont: { size: 14, weight: 'bold' },
        bodyColor: '#1de1fb',
        bodyFont: { size: 13 },
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (ctx) => ctx[0].label,
          label: (ctx) => `Inputs : ${ctx.raw ?? 0}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6', borderDash: [4, 4] }, beginAtZero: true, ticks: { precision: 0, color: '#9CA3AF', font: { size: 11 } } }
    }
  };

  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } }, y: { grid: { color: '#F3F4F6', borderDash: [4, 4] }, beginAtZero: true, ticks: { color: '#9CA3AF', font: { size: 11 } } } } };
  
  const taskBarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 11, weight: '600' },
          color: '#374151',
          usePointStyle: true,
          pointStyleWidth: 10,
          padding: 12,
          generateLabels: (chart) => chart.data.datasets.map((ds, i) => ({
            text: ds.label,
            fillStyle: ds.backgroundColor,
            strokeStyle: ds.backgroundColor,
            hidden: false,
            datasetIndex: i,
          }))
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1F1F2E',
        titleColor: '#fff',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        borderColor: '#5B21B6',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        callbacks: {
          title: (ctx) => ctx[0].label,
          label: (ctx) => {
            const isTotal = ctx.dataset.label === 'Total';
            return `  ${isTotal ? 'Total Tasks' : 'Completed'}: ${ctx.raw}`;
          },
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: { grid: { color: '#F3F4F6', borderDash: [4, 4] }, beginAtZero: true, ticks: { precision: 0, color: '#9CA3AF', font: { size: 11 } } }
    }
  };

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalDaysInCalendar = firstDay + daysInMonth;
  const calendarCells = Array.from({ length: Math.ceil(totalDaysInCalendar / 7) * 7 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null;
  });

  return (
    <div style={{ paddingBottom: '90px' }}>
      <div className="gradient-header" style={{ marginBottom: '20px', paddingBottom: '28px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Your Dashboard</h1>
        <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Track your progress &amp; insights 📊</p>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px', marginBottom: '20px' }}>
        {[
          { label: 'Completion', value: `${completionRate}%`, icon: <FiTarget size={14} />, color: '#10B981', bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
          { label: 'Streak', value: `${progress?.streak || 0} 🔥`, icon: '🔥', color: '#F97316', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
          { label: 'Dopamine', value: `${dopamine}%`, icon: <FiZap size={14} />, color: '#8B5CF6', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' },
          { label: 'Tasks', value: `${completedTasks}/${totalTasks}`, icon: <FiTrendingUp size={14} />, color: '#3B82F6', bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: '18px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stat.color, fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
              {stat.icon} {stat.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1F2937' }}>{stat.value}</div>
          </div>
        ))}
      </div>


      {/* ── Mood Web Radar Chart ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
          🕸️ Mood Radar
        </h3>
        <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
          <Radar
            data={{
              labels: ['Happy', 'Neutral', 'Sad', 'Stressed', 'Angry'],
              datasets: [{
                label: 'Mood Frequency',
                data: [
                  moods.filter(m => m.mood === 'happy').length,
                  moods.filter(m => m.mood === 'neutral').length,
                  moods.filter(m => m.mood === 'sad').length,
                  moods.filter(m => m.mood === 'stressed').length,
                  moods.filter(m => m.mood === 'angry').length,
                ],
                backgroundColor: 'rgba(178,70,210,0.18)',
                borderColor: '#B246D2',
                borderWidth: 2.5,
                pointBackgroundColor: '#F037A5',
                pointRadius: 5,   
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { r: { beginAtZero: true, ticks: { stepSize: 1, color: '#9CA3AF', font: { size: 10 } }, grid: { color: '#F3F4F6' }, pointLabels: { font: { size: 11, weight: '700' }, color: '#374151' } } },
            }}
          />
        </div>
      </div>

      {/* ── Mood Trend ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Mood Trends</h3>
        <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '14px' }}>Total mood inputs per day</p>
        <div style={{ height: '180px' }}><Line data={moodChartData} options={moodLineOpts} /></div>
      </div>

      {/* ── Sleep ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
          <BiMoon size={18} color="#6D28D9" /> Sleep Pattern
        </h3>
        <div style={{ height: '180px' }}><Bar data={sleepChartData} options={barOpts} /></div>
      </div>

      {/* ── Task Bar ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Task Completion</h3>
        <div style={{ height: '180px' }}><Bar data={taskBarChartData} options={taskBarOpts} /></div>
      </div>


    </div>
  );
}

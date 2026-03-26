import { useState, useEffect } from 'react';
import { getMoods, getTasks, getSleep, getProgress } from '../services/api';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Filler, Tooltip, Legend,
  RadialLinearScale,
} from 'chart.js';
import { FiTarget, FiTrendingUp, FiAward, FiZap } from 'react-icons/fi';
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

  // ── Weekly Heap ──────────────────────────────────────────────────────────
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heapData = Array(7).fill(0);
  tasks.filter(t => t.status === 'completed').forEach(t => {
    const d = new Date(t.updatedAt || t.createdAt);
    const diffDays = Math.floor((today - d) / 86400000);
    if (diffDays < 7) {
      const dayStr = d.toLocaleDateString('en', { weekday: 'short' });
      const idx = daysOfWeek.indexOf(dayStr);
      if (idx !== -1) heapData[idx] += 1;
    }
  });
  const maxHeap = Math.max(...heapData, 1);

  // ── Mood Line Chart (Time & Day Wise in Tooltip) ──────────────────────────
  const recentMoods = moods.length > 0 ? [...moods].reverse().slice(-14) : [{ createdAt: new Date(), mood: 'neutral' }];
  const moodChartData = {
    labels: recentMoods.map(m => new Date(m.createdAt).toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{ 
      label: 'Mood Level', 
      data: recentMoods.map(m => MOOD_VALUES[m.mood] ?? 3), 
      times: recentMoods.map(m => new Date(m.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute:'2-digit' })),
      borderColor: '#B246D2', 
      backgroundColor: 'rgba(178,70,210,0.12)', 
      borderWidth: 2.5, fill: true, tension: 0.3, 
      pointBackgroundColor: '#B246D2', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5 
    }],
  };

  // ── Sleep Bar Chart ──────────────────────────────────────────────────────
  const recent7Sleep = sleepData.slice(0, 7).reverse();
  const sleepChartData = {
    labels: recent7Sleep.length > 0 ? recent7Sleep.map((_, i) => `Day ${i + 1}`) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Hours', data: recent7Sleep.length > 0 ? recent7Sleep.map(s => parseFloat((s.duration || 0).toFixed(1))) : Array(7).fill(0), backgroundColor: '#6D28D9', borderRadius: 8 }],
  };

  // ── Task Doughnut ─────────────────────────────────────────────────────────
  const taskDonutData = {
    labels: ['Completed', 'Pending'],
    datasets: [{ data: [completedTasks || 1, pendingTasks || 0], backgroundColor: ['#4ADE80', '#FB923C'], borderWidth: 0, cutout: '72%' }],
  };

  const lineOpts = { 
    responsive: true, maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (ctx) => `${ctx[0].label} ${ctx[0].dataset.times[ctx[0].dataIndex]}`
        }
      }
    }, 
    scales: { 
      x: { grid: { color: '#F3F4F6', borderDash: [4, 4] }, ticks: { color: '#9CA3AF', font: { size: 11 } } }, 
      y: { grid: { color: '#F3F4F6', borderDash: [4, 4] }, beginAtZero: true, max: 6, ticks: { stepSize: 2, color: '#9CA3AF', font: { size: 11 } } } 
    } 
  };
  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } }, y: { grid: { color: '#F3F4F6', borderDash: [4, 4] }, beginAtZero: true, max: 12, ticks: { stepSize: 3, color: '#9CA3AF', font: { size: 11 } } } } };
  const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

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

      {/* ── Badges ── */}
      {progress?.badges?.length > 0 && (
        <div className="card" style={{ margin: '0 16px 20px', padding: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
            <FiAward color="#F59E0B" size={18} /> My Badges
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {progress.badges.map((b, i) => (
              <span key={i} style={{ background: 'linear-gradient(135deg,#B246D2,#F037A5)', color: 'white', borderRadius: '20px', padding: '5px 14px', fontSize: '0.82rem', fontWeight: 700 }}>{b}</span>
            ))}
          </div>
          <p style={{ color: '#9CA3AF', fontSize: '0.78rem', marginTop: '10px' }}>Games played: <strong style={{ color: '#374151' }}>{progress.gamesPlayed || 0}</strong></p>
        </div>
      )}

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
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
          <BiSmile size={18} color="#B246D2" /> Mood Trend
        </h3>
        <div style={{ height: '180px' }}><Line data={moodChartData} options={lineOpts} /></div>
      </div>

      {/* ── Sleep ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
          <BiMoon size={18} color="#6D28D9" /> Sleep Pattern
        </h3>
        <div style={{ height: '180px' }}><Bar data={sleepChartData} options={barOpts} /></div>
      </div>

      {/* ── Task Donut ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Task Distribution</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ height: '160px', flex: '0 0 160px' }}><Doughnut data={taskDonutData} options={donutOpts} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#4ADE80' }}></div>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Done <strong style={{ color: '#1F2937' }}>{completedTasks}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#FB923C' }}></div>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Pending <strong style={{ color: '#1F2937' }}>{pendingTasks}</strong></span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '1.2rem', fontWeight: 800, color: '#1F2937' }}>{completionRate}%</div>
          </div>
        </div>
      </div>


    </div>
  );
}

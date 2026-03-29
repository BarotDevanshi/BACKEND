import { useState, useEffect, useMemo } from 'react';
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
    } catch { }
    setLoading(false);
  };
  // ── Dopamine Simulation — hooks must be ABOVE early returns ─────────────
  const dopamineSimData = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const todayStr = now.toDateString();

    // If it's past midnight but before 6am, start from 0 to avoid empty charts
    const startHour = currentHour < 6 ? 0 : 6;

    const slots = [];
    for (let h = startHour; h <= currentHour; h++) {
      slots.push({ hour: h, min: 0 });
      if (h < currentHour || currentMin >= 30) slots.push({ hour: h, min: 30 });
    }

    // Guarantee at least 2 points so it forms a line (if it's 00:15 for example)
    if (slots.length === 1) {
      slots.push({ hour: currentHour, min: 30 });
    }

    const moodSlots = {};
    moods.forEach(m => {
      const d = new Date(m.createdAt);
      if (d.toDateString() === todayStr) {
        const k = `${d.getHours()}:${d.getMinutes() < 30 ? 0 : 30}`;
        moodSlots[k] = m.mood;
      }
    });

    const taskSlots = {};
    tasks.filter(t => t.status === 'completed').forEach(t => {
      const d = new Date(t.updatedAt || t.createdAt);
      if (d.toDateString() === todayStr) {
        const k = `${d.getHours()}:${d.getMinutes() < 30 ? 0 : 30}`;
        taskSlots[k] = (taskSlots[k] || 0) + 1;
      }
    });

    let dop = 50;

    // Track previous mood state and time decay
    let lastMood = null;
    let timeSinceLastMood = 4; // Starts 'neutral' (>= 4 slots = 2 hours)

    const pseudo = (h, m2, seed) => Math.abs(Math.sin(h * 137.5 + m2 * 17.3 + seed) * 0.5 + 0.5);

    return slots.map(({ hour, min }) => {
      const key = `${hour}:${min}`;
      const mood = moodSlots[key];
      const done = taskSlots[key] || 0;
      const r = pseudo(hour, min, dop);

      let target;
      let eventLabel = null;
      let eventColor = '#8B5CF6';
      let hasEvent = false;
      let isEffect = false;  // secondary mark for ongoing effects (decay/recovery)

      // 1. Process explicit mood input for this 30-min slot
      if (mood) {
        lastMood = mood;
        timeSinceLastMood = 0;

        if (mood === 'happy') {
          target = 80 + r * 20;                           // Spike to 80–100
          eventLabel = '😊 Happy'; eventColor = '#10B981'; hasEvent = true;
        } else if (mood === 'sad') {
          target = 10 + r * 15;                           // Sharp drop to 10–25
          eventLabel = '😢 Sad'; eventColor = '#60A5FA'; hasEvent = true;
        } else if (mood === 'stressed') {
          target = dop * 0.80 + (r - 0.5) * 10;           // −20% + slight instability
          eventLabel = '😟 Stress'; eventColor = '#FBBF24'; hasEvent = true;
        } else if (mood === 'angry') {
          target = 70 + r * 15;                           // Sudden spike 70–85
          eventLabel = '😡 Angry'; eventColor = '#EF4444'; hasEvent = true;
        } else {
          // Neutral
          target = 45 + r * 10;                           // Settle 45–55
        }
      } else {
        // 2. Process lack of input (decay/recovery)
        timeSinceLastMood += 1;

        // Auto-neutralize after 2 hours (4 * 30 mins)
        if (timeSinceLastMood >= 4) {
          lastMood = null;
        }

        if (lastMood === 'happy') {
          target = dop * (0.75 + r * 0.10);
          eventLabel = '↘️ Fading'; eventColor = '#34D399'; isEffect = true;
        } else if (lastMood === 'sad') {
          target = dop + (50 - dop) * 0.25 + (r - 0.5) * 5;
          eventLabel = '↗️ Recovering'; eventColor = '#93C5FD'; isEffect = true;
        } else if (lastMood === 'stressed') {
          target = dop + (r - 0.5) * 12;
        } else if (lastMood === 'angry') {
          if (timeSinceLastMood === 1) {
            target = 15 + r * 10; // Crash pulls dop down
            eventLabel = '📉 Crash'; eventColor = '#FCA5A5'; isEffect = true;
          } else {
            target = dop + (50 - dop) * 0.15; // Slow recovery after crash
            eventLabel = '↗️ Recovering'; eventColor = '#FCA5A5'; isEffect = true;
          }
        } else {
          // No input / Neutral
          target = 50 + (r - 0.5) * 10; // Stabilizes 45-55
        }
      }

      // 3. Task Completion Bump
      if (done > 0) {
        target += done * (15 + r * 10);                   // +10 to +20 bump per task
        if (!hasEvent) { eventLabel = '✅ Task done'; eventColor = '#8B5CF6'; hasEvent = true; }
        else { eventLabel += ' + Task'; }
      }

      // 4. End of Day Logic
      if (hour >= 18) {
        if (pendingCount >= 4) {
          target -= (pendingCount - 3) * 5;               // Gradual decline (-20%)
        } else if (pendingCount <= 1 && done > 0) {
          target += 5;                                    // Stable/Elevated
        }
      }

      target = Math.max(5, Math.min(100, target));
      dop = Math.round(dop * 0.40 + target * 0.60);

      // xLabel: show hour for :00, blank for :30 so axis stays clean
      const xLabel = min === 0 ? `${hour}` : '';
      const fullTime = `${hour}:${min === 0 ? '00' : '30'}`;
      return { xLabel, fullTime, value: dop, eventLabel, eventColor, hasEvent, isEffect };
    });
  }, [moods, tasks]);

  // Use the live value from the dopamine simulation
  const dopamine = dopamineSimData.length > 0 ? dopamineSimData[dopamineSimData.length - 1].value : 50;

  const dopamineGradPlugin = useMemo(() => ({
    id: 'dopamineGrad',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      grad.addColorStop(0, 'rgba(139,92,246,0.40)');
      grad.addColorStop(0.55, 'rgba(99,102,241,0.15)');
      grad.addColorStop(1, 'rgba(139,92,246,0)');
      chart.data.datasets[0].backgroundColor = grad;
    },
  }), []);


  // ── Stats Calculations ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, rate };
  }, [tasks]);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const moodByDay = useMemo(() => {
    const map = {};
    moods.forEach(m => {
      const d = new Date(m.createdAt);
      if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        map[d.getDate()] = m.mood;
      }
    });
    return map;
  }, [moods, today]);

  // ── Rolling 7-Day Labels ─────────────────────────────────────────────────
  const rollingDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        dateStr: d.toDateString(),
        fullDate: d
      });
    }
    return days;
  }, []);

  // ── Weekly Data Mapping (Rolling 7 Days) ──────────────────────────────────
  const weeklyData = useMemo(() => {
    const labels = rollingDays.map(d => d.label);
    const completedTasksByDay = Array(7).fill(0);
    const totalTasksByDay = Array(7).fill(0);
    const moodCountByDay = Array(7).fill(0);
    const sleepByDay = Array(7).fill(0);

    const startTimestamp = rollingDays[0].fullDate.setHours(0,0,0,0);

    tasks.forEach(t => {
      const d = new Date(t.updatedAt || t.createdAt);
      if (d.getTime() >= startTimestamp) {
        const idx = rollingDays.findIndex(rd => rd.dateStr === d.toDateString());
        if (idx !== -1) {
          totalTasksByDay[idx]++;
          if (t.status === 'completed') completedTasksByDay[idx]++;
        }
      }
    });

    moods.forEach(m => {
      const d = new Date(m.createdAt);
      if (d.getTime() >= startTimestamp) {
        const idx = rollingDays.findIndex(rd => rd.dateStr === d.toDateString());
        if (idx !== -1) moodCountByDay[idx]++;
      }
    });

    sleepData.forEach(s => {
      const d = new Date(s.createdAt);
      if (d.getTime() >= startTimestamp) {
        const idx = rollingDays.findIndex(rd => rd.dateStr === d.toDateString());
        if (idx !== -1) sleepByDay[idx] = parseFloat((s.duration || 0).toFixed(1));
      }
    });

    // Weekly Mood Radar (Rolling 7 Days)
    const weekMoods = moods.filter(m => new Date(m.createdAt).getTime() >= startTimestamp);
    const radarData = ['happy', 'neutral', 'sad', 'stressed', 'angry'].map(type => 
      weekMoods.filter(m => m.mood === type).length
    );

    return { labels, completedTasksByDay, totalTasksByDay, moodCountByDay, sleepByDay, radarData };
  }, [moods, tasks, sleepData, rollingDays]);

  // ── Chart Objects ────────────────────────────────────────────────────────
  const taskBarChartData = useMemo(() => ({
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Total',
        data: weeklyData.totalTasksByDay,
        backgroundColor: '#68c3ff',
        borderRadius: 5,
        barPercentage: 0.75,
        categoryPercentage: 0.65,
      },
      {
        label: 'Completed',
        data: weeklyData.completedTasksByDay,
        backgroundColor: '#3873f1',
        borderRadius: 5,
        barPercentage: 0.75,
        categoryPercentage: 0.65,
      },
    ]
  }), [weeklyData]);

  const moodChartData = useMemo(() => ({
    labels: weeklyData.labels,
    datasets: [{
      label: 'No. of Inputs',
      data: weeklyData.moodCountByDay,
      borderColor: '#5016e0ff',
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      fill: false,
      tension: 0.4,
      pointBackgroundColor: '#5016e0ff',
      pointBorderColor: '#ffffff',
      pointRadius: 6,
      spanGaps: true,
    }],
  }), [weeklyData]);

  const sleepChartData = useMemo(() => ({
    labels: weeklyData.labels,
    datasets: [{ 
      label: 'Hours', 
      data: weeklyData.sleepByDay, 
      backgroundColor: '#18bc85', 
      borderRadius: 8 
    }],
  }), [weeklyData]);

  const radarChartData = useMemo(() => ({
    labels: ['Happy', 'Neutral', 'Sad', 'Stressed', 'Angry'],
    datasets: [{
      label: 'Mood Frequency',
      data: weeklyData.radarData,
      backgroundColor: 'rgba(178,70,210,0.18)',
      borderColor: '#B246D2',
      borderWidth: 2.5,
      pointBackgroundColor: '#F037A5',
      pointRadius: 5,
    }],
  }), [weeklyData]);

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
        bodyColor: '#06c585',
        bodyFont: { size: 13 },
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (ctx) => ctx[0].label,
          label: (ctx) => `Inputs: ${ctx.raw ?? 0}`,
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
      y: {
        grid: { color: '#F3F4F6', borderDash: [4, 4] },
        beginAtZero: true,
        ticks: { precision: 0, color: '#9CA3AF', font: { size: 11 } }
      }
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

  const dopamineChartData = {
    labels: dopamineSimData.map(d => d.xLabel),
    datasets: [{
      label: 'Dopamine',
      data: dopamineSimData.map(d => d.value),
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139,92,246,0.15)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.45,
      pointBackgroundColor: dopamineSimData.map(d => (d.hasEvent || d.isEffect) ? d.eventColor : '#8B5CF6'),
      pointBorderColor: dopamineSimData.map(d => (d.hasEvent || d.isEffect) ? '#fff' : 'transparent'),
      pointBorderWidth: 2,
      pointRadius: dopamineSimData.map(d => d.hasEvent ? 8 : d.isEffect ? 5 : 3),
      pointHoverRadius: 11,
      spanGaps: true,
    }],
  };

  const dopamineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1F1F2E',
        titleColor: '#E9D5FF',
        titleFont: { size: 13, weight: 'bold' },
        bodyColor: '#C4B5FD',
        bodyFont: { size: 12 },
        borderColor: '#7C3AED',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (ctx) => {
            const pt = dopamineSimData[ctx[0].dataIndex];
            return `⏰ ${pt?.fullTime ?? ctx[0].label}`;
          },
          label: (ctx) => {
            const pt = dopamineSimData[ctx.dataIndex];
            const lines = [`Level: ${ctx.raw}`];
            if (pt?.eventLabel) lines.push(pt.eventLabel);
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11 },
          maxRotation: 0,
          // Only show non-empty labels (hours), skip :30 blanks
          callback: (val, idx) => dopamineSimData[idx]?.xLabel ?? '',
        },
      },
      y: {
        grid: { color: '#F3F4F6', borderDash: [4, 4] },
        min: 0, max: 100,
        ticks: {
          stepSize: 25,
          color: '#9CA3AF',
          font: { size: 10 },
          callback: (v) => ({ 0: 'Low', 25: '', 50: 'Mid', 75: '', 100: 'Peak' }[v] ?? v),
        },
      },
    },
  };

  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalDaysInCalendar = firstDay + daysInMonth;
  const calendarCells = Array.from({ length: Math.ceil(totalDaysInCalendar / 7) * 7 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null;
  });

  if (loading) return <div className="loading-spinner" style={{ marginTop: '40px' }}></div>;

  return (
    <div style={{ paddingBottom: '90px' }}>
      <div className="gradient-header" style={{ marginBottom: '20px', paddingBottom: '28px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>Your Dashboard</h1>
        <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Track your progress &amp; insights 📊</p>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px', marginBottom: '20px' }}>
        {[
          { label: 'Completion', value: `${stats.rate}%`, icon: <FiTarget size={14} />, color: '#10B981', bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
          { label: 'Streak', value: `${progress?.streak || 0} 🔥`, icon: '🔥', color: '#F97316', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
          { label: 'Dopamine', value: `${dopamine}%`, icon: <FiZap size={14} />, color: '#8B5CF6', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' },
          { label: 'Tasks', value: `${stats.completed}/${stats.total}`, icon: <FiTrendingUp size={14} />, color: '#3B82F6', bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: '18px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stat.color, fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
              {stat.icon} {stat.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1F2937' }}>{stat.value}</div>
          </div>
        ))}
      </div>


      {/* ── Dopamine Simulation ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '3px' }}>🧠 Dopamine Simulation</h3>
            <p style={{ fontSize: '0.75rem', color: '#292929ff', opacity: 0.8 }}>Today's estimated emotional energy flow</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #016443, #06c585)', borderRadius: '14px', padding: '8px 16px', textAlign: 'center', minWidth: '64px', boxShadow: '0 4px 14px rgba(1, 100, 67, 0.35)' }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem' }}>
              {dopamineSimData.length > 0 ? dopamineSimData[dopamineSimData.length - 1].value : 50}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.65rem', marginTop: '1px' }}>NOW</div>
          </div>
        </div>

        {dopamineSimData.length < 2 ? (
          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#06c585', gap: '8px' }}>
            <span style={{ fontSize: '2rem' }}>🧠</span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Log moods &amp; complete tasks to see your dopamine curve!</p>
          </div>
        ) : (
          <div style={{ height: '200px' }}>
            <Line data={dopamineChartData} options={dopamineOpts} plugins={[dopamineGradPlugin]} />
          </div>
        )}

        {/* Event Legend */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          {[
            { color: '#10B981', label: 'Happy → Spike' },
            { color: '#34D399', label: '↘ Fading' },
            { color: '#60A5FA', label: 'Sad → Drop' },
            { color: '#93C5FD', label: '↗ Recovering' },
            { color: '#FBBF24', label: 'Stressed' },
            { color: '#EF4444', label: 'Angry → Crash' },
            { color: '#8B5CF6', label: 'Task Done' },
          ].map(e => (
            <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: e.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.70rem', color: 'var(--text-tertiary)' }}>{e.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mood Web Radar Chart ── */}
      <div className="card" style={{ margin: '0 16px 20px', padding: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
          🕸️ Mood Radar
        </h3>
        <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
          <Radar
            data={radarChartData}
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

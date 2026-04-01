import { useState, useEffect, useMemo } from 'react';
import { getMoods, getTasks, getSleep, getProgress } from '../services/api';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Filler, Tooltip, Legend,
  RadialLinearScale,
  defaults
} from 'chart.js';
import { FiTarget, FiTrendingUp, FiZap, FiDownload, FiX, FiCalendar } from 'react-icons/fi';
import { BiSmile, BiMoon } from 'react-icons/bi';
import * as XLSX from 'xlsx';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Filler, Tooltip, Legend, RadialLinearScale);
defaults.font.family = "'Outfit', sans-serif";

const MOOD_VALUES = { happy: 5, neutral: 4, sad: 2, stressed: 1, angry: 0 };
const MOOD_COLORS = { happy: '#4ADE80', neutral: '#60A5FA', sad: '#F87171', stressed: '#FBBF24', angry: '#EF4444' };

export default function Dashboard() {
  const [moods, setMoods] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Report Modal State ──
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('month');
  const [reportDate, setReportDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // ── Heatmap Tooltip State ──
  const [heatTooltip, setHeatTooltip] = useState(null);

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

    const pendingCount = tasks.filter(t => t.status !== 'completed').length;

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

  // ── Monthly Heatmap Logic ──
  const monthlyHeatmapData = useMemo(() => {
    const days = [];
    const t = new Date();
    const year = t.getFullYear();
    const month = t.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDay; i++) {
        days.push({ empty: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        days.push({
            empty: false,
            dateObj: d,
            dateNum: i,
            dateStr: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            isoStr: new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0],
            moodCounts: {},
            tasksTotal: 0,
            tasksCompleted: 0,
            sleepH: null,
            sleepQ: '-'
        });
    }

    const map = {};
    days.filter(d => !d.empty).forEach(d => map[d.isoStr] = d);

    moods.forEach(m => {
        const dObj = new Date(m.createdAt);
        const dStr = new Date(dObj.getTime() - (dObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (map[dStr]) {
            const lowM = m.mood.toLowerCase();
            map[dStr].moodCounts[lowM] = (map[dStr].moodCounts[lowM] || 0) + 1;
        }
    });

    tasks.forEach(task => {
        const dObj = new Date(task.updatedAt || task.createdAt);
        const dStr = new Date(dObj.getTime() - (dObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (map[dStr]) {
            map[dStr].tasksTotal++;
            if (task.status === 'completed') map[dStr].tasksCompleted++;
        }
    });

    sleepData.forEach(s => {
        const dObj = new Date(s.createdAt);
        const dStr = new Date(dObj.getTime() - (dObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (map[dStr] && s.sleepTime && s.wakeTime) {
            let st = new Date(s.sleepTime);
            let wt = new Date(s.wakeTime);
            let dur = (wt - st) / (1000 * 60 * 60);
            if (dur < 0) dur += 24;
            map[dStr].sleepH = dur;
            map[dStr].sleepQ = s.quality || 'average';
        }
    });

    days.filter(d => !d.empty).forEach(d => {
        let finalizedMood = '-';
        if (Object.keys(d.moodCounts).length > 0) {
             let highestCount = 0;
             let topMoods = [];
             Object.entries(d.moodCounts).forEach(([m, count]) => {
                  if (count > highestCount) { highestCount = count; topMoods = [m]; } 
                  else if (count === highestCount) topMoods.push(m);
             });
             topMoods.sort((a,b) => (MOOD_VALUES[b] || 0) - (MOOD_VALUES[a] || 0));
             finalizedMood = topMoods[0];
        }
        d.overallMood = finalizedMood;
        
        let act = 0;
        if (d.tasksCompleted >= 3) act = 3;
        else if (d.tasksCompleted >= 1) act = 2;
        else if (d.tasksTotal > 0 || finalizedMood !== '-' || d.sleepH !== null) act = 1;
        else act = 0;
        d.intensity = act;
    });

    return days;
  }, [moods, tasks, sleepData]);

  const getHeatEmoji = (m) => m === 'happy' ? '😊 ' : m === 'sad' ? '😢 ' : m === 'stressed' ? '😰 ' : m === 'angry' ? '😡 ' : m === 'neutral' ? '😌 ' : '';

  // ── Report Logic ──
  const reportRows = useMemo(() => {
    if (!showReportModal) return [];
    
    const isMonth = reportType === 'month';
    const parseLocalTime = () => {
        if (!reportDate) return new Date();
        const parts = reportDate.split('-');
        if (parts.length === 2) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        } else {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
    };
    
    const targetStart = parseLocalTime();
    
    let tStart = new Date(targetStart.getFullYear(), targetStart.getMonth(), isMonth ? 1 : targetStart.getDate());
    let tEnd = new Date(targetStart.getFullYear(), targetStart.getMonth(), isMonth ? new Date(targetStart.getFullYear(), targetStart.getMonth()+1, 0).getDate() : targetStart.getDate(), 23, 59, 59);

    const dailyMap = {};
    
    const addDay = (d) => {
        const ds = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (!dailyMap[ds]) {
            dailyMap[ds] = { date: d, moods: [], tasksTotal: 0, tasksCompleted: 0, sleepH: null, sleepQ: '-' };
        }
        return ds;
    };

    moods.forEach(m => {
        const d = new Date(m.createdAt);
        if (d >= tStart && d <= tEnd) {
            const ds = addDay(d);
            dailyMap[ds].moods.push(m.mood);
        }
    });

    tasks.forEach(t => {
        const d = new Date(t.updatedAt || t.createdAt);
        if (d >= tStart && d <= tEnd) {
            const ds = addDay(d);
            dailyMap[ds].tasksTotal++;
            if (t.status === 'completed') {
                dailyMap[ds].tasksCompleted++;
            }
        }
    });

    sleepData.forEach(s => {
        const d = new Date(s.createdAt);
        if (d >= tStart && d <= tEnd) {
            const ds = addDay(d);
            if (s.sleepTime && s.wakeTime) {
                let st = new Date(s.sleepTime);
                let wt = new Date(s.wakeTime);
                let dur = (wt - st) / (1000 * 60 * 60);
                if (dur < 0) dur += 24;
                dailyMap[ds].sleepH = dur;
                dailyMap[ds].sleepQ = s.quality || 'average';
            }
        }
    });

    const rows = [];
    
    Object.keys(dailyMap).sort((a,b) => b.localeCompare(a)).forEach(ds => {
        const dData = dailyMap[ds];
        const dObj = new Date(Math.max(dData.date.getTime(), new Date(ds).getTime()));
        const dateStr = dObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        const moodCounts = {};
        dData.moods.forEach(m => {
            const lowM = m.toLowerCase();
            moodCounts[lowM] = (moodCounts[lowM] || 0) + 1;
        });
        
        const getEmoji = (m) => m === 'happy' ? '😊' : m === 'sad' ? '😢' : m === 'stressed' ? '😰' : m === 'angry' ? '😡' : '😐';
        const getColor = (m) => m === 'happy' ? '#10B981' : m === 'sad' ? '#60A5FA' : m === 'stressed' ? '#F59E0B' : m === 'angry' ? '#EF4444' : '#6B7280';

        const moodSummaryText = Object.entries(moodCounts).map(([m, c]) => `${getEmoji(m)} ${m.charAt(0).toUpperCase() + m.slice(1)} x${c}`).join(', ');

        const moodSummaryJSX = Object.entries(moodCounts).length === 0 ? <span style={{color: '#9CA3AF'}}>-</span> : Object.entries(moodCounts).map(([m, c], idx) => (
             <span key={m} style={{ color: getColor(m), fontWeight: 600, marginRight: '8px' }}>
                 {getEmoji(m)} {m.charAt(0).toUpperCase() + m.slice(1)} x{c}
                 {idx < Object.entries(moodCounts).length - 1 ? ',' : ''}
             </span>
        ));

        // Overall Day Mood
        let avgMoodStr = '-';
        let avgJSX = <span style={{color: '#9CA3AF'}}>-</span>;
        
        if (Object.keys(moodCounts).length > 0) {
             let highestCount = 0;
             let topMoods = [];
             
             Object.entries(moodCounts).forEach(([m, count]) => {
                  if (count > highestCount) {
                      highestCount = count;
                      topMoods = [m];
                  } else if (count === highestCount) {
                      topMoods.push(m);
                  }
             });
             
             // If there's a tie, pick the one with better value
             topMoods.sort((a,b) => (MOOD_VALUES[b] || 0) - (MOOD_VALUES[a] || 0));
             
             const finalizedMood = topMoods[0];
             const displayMoodName = finalizedMood.charAt(0).toUpperCase() + finalizedMood.slice(1);
             
             avgMoodStr = displayMoodName;
             avgJSX = <span style={{ color: getColor(finalizedMood), fontWeight: 700 }}>{getEmoji(finalizedMood)} {displayMoodName}</span>;
        }

        let taskStr = '-';
        if (dData.tasksTotal > 0) {
            const perc = Math.round((dData.tasksCompleted / dData.tasksTotal) * 100);
            taskStr = `${perc}% (${dData.tasksCompleted}/${dData.tasksTotal})`;
        }
        
        const taskJSX = dData.tasksTotal > 0 
           ? <span><strong style={{color: '#1F2937'}}>{Math.round((dData.tasksCompleted / dData.tasksTotal) * 100)}%</strong> <span style={{color: '#9CA3AF', fontSize: '0.85rem'}}>({dData.tasksCompleted}/{dData.tasksTotal})</span></span>
           : <span style={{color: '#9CA3AF'}}>-</span>;

        let sleepStr = dData.sleepH !== null ? dData.sleepH.toFixed(1) + 'h' : '-';
        let sleepQ = dData.sleepQ !== '-' ? dData.sleepQ : '-';

        rows.push({
            date: dateStr,
            moodSummaryJSX,
            moodSummaryText,
            avgJSX,
            avgMoodStr,
            taskJSX,
            taskStr,
            sleepStr,
            sleepQ
        });
    });

    return rows;
  }, [showReportModal, reportType, reportDate, moods, tasks, sleepData]);

  const downloadExcel = () => {
    if (reportRows.length === 0) return;
    const wsPattern = reportRows.map(r => ({
        'Date': r.date,
        'Mood Summary': r.moodSummaryText,
        'Overall Day Mood': r.avgMoodStr,
        'Tasks Done': r.taskStr,
        'Sleep Hours': r.sleepStr,
        'Quality': r.sleepQ
    }));

    const ws = XLSX.utils.json_to_sheet(wsPattern);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activity Report");
    XLSX.writeFile(wb, `NeuroNexus_Report_${reportDate}.xlsx`);
  };

  if (loading) return <div className="loading-spinner" style={{ marginTop: '40px' }}></div>;

  return (
    <div style={{ paddingBottom: '90px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="vibrant-header">
        <h1>Your Dashboard</h1>
        <p>Track your progress &amp; insights 📊</p>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', padding: '0 16px', marginBottom: '24px' }}>
        {[
          { label: 'Completion', value: `${stats.rate}%`, icon: <FiTarget size={16} />, color: '#10B981' },
          { label: 'Streak', value: `${progress?.streak || 0} 🔥`, icon: '🔥', color: '#F97316' },
          { label: 'Dopamine', value: `${dopamine}%`, icon: <FiZap size={16} />, color: '#8B5CF6' },
          { label: 'Tasks', value: `${stats.completed}/${stats.total}`, icon: <FiTrendingUp size={16} />, color: '#3B82F6' },
        ].map(stat => (
          <div key={stat.label} className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stat.color, fontSize: '0.85rem', fontWeight: 700 }}>
              {stat.icon} {stat.label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Dopamine Simulation (Top Priority) ── */}
      <div className="card" style={{ margin: '0 16px 24px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>🧠 Dopamine Simulation</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Today's estimated emotional energy flow</p>
              </div>
              <div style={{ background: '#06c585', borderRadius: '16px', padding: '10px 20px', textAlign: 'center', minWidth: '70px', boxShadow: '0 8px 24px rgba(6,197,133,0.3)' }}>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>
                      {dopamineSimData.length > 0 ? dopamineSimData[dopamineSimData.length - 1].value : 50}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', marginTop: '2px', fontWeight: 600 }}>NOW</div>
              </div>
          </div>

          {dopamineSimData.length < 2 ? (
              <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#06c585', gap: '10px' }}>
                  <span style={{ fontSize: '2.5rem' }}>🧠</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Log moods &amp; complete tasks to see your dopamine curve!</p>
              </div>
          ) : (
              <div style={{ height: '240px' }}>
                  <Line data={dopamineChartData} options={dopamineOpts} plugins={[dopamineGradPlugin]} />
              </div>
          )}

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              {[
                  { color: '#10B981', label: 'Happy Spike' },
                  { color: '#60A5FA', label: 'Sad Drop' },
                  { color: '#8B5CF6', label: 'Task Done' },
                  { color: '#FBBF24', label: 'Stress' },
                  { color: '#EF4444', label: 'Crash' },
              ].map(e => (
                  <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: e.color, flexShrink: 0, boxShadow: `0 0 8px ${e.color}` }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{e.label}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* ── Charts Grid Rows ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 16px' }}>

        {/* ── Row 1: Mood Trend & Task Completion ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* ── Mood Trend ── */}
        <div className="card" style={{ margin: 0, padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Mood Trends</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Total mood inputs per day</p>
          <div style={{ height: '200px' }}><Line data={moodChartData} options={moodLineOpts} /></div>
        </div>

        {/* ── Task Bar ── */}
        <div className="card" style={{ margin: 0, padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Task Completion</h3>
          <div style={{ height: '210px' }}><Bar data={taskBarChartData} options={taskBarOpts} /></div>
        </div>
        </div>

        {/* ── Row 2: Mood Radar & Sleep Pattern ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* ── Mood Web Radar Chart ── */}
        <div className="card" style={{ margin: 0, padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
            🕸️ Mood Radar
          </h3>
          <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
            <Radar
              data={radarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { r: { beginAtZero: true, ticks: { stepSize: 1, color: 'transparent', backdropColor: 'transparent' }, grid: { color: 'var(--border)' }, pointLabels: { font: { size: 12, weight: '700', family: "'Outfit', sans-serif" }, color: 'var(--text-secondary)' } } },
              }}
            />
          </div>
        </div>

        {/* ── Sleep ── */}
        <div className="card" style={{ margin: 0, padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
            <BiMoon size={20} color="#6D28D9" /> Sleep Pattern
          </h3>
          <div style={{ height: '200px' }}><Bar data={sleepChartData} options={barOpts} /></div>
        </div>

      </div>
      </div>

      {/* ── Extractor / Report Section ── */}
      <div className="card" style={{ margin: '32px 16px 80px', padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'stretch', background: 'var(--bg-card)' }}>
          {/* Calendar Heatmap (Left) */}
          <div style={{ flex: '1 1 350px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', color: '#1F2937' }}>🗓️ Monthly Activity Heatmap</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} logs visually displayed. Hover to preview.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', paddingBottom: '4px' }}>{day}</div>
                  ))}
                  {monthlyHeatmapData.map((d, i) => {
                      if (d.empty) return <div key={`empty-${i}`} />;
                      const colors = { 0: '#F3F4F6', 1: '#A7F3D0', 2: '#34D399', 3: '#10B981' };
                      const textColors = { 0: '#9CA3AF', 1: '#064E3B', 2: '#064E3B', 3: 'white' };
                      return (
                          <div 
                              key={`day-${i}`} 
                              style={{
                                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: colors[d.intensity], color: textColors[d.intensity], 
                                  borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.2s',
                                  fontSize: '0.95rem', fontWeight: 800
                              }}
                              onMouseOver={(e) => { 
                                  e.currentTarget.style.transform = 'scale(1.15)'; 
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHeatTooltip({ x: rect.left + window.scrollX + (rect.width/2), y: rect.top + window.scrollY, data: d });
                              }}
                              onMouseOut={(e) => { 
                                  e.currentTarget.style.transform = 'scale(1)'; 
                                  e.currentTarget.style.boxShadow = 'none';
                                  setHeatTooltip(null);
                              }}
                          >
                              {d.dateNum}
                          </div>
                      );
                  })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', marginTop: '16px', justifyContent: 'center' }}>
                  <span>Low</span>
                  {['#F3F4F6', '#A7F3D0', '#34D399', '#10B981'].map(c => (
                      <div key={c} style={{ width: '12px', height: '12px', background: c, borderRadius: '4px' }} />
                  ))}
                  <span>High Activity</span>
              </div>
          </div>

          {/* Download Button (Right) */}
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px 24px', background: '#F0FDF4', borderRadius: '20px', border: '2px dashed #A7F3D0' }}>
              <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#064E3B' }}>Extract Data</h4>
                  <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#059669', maxWidth: '200px' }}>Download your timeline history into a clean Excel spreadsheet.</p>
              </div>
              <button 
                  onClick={() => setShowReportModal(true)} 
                  style={{ background: '#06c585', color: 'white', border: 'none', borderRadius: '14px', padding: '16px 32px', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(6,197,133,0.3)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} 
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                  📊 Monthly Report
              </button>
          </div>
      </div>

      {/* ── Report Generation Modal ── */}
      {showReportModal && (
        <div style={{
           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
           background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 1000,
           display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
           <div style={{ background: '#F0FDF4', borderRadius: '16px', maxWidth: '850px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
               {/* ── Top Bar ── */}
               <div style={{ background: 'white', padding: '24px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         📊 Activity Report
                      </h2>
                      <FiX size={20} style={{ cursor: 'pointer', color: '#6B7280' }} onClick={() => setShowReportModal(false)} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '24px' }}>
                          <div>
                             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Type</label>
                             <select 
                                 value={reportType} 
                                 onChange={(e) => { 
                                    setReportType(e.target.value); 
                                    setReportDate(e.target.value === 'month' ? new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') : new Date().toISOString().split('T')[0]); 
                                 }}
                                 style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', background: 'white', fontSize: '0.9rem', minWidth: '120px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
                             >
                                 <option value="month">Monthly</option>
                                 <option value="date">Daily</option>
                             </select>
                          </div>
                          <div>
                             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Month</label>
                             <input 
                                 type={reportType} 
                                 value={reportDate}
                                 onChange={e => setReportDate(e.target.value)}
                                 style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white', outline: 'none', fontSize: '0.9rem', color: '#1F2937', minWidth: '160px', fontFamily: "'Outfit', sans-serif" }}
                             />
                          </div>
                      </div>
                      
                      <button 
                          onClick={downloadExcel}
                          disabled={reportRows.length === 0}
                          style={{
                              background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '0.9rem', fontWeight: 700, cursor: reportRows.length === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: reportRows.length === 0 ? 0.6 : 1, fontFamily: "'Outfit', sans-serif"
                          }}
                      >
                          Download Excel Report
                      </button>
                  </div>
               </div>
               
               {/* ── Table Header (White) ── */}
               <div style={{ background: 'white', padding: '0 32px' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                       <thead>
                           <tr>
                              <th style={{ padding: '16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1F2937', width: '15%' }}>Date</th>
                              <th style={{ padding: '16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1F2937', width: '30%' }}>Mood Summary</th>
                              <th style={{ padding: '16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1F2937', width: '20%' }}>Overall Day Mood</th>
                              <th style={{ padding: '16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1F2937', width: '15%' }}>Tasks Done</th>
                              <th style={{ padding: '16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1F2937', width: '10%' }}>Sleep</th>
                              <th style={{ padding: '16px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1F2937', width: '10%' }}>Quality</th>
                           </tr>
                       </thead>
                   </table>
               </div>

               {/* ── Table Body (Light Green) ── */}
               <div style={{ padding: '0 32px 32px 32px', overflowY: 'auto', maxHeight: '50vh' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                       <tbody>
                           {reportRows.length === 0 ? (
                               <tr><td colSpan="6" style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280' }}>No activity logged for this period.</td></tr>
                           ) : (
                               reportRows.map((r, i) => (
                                   <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                       <td style={{ padding: '16px 0', fontSize: '0.9rem', color: '#4B5563', width: '15%' }}>{r.date}</td>
                                       <td style={{ padding: '16px 0', fontSize: '0.9rem', width: '30%' }}>{r.moodSummaryJSX}</td>
                                       <td style={{ padding: '16px 0', fontSize: '0.9rem', width: '20%' }}>{r.avgJSX}</td>
                                       <td style={{ padding: '16px 0', fontSize: '0.9rem', width: '15%' }}>{r.taskJSX}</td>
                                       <td style={{ padding: '16px 0', fontSize: '0.9rem', color: '#4B5563', width: '10%' }}>{r.sleepStr}</td>
                                       <td style={{ padding: '16px 0', fontSize: '0.9rem', color: '#4B5563', width: '10%', textTransform: 'capitalize' }}>{r.sleepQ}</td>
                                   </tr>
                               ))
                           )}
                       </tbody>
                   </table>
               </div>
           </div>
        </div>
      )}

      {/* ── Custom Heatmap Tooltip ── */}
      {heatTooltip && (
          <div style={{
               position: 'fixed',
               top: heatTooltip.y - 120, // offset above cursor
               left: heatTooltip.x - 90, // center above cursor
               width: '180px',
               background: '#1F2937', color: 'white',
               padding: '14px', borderRadius: '12px',
               boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
               zIndex: 9999, pointerEvents: 'none',
               animation: 'fadeIn 0.2s ease-out',
               fontFamily: "'Outfit', sans-serif"
          }}>
               <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '1rem', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #4B5563' }}>
                   {heatTooltip.data.dateStr}
               </strong>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                   <span style={{ color: '#9CA3AF' }}>Mood</span>
                   <span style={{ fontWeight: 700 }}>
                       {heatTooltip.data.overallMood !== '-' ? getHeatEmoji(heatTooltip.data.overallMood) : '-'}
                   </span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                   <span style={{ color: '#9CA3AF' }}>Tasks</span>
                   <span style={{ fontWeight: 700 }}>
                       {heatTooltip.data.tasksCompleted}/{heatTooltip.data.tasksTotal}
                   </span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                   <span style={{ color: '#9CA3AF' }}>Sleep</span>
                   <span style={{ fontWeight: 700 }}>
                       {heatTooltip.data.sleepH !== null ? heatTooltip.data.sleepH.toFixed(1) + 'h' : '-'}
                   </span>
               </div>
               
               {/* Tooltip Chevron */}
               <div style={{ 
                   position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', 
                   borderWidth: '6px 6px 0 6px', borderStyle: 'solid', borderColor: '#1F2937 transparent transparent transparent' 
               }} />
          </div>
      )}

    </div>
  );
}

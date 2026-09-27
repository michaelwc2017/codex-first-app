import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const STORAGE_KEY = 'little-by-little.habits.v1';

// Use the local calendar date, not UTC, so midnight matches your timezone.
function dateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function readHabits() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { habits: [], error: '' };
    const habits = JSON.parse(saved);
    if (!Array.isArray(habits) || !habits.every(h => h && typeof h.id === 'string' && typeof h.name === 'string' && Array.isArray(h.completedDates) && h.completedDates.every(d => typeof d === 'string'))) {
      throw new Error('Invalid saved habits');
    }
    return { habits, error: '' };
  } catch {
    return { habits: [], error: 'Saved habits could not be read. Refresh to try again; adding a habit will start a new list.' };
  }
}

function App() {
  const [initial] = useState(readHabits);
  const [habits, setHabits] = useState(initial.habits);
  const [error, setError] = useState(initial.error);
  const [name, setName] = useState('');
  const [today, setToday] = useState(dateKey);

  // Refresh the day when the app stays open overnight or returns from sleep.
  useEffect(() => {
    const refresh = () => setToday(dateKey());
    const timer = setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  // Save at the same time as each edit. A storage failure keeps the app usable.
  function updateHabits(nextHabits) {
    setHabits(nextHabits);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHabits));
      setError('');
    } catch {
      setError('Your browser could not save this change. Habits will last only until you close or refresh this page.');
    }
  }

  function addHabit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    updateHabits([...habits, { id: crypto.randomUUID(), name: trimmed, completedDates: [] }]);
    setName('');
  }

  function toggleHabit(id) {
    const day = dateKey();
    setToday(day);
    updateHabits(habits.map(habit => habit.id !== id ? habit : {
      ...habit,
      completedDates: habit.completedDates.includes(day)
        ? habit.completedDates.filter(date => date !== day)
        : [...habit.completedDates, day],
    }));
  }

  const completed = habits.filter(habit => habit.completedDates.includes(today)).length;
  const progress = habits.length ? Math.round(completed / habits.length * 100) : 0;
  const dateLabel = new Date(`${today}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <main>
      <header className="brand"><span className="brand-icon" aria-hidden="true">↗</span> little by little <span className="local-badge">LOCAL EDITION</span></header>
      <section className="intro">
        <p className="eyebrow">SMALL STEPS. EVERY DAY.</p>
        <h1>A little today.<br /><span>A better tomorrow.</span></h1>
        <p className="subtitle">Make room for the habits that make you feel good.</p>
      </section>

      <section className="tracker" aria-labelledby="today-heading">
        <div className="today-header"><div><p className="eyebrow">{dateLabel}</p><h2 id="today-heading">Your daily rhythm</h2></div><span className="count"><strong>{completed}</strong> / {habits.length} done</span></div>
        <div className="progress" role="progressbar" aria-label="Today's completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{ width: `${progress}%` }} /></div>
        <p className="progress-caption" aria-live="polite">{habits.length && completed === habits.length ? 'All done. Take a moment to enjoy your progress.' : 'Consistency starts with showing up.'}</p>

        <form onSubmit={addHabit}>
          <label htmlFor="habit-name">What would you like to make a habit?</label>
          <div className="input-row"><input id="habit-name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Read a few pages" maxLength={100} required /><button className="add-button" disabled={!name.trim()} type="submit"><span aria-hidden="true">+</span> Add habit</button></div>
        </form>
        {error && <p className="error" role="alert">{error}</p>}

        {habits.length === 0 ? <div className="empty"><span className="seed" aria-hidden="true">✳</span><h3>Good things start small.</h3><p>Add your first habit above.<br />A glass of water. A short walk. A moment for you.</p></div> : <ul className="habit-list">{habits.map(habit => {
          const done = habit.completedDates.includes(today);
          return <li key={habit.id} className={done ? 'habit done' : 'habit'}><label className="habit-label"><input type="checkbox" checked={done} onChange={() => toggleHabit(habit.id)} /><span className="habit-name">{habit.name}</span></label><button type="button" className="delete-button" aria-label={`Delete ${habit.name}`} onClick={() => updateHabits(habits.filter(item => item.id !== habit.id))}>×</button></li>;
        })}</ul>}
        <div className="card-footer"><span aria-hidden="true">↻</span> A fresh start each day. Your habits stay with you.</div>
      </section>
      <footer><span className="privacy-dot" /> Just you and your progress. Saved in this browser.</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

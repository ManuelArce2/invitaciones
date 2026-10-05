import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

function Landing() {
  const [invitations, setInvitations] = React.useState([]);
  const [form, setForm] = React.useState({ title: '', couple_name: '', event_date: '', venue: '' });
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    fetch(`${API}/invitations`).then(r => r.json()).then(setInvitations).catch(() => {});
  }, []);

  async function createInvitation(e) {
    e.preventDefault();
    setMessage('Creando invitación...');
    const response = await fetch(`${API}/invitations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'No se pudo crear');
    setInvitations(current => [data, ...current]);
    setForm({ title: '', couple_name: '', event_date: '', venue: '' });
    setMessage(`Creada: /i/${data.slug}`);
  }

  return <main>
    <section className="hero">
      <p className="eyebrow">INVITACIONES DIGITALES</p>
      <h1>Una historia que comienza con una invitación.</h1>
      <p className="lead">Base inicial para crear invitaciones digitales elegantes, personalizables y administrables.</p>
      <a className="button" href="#crear">Crear invitación</a>
    </section>

    <section className="preview">
      <div className="card invitation-card">
        <span className="small">SAVE THE DATE</span>
        <h2>María & Juan</h2>
        <p>15 · NOVIEMBRE · 2026</p>
        <div className="divider" />
        <p>Una celebración para compartir un día muy especial.</p>
      </div>
    </section>

    <section id="crear" className="section two-col">
      <div>
        <p className="eyebrow">PRIMER MÓDULO</p>
        <h2>Crear una invitación</h2>
        <p>Esta primera versión ya se conecta con PostgreSQL. Después incorporaremos el constructor visual, fotografías, música, RSVP y plantillas.</p>
      </div>
      <form className="card form" onSubmit={createInvitation}>
        <label>Título<input value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="Boda María y Juan" required /></label>
        <label>Nombres<input value={form.couple_name} onChange={e => setForm({...form, couple_name:e.target.value})} placeholder="María & Juan" /></label>
        <label>Fecha<input type="date" value={form.event_date} onChange={e => setForm({...form, event_date:e.target.value})} /></label>
        <label>Lugar<input value={form.venue} onChange={e => setForm({...form, venue:e.target.value})} placeholder="Hacienda Los Arcos" /></label>
        <button className="button" type="submit">Crear</button>
        {message && <p className="status">{message}</p>}
      </form>
    </section>

    <section className="section">
      <p className="eyebrow">DATOS</p><h2>Invitaciones creadas</h2>
      <div className="list">{invitations.length ? invitations.map(item => <article className="card row" key={item.id}><div><strong>{item.title}</strong><span>{item.couple_name || 'Sin nombres'} · {item.event_date || 'Sin fecha'}</span></div><a href={`/i/${item.slug}`}>Ver</a></article>) : <div className="card empty">Todavía no hay invitaciones.</div>}</div>
    </section>
  </main>;
}

function Invitation({ slug }) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState('');
  React.useEffect(() => { fetch(`${API}/invitations/${slug}`).then(r => r.ok ? r.json() : Promise.reject()).then(setData).catch(() => setError('Invitación no encontrada')); }, [slug]);
  if (error) return <main className="center"><h1>{error}</h1></main>;
  if (!data) return <main className="center"><p>Cargando invitación...</p></main>;
  return <main className="public-invitation">
    <section className="public-hero"><p className="eyebrow">{data.type.toUpperCase()}</p><h1>{data.couple_name || data.title}</h1><p>{data.event_date || 'Próximamente'}{data.venue ? ` · ${data.venue}` : ''}</p></section>
    <section className="section narrow"><div className="card message"><h2>{data.title}</h2><p>{data.message || 'Tenemos el honor de compartir contigo este momento especial.'}</p><div className="divider"/><p>{data.address || 'La ubicación se agregará próximamente.'}</p></div></section>
  </main>;
}

function App() {
  const match = location.pathname.match(/^\/i\/([^/]+)$/);
  return match ? <Invitation slug={match[1]} /> : <Landing />;
}

createRoot(document.getElementById('root')).render(<App />);

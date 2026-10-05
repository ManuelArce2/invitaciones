import express from 'express';
import cors from 'cors';
import pg from 'pg';
import slugify from 'slugify';
import fs from 'node:fs';
import path from 'node:path';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3000);
const storagePath = process.env.STORAGE_PATH || path.resolve('storage');
fs.mkdirSync(storagePath, { recursive: true });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '2mb' }));
app.use('/storage', express.static(storagePath));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'invitaciones-api' });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

app.get('/api/invitations', async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM invitations ORDER BY created_at DESC`);
  res.json(rows);
});

app.get('/api/invitations/:slug', async (req, res) => {
  const result = await pool.query(`SELECT * FROM invitations WHERE slug = $1`, [req.params.slug]);
  if (!result.rowCount) return res.status(404).json({ error: 'Invitación no encontrada' });
  const invitation = result.rows[0];
  const [sections, photos] = await Promise.all([
    pool.query(`SELECT * FROM invitation_sections WHERE invitation_id = $1 ORDER BY sort_order`, [invitation.id]),
    pool.query(`SELECT * FROM photos WHERE invitation_id = $1 ORDER BY sort_order`, [invitation.id])
  ]);
  res.json({ ...invitation, sections: sections.rows, photos: photos.rows });
});

app.post('/api/invitations', async (req, res) => {
  const { title, couple_name, type = 'boda', event_date, event_time, venue, address, message, template = 'elegante' } = req.body;
  if (!title) return res.status(400).json({ error: 'title es obligatorio' });
  const base = slugify(title, { lower: true, strict: true }) || `invitacion-${Date.now()}`;
  let slug = base;
  let suffix = 1;
  while ((await pool.query('SELECT 1 FROM invitations WHERE slug=$1', [slug])).rowCount) slug = `${base}-${suffix++}`;
  const { rows } = await pool.query(`
    INSERT INTO invitations (slug, type, title, couple_name, event_date, event_time, venue, address, message, template)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [slug, type, title, couple_name || null, event_date || null, event_time || null, venue || null, address || null, message || null, template]
  );
  res.status(201).json(rows[0]);
});

app.patch('/api/invitations/:id', async (req, res) => {
  const fields = ['title','couple_name','type','event_date','event_time','venue','address','message','template','status'];
  const updates = fields.filter((field) => Object.hasOwn(req.body, field));
  if (!updates.length) return res.status(400).json({ error: 'No hay campos para actualizar' });
  const values = updates.map((field) => req.body[field]);
  const set = updates.map((field, i) => `${field}=$${i + 1}`).join(', ');
  values.push(req.params.id);
  const { rows } = await pool.query(`UPDATE invitations SET ${set}, updated_at=NOW() WHERE id=$${values.length} RETURNING *`, values);
  if (!rows.length) return res.status(404).json({ error: 'Invitación no encontrada' });
  res.json(rows[0]);
});

app.post('/api/invitations/:id/guests', async (req, res) => {
  const { name, phone, attendance = 'pending', guest_count = 1, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name es obligatorio' });
  const { rows } = await pool.query(`INSERT INTO guests (invitation_id,name,phone,attendance,guest_count,notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [req.params.id,name,phone||null,attendance,guest_count,notes||null]);
  res.status(201).json(rows[0]);
});

app.get('/api/invitations/:id/guests', async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM guests WHERE invitation_id=$1 ORDER BY created_at DESC`, [req.params.id]);
  res.json(rows);
});

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.listen(port, () => console.log(`API escuchando en http://0.0.0.0:${port}`));

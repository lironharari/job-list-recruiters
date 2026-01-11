import React, { useEffect, useState } from 'react';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/api';
import type { Template } from '../types';

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data || []);
    } catch (e) {
      // ignore for now
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm({ name: '', subject: '', body: '' }); };
  const startEdit = (tpl: Template) => { setEditing(tpl); setForm({ name: tpl.name, subject: tpl.subject, body: tpl.body }); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateTemplate(editing._id as string, form);
      } else {
        await createTemplate(form);
      }
      await load();
      setEditing(null);
      setForm({ name: '', subject: '', body: '' });
    } catch (err) {
      // ignore
    }
  };

  const doDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this template?')) return;
    await deleteTemplate(id);
    await load();
  };

  return (
    <div className="container">
      <h2>Email Templates</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={startCreate}>New Template</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <div>
          {templates.length === 0 ? <div>No templates yet</div> : (
            <ul className="template-list">
              {templates.map(t => (
                <li key={t._id} className="template-item">
                  <strong>{t.name}</strong>
                  <div className="template-actions">
                    <button onClick={() => startEdit(t)}>Edit</button>
                    <button onClick={() => doDelete(t._id)}>Delete</button>
                  </div>
                  <div className="template-subject">{t.subject}</div>
                  <div className="template-body" dangerouslySetInnerHTML={{ __html: t.body }} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>{editing ? 'Edit' : 'Create'} Template</h3>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div className="form-row">
            <label>Subject</label>
            <input value={form.subject} onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))} required />
          </div>
          <div className="form-row">
            <label>Body (HTML allowed, use name and jobTitle placeholders)</label>
            <textarea value={form.body} onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))} rows={8} required />
          </div>
          <div className="form-actions">
            <button type="submit">Save Template</button>
          </div>
        </form>
      </div>
    </div>
  );
}

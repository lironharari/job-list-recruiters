
import React, { useEffect, useState } from 'react';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/api';
import type { Template } from '../types';

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [modalLoading, setModalLoading] = useState(false);

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

  const startCreate = () => {
    setForm({ name: '', subject: '', body: '' });
    setShowCreateModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await createTemplate(form);
      await load();
      setShowCreateModal(false);
      setForm({ name: '', subject: '', body: '' });
    } catch (err) {
      // ignore
    } finally {
      setModalLoading(false);
    }
  };

  const doDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this template?')) return;
    await deleteTemplate(id);
    await load();
    if (selected && selected._id === id) setSelected(null);
    setShowDetailsModal(false);
  };

  return (
    <>      
      <div className="container">
        <h2>Email Templates</h2>
        <div style={{ marginBottom: 12 }}>
          <button onClick={startCreate}>New Template</button>
        </div>
        {loading ? <div>Loading...</div> : (
          <div style={{ minWidth: 220 }}>
            <h4>Available Templates</h4>
            {templates.length === 0 ? <div>No templates yet</div> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {templates.map(t => (
                  <li key={t._id} style={{ marginBottom: 8 }}>
                    <a
                      href="#"
                      className={`template-link${selected && selected._id === t._id && showDetailsModal ? ' active' : ''}`}
                      onClick={e => {
                        e.preventDefault();
                        setSelected(t);
                        setForm({ name: t.name, subject: t.subject, body: t.body });
                        setShowDetailsModal(true);
                      }}
                    >
                      {t.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Modal for creating a new template */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div
                className="modal-close"
                role="button"
                tabIndex={0}
                aria-label="Close"
                onClick={() => setShowCreateModal(false)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowCreateModal(false); } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>                                
              </div>
              <h3 style={{ marginTop: 0 }}>Create Template</h3>
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
                  <button type="submit" disabled={modalLoading}>{modalLoading ? 'Saving…' : 'Save Template'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for template details */}
        {showDetailsModal && selected && (
          <div className="modal-overlay">
            <div className="modal">
              <div
                className="modal-close"
                role="button"
                tabIndex={0}
                aria-label="Close"
                onClick={() => setShowDetailsModal(false)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDetailsModal(false); } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>                
              </div>
              <h3 style={{ marginTop: 0 }}>Edit Template</h3>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setModalLoading(true);
                  try {
                    await updateTemplate(selected._id as string, form);
                    await load();
                    setShowDetailsModal(false);
                  } catch (err) {
                    // ignore
                  } finally {
                    setModalLoading(false);
                  }
                }}
              >
                <div className="form-row">
                  <label>Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Subject</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Body (HTML allowed, use name and jobTitle placeholders)</label>
                  <textarea
                    value={form.body}
                    onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                    rows={8}
                    required
                  />
                </div>
                <div className="form-actions" style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={modalLoading}>{modalLoading ? 'Saving…' : 'Save Template'}</button>
                  <button type="button" onClick={() => doDelete(selected._id)} style={{ background: '#e53e3e', color: '#fff' }}>Delete</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

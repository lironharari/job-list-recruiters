
import React, { useEffect, useState } from 'react';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/api';
import type { Template } from '../types';
import { CreateTemplateModal, EditTemplateModal } from '../components/Modals';

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

        <CreateTemplateModal
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          form={form}
          setForm={setForm}
          modalLoading={modalLoading}
          submit={submit}
        />
        <EditTemplateModal
          showDetailsModal={showDetailsModal}
          setShowDetailsModal={setShowDetailsModal}
          selected={selected}
          form={form}
          setForm={setForm}
          modalLoading={modalLoading}
          updateTemplate={updateTemplate}
          load={load}
          setModalLoading={setModalLoading}
          doDelete={doDelete}
        />
      </div>
    </>
  );
}

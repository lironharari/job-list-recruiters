
import React, { useEffect, useState } from 'react';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/api';
import type { Template } from '../types';
import { CreateTemplateModal, EditTemplateModal } from '../components/Modals';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';

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
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Email Templates
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* ...existing code... */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80px">
            <CircularProgress />
          </Box>
        ) : (
          <Box minWidth={220}>
            <Typography variant="h6" gutterBottom>
              Available Templates
            </Typography>
            {templates.length === 0 ? (
              <Typography color="text.secondary">No templates yet</Typography>
            ) : (
              <List disablePadding>
                {templates.map(t => (
                  <ListItem key={t._id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={Boolean(selected && selected._id === t._id && showDetailsModal)}
                      onClick={e => {
                        setSelected(t);
                        setForm({ name: t.name, subject: t.subject, body: t.body });
                        setShowDetailsModal(true);
                      }}
                    >
                      <Typography variant="body1">{t.name}</Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button variant="contained" onClick={startCreate}>
            Add Template
          </Button>
        </Box>
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
      </Paper>
    </Container>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import JobListPage from './pages/JobListPage';
import CreateJobPage from './pages/CreateJobPage';
import EditJobPage from './pages/EditJobPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<JobListPage />} />
          <Route path="create" element={<CreateJobPage />} />
          <Route path="edit/:id" element={<EditJobPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

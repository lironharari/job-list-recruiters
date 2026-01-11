import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

type Props = {
  jobId: string;
  isOpen: boolean;
  onToggle: () => void;
  editPath: string;
  canDelete?: boolean;
  onDelete?: () => void;
};

export default function ActionMenu({ jobId, isOpen, onToggle, editPath, canDelete = false, onDelete }: Props) {
  const auth = useContext(AuthContext);

  const canViewApplications = auth.role === 'recruiter' || auth.role === 'admin';

  return (
    <>
      <button
        className="action-menu-button"
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : 'false'}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        title="Actions"
      >
        ☰
      </button>
      {isOpen && (
        <div className="action-menu" role="menu">
          {canViewApplications && (
            <Link to={`/jobs/${jobId}/applications`} className="action-menu-item" role="menuitem" onClick={(e) => { e.stopPropagation(); onToggle(); }}>Applications</Link>
          )}
          <Link to={editPath} className="action-menu-item" role="menuitem" onClick={(e) => { e.stopPropagation(); onToggle(); }}>Edit Job</Link>          
          {canDelete && (
            <button
              className="action-menu-item"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); onToggle(); if (onDelete) onDelete(); }}
            >
              Delete Job
            </button>
          )}
        </div>
      )}
    </>
  );
}

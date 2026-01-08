import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  jobId: string;
  isOpen: boolean;
  onToggle: () => void;
  editPath: string;
  canDelete?: boolean;
  onDelete?: () => void;
};

export default function ActionMenu({ jobId, isOpen, onToggle, editPath, canDelete = false, onDelete }: Props) {
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
          <Link to={editPath} className="action-menu-item" role="menuitem" onClick={(e) => { e.stopPropagation(); onToggle(); }}>Edit</Link>
          {canDelete && (
            <button
              className="action-menu-item"
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); onToggle(); if (onDelete) onDelete(); }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </>
  );
}

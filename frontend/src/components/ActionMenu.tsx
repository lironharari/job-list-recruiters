import { Link } from 'react-router-dom';
import { useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Props = {
  jobId: string;
  isOpen: boolean;
  onToggle: () => void;
  editPath: string;
  canDelete?: boolean;
  onDelete?: () => void;
};

export default function ActionMenu({
  jobId,
  isOpen,
  onToggle,
  editPath,
  canDelete = false,
  onDelete,
}: Props) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <IconButton
        ref={anchorRef}
        aria-label="actions"
        aria-controls={isOpen ? `action-menu-${jobId}` : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`action-menu-${jobId}`}
        anchorEl={anchorRef.current}
        open={isOpen}
        onClose={onToggle}
        onClick={onToggle}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ '& .MuiPaper-root': { minWidth: 180 } }}
      >
        <MenuItem component={Link} to={editPath}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Job</ListItemText>
        </MenuItem>
        {canDelete && <Divider />}
        {canDelete && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Job</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

type Props = {
  page: number;
  onPageChange: (n: number) => void;
  pageCount: number;
  startIndex: number;
  endIndex: number;
  totalCount: number;
};

export default function Pagination({ page, onPageChange, pageCount, startIndex, endIndex, totalCount }: Props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {totalCount === 0 ? 'No jobs' : `Showing ${startIndex}-${endIndex} of ${totalCount}`}
      </Typography>
      <nav aria-label="Pagination">
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Prev
          </Button>
          {(() => {
            const buttons: Array<React.ReactNode> = [];
            const maxVisible = 7;
            if (pageCount <= maxVisible) {
              for (let i = 1; i <= pageCount; i++) buttons.push(i);
            } else {
              const pages = new Set<number>();
              pages.add(1);
              pages.add(pageCount);
              const start = Math.max(2, page - 2);
              const end = Math.min(pageCount - 1, page + 2);
              for (let i = start; i <= end; i++) pages.add(i);
              const sorted = Array.from(pages).sort((a,b)=>a-b);
              let last = 0;
              for (const pnum of sorted) {
                if (last && pnum - last > 1) buttons.push('gap-' + last + '-' + pnum);
                buttons.push(pnum);
                last = pnum;
              }
            }
            return buttons.map((b) => {
              if (typeof b === 'string' && b.startsWith('gap-')) {
                return <Typography key={b} variant="body2" sx={{ mx: 0.5 }}>…</Typography>;
              }
              const pnum = b as number;
              return (
                <Button
                  key={pnum}
                  onClick={() => onPageChange(pnum)}
                  aria-current={pnum === page ? 'page' : undefined}
                  variant={pnum === page ? 'contained' : 'outlined'}
                  color={pnum === page ? 'primary' : 'inherit'}
                  size="small"
                  sx={{ minWidth: 36 }}
                >
                  {pnum}
                </Button>
              );
            });
          })()}
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
            aria-label="Next page"
          >
            Next
          </Button>
        </Stack>
      </nav>
    </Box>
  );
}

import React from 'react';

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
    <div className="pagination-row">
      <div className="pager-info">
        {totalCount === 0 ? 'No jobs' : `Showing ${startIndex}-${endIndex} of ${totalCount}`}
      </div>
      <nav aria-label="Pagination">
        <div className="pagination-controls">
          <button className="pager-button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page">Prev</button>

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
                return <span key={b} className="pager-gap">…</span>;
              }
              const pnum = b as number;
              return (
                <button
                  key={pnum}
                  onClick={() => onPageChange(pnum)}
                  aria-current={pnum === page ? 'page' : undefined}
                  className="pager-button"
                >
                  {pnum}
                </button>
              );
            });
          })()}

          <button className="pager-button" onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page === pageCount} aria-label="Next page">Next</button>
        </div>
      </nav>
    </div>
  );
}

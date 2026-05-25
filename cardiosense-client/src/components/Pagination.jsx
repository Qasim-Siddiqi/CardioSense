export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const btnBase = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #1e293b',
    background: '#111827',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.15s',
  };

  const activeBtn = {
    ...btnBase,
    background: '#06b6d4',
    color: '#0b1120',
    fontWeight: '600',
    border: '1px solid #06b6d4',
  };

  const disabledBtn = {
    ...btnBase,
    opacity: 0.35,
    cursor: 'not-allowed',
  };

  // Show a window of pages around current: always show first, last, and ±2 around current
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(i);
      }
    }

    // Insert ellipsis markers
    const withEllipsis = [];
    let prev = null;
    for (const p of pages) {
      if (prev !== null && p - prev > 1) withEllipsis.push('...');
      withEllipsis.push(p);
      prev = p;
    }
    return withEllipsis;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        justifyContent: 'center',
        marginTop: '28px',
        flexWrap: 'wrap',
      }}
    >
      <button
        style={currentPage === 1 ? disabledBtn : btnBase}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </button>

      {getPageNumbers().map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} style={{ color: '#475569', padding: '0 4px' }}>
            …
          </span>
        ) : (
          <button
            key={item}
            style={item === currentPage ? activeBtn : btnBase}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        )
      )}

      <button
        style={currentPage === totalPages ? disabledBtn : btnBase}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
}
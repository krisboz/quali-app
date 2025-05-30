// Pagination.jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
  
      <span>Page {currentPage} of {totalPages}</span>
  
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
  
export default Pagination;
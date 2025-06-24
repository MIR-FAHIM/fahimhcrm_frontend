import React, { useState } from 'react';

const ReasonModal = ({ title, onSubmit, onClose }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim() === '') {
      alert('Please enter a reason');
      return;
    }
    onSubmit(reason);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{title}</h2>
        <textarea
          placeholder="Enter your reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={styles.textarea}
        />
        <button onClick={handleSubmit} style={styles.button}>
          Submit
        </button>
      </div>
    </div>
  );
};

// Inline styles for simplicity
const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '10px',
    marginTop: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default ReasonModal;

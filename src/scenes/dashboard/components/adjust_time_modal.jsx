import React, { useState } from 'react';

const AdjustTimeModal = ({ userId, onSubmit, onClose , attendanceID, type}) => {
  const [requestedTime, setRequestedTime] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!requestedTime || note.trim() === '') {
      alert('Please fill in all fields');
      return;
    }

    onSubmit({ requested_time: requestedTime, note: note, user_id: userId, attendance_id: attendanceID, type: type});
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
         <button onClick={onClose} style={styles.closeButton}>×</button>
        <h2>Request for check in time adjustment</h2>

        <label style={styles.label}>Requested Time</label>
        <input
          type="datetime-local"
          value={requestedTime}
          onChange={(e) => setRequestedTime(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Note</label>
        <textarea
          placeholder="Enter your note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={handleSubmit} style={styles.button}>
          Submit
        </button>
     
      </div>
    </div>
  );
};

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
    textAlign: 'left'
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'block',
    marginBottom: '5px',
    marginTop: '10px'
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '10px'
  },
  textarea: {
    width: '100%',
    height: '80px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '15px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%'
  }
};

export default AdjustTimeModal;

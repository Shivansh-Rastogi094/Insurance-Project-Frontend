import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-badge">
          <i className="ph ph-warning-circle"></i> Page Not Found
        </div>

        <div className="notfound-code">404</div>

        <h1 className="notfound-title">Oops! Page Lost in Space</h1>

        <p className="notfound-desc">
          We couldn't find the page you're looking for. It might have been removed, renamed, or is temporarily unavailable.
        </p>

        <div className="notfound-actions">
          <button
            className="btn-notfound-secondary"
            onClick={handleRetry}
            disabled={retrying}
          >
            <i className={`ph ph-arrows-counter-clockwise ${retrying ? 'ph-spin' : ''}`}></i>
            {retrying ? 'Retrying...' : 'Retry Page'}
          </button>

          <button
            className="btn-notfound-primary"
            onClick={() => navigate('/')}
          >
            <i className="ph ph-house"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

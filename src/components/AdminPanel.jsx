import { useState, useEffect } from 'react';

function AdminPanel() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/urls');
      
      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }
      
      const data = await response.json();
      setUrls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dateOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate}\n${formattedTime}`;
  };

  const totalVisits = urls.reduce((sum, url) => sum + url.visits, 0);

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="card">
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchUrls} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="card">
        <h2 className="card-title">Admin Panel</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-number">{urls.length}</span>
            <span className="stat-label">Total URLs</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalVisits}</span>
            <span className="stat-label">Total Visits</span>
          </div>
        </div>

        {urls.length === 0 ? (
          <div className="empty-state">
            <p>No URLs have been shortened yet.</p>
          </div>
        ) : (
          <div className="urls-table">
            <div className="table-header">
              <div className="header-cell">Short Code</div>
              <div className="header-cell">Original URL</div>
              <div className="header-cell">Visits</div>
              <div className="header-cell">Created</div>
            </div>
            {urls.map((url) => (
              <div key={url._id} className="table-row">
                <div className="table-cell">
                  <a
                    href={`/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="short-link"
                  >
                    {url.shortCode}
                  </a>
                </div>
                <div className="table-cell">
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="original-link"
                    title={url.originalUrl}
                  >
                    {url.originalUrl.length > 50
                      ? url.originalUrl.substring(0, 50) + '...'
                      : url.originalUrl}
                  </a>
                </div>
                <div className="table-cell">
                  <span className="visit-count">{url.visits}</span>
                </div>
                <div className="table-cell">
                  <span className="date">{formatDate(url.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={fetchUrls} className="refresh-button">
          Refresh Data
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
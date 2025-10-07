import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Edit, 
  Trash2, 
  Star, 
  Eye,
  Heart,
  DollarSign,
  Upload
} from 'lucide-react';
import videoService from '../../services/videoService';
import { useAuth } from '../../context/AuthContext';
import VideoUploadModal from '../../Modal/VideoUpload';
import VideoEditModal from './VideoEditModal';
import Spinner from '../common/Spinner';
import './videomanagement.css';

const VideoManagement = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [viewMode] = useState('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [limit] = useState(12);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    isPremium: '',
    featured: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    includeInactive: false
  });
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  
  const categories = ['all', 'hand speed', 'general lacrosse', 'shooting', 'defense', 'goalie', 'conditioning'];

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching videos...');

      const response = await videoService.getAllVideos({
        page: currentPage,
        limit,
        ...filters
      });

      console.log('📦 Response received:', response);

      if (response.success) {
        console.log('✅ Setting videos:', response.data.length);
        setVideos(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalVideos(response.pagination.totalVideos);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Fetch videos error:', error);
      setError(error.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [currentPage, filters]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setShowEditModal(true);
  };

  const handleDeleteVideo = async (videoId, hardDelete = true) => {
    const video = videos.find(v => v._id === videoId);
    const action = hardDelete ? 'permanently delete' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this video? ${hardDelete ? 'This cannot be undone!' : ''}`)) {
      return;
    }
    
    try {
      console.log('🗑️ Deleting video:', videoId, 'hardDelete:', hardDelete);
      
      await videoService.deleteVideo(videoId, hardDelete);
      
      console.log('✅ Delete successful, refreshing...');
      
      // Remove from local state immediately
      setVideos(prevVideos => prevVideos.filter(v => v._id !== videoId));
      setTotalVideos(prev => prev - 1);
      
      // Refresh to be sure
      setTimeout(() => {
        fetchVideos();
      }, 100);
      
      console.log('✅ Video deleted permanently!');
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete video: ' + error.message);
    }
  };

  const handleToggleFeatured = async (videoId) => {
    try {
      const response = await videoService.toggleFeatured(videoId);
      if (response.success) {
        fetchVideos();
      }
    } catch (error) {
      alert('Failed to toggle featured status: ' + error.message);
    }
  };

  const handleBulkDelete = async (hardDelete = false) => {
    if (selectedVideos.length === 0) {
      alert('Please select videos to delete');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'deactivate'} ${selectedVideos.length} video(s)?`)) {
      return;
    }
    
    try {
      const response = await videoService.bulkDelete(selectedVideos, hardDelete);
      if (response.success) {
        setSelectedVideos([]);
        fetchVideos();
        alert(`Successfully ${hardDelete ? 'deleted' : 'deactivated'} ${response.data.successfullyDeleted} video(s)`);
      }
    } catch (error) {
      alert('Bulk delete failed: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading && videos.length === 0) {
    return <Spinner fullScreen />;
  }

  return (
    <div className="video-management">
      {/* Header */}
      <div className="video-header">
        <div className="video-header-content">
          <div className="video-header-info">
            <h1>Video Management</h1>
            <p>Manage and organize your training videos</p>
          </div>
          <div className="video-header-actions">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              <Plus size={16} />
              Upload Video
            </button>
          </div>
        </div>
      </div>

      <div className="video-container">
        {/* Filters and Search */}
        <div className="video-filters">
          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group search-group">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Premium Filter */}
            <div className="filter-group">
              <select
                value={filters.isPremium}
                onChange={(e) => handleFilterChange('isPremium', e.target.value)}
                className="filter-select"
              >
                <option value="">All Videos</option>
                <option value="true">Premium Only</option>
                <option value="false">Free Only</option>
              </select>
            </div>
          </div>

          <div className="filters-bottom">
            <div className="filter-checkboxes">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="featured"
                  checked={filters.featured === 'true'}
                  onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
                  className="custom-checkbox"
                />
                <label htmlFor="featured" className="checkbox-label">Featured only</label>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="inactive"
                  checked={filters.includeInactive}
                  onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
                  className="custom-checkbox"
                />
                <label htmlFor="inactive" className="checkbox-label">Include inactive</label>
              </div>
            </div>

            {selectedVideos.length > 0 && (
              <div className="bulk-actions">
                <span className="selected-count">
                  {selectedVideos.length} selected
                </span>
                <button
                  onClick={() => handleBulkDelete(false)}
                  className="btn-bulk deactivate"
                >
                  Deactivate
                </button>
                {user?.role === 'super_admin' && (
                  <button
                    onClick={() => handleBulkDelete(true)}
                    className="btn-bulk delete"
                  >
                    Delete Permanently
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Videos Grid/List */}
        {error && (
          <div className="error-state">
            <div className="error-content">
              <p>{error}</p>
            </div>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="empty-state">
            <Upload className="empty-icon" />
            <h3 className="empty-title">No videos found</h3>
            <p className="empty-description">
              Get started by uploading your first video.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              <Plus size={16} />
              Upload Video
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  viewMode={viewMode}
                  selected={selectedVideos.includes(video._id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedVideos([...selectedVideos, video._id]);
                    } else {
                      setSelectedVideos(selectedVideos.filter(id => id !== video._id));
                    }
                  }}
                  onEdit={handleEditVideo}
                  onDelete={handleDeleteVideo}
                  onToggleFeatured={handleToggleFeatured}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                  userRole={user?.role}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing page {currentPage} of {totalPages} ({totalVideos} total videos)
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <VideoUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchVideos();
          }}
        />
      )}

      {showEditModal && editingVideo && (
        <VideoEditModal
          video={editingVideo}
          onClose={() => {
            setShowEditModal(false);
            setEditingVideo(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingVideo(null);
            fetchVideos();
          }}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner"></div>
            <span className="loading-text">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Video Card Component
const VideoCard = ({ 
  video, 
  viewMode = 'grid',
  selected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onToggleFeatured, 
  formatDate, 
  formatDuration,
  userRole 
}) => {
  const [showActions, setShowActions] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="video-list-item">
        <div className="list-thumbnail">
          <img src={video.thumbnailUrl} alt={video.title} />
          <div className="video-overlay">
            <Play className="play-icon" size={24} />
          </div>
          <div className="video-duration">{formatDuration(video.duration)}</div>
        </div>
        
        <div className="list-content">
          <h3 className="list-title">{video.title}</h3>
          <p className="list-description">{video.description}</p>
          <div className="list-meta">
            <span className="video-category">{video.category}</span>
            <span>{formatDate(video.createdAt)}</span>
            <div className="stat-item">
              <Eye size={12} />
              {video.viewCount || 0}
            </div>
            <div className="stat-item">
              <Heart size={12} />
              {video.likes || 0}
            </div>
          </div>
        </div>

        <div className="list-actions">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="video-checkbox"
          />
          <div className="video-actions">
            <button
              onClick={() => setShowActions(!showActions)}
              className="actions-btn"
            >
              <MoreVertical size={16} />
            </button>
            
            {showActions && (
              <div className="actions-menu">
                <button onClick={() => { onEdit(video); setShowActions(false); }}>
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => { onToggleFeatured(video._id); setShowActions(false); }}>
                  <Star size={16} />
                  {video.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button 
                  onClick={() => { onDelete(video._id, true); setShowActions(false); }}
                  className="danger"
                >
                  <Trash2 size={16} />
                  Delete Permanently
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-card">
      <div className="video-thumbnail">
        <img src={video.thumbnailUrl} alt={video.title} />
        
        <div className="video-overlay">
          <Play className="play-icon" size={48} />
        </div>
        
        <div className="video-duration">{formatDuration(video.duration)}</div>
        
        <div className="video-badges">
          {video.featured && (
            <div className="video-badge featured">Featured</div>
          )}
          {video.isPremium && (
            <div className="video-badge premium">Premium</div>
          )}
          {!video.isActive && (
            <div className="video-badge inactive">Inactive</div>
          )}
        </div>
        
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="video-checkbox"
        />
      </div>

      <div className="video-content">
        <div className="video-header-row">
          <h3 className="video-title">{video.title}</h3>
          <div className="video-actions">
            <button
              onClick={() => setShowActions(!showActions)}
              className="actions-btn"
            >
              <MoreVertical size={16} />
            </button>
            
            {showActions && (
              <div className="actions-menu">
                <button onClick={() => { onEdit(video); setShowActions(false); }}>
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => { onToggleFeatured(video._id); setShowActions(false); }}>
                  <Star size={16} />
                  {video.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button 
                  onClick={() => { onDelete(video._id, true); setShowActions(false); }}
                  className="danger"
                >
                  <Trash2 size={16} />
                  Delete Permanently
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="video-description">{video.description}</p>

        <div className="video-meta">
          <span className="video-category">{video.category}</span>
          <span>{formatDate(video.createdAt)}</span>
        </div>

        <div className="video-stats">
          <div className="stats-left">
            <div className="stat-item">
              <Eye size={14} />
              {video.viewCount || 0}
            </div>
            <div className="stat-item">
              <Heart size={14} />
              {video.likes || 0}
            </div>
            {video.isPremium && (
              <div className="stat-item video-price">
                <DollarSign size={14} />
                ${video.price}
              </div>
            )}
          </div>
          
          <div className="video-status">
            {!video.isActive && (
              <span className="status-inactive">Inactive</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoManagement;
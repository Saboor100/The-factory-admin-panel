import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Play, 
  Pause, 
  Image as ImageIcon,
  Clock,
  Tag,
  DollarSign,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import videoService from '../../services/videoService';
import './videoeditmodal.css';

const VideoEditModal = ({ video, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hand speed',
    tags: [],
    isPremium: false,
    price: 0,
    featured: false,
    isActive: true,
    thumbnailUrl: ''
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState(false);


  const categories = [
    'hand speed', 'general lacrosse', 'shooting', 'defense', 'goalie', 'conditioning'
  ];

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        category: video.category || 'hand speed',
        tags: video.tags || [],
        isPremium: video.isPremium || false,
        price: video.price || 0,
        featured: video.featured || false,
        isActive: video.isActive !== undefined ? video.isActive : true,
        thumbnailUrl: video.thumbnailUrl || ''
      });
      setThumbnailPreview(video.thumbnailUrl || '');
    }
  }, [video]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Thumbnail file size must be less than 2MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Video title is required');
        setLoading(false);
        return;
      }

      // Validate price if premium
      if (formData.isPremium && (!formData.price || formData.price <= 0)) {
        setError('Price must be greater than 0 for premium videos');
        setLoading(false);
        return;
      }

      // Create FormData object for file uploads
      const updateData = new FormData();
      
      // Add text fields
      updateData.append('title', formData.title.trim());
      updateData.append('description', formData.description.trim());
      updateData.append('category', formData.category);
      updateData.append('isPremium', formData.isPremium.toString());
      updateData.append('price', formData.price.toString());
      updateData.append('featured', formData.featured.toString());
      updateData.append('isActive', formData.isActive.toString());
      
      // Add tags as JSON string
      updateData.append('tags', JSON.stringify(formData.tags));

      // Add thumbnail file if selected
      if (thumbnailFile) {
        updateData.append('thumbnail', thumbnailFile);
      }

      console.log('Submitting update for video:', video._id);
      console.log('Form data:', Object.fromEntries(updateData));

      const response = await videoService.updateVideo(video._id, updateData);
      
      console.log('Update response:', response);

      if (response.success || response.status === 'success') {
        setSuccess('Video updated successfully!');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(response.message || 'Failed to update video');
      }
    } catch (error) {
      console.error('Update video error:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        setError(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        setError('Network error - please check your connection');
      } else {
        setError(error.message || 'Failed to update video');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container video-edit-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">Edit Video</h2>
            <p className="modal-subtitle">Update video details and settings</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-form">
            {/* Video Preview Section */}
            <div className="form-section">
              <h3 className="section-title">Video Preview</h3>
              <div className="video-preview-container">
                <div className="current-video-info">
                  <div className="video-thumbnail-preview">
                    <img 
                      src={thumbnailPreview || '/placeholder-video.jpg'} 
                      alt="Video thumbnail"
                      className="thumbnail-image"
                    />
                    <div className="video-overlay">
                      <button
                        type="button"
                        onClick={() => setVideoPreview(!videoPreview)}
                        className="preview-btn"
                      >
                        {videoPreview ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                    </div>
                  </div>
                  <div className="video-meta-info">
                    <div className="video-stats-grid">
                      <div className="stat-item">
                        <Clock size={16} />
                        <span>{formatDuration(video?.duration)}</span>
                      </div>
                      <div className="stat-item">
                        <Eye size={16} />
                        <span>{video?.viewCount || 0} views</span>
                      </div>
                      <div className="stat-item">
                        <Tag size={16} />
                        <span className="category-tag">{video?.category}</span>
                      </div>
                      {video?.isPremium && (
                        <div className="stat-item">
                          <DollarSign size={16} />
                          <span className="price-tag">${video?.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter video title..."
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Enter video description..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Status
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="form-select"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="form-section">
              <h3 className="section-title">Thumbnail</h3>
              <div className="thumbnail-upload-section">
                <div className="current-thumbnail">
                  <img 
                    src={thumbnailPreview || '/placeholder-video.jpg'} 
                    alt="Current thumbnail"
                    className="thumbnail-preview"
                  />
                </div>
                <div className="thumbnail-upload-controls">
                  <label className="upload-btn">
                    <ImageIcon size={16} />
                    Change Thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      hidden
                    />
                  </label>
                  <p className="upload-hint">
                    Recommended: 1280x720px, JPG or PNG, max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="form-section">
              <h3 className="section-title">Tags</h3>
              <div className="tags-section">
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="form-input tag-input"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="add-tag-btn"
                    disabled={!newTag.trim()}
                  >
                    Add
                  </button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="remove-tag-btn"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & Features */}
            <div className="form-section">
              <h3 className="section-title">Pricing & Features</h3>
              <div className="features-grid">
                <div className="feature-toggle">
                  <label className="toggle-container">
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={formData.isPremium}
                      onChange={handleInputChange}
                      className="toggle-input"
                    />
                    <div className="toggle-slider"></div>
                    <span className="toggle-label">Premium Content</span>
                  </label>
                  <p className="toggle-description">
                    Mark this video as premium content requiring payment
                  </p>
                </div>

                {formData.isPremium && (
                  <div className="form-group">
                    <label className="form-label">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="feature-toggle">
                  <label className="toggle-container">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="toggle-input"
                    />
                    <div className="toggle-slider"></div>
                    <span className="toggle-label">Featured Video</span>
                  </label>
                  <p className="toggle-description">
                    Display this video prominently on the platform
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
            className="btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Updating...
              </>
            ) : (
              <>
                <Save size={16} />
                Update Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoEditModal;
import React, { useState, useRef } from 'react';
import { X, Upload, Video, Image, Plus, Minus, AlertTriangle } from 'lucide-react';
import videoService from '../services/videoService';
import { useAuth } from '../context/AuthContext';
import './VideoUploadModal.css';

const VideoUploadModal = ({ onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hand speed',
    tags: [],
    isPremium: false,
    price: 0,
    featured: false
  });
  
  const [files, setFiles] = useState({
    video: null,
    thumbnail: null
  });
  
  const [dragOver, setDragOver] = useState({
    video: false,
    thumbnail: false
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('idle');
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  
  const categories = ['hand speed', 'general lacrosse', 'shooting', 'defense', 'goalie', 'conditioning'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileSelect = (type, file) => {
    if (!file) return;
    
    const validation = type === 'video' 
      ? videoService.validateVideoFile(file)
      : videoService.validateThumbnailFile(file);
      
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, [type]: validation.error }));
      return;
    }
    
    setFiles(prev => ({ ...prev, [type]: file }));
    setErrors(prev => ({ ...prev, [type]: null }));
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(type, droppedFiles[0]);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!files.video) {
      newErrors.video = 'Video file is required';
    }
    
    if (formData.isPremium && (!formData.price || formData.price <= 0)) {
      newErrors.price = 'Price is required for premium videos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadStage('preparing');
    
    try {
      setUploadStage('uploading');
      
      const uploadData = {
        ...formData,
        video: files.video,
        thumbnail: files.thumbnail,
        onProgress: (progress) => {
          setUploadProgress(progress);
          
          if (progress === 100) {
            setUploadStage('processing');
          }
        }
      };
      
      const response = await videoService.uploadVideo(uploadData);
      
      setUploadStage('complete');
      
      setTimeout(() => {
        onSuccess(response);
      }, 1000);
      
    } catch (error) {
      setUploadStage('error');
      setErrors({ submit: error.message || 'Upload failed. Please try again.' });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStageMessage = () => {
    switch (uploadStage) {
      case 'preparing': return 'Preparing upload...';
      case 'uploading': return `Uploading... ${uploadProgress}%`;
      case 'processing': return 'Processing video...';
      case 'complete': return 'Upload complete!';
      case 'error': return 'Upload failed';
      default: return '';
    }
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-container">
        {/* Header */}
        <div className="upload-modal-header">
          <div className="upload-modal-title-section">
            <h2 className="upload-modal-title">Upload Training Video</h2>
            <p className="upload-modal-subtitle">Share your lacrosse expertise with the community</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="upload-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="upload-modal-content">
          <form onSubmit={handleSubmit} className="upload-form">
            {/* Left Column - File Uploads */}
            <div className="upload-files-section">
              {/* Status Card */}
              <div className="upload-status-card">
                <h3 className="upload-status-title">Upload Status</h3>
                <div className="upload-status-items">
                  <div className={`upload-status-item ${isAuthenticated ? 'success' : 'error'}`}>
                    <div className="upload-status-dot"></div>
                    Authentication: {isAuthenticated ? 'Valid' : 'Invalid'}
                  </div>
                  <div className={`upload-status-item ${user ? 'success' : 'error'}`}>
                    <div className="upload-status-dot"></div>
                    User: {user ? `${user.name} (${user.role})` : 'Not Found'}
                  </div>
                </div>
              </div>

              {/* Video Upload */}
              <div className="upload-field">
                <label className="upload-label">Video File *</label>
                <div
                  className={`upload-dropzone ${
                    dragOver.video ? 'dragover' : ''
                  } ${errors.video ? 'error' : ''} ${files.video ? 'has-file' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'video')}
                  onDragLeave={(e) => handleDragLeave(e, 'video')}
                  onDrop={(e) => handleDrop(e, 'video')}
                >
                  {files.video ? (
                    <div className="upload-file-info">
                      <Video className="upload-file-icon" size={32} />
                      <p className="upload-file-name">{files.video.name}</p>
                      <p className="upload-file-size">{formatFileSize(files.video.size)}</p>
                      <button
                        type="button"
                        onClick={() => setFiles(prev => ({ ...prev, video: null }))}
                        className="upload-file-remove"
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="upload-dropzone-content">
                      <Upload className="upload-dropzone-icon" size={32} />
                      <p className="upload-dropzone-text">
                        Drop video file here or{' '}
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="upload-browse-btn"
                          disabled={uploading}
                        >
                          browse
                        </button>
                      </p>
                      <p className="upload-dropzone-hint">
                        MP4, MOV, AVI, WebM up to 500MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.video && (
                  <p className="upload-error-message">{errors.video}</p>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileSelect('video', e.target.files[0])}
                  className="upload-hidden-input"
                  disabled={uploading}
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="upload-field">
                <label className="upload-label">Thumbnail (Optional)</label>
                <div
                  className={`upload-dropzone ${
                    dragOver.thumbnail ? 'dragover' : ''
                  } ${errors.thumbnail ? 'error' : ''} ${files.thumbnail ? 'has-file' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'thumbnail')}
                  onDragLeave={(e) => handleDragLeave(e, 'thumbnail')}
                  onDrop={(e) => handleDrop(e, 'thumbnail')}
                >
                  {files.thumbnail ? (
                    <div className="upload-file-info">
                      <Image className="upload-file-icon" size={32} />
                      <p className="upload-file-name">{files.thumbnail.name}</p>
                      <p className="upload-file-size">{formatFileSize(files.thumbnail.size)}</p>
                      <button
                        type="button"
                        onClick={() => setFiles(prev => ({ ...prev, thumbnail: null }))}
                        className="upload-file-remove"
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="upload-dropzone-content">
                      <Image className="upload-dropzone-icon" size={32} />
                      <p className="upload-dropzone-text">
                        Drop thumbnail here or{' '}
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="upload-browse-btn"
                          disabled={uploading}
                        >
                          browse
                        </button>
                      </p>
                      <p className="upload-dropzone-hint">
                        JPG, PNG, WebP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.thumbnail && (
                  <p className="upload-error-message">{errors.thumbnail}</p>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect('thumbnail', e.target.files[0])}
                  className="upload-hidden-input"
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="upload-form-section">
              {/* Title */}
              <div className="upload-field">
                <label className="upload-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={uploading}
                  className={`upload-input ${errors.title ? 'error' : ''}`}
                  placeholder="Enter video title"
                />
                {errors.title && (
                  <p className="upload-error-message">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="upload-field">
                <label className="upload-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={uploading}
                  rows={3}
                  className={`upload-textarea ${errors.description ? 'error' : ''}`}
                  placeholder="Enter video description"
                />
                {errors.description && (
                  <p className="upload-error-message">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div className="upload-field">
                <label className="upload-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={uploading}
                  className="upload-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="upload-field">
                <label className="upload-label">Tags</label>
                <div className="upload-tags-container">
                  <div className="upload-tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="upload-tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          disabled={uploading}
                          className="upload-tag-remove"
                        >
                          <Minus size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="upload-tag-input-container">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      disabled={uploading}
                      className="upload-tag-input"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={uploading || !tagInput.trim()}
                      className="upload-tag-add-btn"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Premium Settings */}
              <div className="upload-field">
                <div className="upload-checkbox-container">
                  <input
                    type="checkbox"
                    name="isPremium"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={handleInputChange}
                    disabled={uploading}
                    className="upload-checkbox"
                  />
                  <label htmlFor="isPremium" className="upload-checkbox-label">
                    Premium video (requires payment)
                  </label>
                </div>

                {formData.isPremium && (
                  <div className="upload-field">
                    <label className="upload-label">Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={uploading}
                      min="0"
                      step="0.01"
                      className={`upload-input ${errors.price ? 'error' : ''}`}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="upload-error-message">{errors.price}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Featured */}
              <div className="upload-field">
                <div className="upload-checkbox-container">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    disabled={uploading}
                    className="upload-checkbox"
                  />
                  <label htmlFor="featured" className="upload-checkbox-label">
                    Featured video (appears in featured section)
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="upload-submit-section">
                <button
                  type="submit"
                  disabled={uploading || !isAuthenticated}
                  className="upload-submit-btn"
                >
                  {uploading ? (
                    <>
                      <div className="upload-spinner"></div>
                      {getStageMessage()}
                    </>
                  ) : uploadStage === 'complete' ? (
                    <>Upload Complete!</>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Video
                    </>
                  )}
                </button>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="upload-progress-container">
                  <div className="upload-progress-info">
                    <span>{getStageMessage()}</span>
                    {uploadStage === 'uploading' && (
                      <span>{uploadProgress}%</span>
                    )}
                  </div>
                  <div className="upload-progress-bar">
                    <div
                      className={`upload-progress-fill ${uploadStage}`}
                      style={{ 
                        width: uploadStage === 'processing' || uploadStage === 'complete' 
                          ? '100%' 
                          : `${uploadProgress}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="upload-error-container">
                  <AlertTriangle size={16} />
                  <p className="upload-error-text">{errors.submit}</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
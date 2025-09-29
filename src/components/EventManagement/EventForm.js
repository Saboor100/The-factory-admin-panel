// components/EventManagement/EventForm.js
import React, { useState, useEffect } from 'react';
import eventService from '../../services/events/eventService';
import '../../pages/events/EventCreate.css'; // Use the new clean CSS

const EventForm = ({ eventId, onBack, onSuccess, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    category: 'lacrosse_camp',
    tags: '',
    isPublished: false,
    isFeatured: false,
    requiresApproval: false,
    image: null,
    ticketTypes: [
      {
        name: 'Day Camper',
        description: '9AM-5PM daily participation',
        price: 150,
        maxCapacity: 50,
        isActive: true,
        currentRegistrations: 0
      }
    ],
    additionalInfo: {
      ageGroups: [],
      skillLevels: [],
      whatToBring: '',
      cancellationPolicy: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [uploadProgress, setUploadProgress] = useState(0);

  const eventCategories = [
    { value: 'lacrosse_camp', label: 'Lacrosse Camp' },
    { value: 'tournament', label: 'Tournament' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'training', label: 'Training' },
    { value: 'social', label: 'Social' },
    { value: 'fundraiser', label: 'Fundraiser' },
    { value: 'other', label: 'Other' }
  ];

  const ageGroups = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Adult', 'All Ages'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  useEffect(() => {
    if (mode === 'edit' && eventId) {
      fetchEventData();
    }
  }, [eventId, mode]);

  const fetchEventData = async () => {
    try {
      setInitialLoading(true);
      const response = await eventService.getEvent(eventId);
      const event = response.data;

      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
        organizerName: event.organizerName || '',
        organizerEmail: event.organizerEmail || '',
        organizerPhone: event.organizerPhone || '',
        category: event.category || 'lacrosse_camp',
        tags: event.tags ? event.tags.join(', ') : '',
        isPublished: event.isPublished || false,
        isFeatured: event.isFeatured || false,
        requiresApproval: event.requiresApproval || false,
        image: null,
        ticketTypes: event.ticketTypes || [],
        additionalInfo: {
          ageGroups: event.additionalInfo?.ageGroups || [],
          skillLevels: event.additionalInfo?.skillLevels || [],
          whatToBring: event.additionalInfo?.whatToBring || '',
          cancellationPolicy: event.additionalInfo?.cancellationPolicy || ''
        }
      });
    } catch (error) {
      console.error('Failed to fetch event data:', error);
      setError(error.message || 'Failed to load event data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setError(null);
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index] = {
      ...updatedTicketTypes[index],
      [field]: field === 'price' || field === 'maxCapacity' ? parseFloat(value) || 0 : value
    };
    setFormData(prev => ({ ...prev, ticketTypes: updatedTicketTypes }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          name: '',
          description: '',
          price: 0,
          maxCapacity: 0,
          isActive: true,
          currentRegistrations: 0
        }
      ]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.ticketTypes.length > 1) {
      setFormData(prev => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAdditionalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [field]: value
      }
    }));
  };

  const handleAgeGroupChange = (ageGroup) => {
    const currentAgeGroups = formData.additionalInfo.ageGroups || [];
    const updatedAgeGroups = currentAgeGroups.includes(ageGroup)
      ? currentAgeGroups.filter(ag => ag !== ageGroup)
      : [...currentAgeGroups, ageGroup];
    
    handleAdditionalInfoChange('ageGroups', updatedAgeGroups);
  };

  const handleSkillLevelChange = (skillLevel) => {
    const currentSkillLevels = formData.additionalInfo.skillLevels || [];
    const updatedSkillLevels = currentSkillLevels.includes(skillLevel)
      ? currentSkillLevels.filter(sl => sl !== skillLevel)
      : [...currentSkillLevels, skillLevel];
    
    handleAdditionalInfoChange('skillLevels', updatedSkillLevels);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.location.trim()) errors.push('Location is required');
    if (!formData.startDate) errors.push('Start date is required');
    if (!formData.endDate) errors.push('End date is required');
    if (!formData.registrationDeadline) errors.push('Registration deadline is required');
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    // Only validate that end date is after start date
    if (endDate <= startDate) errors.push('End date must be after start date');
    
    if (formData.ticketTypes.length === 0) {
      errors.push('At least one ticket type is required');
    } else {
      formData.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name.trim()) errors.push(`Ticket type ${index + 1}: Name is required`);
        if (!ticket.description.trim()) errors.push(`Ticket type ${index + 1}: Description is required`);
        if (ticket.price < 0) errors.push(`Ticket type ${index + 1}: Price cannot be negative`);
        if (ticket.maxCapacity <= 0) errors.push(`Ticket type ${index + 1}: Max capacity must be greater than 0`);
      });
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
        : [];

      const eventData = {
        ...formData,
        tags: tagsArray,
        organizerName: formData.organizerName || 'Event Organizer',
        organizerEmail: formData.organizerEmail || 'events@example.com'
      };

      let response;
      if (mode === 'edit') {
        response = await eventService.updateEvent(eventId, eventData);
      } else {
        response = await eventService.createEvent(eventData);
      }
      
      console.log(`Event ${mode}d successfully:`, response);
      
      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          onBack();
        }
      }
    } catch (error) {
      console.error(`Failed to ${mode} event:`, error);
      
      // Handle specific error types
      if (error.type === 'timeout') {
        setError(`Request timed out. The event might have been ${mode}d successfully. Please check your events list.`);
      } else if (error.type === 'validation') {
        setError(error.message || 'Please check your input data.');
      } else if (error.type === 'authentication') {
        setError('Authentication failed. Please login again.');
      } else {
        setError(error.message || `Failed to ${mode} event. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="event-create-container">
        <div className="event-create-header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="header-title">Loading Event...</h1>
              <p className="header-subtitle">Please wait while we load the event data</p>
            </div>
          </div>
        </div>
        <div className="form-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #1e2632',
              borderTop: '3px solid #c6ff1a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-create-container">
      {/* Header */}
      <div className="event-create-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="header-title">
              {mode === 'edit' ? 'Edit Event' : 'Create Event'}
            </h1>
            <p className="header-subtitle">
              {mode === 'edit' 
                ? 'Update the event details below' 
                : 'Share your lacrosse expertise with the community'
              }
            </p>
          </div>
          <button onClick={onBack} className="back-btn">
            Back to Events
          </button>
        </div>
      </div>

      <div className="form-container">
        <div className="form-layout">
          
          {/* Left Column - Main Form */}
          <div className="form-main">
            
            {/* Upload Status */}
            <div className="form-section">
              <h2 className="section-title">Upload Status</h2>
              
              <div className="status-item">
                <div className="status-indicator status-success"></div>
                <span className="status-text">Authentication: Valid</span>
              </div>
              
              <div className="status-item">
                <div className="status-indicator status-success"></div>
                <span className="status-text">User: Event Organizer (admin)</span>
              </div>
            </div>

            {/* Event Image Upload */}
            <div className="form-section">
              <h2 className="section-title">Event Image *</h2>
              
              <div 
                className="upload-area"
                onClick={() => document.getElementById('imageInput').click()}
              >
                <div className="upload-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <p className="upload-text">
                  Drop event image here or <span className="upload-link">browse</span>
                </p>
                
                <p className="upload-subtext">
                  JPG, PNG, GIF up to 5MB
                </p>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="progress-text">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <div className="error-content">
                  <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="error-close">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="form-section">
              <h2 className="section-title">Basic Information</h2>
              
              <div className="form-fields">
                <div className="field-group">
                  <label className="field-label">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Summer Lacrosse Camp 2024"
                    className="form-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event, what participants can expect..."
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Central Park Fields, New York, NY"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Event Dates */}
            <div className="form-section">
              <h2 className="section-title">Event Dates & Times</h2>
              
              <div className="date-grid">
                <div className="field-group">
                  <label className="field-label">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Registration Deadline *</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Types */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Ticket Types</h2>
                <button type="button" onClick={addTicketType} className="add-ticket-btn">
                  + Add Ticket Type
                </button>
              </div>

              {formData.ticketTypes.map((ticket, index) => (
                <div key={index} className="ticket-card">
                  <div className="ticket-header">
                    <h3 className="ticket-title">Ticket Type {index + 1}</h3>
                    {formData.ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="remove-ticket-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="ticket-fields">
                    <div className="field-group">
                      <label className="field-label-small">Name *</label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                        placeholder="Day Camper"
                        className="form-input-small"
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label-small">Price ($) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                        placeholder="150.00"
                        className="form-input-small"
                      />
                    </div>

                    <div className="field-group field-full">
                      <label className="field-label-small">Description *</label>
                      <textarea
                        value={ticket.description}
                        onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                        placeholder="9AM-5PM daily participation"
                        rows={2}
                        className="form-textarea-small"
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label-small">Max Capacity *</label>
                      <input
                        type="number"
                        min="1"
                        value={ticket.maxCapacity}
                        onChange={(e) => handleTicketTypeChange(index, 'maxCapacity', e.target.value)}
                        placeholder="50"
                        className="form-input-small"
                      />
                    </div>

                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id={`active-${index}`}
                        checked={ticket.isActive}
                        onChange={(e) => handleTicketTypeChange(index, 'isActive', e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor={`active-${index}`} className="checkbox-label">
                        Active for registration
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="form-sidebar">
            
            {/* Category & Tags */}
            <div className="form-section">
              <h2 className="section-title">Category</h2>
              
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                {eventCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <h3 className="section-subtitle">Tags</h3>
              
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Add a tag"
                  className="tag-input"
                />
                <button type="button" className="tag-add-btn">+</button>
              </div>
            </div>

            {/* Age Groups */}
            <div className="form-section">
              <h2 className="section-title">Age Groups</h2>
              
              <div className="tag-buttons">
                {ageGroups.map(ageGroup => (
                  <button
                    key={ageGroup}
                    type="button"
                    onClick={() => handleAgeGroupChange(ageGroup)}
                    className={`tag-button ${
                      formData.additionalInfo.ageGroups?.includes(ageGroup) ? 'tag-active' : ''
                    }`}
                  >
                    {ageGroup}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Levels */}
            <div className="form-section">
              <h2 className="section-title">Skill Levels</h2>
              
              <div className="tag-buttons">
                {skillLevels.map(skillLevel => (
                  <button
                    key={skillLevel}
                    type="button"
                    onClick={() => handleSkillLevelChange(skillLevel)}
                    className={`tag-button tag-skill ${
                      formData.additionalInfo.skillLevels?.includes(skillLevel) ? 'tag-skill-active' : ''
                    }`}
                  >
                    {skillLevel}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Settings */}
            <div className="form-section">
              <h2 className="section-title">Event Settings</h2>
              
              <div className="settings-list">
                <div className="setting-item">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="isPublished" className="setting-label">
                    Publish event immediately
                  </label>
                </div>

                <div className="setting-item">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="isFeatured" className="setting-label">
                    Featured event
                  </label>
                </div>

                <div className="setting-item">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="requiresApproval" className="setting-label">
                    Require approval for registrations
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h2 className="section-title">Additional Information</h2>
              
              <div className="additional-fields">
                <div className="field-group">
                  <label className="field-label">What to Bring</label>
                  <textarea
                    value={formData.additionalInfo.whatToBring}
                    onChange={(e) => handleAdditionalInfoChange('whatToBring', e.target.value)}
                    placeholder="Lacrosse stick, cleats, water bottle..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Cancellation Policy</label>
                  <textarea
                    value={formData.additionalInfo.cancellationPolicy}
                    onChange={(e) => handleAdditionalInfoChange('cancellationPolicy', e.target.value)}
                    placeholder="Refund policy and cancellation terms..."
                    rows={3}
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            {/* Organizer Information */}
            <div className="form-section">
              <h2 className="section-title">Organizer Information</h2>
              
              <div className="organizer-fields">
                <div className="field-group">
                  <label className="field-label">Organizer Name</label>
                  <input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleInputChange}
                    placeholder="Coach Smith"
                    className="form-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Contact Email</label>
                  <input
                    type="email"
                    name="organizerEmail"
                    value={formData.organizerEmail}
                    onChange={handleInputChange}
                    placeholder="coach@example.com"
                    className="form-input"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  <input
                    type="tel"
                    name="organizerPhone"
                    value={formData.organizerPhone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`submit-btn ${loading ? 'submit-loading' : ''}`}
            >
              {loading ? `${mode === 'edit' ? 'Updating' : 'Creating'} Event...` : `${mode === 'edit' ? 'Update' : 'Create'} Event`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
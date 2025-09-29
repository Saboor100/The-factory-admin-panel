import React, { useState, useEffect } from 'react';
import eventService from '../../services/events/eventService';
import './DiscountCodeManager.css';

const DiscountCodeManager = ({ onBack }) => {
  const [discounts, setDiscounts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'active',
    discountType: '',
    eventId: '',
    search: ''
  });
  const [pagination, setPagination] = useState({});

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxUsageLimit: '',
    usagePerUser: 1,
    validFrom: '',
    validUntil: '',
    isActive: true,
    applicableEvents: [],
    applicableTicketTypes: []
  });

  useEffect(() => {
    fetchDiscounts();
    fetchEvents();
  }, [filters]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await eventService.getDiscountCodes(filters);
      setDiscounts(response.data || []);
      setPagination(response.pagination || {});
      setError(null);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      setError(error.message || 'Failed to load discount codes');
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventService.getEvents({ limit: 100, isPublished: 'true' });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEventSelect = (eventId) => {
    setFormData(prev => ({
      ...prev,
      applicableEvents: prev.applicableEvents.includes(eventId)
        ? prev.applicableEvents.filter(id => id !== eventId)
        : [...prev.applicableEvents, eventId]
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxUsageLimit: '',
      usagePerUser: 1,
      validFrom: '',
      validUntil: '',
      isActive: true,
      applicableEvents: [],
      applicableTicketTypes: []
    });
    setEditingDiscount(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const start = new Date(formData.validFrom);
    const end = new Date(formData.validUntil);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Please provide both valid start and end dates.');
      return;
    }

    if (end <= start) {
      setError('Valid Until must be after Valid From.');
      return;
    }

    if (!formData.code || !formData.discountValue) {
      setError("Please fill in all required fields (code, discount value, dates).");
      return;
    }

    try {
      const discountData = {
  code: formData.code,
  description: formData.description,
  discountType: formData.discountType,
  discountAmount: parseFloat(formData.discountValue),
  minimumOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
  maxUses: formData.maxUsageLimit ? parseInt(formData.maxUsageLimit) : null,
  maxUsesPerUser: parseInt(formData.usagePerUser),
  validFrom: new Date(formData.validFrom),
  expiresAt: new Date(formData.validUntil),
  isActive: formData.isActive,
  applicableEvents: formData.applicableEvents,
  applicableTicketTypes: formData.applicableTicketTypes
};

      if (editingDiscount) {
        await eventService.updateDiscountCode(editingDiscount._id, discountData);
      } else {
        await eventService.createDiscountCode(discountData);
      }

      fetchDiscounts();
      resetForm();
    } catch (error) {
      console.error('Failed to save discount:', error);
      const errMsg = error?.response?.data?.message || error.message || 'Failed to save discount code';
      setError(errMsg);
    }
  };

  const handleEdit = (discount) => {
  const safeDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
  };

  setFormData({
    code: discount.code || '',
    description: discount.description || '',
    discountType: discount.discountType || 'percentage',
    discountValue: discount.discountAmount || '',
    minOrderAmount: discount.minimumOrderAmount || '',
    maxUsageLimit: discount.maxUses || '',
    usagePerUser: discount.maxUsesPerUser || 1,
    validFrom: safeDate(discount.validFrom),
    validUntil: safeDate(discount.expiresAt),
    isActive: discount.isActive !== undefined ? discount.isActive : true,
    applicableEvents: discount.applicableEvents?.map(e => e._id || e) || [],
    applicableTicketTypes: discount.applicableTicketTypes || []
  });

  setEditingDiscount(discount);
  setShowCreateForm(true);
};
  const handleDelete = async (discountId) => {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      try {
        await eventService.deleteDiscountCode(discountId, true);
        fetchDiscounts();
      } catch (error) {
        console.error('Failed to delete discount:', error);
        setError(error.message || 'Failed to delete discount code');
      }
    }
  };

  const handleToggleStatus = async (discountId, currentStatus) => {
    try {
      await eventService.updateDiscountCode(discountId, { isActive: !currentStatus });
      fetchDiscounts();
    } catch (error) {
      console.error('Failed to toggle discount status:', error);
      setError(error.message || 'Failed to update discount status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (isActive, validUntil) => {
    const now = new Date();
    const expiry = new Date(validUntil);
    
    if (!isActive) return 'status-inactive';
    if (expiry < now) return 'status-expired';
    return 'status-active';
  };

  const getStatusText = (isActive, validUntil) => {
    const now = new Date();
    const expiry = new Date(validUntil);
    
    if (!isActive) return 'Inactive';
    if (expiry < now) return 'Expired';
    return 'Active';
  };

  // Calculate stats
  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.isActive && new Date(d.validUntil) >= new Date()).length,
    expired: discounts.filter(d => new Date(d.validUntil) < new Date()).length,
    totalUsage: discounts.reduce((sum, d) => sum + (d.currentUsage || 0), 0)
  };

  const hasActiveFilters = filters.search || filters.status !== 'active' || filters.discountType || filters.eventId;

  if (loading && discounts.length === 0) {
    return (
      <div className="discount-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading discount codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="discount-container">
      {/* Header */}
      <div className="discount-header">
        <div className="discount-header-content">
          <div className="discount-header-info">
            <button onClick={onBack} className="back-button">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Events
            </button>
            <h1 className="discount-title">Discount Code Manager</h1>
            <p className="discount-subtitle">Create and manage discount codes for events</p>
          </div>
          <div className="discount-header-actions">
            <button onClick={() => setShowCreateForm(true)} className="btn-primary">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Discount Code
            </button>
          </div>
        </div>
      </div>

      <div className="discount-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Codes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active Codes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-yellow">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.expired}</div>
              <div className="stat-label">Expired Codes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsage}</div>
              <div className="stat-label">Total Usage</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-section">
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search discount codes..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              {filters.search && (
                <button onClick={() => handleSearch('')} className="search-clear">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="filter-actions">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hasActiveFilters && <span className="filter-badge">!</span>}
              </button>
              {hasActiveFilters && (
                <button 
                  onClick={() => setFilters({
                    page: 1,
                    limit: 20,
                    status: 'active',
                    discountType: '',
                    eventId: '',
                    search: ''
                  })}
                  className="clear-filters"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Discount Type</label>
                <select
                  value={filters.discountType}
                  onChange={(e) => handleFilterChange('discountType', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Event</label>
                <select
                  value={filters.eventId}
                  onChange={(e) => handleFilterChange('eventId', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Events</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <svg className="error-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="error-title">Error</h3>
                <p className="error-text">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="error-close">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {discounts.length > 0 && (
          <div className="results-summary">
            <p className="results-text">
              Showing {discounts.length} discount code{discounts.length !== 1 ? 's' : ''}
            </p>
            {hasActiveFilters && (
              <p className="results-filters">
                Filters applied: {[
                  filters.search && `Search: "${filters.search}"`,
                  filters.status && `Status: ${filters.status}`,
                  filters.discountType && `Type: ${filters.discountType}`,
                  filters.eventId && `Event: ${events.find(e => e._id === filters.eventId)?.title}`
                ].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Discount Codes Table */}
        {loading ? (
          <div className="loading-table">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-row">
                <div className="loading-cell"></div>
                <div className="loading-cell"></div>
                <div className="loading-cell"></div>
                <div className="loading-cell"></div>
              </div>
            ))}
          </div>
        ) : discounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="empty-title">No discount codes found</h3>
            <p className="empty-description">
              {hasActiveFilters
                ? "No discount codes match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first discount code to offer promotions for your events."
              }
            </p>
            <div className="empty-actions">
              <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Discount Code
              </button>
            </div>
          </div>
        ) : (
          <div className="discount-table-container">
            <div className="discount-table">
              <div className="table-header">
                <div className="header-cell">Code</div>
                <div className="header-cell">Discount</div>
                <div className="header-cell">Usage</div>
                <div className="header-cell">Validity</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Actions</div>
              </div>
              <div className="table-body">
                {discounts.map((discount) => (
                  <div key={discount._id} className="table-row">
                    <div className="table-cell">
                      <div className="code-cell">
                        <span className="discount-code">{discount.code}</span>
                        {discount.description && (
                          <span className="discount-description">{discount.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="discount-value">
  {discount.discountType === 'percentage' 
    ? `${discount.discountAmount}%` 
    : formatCurrency(discount.discountAmount)
  }
</div>
                      {discount.minimumOrderAmount > 0 && (
  <div className="min-order">
    Min: {formatCurrency(discount.minimumOrderAmount)}
  </div>
)}
                      
                    </div>
                    <div className="table-cell">
                      <div className="usage-info">
                        <span className="current-usage">
  {discount.currentUses || 0}
  {discount.maxUses ? ` / ${discount.maxUses}` : ' uses'}
</span>
                        <span className="per-user">{discount.usagePerUser} per user</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="validity-info">
                        <span className="validity-from">{formatDate(discount.validFrom)}</span>
                        <span className="validity-to">to {formatDate(discount.validUntil)}</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${getStatusColor(discount.isActive, discount.validUntil)}`}>
                        {getStatusText(discount.isActive, discount.validUntil)}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="action-btn edit-btn"
                          title="Edit"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(discount._id, discount.isActive)}
                          className={`action-btn ${discount.isActive ? 'deactivate-btn' : 'activate-btn'}`}
                          title={discount.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(discount._id)}
                          className="action-btn delete-btn"
                          title="Delete"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {(pagination.currentPage - 1) * filters.limit + 1} to{' '}
                  {Math.min(pagination.currentPage * filters.limit, pagination.totalDiscounts)} of{' '}
                  {pagination.totalDiscounts} discount codes
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="pagination-btn"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`page-number ${page === pagination.currentPage ? 'active' : ''}`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === pagination.currentPage - 3 ||
                        page === pagination.currentPage + 3
                      ) {
                        return <span key={page} className="page-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="pagination-btn"
                  >
                    Next
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingDiscount ? 'Edit Discount Code' : 'Create New Discount Code'}
                </h3>
                <button onClick={resetForm} className="modal-close">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="discount-form">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Discount Code *</label>
                    <input 
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="SUMMER2024"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Type *</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Discount Value *</label>
                    <input 
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="25"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Min Order Amount</label>
                    <input 
                      type="number"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="100.00"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Usage Limit</label>
                    <input 
                      type="number"
                      name="maxUsageLimit"
                      value={formData.maxUsageLimit}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="100"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Usage Per User *</label>
                    <input 
                      type="number"
                      name="usagePerUser"
                      value={formData.usagePerUser}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valid From *</label>
                    <input 
                      type="datetime-local"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valid Until *</label>
                    <input 
                      type="datetime-local"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={3}
                    placeholder="Optional description about the discount..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingDiscount ? 'Update Discount' : 'Create Discount'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCodeManager;
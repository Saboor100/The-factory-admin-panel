import React, { useState, useEffect } from 'react';
import registrationService from '../../services/events/registrationService';
import './CleanRegistrationList.css';

const CleanRegistrationList = ({ eventId, onBack }) => {
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    paymentStatus: '',
    ticketType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({});
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchRegistrations();
      fetchEventDetails();
    }
  }, [eventId, filters]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.getEventRegistrations(eventId, filters);
      setRegistrations(response.data.registrations || []);
      setPagination(response.pagination || {});
      setError(null);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      setError(error.message || 'Failed to load registrations');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      // Use your existing eventService to get event details
      const eventService = await import('../../services/events/eventService');
      const response = await eventService.default.getEvent(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
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

  const handleCheckIn = async (registrationId) => {
    try {
      await registrationService.checkInParticipant(registrationId);
      fetchRegistrations();
    } catch (error) {
      console.error('Failed to check in participant:', error);
      setError(error.message || 'Failed to check in participant');
    }
  };

  const handleGenerateTicket = async (registrationId) => {
    try {
      const response = await registrationService.generateTicket(registrationId);
      window.open(response.data.ticketUrl, '_blank');
    } catch (error) {
      console.error('Failed to generate ticket:', error);
      setError(error.message || 'Failed to generate ticket');
    }
  };

  const handleSelectRegistration = (registrationId) => {
    setSelectedRegistrations(prev => {
      if (prev.includes(registrationId)) {
        return prev.filter(id => id !== registrationId);
      } else {
        return [...prev, registrationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRegistrations.length === registrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(registrations.map(reg => reg._id));
    }
  };

  const handleBulkCheckIn = async () => {
    try {
      setBulkLoading(true);
      await registrationService.bulkCheckIn(selectedRegistrations);
      setSelectedRegistrations([]);
      fetchRegistrations();
    } catch (error) {
      console.error('Failed to bulk check in:', error);
      setError(error.message || 'Failed to bulk check in');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportSelected = async () => {
    try {
      await registrationService.exportRegistrations({
        eventId,
        registrationIds: selectedRegistrations
      });
    } catch (error) {
      console.error('Failed to export registrations:', error);
      setError(error.message || 'Failed to export registrations');
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'payment-paid';
      case 'pending':
        return 'payment-pending';
      case 'failed':
        return 'payment-failed';
      case 'refunded':
        return 'payment-refunded';
      default:
        return 'payment-default';
    }
  };

  const hasActiveFilters = filters.search || filters.status || filters.paymentStatus || filters.ticketType;

  if (loading && registrations.length === 0) {
    return (
      <div className="clean-registration-list">
        <div className="registration-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Event Registrations</h1>
              <p>Loading registrations...</p>
            </div>
          </div>
        </div>
        <div className="content-container">
          <div className="loading-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-row">
                <div className="loading-cell"></div>
                <div className="loading-cell"></div>
                <div className="loading-cell"></div>
                <div className="loading-cell"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clean-registration-list">
      {/* Clean Header matching video management style */}
      <div className="registration-header">
        <div className="header-content">
          <div className="header-info">
            <button onClick={onBack} className="back-button">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Events
            </button>
            <h1>Event Registrations</h1>
            {event ? (
              <div className="event-details">
                <h2>{event.title}</h2>
                <p>{formatDate(event.startDate)} - {event.location}</p>
              </div>
            ) : (
              <p>Loading event details...</p>
            )}
          </div>
          <div className="header-actions">
            <div className="registration-count">
            {registrations.length} Registration{registrations.length !== 1 ? 's' : ''}
          </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Clean Filters matching video style */}
        <div className="registration-filters">
          <div className="filters-grid">
            {/* Search Input */}
            <div className="filter-group search-group">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search participants..."
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
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="filter-group">
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="filter-select"
              >
                <option value="">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <div className="filter-group">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                More Filters
                {hasActiveFilters && <span className="filter-indicator"></span>}
              </button>
            </div>
          </div>

          {/* Additional Filters */}
          {showFilters && (
            <div className="additional-filters">
              <div className="additional-filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Ticket Type</label>
                  <select
                    value={filters.ticketType}
                    onChange={(e) => handleFilterChange('ticketType', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Ticket Types</option>
                    {event?.ticketTypes?.map(ticket => (
                      <option key={ticket.name} value={ticket.name}>
                        {ticket.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <button
                    onClick={() => {
                      setFilters({
                        page: 1,
                        limit: 20,
                        status: '',
                        paymentStatus: '',
                        ticketType: '',
                        search: ''
                      });
                      setShowFilters(false);
                    }}
                    className="clear-filters-btn"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-state">
            <div className="error-content">
              <svg className="error-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="error-close">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Registrations Table */}
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
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="empty-title">No registrations found</h3>
            <p className="empty-description">
              {hasActiveFilters
                ? "No registrations match your current filters. Try adjusting your search criteria."
                : "No one has registered for this event yet."
              }
            </p>
          </div>
        ) : (
          <div className="registrations-container">
            {/* Bulk Actions */}
            {selectedRegistrations.length > 0 && (
              <div className="bulk-actions">
                <div className="bulk-info">
                  {selectedRegistrations.length} selected
                </div>
                <div className="bulk-buttons">
                  <button 
                    onClick={handleBulkCheckIn}
                    disabled={bulkLoading}
                    className="bulk-btn bulk-checkin"
                  >
                    {bulkLoading ? 'Processing...' : 'Bulk Check-in'}
                  </button>
                  <button 
                    onClick={handleExportSelected}
                    className="bulk-btn bulk-export"
                  >
                    Export Selected
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="registrations-table">
              <div className="table-header">
                <div className="header-cell checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedRegistrations.length === registrations.length && registrations.length > 0}
                    onChange={handleSelectAll}
                    className="checkbox"
                  />
                </div>
                <div className="header-cell">Participant</div>
                <div className="header-cell">Contact</div>
                <div className="header-cell">Ticket</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Payment</div>
                <div className="header-cell">Registered</div>
                <div className="header-cell">Actions</div>
              </div>
              
              <div className="table-body">
                {registrations.map((registration) => (
                  <div key={registration._id} className="table-row">
                    <div className="table-cell checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedRegistrations.includes(registration._id)}
                        onChange={() => handleSelectRegistration(registration._id)}
                        className="checkbox"
                      />
                    </div>
                    
                    <div className="table-cell">
                      <div className="participant-info">
                        <div className="participant-name">
                          {registration.athleteFirstName} {registration.athleteLastName}
                        </div>
                        {registration.usaLaxNumber && (
                          <div className="participant-id">
                            USA Lax: {registration.usaLaxNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="contact-info">
                        <div className="contact-email">{registration.email}</div>
                        {registration.phone && (
                          <div className="contact-phone">{registration.phone}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="ticket-info">
                        <div className="ticket-type">{registration.ticketType}</div>
                        <div className="ticket-amount">
                          {formatCurrency(registration.paidAmount)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <span className={`status-badge ${getStatusClass(registration.registrationStatus)}`}>
                        {registration.registrationStatus}
                      </span>
                      {registration.checkedIn && (
                        <div className="checkin-status">
                          Checked in: {formatDate(registration.checkInTime)}
                        </div>
                      )}
                    </div>
                    
                    <div className="table-cell">
                      <span className={`payment-badge ${getPaymentStatusClass(registration.paymentStatus)}`}>
                        {registration.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="table-cell">
                      <div className="registration-date">
                        {formatDate(registration.registrationDate)}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="action-buttons">
                        {!registration.checkedIn && (
                          <button
                            onClick={() => handleCheckIn(registration._id)}
                            className="action-btn checkin-btn"
                          >
                            Check In
                          </button>
                        )}
                        <button
                          onClick={() => handleGenerateTicket(registration._id)}
                          className="action-btn ticket-btn"
                        >
                          Ticket
                        </button>
                        <button className="action-btn edit-btn">
                          Edit
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
                  {Math.min(pagination.currentPage * filters.limit, pagination.totalRegistrations)} of{' '}
                  {pagination.totalRegistrations} registrations
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
      </div>
    </div>
  );
};

export default CleanRegistrationList;
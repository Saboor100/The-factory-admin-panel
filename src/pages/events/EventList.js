// pages/events/EventList.js - Clean Video Management Style
import React, { useState, useEffect } from 'react';
import eventService from '../../services/events/eventService';
import EventCard from '../../components/EventManagement/EventCard';
import './EventComponents.css';

const EventList = ({ 
  onCreateEvent, 
  onEditEvent, 
  onViewRegistrations, 
  onManageDiscounts 
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: '',
    isPublished: '',
    isFeatured: '',
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    includeInactive: 'false'
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({
    overview: { totalEvents: 0, totalPublished: 0, upcomingEvents: 0, totalInactive: 0 },
    registrations: { totalRevenue: 0 }
  });

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents(filters);
      setEvents(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError(error.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await eventService.getEventStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        overview: { 
          totalEvents: events.length || 0, 
          totalPublished: 0, 
          upcomingEvents: 0, 
          totalInactive: 0 
        },
        registrations: { totalRevenue: 0 }
      });
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

  const handleToggleActive = async (eventId, currentStatus) => {
    const nextStatus = !currentStatus;
    const actionLabel = nextStatus ? 'activate' : 'deactivate';

    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} this event?`);
    if (!confirmed) return;

    try {
      await eventService.toggleEventActive(eventId, nextStatus);
      fetchEvents();
      fetchStats();
    } catch (error) {
      console.error(`Failed to ${actionLabel} event:`, error);
      setError(error.message || `Failed to ${actionLabel} event`);
    }
  };

  const handleTogglePublished = async (eventId) => {
    try {
      await eventService.togglePublished(eventId);
      fetchEvents();
    } catch (error) {
      console.error('Failed to toggle published status:', error);
      setError(error.message || 'Failed to update event');
    }
  };

  const handleToggleFeatured = async (eventId) => {
    try {
      await eventService.toggleFeatured(eventId);
      fetchEvents();
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      setError(error.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId, hardDelete = false) => {
    if (window.confirm(hardDelete ? 
      'Are you sure you want to permanently delete this event? This action cannot be undone.' : 
      'Are you sure you want to deactivate this event?'
    )) {
      try {
        await eventService.deleteEvent(eventId, hardDelete);
        fetchEvents();
        fetchStats();
      } catch (error) {
        console.error('Failed to delete event:', error);
        setError(error.message || 'Failed to delete event');
      }
    }
  };

  const eventCategories = [
  { value: '', label: 'All Categories' },
  { value: 'overnight_camp', label: 'Overnight Camp' },
  { value: 'recruiting_event', label: 'Recruiting Event' },
  { value: 'weekly_training', label: 'Weekly Training' },
  { value: 'complete_faceoff_training', label: 'Complete Faceoff Training' },
  { value: 'development_day', label: 'Development Day' },
  { value: 'tuneup', label: 'Tune-up' },
  { value: 'other', label: 'Other' }
];

  const statusOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'past', label: 'Past Events' }
  ];

  if (loading && events.length === 0) {
    return (
      <div className="video-management">
        <div className="video-header">
          <div className="video-header-content">
            <div className="video-header-info">
              <h1>Event Management</h1>
              <p>Loading events...</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="loading-card animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-management">
      {/* Header matching video management style */}
      <div className="video-header">
        <div className="video-header-content">
          <div className="video-header-info">
            <h1>Event Management</h1>
            <p>Manage and organize your lacrosse events</p>
          </div>
          <div className="video-header-actions">
            <button onClick={onManageDiscounts} className="btn-stats">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Manage Discounts
            </button>
            <button onClick={onCreateEvent} className="btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Event
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Clean search and filter bar matching video style */}
        <div className="video-filters">
          <div className="filters-grid">
            {/* Search Input */}
            <div className="filter-group search-group">
              <div className="search-input-wrapper">
                <svg className="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
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
                {eventCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle Button */}
            <div className="filter-group">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                More Filters
                {(filters.isPublished || filters.isFeatured || filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
                  <span className="filter-indicator"></span>
                )}
              </button>
            </div>
          </div>

          {/* Filter options row matching video style */}
          <div className="filters-bottom">
            <div className="filter-checkboxes">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="featured-only"
                  className="custom-checkbox"
                  checked={filters.isFeatured === 'true'}
                  onChange={(e) => handleFilterChange('isFeatured', e.target.checked ? 'true' : '')}
                />
                <label htmlFor="featured-only" className="checkbox-label">Featured only</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="include-inactive"
                  className="custom-checkbox"
                  checked={filters.includeInactive === 'true'}
                  onChange={(e) => handleFilterChange('includeInactive', e.target.checked ? 'true' : 'false')}
                />
                <label htmlFor="include-inactive" className="checkbox-label">Include inactive</label>
              </div>
            </div>
          </div>

          {/* Collapsible Additional Filters */}
          {showFilters && (
            <div className="additional-filters">
              <div className="additional-filters-grid">
                <div className="filter-group">
                  <label className="filter-label">Published Status</label>
                  <select
                    value={filters.isPublished}
                    onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="filter-select"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="startDate">Event Date</option>
                    <option value="title">Title</option>
                    <option value="totalRegistrations">Registrations</option>
                    <option value="totalRevenue">Revenue</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="filter-select"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>

                <div className="filter-group">
                  <button
                    onClick={() => {
                      setFilters({
                        page: 1,
                        limit: 12,
                        category: '',
                        isPublished: '',
                        isFeatured: '',
                        search: '',
                        status: 'all',
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                        includeInactive: 'false'
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
              <svg className="error-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Events Grid matching video grid style */}
        {loading ? (
          <div className="videos-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="video-card animate-pulse">
                <div className="video-thumbnail">
                  <div className="h-full bg-gray-300"></div>
                </div>
                <div className="video-content">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a4 4 0 118 0v4m-4 9a5 5 0 01-4.9-4H2a1 1 0 01-1-1V9a1 1 0 011-1h1.1A5 5 0 018 4h8a5 5 0 014.9 4H22a1 1 0 011 1v2a1 1 0 01-1 1h-1.1A5 5 0 0116 16H8z" />
              </svg>
            </div>
            <h2 className="empty-title">No events found</h2>
            <p className="empty-description">
              {filters.search || filters.category || filters.isFeatured 
                ? "No events match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first lacrosse event."
              }
            </p>
            <button onClick={onCreateEvent} className="btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Event
            </button>
          </div>
        ) : (
          <>
            <div className="videos-grid">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onTogglePublished={handleTogglePublished}
                  onToggleActive={handleToggleActive} 
                  onToggleFeatured={handleToggleFeatured}
                  onDelete={handleDeleteEvent}
                  onEdit={(eventId) => onEditEvent && onEditEvent(eventId)}
                  onViewRegistrations={(eventId) => onViewRegistrations && onViewRegistrations(eventId)}
                />
              ))}
            </div>

            {/* Pagination matching video style */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {(pagination.currentPage - 1) * filters.limit + 1} to{' '}
                  {Math.min(pagination.currentPage * filters.limit, pagination.totalEvents)} of{' '}
                  {pagination.totalEvents} events
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
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
                        page === pagination.currentPage - 2 ||
                        page === pagination.currentPage + 2
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
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventList;
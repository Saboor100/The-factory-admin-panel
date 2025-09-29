import React, { useState } from 'react';
import './EventComponents.css';

const EventCard = ({
  event,
  onTogglePublished,
  onToggleFeatured,
  onToggleActive,
  onDelete,
  onEdit,
  onViewRegistrations,
}) => {
  const [loading, setLoading] = useState({
    publish: false,
    feature: false,
    active: false,
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const getStatusClass = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (end < now) return 'status-badge-past';
    if (start <= now && end >= now) return 'status-badge-ongoing';
    return 'status-badge-upcoming';
  };

  const getStatusText = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (end < now) return 'Past';
    if (start <= now && end >= now) return 'Ongoing';
    return 'Upcoming';
  };

  const getRegistrationStatus = () => {
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    if (deadline < now) return { text: 'Closed', class: 'status-badge-reg-closed' };
    return { text: 'Open', class: 'status-badge-reg-open' };
  };

  const registrationStatus = getRegistrationStatus();

  const availableSpots =
    event.ticketTypes?.reduce(
      (total, ticket) => total + (ticket.maxCapacity - ticket.currentRegistrations),
      0
    ) || 0;

  const handleTogglePublished = async () => {
    setLoading((prev) => ({ ...prev, publish: true }));
    try {
      await onTogglePublished(event._id);
    } finally {
      setLoading((prev) => ({ ...prev, publish: false }));
    }
  };

  const handleToggleFeatured = async () => {
    setLoading((prev) => ({ ...prev, feature: true }));
    try {
      await onToggleFeatured(event._id);
    } finally {
      setLoading((prev) => ({ ...prev, feature: false }));
    }
  };

  const handleToggleActive = async () => {
    setLoading((prev) => ({ ...prev, active: true }));
    try {
      await onToggleActive(event._id, event.isActive);
    } finally {
      setLoading((prev) => ({ ...prev, active: false }));
    }
  };

  return (
    <div className={`event-card rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-lg ${!event.isActive ? 'opacity-75 bg-gray-100' : ''}`}>
      {/* Event Image & Badges */}
      <div className="relative h-48 event-card-image">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.style.display = 'none')}
          />
        ) : (
          <div className="flex justify-center items-center h-full text-white event-card-placeholder">
            <div className="text-center">
              <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4..." />
              </svg>
              <p>Event</p>
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass()}`}>
            {getStatusText()}
          </span>
          {!event.isActive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              Inactive
            </span>
          )}
          {event.isFeatured && (
            <span className="px-2 py-1 rounded-full text-xs font-medium status-badge-featured">
              Featured
            </span>
          )}
          {!event.isPublished && (
            <span className="px-2 py-1 rounded-full text-xs font-medium status-badge-draft">
              Draft
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${registrationStatus.class}`}>
            {registrationStatus.text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 text-gray-800">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div>{formatDate(event.startDate)}</div>
          <div>{event.location}</div>
          <div>{event.totalRegistrations || 0} registrations</div>
          <div>{availableSpots} spots available</div>
        </div>

        {/* Tickets */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Ticket Types</h4>
          {event.ticketTypes?.slice(0, 2).map((ticket, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{ticket.name}</span>
              <span>{formatCurrency(ticket.price)}</span>
            </div>
          ))}
          {event.ticketTypes?.length > 2 && (
            <div className="text-sm text-gray-500">
              +{event.ticketTypes.length - 2} more
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => onEdit(event._id)}
            className="btn-edit flex-1 px-3 py-2 text-sm rounded-md font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onViewRegistrations(event._id)}
            className="btn-registrations flex-1 px-3 py-2 text-sm rounded-md font-medium"
          >
            Registrations
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleTogglePublished}
            disabled={loading.publish}
            className={`flex-1 px-3 py-2 text-sm rounded-md font-medium ${
              event.isPublished ? 'btn-unpublish' : 'btn-publish'
            } ${loading.publish ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading.publish ? '...' : event.isPublished ? 'Unpublish' : 'Publish'}
          </button>

          <button
            onClick={handleToggleFeatured}
            disabled={loading.feature}
            className={`flex-1 px-3 py-2 text-sm rounded-md font-medium ${
              event.isFeatured ? 'btn-unfeature' : 'btn-feature'
            } ${loading.feature ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading.feature ? '...' : event.isFeatured ? 'Unfeature' : 'Feature'}
          </button>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={handleToggleActive}
            disabled={loading.active}
            className={`flex-1 ${
              event.isActive ? 'btn-deactivate' : 'btn-activate'
            } px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              loading.active ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading.active
              ? '...'
              : event.isActive
              ? 'Deactivate'
              : 'Activate'}
          </button>

          <button
            onClick={() => onDelete(event._id, true)}
            className="btn-delete flex-1 px-3 py-2 text-sm rounded-md font-medium"
          >
            Delete
          </button>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Category: {event.category?.replace('_', ' ')}</span>
            <span>Revenue: {formatCurrency(event.totalRevenue || 0)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Created: {formatDate(event.createdAt)}</span>
            <span>Deadline: {formatDate(event.registrationDeadline)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
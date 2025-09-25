import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function AppointmentCard({ appointment, user, onBook, onUpdate, onDelete, showActions = true }) {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const canEdit = user?.userType === 'specialist' && appointment.specialistId === user._id;
  const canBook = user?.userType === 'member' && !appointment.isBooked;
  const isUserAppointment = user?.userType === 'member' && appointment.memberName === user.name;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-lg">{appointment.specialistName}</h4>
              <Badge variant="outline" className="text-xs">{appointment.category}</Badge>
            </div>
            <p className="text-gray-600">{appointment.specialization}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="font-medium">
                📅 {formatDate(appointment.date)} at {appointment.time}
              </span>
            </div>
            {appointment.venue && (
              <p className="text-sm text-blue-600">📍 {appointment.venue}</p>
            )}
            
            {/* Booking Status */}
            {appointment.isBooked ? (
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                  ✅ Booked
                </Badge>
                {appointment.memberName && (
                  <span className="text-sm text-green-600">
                    by: {appointment.memberName}
                  </span>
                )}
              </div>
            ) : (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                📅 Available
              </Badge>
            )}
            
            {/* Phone number visibility */}
            {appointment.phone && (isUserAppointment || canEdit) && (
              <p className="text-sm text-gray-600">
                📞 {appointment.phone}
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-2 sm:ml-4">
              {canBook && (
                <Button 
                  onClick={() => onBook && onBook(appointment._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Book Appointment
                </Button>
              )}
              
              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdate && onUpdate(appointment)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete && onDelete(appointment._id)}
                  >
                    Delete
                  </Button>
                </>
              )}

              {appointment.isBooked && !canEdit && !isUserAppointment && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  Booked
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
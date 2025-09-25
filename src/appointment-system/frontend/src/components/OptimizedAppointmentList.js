import React, { useMemo } from 'react';
import { AppointmentCard } from './AppointmentCard';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export function OptimizedAppointmentList({
  appointments = [],
  user,
  currentPage = 1,
  itemsPerPage = 20,
  onBook,
  onUpdate,
  onDelete,
  onPageChange,
  emptyMessage = "No appointments found",
  showPagination = true
}) {
  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    try {
      if (!Array.isArray(appointments)) {
        console.warn('OptimizedAppointmentList: appointments is not an array:', appointments);
        return {
          paginatedItems: [],
          totalPages: 1,
          startIndex: 0,
          endIndex: 0,
          totalItems: 0
        };
      }

      const totalItems = appointments.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
      const paginatedItems = appointments.slice(startIndex, endIndex);

      return {
        paginatedItems,
        totalPages,
        startIndex,
        endIndex,
        totalItems
      };
    } catch (error) {
      console.error('Error in OptimizedAppointmentList pagination:', error);
      return {
        paginatedItems: [],
        totalPages: 1,
        startIndex: 0,
        endIndex: 0,
        totalItems: 0
      };
    }
  }, [appointments, currentPage, itemsPerPage]);

  const { paginatedItems, totalPages, startIndex, endIndex, totalItems } = paginationData;

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalItems === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results info */}
      {showPagination && totalItems > itemsPerPage && (
        <div className="text-sm text-gray-600 text-center">
          Showing {startIndex + 1} to {endIndex} of {totalItems} appointments
        </div>
      )}

      {/* Appointment cards */}
      <div className="space-y-4">
        {paginatedItems.map((appointment) => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
            user={user}
            onBook={onBook}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-hover"
          >
            ← Previous
          </Button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {pageNumbers.map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange && onPageChange(pageNum)}
                className="btn-hover"
              >
                {pageNum}
              </Button>
            ))}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-hover"
          >
            Next →
          </Button>
        </div>
      )}

      {/* Performance indicator for large datasets */}
      {totalItems > 100 && (
        <div className="text-xs text-gray-400 text-center pt-2">
          Large dataset ({totalItems} items) - pagination enabled for optimal performance
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from 'react';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    onDateChange(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow p-3">
      <button 
        onClick={goToPreviousDay}
        className="p-2 rounded-md hover:bg-gray-100"
      >
        &lt; Previous
      </button>
      
      <div className="flex flex-col items-center">
        <span className="text-xl font-semibold">{formatDate(selectedDate)}</span>
        <button 
          onClick={goToToday}
          className="text-sm text-blue-500 hover:underline mt-1"
        >
          Today
        </button>
      </div>
      
      <button 
        onClick={goToNextDay}
        className="p-2 rounded-md hover:bg-gray-100"
      >
        Next &gt;
      </button>
    </div>
  );
} 
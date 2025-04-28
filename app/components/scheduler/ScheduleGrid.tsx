"use client";

import { useState, useRef, useEffect } from "react";

// Types for our schedule data
interface Employee {
  id: string;
  name: string;
  role?: string;
}

interface Shift {
  employeeId: string;
  startHour: number;
  endHour: number;
  role?: string;
}

interface ScheduleGridProps {
  employees: Employee[];
}

export default function ScheduleGrid({ employees }: ScheduleGridProps) {
  // Hours from 6am to 8pm (6, 7, 8, ..., 20)
  const hours = Array.from({ length: 15 }, (_, i) => i + 6);
  
  // State for tracking shifts
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  // State for tracking drag operation
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ employeeId: string, hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ employeeId: string, hour: number } | null>(null);
  
  // State for showing shift details
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  
  // Handle mouse down to start dragging
  const handleMouseDown = (employeeId: string, hour: number) => {
    // Check if there's already a shift at this position
    const existingShift = getShiftForCell(employeeId, hour);
    
    if (existingShift) {
      // Set as active shift for editing
      setActiveShift(existingShift);
      return;
    }
    
    setIsDragging(true);
    setDragStart({ employeeId, hour });
    setDragEnd({ employeeId, hour });
    setActiveShift(null);
  };
  
  // Handle mouse move during dragging
  const handleMouseMove = (employeeId: string, hour: number) => {
    if (isDragging && dragStart && dragStart.employeeId === employeeId) {
      setDragEnd({ employeeId, hour });
    }
  };
  
  // Handle mouse up to end dragging and create a shift
  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      // Ensure start hour is before end hour
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1; // +1 because end hour is exclusive
      
      // Get employee role
      const employee = employees.find(emp => emp.id === dragStart.employeeId);
      
      // Create new shift
      const newShift = {
        employeeId: dragStart.employeeId,
        startHour,
        endHour,
        role: employee?.role
      };
      
      // Add to shifts, removing any overlapping shifts for the same employee
      setShifts(prevShifts => {
        const filteredShifts = prevShifts.filter(shift => 
          shift.employeeId !== dragStart?.employeeId || 
          (shift.endHour <= startHour || shift.startHour >= endHour)
        );
        return [...filteredShifts, newShift];
      });
      
      // Reset drag state
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      
      // Set as active shift for potential editing
      setActiveShift(newShift);
    }
  };
  
  // Set up global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, dragEnd]);
  
  // Helper to check if a cell is part of the current drag operation
  const isDraggingOver = (employeeId: string, hour: number) => {
    if (!isDragging || !dragStart || !dragEnd || dragStart.employeeId !== employeeId) return false;
    
    const minHour = Math.min(dragStart.hour, dragEnd.hour);
    const maxHour = Math.max(dragStart.hour, dragEnd.hour);
    
    return hour >= minHour && hour <= maxHour;
  };
  
  // Helper to check if a cell has a shift
  const getShiftForCell = (employeeId: string, hour: number) => {
    return shifts.find(shift => 
      shift.employeeId === employeeId && 
      hour >= shift.startHour && 
      hour < shift.endHour
    );
  };
  
  // Format hour display (convert 24h to 12h format)
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}${period}`;
  };
  
  // Delete a shift
  const handleDeleteShift = () => {
    if (activeShift) {
      setShifts(shifts.filter(shift => 
        shift.employeeId !== activeShift.employeeId || 
        shift.startHour !== activeShift.startHour || 
        shift.endHour !== activeShift.endHour
      ));
      setActiveShift(null);
    }
  };
  
  // Determine if a cell is the first cell in a shift for label rendering
  const isFirstCellOfShift = (employeeId: string, hour: number) => {
    const shift = getShiftForCell(employeeId, hour);
    return shift && shift.startHour === hour;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="w-40 p-2 border bg-gray-100">Employee</th>
              {hours.map(hour => (
                <th key={hour} className="w-16 p-2 border bg-gray-100">
                  {formatHour(hour)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id}>
                <td className="p-2 border font-medium">
                  {employee.name}
                  {employee.role && (
                    <div className="text-xs text-gray-500">{employee.role}</div>
                  )}
                </td>
                {hours.map(hour => {
                  const shift = getShiftForCell(employee.id, hour);
                  const isDraggingCell = isDraggingOver(employee.id, hour);
                  const isFirstCell = isFirstCellOfShift(employee.id, hour);
                  
                  return (
                    <td 
                      key={hour}
                      className={`p-0 border relative ${
                        shift ? 'bg-blue-500 text-white' : 
                        isDraggingCell ? 'bg-blue-300' : 'bg-white hover:bg-gray-100'
                      }`}
                      onMouseDown={() => handleMouseDown(employee.id, hour)}
                      onMouseMove={() => handleMouseMove(employee.id, hour)}
                      style={{ cursor: isDragging ? 'grabbing' : shift ? 'pointer' : 'cell' }}
                    >
                      <div className="w-full h-12 flex items-center justify-center">
                        {isFirstCell && shift && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {formatHour(shift.startHour)} - {formatHour(shift.endHour)}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {activeShift && (
        <div className="bg-gray-100 p-3 rounded-lg border mt-4">
          <h3 className="font-medium mb-2">Shift Details</h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Employee:</span> {employees.find(e => e.id === activeShift.employeeId)?.name}
            </p>
            <p>
              <span className="font-medium">Time:</span> {formatHour(activeShift.startHour)} - {formatHour(activeShift.endHour)}
            </p>
            <p>
              <span className="font-medium">Hours:</span> {activeShift.endHour - activeShift.startHour}
            </p>
          </div>
          <div className="mt-3 flex space-x-2">
            <button 
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              onClick={handleDeleteShift}
            >
              Delete Shift
            </button>
            <button 
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              onClick={() => setActiveShift(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
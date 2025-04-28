"use client";

import { useState } from 'react';
import ScheduleGrid from "@/app/components/scheduler/ScheduleGrid";
import DatePicker from "@/app/components/scheduler/DatePicker";
import EmployeeList, { Employee } from "@/app/components/scheduler/EmployeeList";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "1", name: "John Smith", role: "Teller" },
    { id: "2", name: "Sarah Johnson", role: "Customer Service" },
    { id: "3", name: "Michael Brown", role: "Branch Manager" },
  ]);

  const handleAddEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Branch Schedule</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Schedule
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Auto-Schedule
          </button>
        </div>
      </div>

      <DatePicker 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <EmployeeList 
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
          />
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Schedule Options</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Copy Previous Day
              </button>
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Clear Schedule
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Daily Schedule</h2>
            <p className="text-sm text-gray-500 mb-4">
              Click and drag to create shifts. Click on existing shifts to edit or remove.
            </p>
            <ScheduleGrid employees={employees} />
          </div>
        </div>
      </div>
    </div>
  );
}
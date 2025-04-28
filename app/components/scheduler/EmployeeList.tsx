"use client";

import { useState } from 'react';

export interface Employee {
  id: string;
  name: string;
  role?: string;
}

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onRemoveEmployee: (employeeId: string) => void;
}

export default function EmployeeList({ 
  employees, 
  onAddEmployee, 
  onRemoveEmployee 
}: EmployeeListProps) {
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      const newEmployee: Employee = {
        id: Date.now().toString(), // Simple ID generation
        name: newEmployeeName.trim(),
        role: newEmployeeRole.trim() || undefined
      };
      onAddEmployee(newEmployee);
      setNewEmployeeName('');
      setNewEmployeeRole('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Team Members</h2>
      
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Employee name"
          className="flex-1 p-2 border rounded"
          value={newEmployeeName}
          onChange={(e) => setNewEmployeeName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Role (optional)"
          className="flex-1 p-2 border rounded"
          value={newEmployeeRole}
          onChange={(e) => setNewEmployeeRole(e.target.value)}
        />
        <button
          onClick={handleAddEmployee}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      
      <div>
        {employees.length === 0 ? (
          <p className="text-gray-500 italic">No employees added yet.</p>
        ) : (
          <ul className="space-y-2">
            {employees.map(employee => (
              <li key={employee.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">{employee.name}</span>
                  {employee.role && (
                    <span className="text-gray-500 ml-2 text-sm">({employee.role})</span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveEmployee(employee.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 
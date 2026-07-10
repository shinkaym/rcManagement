import type { Employee } from '@/features/employee/model/employee.types';

const mockEmployeeTimestamp = '2026-07-02T00:00:00.000Z';

const employeeNotes = [
  'Keeps the team aligned and helps daily operations stay smooth.',
  'Supports guests carefully and follows up on customer requests.',
  'Reliable team member with strong attention to service details.',
  'Handles busy shifts well and communicates clearly with the team.',
  'Trusted support for day-to-day work and internal coordination.',
] as const;

const firstNames = ['David', 'Emily', 'Sarah', 'Linh', 'Minh', 'Anna', 'Jason', 'Thao', 'Kevin', 'Mai'] as const;

const lastNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Bui', 'Do', 'Huynh', 'Dang'] as const;

export const employeeMockData: Employee[] = Array.from({ length: 30 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index * 3) % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const normalizedFirstName = firstName.toLowerCase();
  const normalizedLastName = lastName.toLowerCase();

  return {
    id: `employee-${index + 1}`,
    name,
    email: `${normalizedFirstName}.${normalizedLastName}@rcmanage.app`,
    phone: `(+84) 90${(index + 2).toString().padStart(2, '0')} ${(index * 37 + 124).toString().padStart(3, '0')} ${(index * 53 + 412).toString().padStart(3, '0')}`,
    note: employeeNotes[index % employeeNotes.length],
    status: index % 5 === 0 ? 'INACTIVE' : 'ACTIVE',
    createdAt: mockEmployeeTimestamp,
    updatedAt: mockEmployeeTimestamp,
  };
});

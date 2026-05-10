import type { Company, Employee } from "@/lib/types";

export function generateSifFile({
  company,
  employees,
  month,
}: {
  company: Company;
  employees: Employee[];
  month: string;
}) {
  const totalAmount = employees.reduce((sum, employee) => sum + employee.salary, 0);

  const header = [
    "SCR",
    company.wpsEstablishmentId,
    company.name,
    company.bankCode,
    month,
    employees.length,
    totalAmount.toFixed(2),
  ].join("|");

  const details = employees.map((employee, index) =>
    [
      "EDR",
      index + 1,
      employee.employeeNumber,
      employee.name,
      employee.iban,
      employee.basicSalary.toFixed(2),
      (employee.salary - employee.basicSalary).toFixed(2),
      "0.00",
      employee.salary.toFixed(2),
    ].join("|"),
  );

  return [header, ...details].join("\n");
}
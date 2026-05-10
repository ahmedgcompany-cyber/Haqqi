import { calculateGratuity } from "@/features/calculators/gratuity";
import type { SettlementInput, SettlementResult } from "@/lib/types";

export function calculateSettlement(input: SettlementInput): SettlementResult {
  const gratuity = calculateGratuity(input).amount;
  const leaveEncashment = (input.monthlySalary / 30) * input.unusedLeaveDays;
  const noticePay = (input.monthlySalary / 30) * input.noticeDays;
  const pendingSalary = (input.monthlySalary / 30) * input.pendingSalaryDays;

  return {
    gratuity,
    leaveEncashment,
    noticePay,
    pendingSalary,
    deductions: input.deductions,
    total: gratuity + leaveEncashment + noticePay + pendingSalary - input.deductions,
  };
}
"use client";

import { jsPDF } from "jspdf";
import type { Locale } from "@/lib/i18n";
import type { Employee, SettlementResult } from "@/lib/types";

export function createSettlementPdf({
  employee,
  result,
  locale,
}: {
  employee: Employee;
  result: SettlementResult;
  locale: Locale;
}) {
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Haqqi Final Settlement", 40, 50);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("تسوية نهاية الخدمة", 40, 72);
  pdf.text(`Employee: ${employee.name}`, 40, 110);
  pdf.text(`Employee Number: ${employee.employeeNumber}`, 40, 130);
  pdf.text(`Locale: ${locale}`, 40, 150);

  const rows = [
    ["Gratuity", "المكافأة", result.gratuity],
    ["Unused leave", "رصيد الإجازة", result.leaveEncashment],
    ["Notice pay", "بدل الإشعار", result.noticePay],
    ["Pending salary", "راتب مستحق", result.pendingSalary],
    ["Deductions", "الاستقطاعات", -result.deductions],
    ["Total", "الإجمالي", result.total],
  ];

  let y = 200;
  rows.forEach(([english, arabic, amount]) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(String(english), 40, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(arabic), 240, y);
    pdf.text(String(Number(amount).toFixed(2)), 470, y);
    y += 28;
  });

  pdf.save(`haqqi-settlement-${employee.employeeNumber}.pdf`);
}
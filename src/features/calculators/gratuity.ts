import type { Country, GratuityInput, GratuityResult } from "@/lib/types";

function capToTwoYearsWages(amount: number, basicSalary: number) {
  return Math.min(amount, basicSalary * 24);
}

function fullServiceAward(basicSalary: number, yearsOfService: number) {
  const dailyRate = basicSalary / 30;
  const firstFiveYears = Math.min(yearsOfService, 5);
  const remainingYears = Math.max(yearsOfService - 5, 0);

  return dailyRate * 21 * firstFiveYears + dailyRate * 30 * remainingYears;
}

function gulfAward(country: Country, basicSalary: number, yearsOfService: number) {
  const dailyRate = basicSalary / 30;

  switch (country) {
    case "Qatar":
      return dailyRate * 21 * yearsOfService;
    case "Bahrain":
    case "Oman": {
      const firstThreeYears = Math.min(yearsOfService, 3);
      const remainingYears = Math.max(yearsOfService - 3, 0);
      return dailyRate * 15 * firstThreeYears + dailyRate * 30 * remainingYears;
    }
    case "Kuwait": {
      const firstFiveYears = Math.min(yearsOfService, 5);
      const remainingYears = Math.max(yearsOfService - 5, 0);
      return Math.min(
        dailyRate * 15 * firstFiveYears + dailyRate * 30 * remainingYears,
        basicSalary * 18,
      );
    }
    default:
      return 0;
  }
}

export function calculateGratuity(input: GratuityInput): GratuityResult {
  const { basicSalary, country, monthlySalary, terminationReason, yearsOfService } = input;
  const dailyRate = basicSalary / 30;
  const explanation: string[] = [];

  if (yearsOfService < 1 && country !== "Saudi Arabia") {
    explanation.push("Service under one year is not eligible for statutory gratuity.");
    return {
      amount: 0,
      dailyRate,
      explanation,
      eligible: false,
      legalReference: "Minimum service threshold",
    };
  }

  if (country === "UAE") {
    const amount = capToTwoYearsWages(
      fullServiceAward(basicSalary, yearsOfService),
      basicSalary,
    );

    explanation.push(
      "UAE private sector formula uses 21 basic-wage days per year for the first five years and 30 days thereafter.",
      "The result is capped at two years of basic wage.",
      "Under the post-2022 framework, resignation and termination both retain gratuity after one year of service.",
    );

    return {
      amount,
      dailyRate,
      explanation,
      eligible: true,
      legalReference: "UAE Labour Law Federal Decree-Law No. 33 of 2021",
    };
  }

  if (country === "Saudi Arabia") {
    const baseAward =
      monthlySalary * 0.5 * Math.min(yearsOfService, 5) +
      monthlySalary * Math.max(yearsOfService - 5, 0);

    let multiplier = 1;

    if (terminationReason === "employee_resignation") {
      if (yearsOfService < 2) {
        multiplier = 0;
      } else if (yearsOfService < 5) {
        multiplier = 1 / 3;
      } else if (yearsOfService < 10) {
        multiplier = 2 / 3;
      }
    }

    explanation.push(
      "Saudi gratuity grants half a month of wage for each of the first five years and one full month thereafter.",
      "Employee resignation reduces entitlement to one-third after 2–5 years, two-thirds after 5–10 years, and full after 10 years.",
    );

    return {
      amount: baseAward * multiplier,
      dailyRate: monthlySalary / 30,
      explanation,
      eligible: multiplier > 0,
      legalReference: "Saudi Labor Law Articles 84 and 85",
    };
  }

  const amount = gulfAward(country, basicSalary, yearsOfService);
  const legalReferenceMap: Record<Exclude<Country, "UAE" | "Saudi Arabia">, string> = {
    Kuwait: "Kuwait Labor Law private sector gratuity baseline",
    Qatar: "Qatar Labor Law Article 54 baseline",
    Bahrain: "Bahrain Labour Law baseline",
    Oman: "Oman Labour Law baseline",
  };

  explanation.push(
    "This regional preset uses the standard statutory baseline for the selected GCC jurisdiction.",
    "Country-specific edge cases can be refined later per company policy or legal counsel.",
  );

  return {
    amount,
    dailyRate,
    explanation,
    eligible: amount > 0,
    legalReference: legalReferenceMap[country],
  };
}
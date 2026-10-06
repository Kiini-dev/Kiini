/**
 * Kenyan Payroll Calculator - Tax and Deduction Calculations
 * Implements PAYE, NSSF, SHIF, and Housing Levy according to Kenya Revenue Authority (KRA) regulations
 * Last Updated: 2024
 */

export interface PayrollCalculationResult {
  basicSalary: number;
  grossSalary: number;
  
  // Deductions
  nssfContribution: number; // NSSF Tier 1 & 2
  payeeTax: number; // Pay As You Earn
  shifContribution: number; // Social Health Insurance Fund
  housingLevyDeduction: number; // Housing/Building Levy
  personalRelief: number; // Tax relief
  
  // Net
  netSalary: number;
  
  // Breakdown details
  details: {
    nssfTier1: number;
    nssfTier2: number;
    shifBasic: number;
    shifCapped: number;
    
    payeBeforeRelief: number;
    payeAfterRelief: number;
    
    taxableIncome: number;
    taxBracketApplied: string;
  };
}

export interface EmployeePayrollInfo {
  basicSalary: number;
  allowances?: number;
  housingAllowance?: number;
  nssf?: number; // Pre-filled NSSF if available
}

/**
 * PAYE Tax Brackets (2024 - Annual)
 * Progressive tax system based on gross salary
 */
const PAYE_TAX_BRACKETS = [
  { min: 0, max: 288000, rate: 0.10 }, // 10%
  { min: 288001, max: 388000, rate: 0.15 }, // 15%
  { min: 388001, max: 6000000, rate: 0.20 }, // 20%
  { min: 6000001, max: 9600000, rate: 0.25 }, // 25%
  { min: 9600001, max: Infinity, rate: 0.30 }, // 30%
];

/**
 * NSSF Contribution Rates (2024)
 */
const NSSF_RATES = {
  TIER_1_RATE: 0.06, // 6% - Tier 1
  TIER_1_MAX: 18000, // Max contribution from 300,000 salary
  TIER_2_RATE: 0.06, // 6% - Tier 2
  TIER_2_MIN_SALARY: 300001, // Tier 2 applies above this
};

/**
 * SHIF (Social Health Insurance Fund) Rates
 * Maximum contribution cap: 15,000 per month as of 2024
 */
const SHIF_RATES = {
  RATE: 0.025, // 2.5%
  MAX_MONTHLY: 15000, // Maximum monthly contribution
};

/**
 * Housing Levy Deduction
 * 1.5% of gross salary, capped at KES 15,000 per month
 */
const HOUSING_LEVY = {
  RATE: 0.015, // 1.5%
  MAX_MONTHLY: 15000,
};

/**
 * Personal Relief Amount (2024)
 * Fixed monthly relief to reduce tax burden
 */
const PERSONAL_RELIEF_MONTHLY = 2400; // Monthly personal relief

/**
 * Calculate NSSF Contribution (Tier 1 and Tier 2)
 */
function calculateNSSF(grossMonthlySalary: number): {
  tier1: number;
  tier2: number;
  total: number;
} {
  // Tier 1: 6% up to KES 18,000
  const tier1Contribution = Math.min(grossMonthlySalary * NSSF_RATES.TIER_1_RATE, NSSF_RATES.TIER_1_MAX);

  // Tier 2: 6% on salary above 300,000 (if applicable)
  let tier2Contribution = 0;
  if (grossMonthlySalary > NSSF_RATES.TIER_2_MIN_SALARY) {
    const tier2Salary = grossMonthlySalary - NSSF_RATES.TIER_2_MIN_SALARY;
    tier2Contribution = tier2Salary * NSSF_RATES.TIER_2_RATE;
  }

  return {
    tier1: Math.round(tier1Contribution),
    tier2: Math.round(tier2Contribution),
    total: Math.round(tier1Contribution + tier2Contribution),
  };
}

/**
 * Calculate SHIF Contribution
 */
function calculateSHIF(grossMonthlySalary: number): number {
  const shifContribution = grossMonthlySalary * SHIF_RATES.RATE;
  return Math.round(Math.min(shifContribution, SHIF_RATES.MAX_MONTHLY));
}

/**
 * Calculate Housing Levy
 */
function calculateHousingLevy(grossMonthlySalary: number): number {
  const levy = grossMonthlySalary * HOUSING_LEVY.RATE;
  return Math.round(Math.min(levy, HOUSING_LEVY.MAX_MONTHLY));
}

/**
 * Calculate PAYE Tax
 * Based on taxable income (gross salary - NSSF - Housing Levy)
 */
function calculatePAYE(taxableIncome: number): {
  tax: number;
  bracketApplied: string;
  beforeRelief: number;
  afterRelief: number;
} {
  // Annualize for tax calculation
  const annualTaxableIncome = taxableIncome * 12;

  let tax = 0;
  let bracketApplied = "";

  // Progressive tax calculation
  for (const bracket of PAYE_TAX_BRACKETS) {
    if (annualTaxableIncome > bracket.min) {
      const taxableInThisBracket = Math.min(annualTaxableIncome, bracket.max) - bracket.min;
      tax += taxableInThisBracket * bracket.rate;
      if (annualTaxableIncome <= bracket.max) {
        bracketApplied = `${(bracket.rate * 100).toFixed(0)}%`;
        break;
      }
    }
  }

  // Convert back to monthly
  const monthlyTax = Math.round(tax / 12);
  const personalRelief = Math.round(PERSONAL_RELIEF_MONTHLY);
  const taxAfterRelief = Math.max(0, monthlyTax - personalRelief);

  return {
    tax: monthlyTax,
    bracketApplied,
    beforeRelief: monthlyTax,
    afterRelief: taxAfterRelief,
  };
}

/**
 * Main calculation function for complete payroll
 * Converts cents to whole numbers for calculation, then back to cents for output
 */
export function calculateKenyanPayroll(payrollInfo: EmployeePayrollInfo): PayrollCalculationResult {
  // Convert from cents to whole numbers
  const basicSalary = payrollInfo.basicSalary / 100;
  const allowances = (payrollInfo.allowances || 0) / 100;
  const housingAllowance = (payrollInfo.housingAllowance || 0) / 100;

  // Gross Salary = Basic + Allowances
  const grossSalary = basicSalary + allowances;

  // Calculate statutory deductions
  const nssf = calculateNSSF(grossSalary);
  const shif = calculateSHIF(grossSalary);
  const housingLevy = calculateHousingLevy(grossSalary);

  // Taxable Income = Gross - NSSF - Housing Levy
  const taxableIncome = grossSalary - nssf.total - housingLevy;
  const payeCalculation = calculatePAYE(taxableIncome);

  // Net Salary Calculation
  const totalDeductions =
    nssf.total +
    payeCalculation.afterRelief +
    shif +
    housingLevy;

  const netSalary = grossSalary - totalDeductions;

  // Convert back to cents for storage/transmission
  return {
    basicSalary: Math.round(basicSalary * 100),
    grossSalary: Math.round(grossSalary * 100),
    
    // Deductions (in cents)
    nssfContribution: Math.round(nssf.total * 100),
    payeeTax: Math.round(payeCalculation.afterRelief * 100),
    shifContribution: Math.round(shif * 100),
    housingLevyDeduction: Math.round(housingLevy * 100),
    personalRelief: Math.round(PERSONAL_RELIEF_MONTHLY * 100),
    
    // Net (in cents)
    netSalary: Math.round(netSalary * 100),
    
    // Detailed breakdown
    details: {
      nssfTier1: Math.round(nssf.tier1 * 100),
      nssfTier2: Math.round(nssf.tier2 * 100),
      shifBasic: Math.round((grossSalary * SHIF_RATES.RATE) * 100),
      shifCapped: Math.round(shif * 100),
      payeBeforeRelief: Math.round(payeCalculation.beforeRelief * 100),
      payeAfterRelief: Math.round(payeCalculation.afterRelief * 100),
      taxableIncome: Math.round(taxableIncome * 100),
      taxBracketApplied: payeCalculation.bracketApplied,
    },
  };
}

/**
 * Calculate deductions breakdown for a payroll
 * Returns detailed breakdown of each deduction type
 */
export function getDeductionsBreakdown(calculation: PayrollCalculationResult) {
  return {
    nssf: {
      name: "NSSF (National Social Security Fund)",
      tier1: calculation.details.nssfTier1,
      tier2: calculation.details.nssfTier2,
      total: calculation.nssfContribution,
      description: "Tier 1 (6% up to 18,000) + Tier 2 (6% above 300,000)",
    },
    paye: {
      name: "PAYE (Pay As You Earn)",
      beforeRelief: calculation.details.payeBeforeRelief,
      personalRelief: calculation.personalRelief,
      afterRelief: calculation.payeeTax,
      taxBracket: calculation.details.taxBracketApplied,
      taxableIncome: calculation.details.taxableIncome,
      description: `Progressive tax on taxable income (${calculation.details.taxBracketApplied})`,
    },
    shif: {
      name: "SHIF (Social Health Insurance Fund)",
      rate: SHIF_RATES.RATE * 100,
      calculated: calculation.details.shifBasic,
      capped: calculation.details.shifCapped,
      total: calculation.shifContribution,
      description: `2.5% of gross (max ${SHIF_RATES.MAX_MONTHLY.toLocaleString()})`,
    },
    housingLevy: {
      name: "Housing Levy (Building Levy)",
      rate: HOUSING_LEVY.RATE * 100,
      total: calculation.housingLevyDeduction,
      description: `1.5% of gross (max ${HOUSING_LEVY.MAX_MONTHLY.toLocaleString()})`,
    },
  };
}

/**
 * Format payroll calculation for display
 */
export function formatPayrollDisplay(calculation: PayrollCalculationResult) {
  const formatKES = (cents: number) => {
    const ksh = cents / 100;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(ksh);
  };

  return {
    basicSalary: formatKES(calculation.basicSalary),
    grossSalary: formatKES(calculation.grossSalary),
    nssfContribution: formatKES(calculation.nssfContribution),
    payeeTax: formatKES(calculation.payeeTax),
    shifContribution: formatKES(calculation.shifContribution),
    housingLevyDeduction: formatKES(calculation.housingLevyDeduction),
    personalRelief: formatKES(calculation.personalRelief),
    netSalary: formatKES(calculation.netSalary),
  };
}

/**
 * Calculate year-to-date totals for a list of monthly payrolls
 */
export function calculateYTDTotals(calculations: PayrollCalculationResult[]) {
  const totals = calculations.reduce(
    (acc, calc) => ({
      grossSalary: acc.grossSalary + calc.grossSalary,
      nssfContribution: acc.nssfContribution + calc.nssfContribution,
      payeeTax: acc.payeeTax + calc.payeeTax,
      shifContribution: acc.shifContribution + calc.shifContribution,
      housingLevy: acc.housingLevy + calc.housingLevyDeduction,
      netSalary: acc.netSalary + calc.netSalary,
    }),
    {
      grossSalary: 0,
      nssfContribution: 0,
      payeeTax: 0,
      shifContribution: 0,
      housingLevy: 0,
      netSalary: 0,
    }
  );

  return totals;
}

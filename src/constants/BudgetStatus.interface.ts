export interface BudgetStatus {
  month: string;
  total?: {
    budget?: number;
    spent: number;
    remaining?: number;
    usedPct?: number;
    alert?: 'NEAR' | 'OVER';
  };
  categories: Array<{
    name: string;
    budget?: number;
    spent: number;
    remaining?: number;
    usedPct?: number;
    alert?: 'NEAR' | 'OVER';
  }>;
  totals: { income: number; expense: number; net: number }; // คำนวณสุทธิ
  prevCompare?: {
    // เทียบเดือนก่อน
    incomeChangePct: number;
    expenseChangePct: number;
    netChangePct: number;
  };
}

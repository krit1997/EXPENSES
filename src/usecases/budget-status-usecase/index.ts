export class BudgetRequest {
  month?: string;
  opts?: {
    userId?: string;
    alertNear?: number;
    alertOver?: number;
    withPrev?: boolean;
  };
}

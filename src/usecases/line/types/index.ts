export interface HandleEventRequest {
  ev: IsUserMessageEventRequest;
  replyTasks: Promise<any>[];
  sideTasks: Promise<any>[];
}

export interface TextMessage {
  type: 'text';
  text: string;
}

export interface IsUserMessageEventRequest {
  type: string;
  source: {
    type: string;
    userId: string;
  };
  replyToken: string;
  message?: TextMessage;
}

export interface ValidateSignatureRequest {
  bodyText: string;
  secret: string;
  signature: string;
}

export type Parsed = {
  item?: string;
  amount?: number | null;
  when?: Date;
  merchant?: string;
  type: string;
  category?: string;
  subcategory?: string;
};

export const AMOUNT_LABELS = [
  String.raw`จำนวน(?!\s*รายการ)`,
  'ยอดเงิน',
  'ยอดโอน',
  'ยอดชำระ',
  'ยอดรวม',
  'รวมสุทธิ',
  'รวมทั้งสิ้น',
  'amount',
  'total',
  'paid',
  'payment',
] as const;

export const BAD_LABELS = [
  'เลขที่รายการ',
  'หมายเลขรายการ',
  'อ้างอิง',
  'เลขที่อ้างอิง',
  'reference',
  String.raw`\bref\b`,
  'รหัส',
  'code',
  'หมายเลข',
  'เบอร์',
  'โทร',
  'บัญชี',
  'account',
  'เวลา',
  'วันที่',
] as const;

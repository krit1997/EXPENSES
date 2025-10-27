export type TypeKind = 'income' | 'expense' | 'unknown';

export const TYPE_KEYWORDS: Record<TypeKind, string[]> = {
  income: [
    'โอนเข้า',
    'รับมา',
    'ได้เงิน',
    'รายรับ',
    'เงินเดือน',
    'ขายได้',
    'ทอน',
    'refund',
    'คืนเงิน',
    'รายได้',
  ],
  expense: [
    'ซื้อ',
    'จ่าย',
    'ค่า',
    'เติม',
    'โอนออก',
    'ผ่อน',
    'หัก',
    'รายจ่าย',
    'สั่ง',
    'จอง',
    'กิน',
    'กาแฟ',
    'ข้าว',
    'ค่าขนม',
  ],
  unknown: [],
};

export interface CategoryRule {
  name: string; // หมวด
  sub?: string; // ย่อย (optional)
  kw: string[]; // คีย์เวิร์ด
  type?: TypeKind; // บังคับเป็นรายรับ/รายจ่าย ถ้าตรง
}

export const CATEGORY_RULES: CategoryRule[] = [
  // อาหาร/เครื่องดื่ม
  {
    name: 'อาหาร',
    sub: 'อาหารคาว',
    kw: ['ข้าว', 'ก๋วยเตี๋ยว', 'ส้มตำ', 'หมูกรอบ', 'อาหารกลางวัน'],
    type: 'expense',
  },
  {
    name: 'อาหาร',
    sub: 'เครื่องดื่ม',
    kw: ['กาแฟ', 'ชา', 'น้ำ', 'นม', 'ชานม', 'โคล่า'],
    type: 'expense',
  },

  // เดินทาง
  {
    name: 'เดินทาง',
    sub: 'แท็กซี่',
    kw: ['แท็กซี่', 'taxi', 'แกร็บคาร์', 'grab'],
    type: 'expense',
  },
  {
    name: 'เดินทาง',
    sub: 'น้ำมัน',
    kw: ['น้ำมัน', 'เติมน้ำมัน', 'ปตท.', 'บางจาก'],
    type: 'expense',
  },
  {
    name: 'เดินทาง',
    sub: 'รถไฟฟ้า',
    kw: ['bts', 'mrt', 'รถไฟฟ้า', 'บีทีเอส'],
    type: 'expense',
  },

  // บิลบ้าน
  {
    name: 'สาธารณูปโภค',
    sub: 'ไฟฟ้า',
    kw: ['ค่าไฟ', 'ไฟฟ้า', 'mea'],
    type: 'expense',
  },
  {
    name: 'สาธารณูปโภค',
    sub: 'น้ำประปา',
    kw: ['ค่าน้ำ', 'ประปา', 'mwa'],
    type: 'expense',
  },
  {
    name: 'สาธารณูปโภค',
    sub: 'อินเทอร์เน็ต',
    kw: ['เน็ตบ้าน', 'ค่าเน็ต', 'ais fibre', 'true online', '3bb'],
    type: 'expense',
  },

  // รายรับ
  {
    name: 'รายรับ',
    sub: 'เงินเดือน',
    kw: ['เงินเดือน', 'salary', 'payroll'],
    type: 'income',
  },
  {
    name: 'รายรับ',
    sub: 'โอน/รับเงิน',
    kw: ['โอนเข้า', 'รับเงิน', 'รับตัง', 'refund', 'คืนเงิน'],
    type: 'income',
  },

  // ทั่วไป
  {
    name: 'ทั่วไป',
    kw: ['ของใช้', 'อุปกรณ์', 'ช็อป', 'ซื้อของ'],
    type: 'expense',
  },
];

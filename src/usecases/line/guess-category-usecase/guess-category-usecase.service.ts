import { Injectable } from '@nestjs/common';

@Injectable()
export class GuessCategoryUsecaseService {
  async execute(
    text: string,
  ): Promise<{ category?: string; subcategory?: string }> {
    const t = text.toLowerCase();
    if (/ค่าไฟ|ไฟฟ้า/.test(t))
      return { category: 'สาธารณูปโภค', subcategory: 'ไฟฟ้า' };
    if (/ค่าน้ำ/.test(t))
      return { category: 'สาธารณูปโภค', subcategory: 'น้ำประปา' };
    if (/น้ำมัน|เชื้อเพลิง|fuel|gas/.test(t))
      return { category: 'เดินทาง', subcategory: 'น้ำมัน' };
    if (/กาแฟ|ร้านอาหาร|อาหาร|coffee|cafe|amazon|starbucks|7-?eleven/.test(t))
      return { category: 'อาหาร', subcategory: 'เครื่องดื่ม' };
    if (/เงินเดือน|salary|โบนัส/.test(t))
      return { category: 'รายรับ', subcategory: 'เงินเดือน' };
    return {};
  }
}

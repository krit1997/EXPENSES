import { Injectable } from '@nestjs/common';
import { Parsed } from '../types';

@Injectable()
export class BuildConfirmMessageUsecaseService {
  async execute(p: Parsed): Promise<string> {
    const lines: string[] = [];
    lines.push('บันทึกสลิปเรียบร้อย ✅');
    if (p.merchant) lines.push(`ร้าน/ผู้รับ: ${p.merchant}`);
    if (p.item) lines.push(`รายการ: ${p.item}`);
    if (p.amount != null) lines.push(`จำนวน: ${p.amount}`);
    if (p.when)
      lines.push(
        `วันที่: ${p.when.toISOString().replaceAll('T', ' ').slice(0, 16)}Z`,
      );
    lines.push('(ถ้าข้อมูลไม่ตรง พิมพ์แก้ได้ เช่น "แก้จำนวน 118")');
    return lines.join('\n');
  }
}

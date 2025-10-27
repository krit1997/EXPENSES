// src/modules/line/line.service.ts
import { Client, MiddlewareConfig } from '@line/bot-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeKind } from '../../constants/classify.rule';
import { SheetsService } from '../sheets/sheets.service';

import { ImageAnnotatorClient } from '@google-cloud/vision';
import * as fs from 'fs';
import sharp from 'sharp';

@Injectable()
export class LineService {
  public readonly client: Client;
  public readonly middlewareConfig: MiddlewareConfig;
  private readonly vision: ImageAnnotatorClient;

  constructor(
    private readonly sheets: SheetsService,
    private readonly config: ConfigService,
  ) {
    const token = this.config.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
    const secret = this.config.get<string>('LINE_CHANNEL_SECRET');
    if (!token) throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN');
    if (!secret) throw new Error('Missing LINE_CHANNEL_SECRET');

    this.middlewareConfig = { channelSecret: secret };
    this.client = new Client({ channelAccessToken: token });

    // ใช้ service-account จากไฟล์ และดึง project_id ตรงจากไฟล์
    const keyFile = this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (!keyFile) throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS');
    const raw = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    const { client_email, private_key, project_id } = raw;
    if (!client_email || !private_key || !project_id) {
      throw new Error('Invalid service account key file');
    }
    this.vision = new ImageAnnotatorClient({
      credentials: { client_email, private_key },
      projectId: project_id,
    });
  }

  // ---------- PUBLIC: used by controller ----------

  parseText(text: string): { item: string; amount: number | null } {
    const norm = this.normalizeThai(text);
    const { stripped } = this.extractWhen(norm);
    const moneyRe = /[+-]?\d+(?:\.\d{1,2})?\b/g;
    const nums = (stripped.match(moneyRe) ?? []).map(Number);
    const amount = nums.length
      ? Math.max(...nums.map((n) => Math.abs(n)))
      : null;
    const item =
      stripped.replace(moneyRe, ' ').replace(/\s+/g, ' ').trim() ||
      '(ไม่ทราบรายการ)';
    return { item, amount };
  }

  parseWhen(text: string): Date | undefined {
    return this.extractWhen(this.normalizeThai(text)).when;
  }

  guessType(text: string, amount: number | null): TypeKind {
    const t = text.toLowerCase();
    if (/[+]\d/.test(t) || /เงินเดือน|โบนัส|income|รายรับ/.test(t))
      return 'income' as TypeKind;
    if (amount != null) return 'expense' as TypeKind;
    return 'unknown' as TypeKind;
  }

  guessCategory(text: string): { category?: string; subcategory?: string } {
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

  async handleSlipImage(ev: any) {
    const userId = ev.source.userId;
    const messageId = ev.message.id;

    // A) ดาวน์โหลดรูปจาก LINE
    const stream = await this.client.getMessageContent(messageId);
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });
    const imgBuf = Buffer.concat(chunks);

    // B) Preprocess ภาพเพื่อ OCR
    const preprocessed = await sharp(imgBuf)
      .grayscale()
      .resize({ width: 1800, withoutEnlargement: true })
      .sharpen()
      .toBuffer();

    // C) OCR
    const [res] = await this.vision.documentTextDetection(preprocessed);
    const rawText = res.fullTextAnnotation?.text ?? '';
    console.log(
      '\n\n===== OCR RAW TEXT =====\n' +
        rawText +
        '\n========================\n',
    );
    // D) แปลงเป็นโครงข้อมูล
    const parsed = this.parseSlipText(rawText);

    // E) บันทึกชีต
    await this.saveToSheet({
      userId,
      displayName: '',
      rawText,
      item: parsed.item ?? 'จ่ายผ่านสลิป',
      amount: parsed.amount ?? null,
      type: parsed.type as TypeKind,
      category: parsed.category,
      subcategory: parsed.subcategory,
      when: parsed.when ?? null,
    });

    // F) แจ้งผล
    await this.client.pushMessage(userId, [
      { type: 'text', text: this.buildConfirmMessage(parsed) },
    ]);
  }

  async saveToSheet(opts: {
    userId: string;
    displayName?: string;
    rawText: string;
    item: string;
    amount: number | null;
    type?: TypeKind;
    category?: string;
    subcategory?: string;
    when?: Date | null;
  }) {
    const ts = (opts.when ?? new Date()).toISOString();
    await this.sheets.appendRow([
      ts,
      opts.userId,
      opts.displayName ?? '',
      opts.rawText,
      opts.type ?? '',
      opts.category ?? '',
      opts.subcategory ?? '',
      opts.item,
      opts.amount ?? null,
    ]);
  }

  logLineError = (err: any) => {
    console.error('[LINE ERROR STATUS]', err?.originalError?.response?.status);
    console.error('[LINE ERROR DATA]', err?.originalError?.response?.data);
  };

  // ---------- INTERNAL: OCR parsing ----------

  private normalizeThai(s: string) {
    return (
      s
        .replace(/[,\u200B]/g, ' ')
        // แปลงตัวเลขไทยเป็นอารบิก
        .replace(/[๐-๙]/g, (d) => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d).toString())
        // รวม U+0E4D (นิคหิต) + U+0E32 (า) → U+0E33 (ำ)  เช่น "จํานวน" → "จำนวน"
        .replace(/\u0E4D\u0E32/g, '\u0E33')
        .replace(/\r/g, '\n')
        // เก็บ \n ไว้ อย่าบีบทิ้ง
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .trim()
    );
  }

  /** ลบ date-time ออกและคืนค่า Date (dd/mm(-yy[yy]) hh:mm) */
  private extractWhen(text: string): { when?: Date; stripped: string } {
    const re =
      /\b(?<d>\d{1,2})[\/-](?<m>\d{1,2})(?:[\/-](?<y>\d{2,4}))?(?:\s+(?<hh>\d{1,2}):(?<mm>\d{2}))?\b/g;

    let m: RegExpExecArray | null;
    let when: Date | undefined;
    let stripped = text;

    while ((m = re.exec(text))) {
      const d = +m.groups!.d;
      const M = +m.groups!.m;
      const yRaw = m.groups!.y;
      const hh = m.groups!.hh ? +m.groups!.hh : 0;
      const mm = m.groups!.mm ? +m.groups!.mm : 0;
      const now = new Date();
      const y =
        yRaw == null
          ? now.getFullYear()
          : yRaw.length === 2
            ? 2000 + +yRaw
            : +yRaw;
      when = new Date(Date.UTC(y, M - 1, d, hh, mm, 0));

      // ลบเฉพาะ token ที่ตรง โดย "คง \n" ไว้
      stripped = stripped.replace(m[0], ' ');
    }

    // ทำความสะอาดช่องว่าง แต่ไม่แตะ \n
    stripped = stripped
      .replace(/[ \t]+/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .trim();

    return { when, stripped };
  }

  /** แปลง OCR → โครงข้อมูล (ใช้ amount picker แบบ context-aware) */
  private parseSlipText(text: string): {
    item?: string;
    amount?: number | null;
    when?: Date;
    merchant?: string;
    type: TypeKind;
    category?: string;
    subcategory?: string;
  } {
    const t0 = this.normalizeThai(text);
    const { when, stripped } = this.extractWhen(t0);

    const amount = this.pickAmountSmart(stripped);

    const merchant = this.pickMerchant(t0);
    const item =
      this.pickItemHint(t0) ||
      (merchant ? `ชำระที่ ${merchant}` : 'จ่ายผ่านสลิป');
    const type = (amount != null ? 'expense' : 'unknown') as TypeKind;
    const { category, subcategory } = this.guessCategory(item);

    return { item, amount, when, merchant, type, category, subcategory };
  }

  private buildConfirmMessage(p: {
    item?: string;
    amount?: number | null;
    when?: Date;
    merchant?: string;
  }) {
    const lines: string[] = [];
    lines.push('บันทึกสลิปเรียบร้อย ✅');
    if (p.merchant) lines.push(`ร้าน/ผู้รับ: ${p.merchant}`);
    if (p.item) lines.push(`รายการ: ${p.item}`);
    if (p.amount != null) lines.push(`จำนวน: ${p.amount}`);
    if (p.when)
      lines.push(
        `วันที่: ${p.when.toISOString().replace('T', ' ').slice(0, 16)}Z`,
      );
    lines.push('(ถ้าข้อมูลไม่ตรง พิมพ์แก้ได้ เช่น "แก้จำนวน 118")');
    return lines.join('\n');
  }

  // ---------- Amount extraction v2 (context-aware) ----------

  private toNumber(s: string): number {
    const t = s.replace(/\s/g, '');
    // มีทั้ง "," และ "." → คอมมาคือหลักพัน ให้ลบทิ้ง
    if (t.includes(',') && t.includes('.')) return Number(t.replace(/,/g, ''));
    // มีแต่ "," → ถือว่าเป็นทศนิยม
    if (t.includes(',') && !t.includes('.'))
      return Number(t.replace(/,/g, '.'));
    return Number(t);
  }

  /** ตัดเลขอ้างอิง/เลขยาว ๆ ออก (เช่น 20251025..., QR token, account no.) */
  private stripLongIds(s: string) {
    return (
      s
        // เลขยาว ≥7 หลักติดกัน (ไม่มีคั่น)
        .replace(/\b\d{7,}\b/g, ' ')
        // เลขที่มีคั่นหลักพันยาวเกิน (>= 3 กลุ่ม เช่น 1,234,567)
        .replace(/\b\d{1,3}(?:[ ,]\d{3}){2,}\b/g, ' ')
    );
  }

  /** คำบ่งชี้ "จำนวนเงิน" ที่พบบนสลิป (ไทย/อังกฤษ) */
  private AMOUNT_LABELS = [
    'จำนวน(?!\\s*รายการ)', // ไม่จับ "จำนวนรายการ"
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
  ];

  /** คำที่บอกว่า "อย่าเอาตัวเลขนี้" (เลขที่รายการ/อ้างอิง/รหัส ฯลฯ) */
  private BAD_LABELS = [
    'เลขที่รายการ',
    'หมายเลขรายการ',
    'อ้างอิง',
    'เลขที่อ้างอิง',
    'reference',
    '\\bref\\b',
    'รหัส',
    'code',
    'หมายเลข',
    'เบอร์',
    'โทร',
    'บัญชี',
    'account',
    'เวลา',
    'วันที่',
  ];

  /** เลือกจำนวนเงินโดยดูบริบทของ "ทั้งบรรทัด" แล้วให้คะแนน */
  private pickAmountSmart(text: string): number | null {
    const source = this.stripLongIds(text);
    const lines = source
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const numRe =
      /[+-]?(?:\d{1,3}(?:,\d{3})*(?:\.\d{1,2})|\d+(?:[.,]\d{1,2})?)/g;
    const amountLabelRe = new RegExp(this.AMOUNT_LABELS.join('|'), 'i');
    const badLabelRe = new RegExp(this.BAD_LABELS.join('|'), 'i');
    const currencyRe = /(บาท|thb)/i;

    type Cand = {
      n: number;
      hasAmountLabel: boolean;
      hasCurrency: boolean;
      hasDecimal: boolean;
      isBadContext: boolean;
    };

    const cands: Cand[] = [];

    for (const raw of lines) {
      const line = raw.replace(/[,\u200B]/g, ' ');
      const hasAmt = amountLabelRe.test(line);
      const hasCur = currencyRe.test(line);
      // ❗️อย่าปักธง bad ถ้าในบรรทัดเดียวกันมี amount/currency
      const isBad = badLabelRe.test(line) && !hasAmt && !hasCur;

      const matches = line.match(numRe) ?? [];
      for (const tok of matches) {
        const val = this.toNumber(tok);
        if (!(val > 0 && val < 1_000_000)) continue;
        if (val >= 1900 && val <= 2099) continue; // ปี

        cands.push({
          n: val,
          hasAmountLabel: hasAmt,
          hasCurrency: hasCur,
          hasDecimal: /\d[.,]\d{1,2}$/.test(tok),
          isBadContext: isBad,
        });
      }
    }

    if (!cands.length) return null;

    let best: Cand | null = null;
    let bestScore = -Infinity;

    for (const c of cands) {
      if (c.isBadContext) continue;
      let score = 0;
      if (c.hasAmountLabel) score += 100;
      if (c.hasCurrency) score += 50;
      if (c.hasDecimal) score += 20;
      score += Math.min(c.n / 100, 10);

      if (
        !c.hasAmountLabel &&
        !c.hasCurrency &&
        !c.hasDecimal &&
        c.n >= 1000 &&
        c.n < 10000
      ) {
        score -= 40;
      }

      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }

    return best ? best.n : null;
  }

  private pickMerchant(s: string): string | undefined {
    const first = s
      .split('\n')
      .map((l) => l.trim())
      .find((l) => /^[A-Za-zก-๙0-9&().\s\-]{3,}$/.test(l));
    return first?.slice(0, 40);
  }

  private pickItemHint(s: string): string | undefined {
    if (/ค่าไฟ|ไฟฟ้า/i.test(s)) return 'ค่าไฟ';
    if (/ค่าน้ำ/i.test(s)) return 'ค่าน้ำ';
    if (/เชลล์|ปตท|บางจาก|fuel|gas|diesel|แก๊สโซฮอล์/i.test(s))
      return 'เติมน้ำมัน';
    if (/7\-?eleven|cafe|coffee|amazon|starbucks|กาแฟ|ร้านอาหาร|food/i.test(s))
      return 'อาหาร/เครื่องดื่ม';
    return undefined;
  }
}

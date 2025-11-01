import { Injectable } from '@nestjs/common';
import { GuessCategoryUsecaseService } from '../guess-category-usecase/guess-category-usecase.service';
import { AMOUNT_LABELS, BAD_LABELS, Parsed } from '../types';

@Injectable()
export class ParseSlipTextUsecaseService {
  constructor(
    private readonly guessCategoryUsecaseService: GuessCategoryUsecaseService,
  ) {}

  async execute(text: string): Promise<Parsed> {
    const t0 = this.normalizeThai(text);
    const { when, stripped } = this.extractWhen(t0);
    const amount = this.pickAmountSmart(stripped);
    const merchant = this.pickMerchant(t0);
    const item =
      this.pickItemHint(t0) ||
      (merchant ? `ชำระที่ ${merchant}` : 'จ่ายผ่านสลิป');
    const type = amount == null ? 'unknown' : 'expense';
    const { category, subcategory } =
      await this.guessCategoryUsecaseService.execute(item);
    return {
      item,
      amount,
      when,
      merchant,
      type,
      category,
      subcategory,
    } as Parsed;
  }

  private normalizeThai(s: string) {
    return s
      .replaceAll(',', ' ')
      .replaceAll('\u200B', ' ')
      .replaceAll(/[๐-๙]/g, (d) => '๐๑๒๓๔๕๖๗๘๙'.indexOf(d).toString())
      .replaceAll('\u0E4D\u0E32', '\u0E33')
      .replaceAll('\r', '\n')
      .replaceAll(/[ \t]+\n/g, '\n')
      .replaceAll(/\n[ \t]+/g, '\n')
      .trim();
  }

  private extractWhen(text: string): { when?: Date; stripped: string } {
    const re =
      /\b(?<d>\d{1,2})[\\/-](?<m>\d{1,2})(?:[\\/-](?<y>\d{2,4}))?(?:\s+(?<hh>\d{1,2}):(?<mm>\d{2}))?\b/g;
    let m: RegExpExecArray | null;
    let when: Date | undefined;
    let stripped = text;
    while ((m = re.exec(text))) {
      if (!m.groups) continue;
      const d = +m.groups.d;
      const M = +m.groups.m;
      const yRaw = m.groups.y;
      const hh = m.groups.hh ? +m.groups.hh : 0;
      const mm = m.groups.mm ? +m.groups.mm : 0;
      const now = new Date();
      let y: number;
      if (yRaw == null) y = now.getFullYear();
      else if (yRaw.length === 2) y = 2000 + +yRaw;
      else y = +yRaw;
      when = new Date(Date.UTC(y, M - 1, d, hh, mm, 0));
      stripped = stripped.replaceAll(m[0], ' ');
    }
    stripped = stripped
      .replaceAll(/[ \t]+/g, ' ')
      .replaceAll(/[ \t]+\n/g, '\n')
      .replaceAll(/\n[ \t]+/g, '\n')
      .trim();
    return { when, stripped };
  }

  private pickAmountSmart(text: string): number | null {
    const source = this.stripLongIds(text);
    const lines = source
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const cands = this.getCandidatesFromLines(lines);
    return this.chooseBestCandidate(cands);
  }

  private stripLongIds(s: string) {
    return s
      .replaceAll(/\b\d{7,}\b/g, ' ')
      .replaceAll(/\b\d{1,3}(?:[ ,]\d{3}){2,}\b/g, ' ');
  }

  private getCandidatesFromLines(lines: string[]) {
    const numRe =
      /[+-]?(?:\d{1,3}(?:,\d{3})*(?:\.\d{1,2})|\d+(?:[.,]\d{1,2})?)/g;
    const amountLabelRe = new RegExp(AMOUNT_LABELS.join('|'), 'i');
    const badLabelRe = new RegExp(BAD_LABELS.join('|'), 'i');
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
      const line = raw.replaceAll(',', ' ').replaceAll('\u200B', ' ');
      const hasAmt = amountLabelRe.test(line);
      const hasCur = currencyRe.test(line);
      const isBad = badLabelRe.test(line) && !hasAmt && !hasCur;
      const matches = line.match(numRe) ?? [];
      for (const tok of matches) {
        const val = this.toNumber(tok);
        if (!(val > 0 && val < 1_000_000)) continue;
        if (val >= 1900 && val <= 2099) continue;
        cands.push({
          n: val,
          hasAmountLabel: hasAmt,
          hasCurrency: hasCur,
          hasDecimal: /\d[.,]\d{1,2}$/.test(tok),
          isBadContext: isBad,
        });
      }
    }
    return cands;
  }

  private chooseBestCandidate(
    cands: Array<{
      n: number;
      hasAmountLabel: boolean;
      hasCurrency: boolean;
      hasDecimal: boolean;
      isBadContext: boolean;
    }>,
  ) {
    if (!cands.length) return null;
    let best: (typeof cands)[0] | null = null;
    let bestScore = -Infinity;
    for (const c of cands) {
      if (c.isBadContext) continue;
      const score = this.scoreCandidate(c);
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best ? best.n : null;
  }

  private scoreCandidate(c: {
    n: number;
    hasAmountLabel: boolean;
    hasCurrency: boolean;
    hasDecimal: boolean;
    isBadContext: boolean;
  }) {
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
    )
      score -= 40;
    return score;
  }

  private toNumber(s: string): number {
    const t = s.replaceAll(/\s/g, '');
    if (t.includes(',') && t.includes('.'))
      return Number(t.replaceAll(',', ''));
    if (t.includes(',') && !t.includes('.'))
      return Number(t.replaceAll(',', '.'));
    return Number(t);
  }

  private pickMerchant(s: string): string | undefined {
    const first = s
      .split('\n')
      .map((l) => l.trim())
      .find((l) => /^[A-Za-zก-๙0-9&().\s-]{3,}$/.test(l));
    return first?.slice(0, 40);
  }

  private pickItemHint(s: string): string | undefined {
    if (/ค่าไฟ|ไฟฟ้า/i.test(s)) return 'ค่าไฟ';
    if (/ค่าน้ำ/i.test(s)) return 'ค่าน้ำ';
    if (/เชลล์|ปตท|บางจาก|fuel|gas|diesel|แก๊สโซฮอล์/i.test(s))
      return 'เติมน้ำมัน';
    if (/7-?eleven|cafe|coffee|amazon|starbucks|กาแฟ|ร้านอาหาร|food/i.test(s))
      return 'อาหาร/เครื่องดื่ม';
    return undefined;
  }
}

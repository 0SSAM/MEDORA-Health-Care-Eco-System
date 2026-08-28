/**
 * sync-engine.ts — محرك مزامنة عدم الاتصال (Offline-first) مشترك بين الخادم والعميل.
 * نمط Outbox + حل تعارض LWW (Last-Write-Wins بالطابع الزمني) — تنفيذ فعلي للتصميم
 * الموثق في docs/SYNC-DESIGN-2026-08-28.md
 */

export type SyncOp = "upsert" | "delete";

export interface Change<T = unknown> {
  entityType: string;
  entityId: string;
  op: SyncOp;
  payload: T | null;
  /** عداد محلي متصاعد */
  version: number;
  deviceId: string;
  /** طابع زمني epoch ms — أساس حل التعارض LWW */
  ts: number;
}

/** حلال تعارضات: آخر كتابة تفوز (LWW) */
export class ConflictResolver {
  resolveLww<T>(local: Change<T> | null, remote: Change<T> | null): Change<T> | null {
    if (!local) return remote;
    if (!remote) return local;
    return remote.ts >= local.ts ? remote : local;
  }
}

/** محرك مزامنة خفيف: صف انتظار محلي + دفع/سحب + دمج LWW */
export class SyncEngine<T = unknown> {
  private outbox: Change<T>[] = [];
  private readonly resolver = new ConflictResolver();

  constructor(
    private readonly deviceId: string,
    private readonly onPush?: (batch: Change<T>[]) => Promise<void>,
  ) {}

  /** إضافة تغيير محلي إلى صف الانتظار */
  enqueue(entityType: string, entityId: string, op: SyncOp, payload: T | null): Change<T> {
    const change: Change<T> = {
      entityType,
      entityId,
      op,
      payload,
      version: Date.now(),
      deviceId: this.deviceId,
      ts: Date.now(),
    };
    this.outbox.push(change);
    return change;
  }

  get pending(): Change<T>[] {
    return [...this.outbox];
  }

  /** دفع كل التغييرات المعلقة دفعة واحدة */
  async push(): Promise<void> {
    if (this.outbox.length === 0 || !this.onPush) return;
    const batch = this.outbox.splice(0);
    await this.onPush(batch);
  }

  /**
   * دمج التغييرات المحلية (قيد الانتظار) مع البعيدة (القادمة من الخادم) بحل LWW.
   * يعيد القائمة الموحدة مرتبة زمنيًا.
   */
  merge(local: Change<T>[] | null, remote: Change<T>[]): Change<T>[] {
    const map = new Map<string, Change<T>>();
    const key = (c: Change<T>) => `${c.entityType}:${c.entityId}`;
    for (const c of local ?? []) map.set(key(c), c);
    for (const c of remote) {
      const existing = map.get(key(c));
      map.set(key(c), this.resolver.resolveLww(existing ?? null, c) as Change<T>);
    }
    return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
  }
}

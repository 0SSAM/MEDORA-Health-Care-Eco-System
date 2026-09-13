import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { and, eq, gt, lt, asc } from 'drizzle-orm';
import { db } from '@/db';
import { demoSessions, demoRecords } from '@/db/schema';
import { initialRecords, defaultPreferences, moduleInfo, type Module, type Preferences } from '@/lib/demo';

export const dynamic = 'force-dynamic';
const cookieName = 'madar_demo_session';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function session(create = false) {
  const jar = await cookies();
  const id = jar.get(cookieName)?.value;
  if (id && uuidPattern.test(id)) {
    const [found] = await db.select().from(demoSessions).where(and(eq(demoSessions.id, id), gt(demoSessions.expiresAt, new Date())));
    if (found) return found;
  }
  if (!create) return null;
  await db.delete(demoSessions).where(lt(demoSessions.expiresAt, new Date()));
  const created = await db.transaction(async (tx) => {
    const [item] = await tx.insert(demoSessions).values({ preferences: defaultPreferences, expiresAt: new Date(Date.now() + 86400000) }).returning();
    await tx.insert(demoRecords).values(initialRecords.map(({ module, ...data }) => ({ sessionId: item.id, module, data })));
    return item;
  });
  jar.set(cookieName, created.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 });
  return created;
}
export async function GET() {
  try {
    const current = (await session(true))!;
    const rows = await db.select().from(demoRecords).where(eq(demoRecords.sessionId, current.id)).orderBy(asc(demoRecords.createdAt));
    return NextResponse.json({ records: rows.map(r => ({ ...r.data, id: r.id, module: r.module })), preferences: current.preferences, expiresAt: current.expiresAt }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Demo load failed', error);
    return NextResponse.json({ error: 'تعذر تحميل مساحة العرض. حاول مرة أخرى.' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (origin && new URL(origin).host !== host) return NextResponse.json({ error: 'طلب غير مسموح' }, { status: 403 });
    const current = await session();
    if (!current) return NextResponse.json({ error: 'انتهت الجلسة التجريبية. أعد تحميل الصفحة.' }, { status: 401 });
    const body = await request.json();
    if (body.action === 'reset') {
      await db.transaction(async tx => {
        await tx.delete(demoRecords).where(eq(demoRecords.sessionId, current.id));
        await tx.insert(demoRecords).values(initialRecords.map(({ module, ...data }) => ({ sessionId: current.id, module, data })));
        await tx.update(demoSessions).set({ preferences: defaultPreferences }).where(eq(demoSessions.id, current.id));
      });
      return NextResponse.json({ success: true });
    }
    if (body.action === 'settings') {
      const p = body.preferences as Preferences;
      if (!p || typeof p.company !== 'string' || !p.company.trim() || p.company.length > 100 || typeof p.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || p.email.length > 150 || !['SAR', 'AED', 'USD'].includes(p.currency) || typeof p.notifications !== 'boolean') return NextResponse.json({ error: 'يرجى التحقق من بيانات الإعدادات.' }, { status: 400 });
      await db.update(demoSessions).set({ preferences: { company: p.company.trim(), email: p.email, notifications: p.notifications, currency: p.currency } }).where(eq(demoSessions.id, current.id));
      return NextResponse.json({ success: true });
    }
    if (body.action === 'delete') {
      if (!uuidPattern.test(body.id || '')) return NextResponse.json({ error: 'معرف غير صالح' }, { status: 400 });
      const deleted = await db.delete(demoRecords).where(and(eq(demoRecords.id, body.id), eq(demoRecords.sessionId, current.id))).returning();
      return NextResponse.json({ success: deleted.length > 0 }, { status: deleted.length ? 200 : 404 });
    }
    if (!['create', 'update'].includes(body.action)) return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
    const module = body.module as Module;
    if (!Object.hasOwn(moduleInfo, module)) return NextResponse.json({ error: 'وحدة غير صالحة' }, { status: 400 });
    const { name, amount, status, detail, date } = body;
    if (typeof name !== 'string' || !name.trim() || name.length > 150 || typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0 || amount > 1000000000 || !moduleInfo[module].statuses.includes(status) || typeof detail !== 'string' || detail.length > 500 || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) return NextResponse.json({ error: 'يرجى تعبئة الحقول بقيم صحيحة.' }, { status: 400 });
    if (body.action === 'update') {
      if (!uuidPattern.test(body.id || '')) return NextResponse.json({ error: 'معرف غير صالح' }, { status: 400 });
      const [existing] = await db.select().from(demoRecords).where(and(eq(demoRecords.id, body.id), eq(demoRecords.sessionId, current.id), eq(demoRecords.module, module)));
      if (!existing) return NextResponse.json({ error: 'السجل غير موجود' }, { status: 404 });
      await db.update(demoRecords).set({ data: { name: name.trim(), amount, status, detail, date, reference: existing.data.reference } }).where(and(eq(demoRecords.id, existing.id), eq(demoRecords.sessionId, current.id)));
    } else {
      const prefixes: Record<Module, string> = { sales: 'INV', purchases: 'PO', inventory: 'PRD', customers: 'CUS', suppliers: 'SUP', team: 'EMP' };
      await db.insert(demoRecords).values({ sessionId: current.id, module, data: { name: name.trim(), amount, status, detail, date, reference: `${prefixes[module]}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Demo mutation failed', error);
    return NextResponse.json({ error: 'تعذر حفظ التغييرات. حاول مرة أخرى.' }, { status: 500 });
  }
}

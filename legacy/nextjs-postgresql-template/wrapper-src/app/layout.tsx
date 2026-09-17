import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = { title: 'مدار | إدارة أعمالك، بوضوح', description: 'مساحة متكاملة لإدارة المبيعات والمشتريات والمخزون والعملاء. استكشف مدار بحساب تجريبي مستقل، بدون تسجيل الدخول.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}

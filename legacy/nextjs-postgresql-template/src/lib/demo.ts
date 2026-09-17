export const sections = [
  { id: 'dashboard', label: 'نظرة عامة', icon: 'LayoutDashboard' },
  { id: 'sales', label: 'المبيعات', icon: 'ShoppingBag' },
  { id: 'purchases', label: 'المشتريات', icon: 'ShoppingCart' },
  { id: 'inventory', label: 'المنتجات والمخزون', icon: 'Package' },
  { id: 'customers', label: 'العملاء', icon: 'Users' },
  { id: 'suppliers', label: 'الموردون', icon: 'Truck' },
  { id: 'team', label: 'فريق العمل', icon: 'UserRoundCog' },
  { id: 'reports', label: 'التقارير والتحليلات', icon: 'ChartNoAxesCombined' },
  { id: 'settings', label: 'الإعدادات', icon: 'Settings' },
  { id: 'help', label: 'المساعدة والدعم', icon: 'CircleHelp' },
] as const;
export type Section = typeof sections[number]['id'];
export type Module = 'sales' | 'purchases' | 'inventory' | 'customers' | 'suppliers' | 'team';
export type DemoRecord = { id: string; module: Module; name: string; reference: string; amount: number; status: string; date: string; detail: string };
export type Preferences = { company: string; email: string; notifications: boolean; currency: string };
export const defaultPreferences: Preferences = { company: 'شركة الأفق التجارية', email: 'demo@madar.app', notifications: true, currency: 'SAR' };
export const moduleInfo: Record<Module, { title: string; singular: string; description: string; nameLabel: string; amountLabel: string; detailLabel: string; statuses: string[] }> = {
  sales: { title: 'المبيعات', singular: 'فاتورة بيع', description: 'كل مبيعاتك وفواتيرك، في مكان واحد.', nameLabel: 'اسم العميل', amountLabel: 'قيمة الفاتورة', detailLabel: 'البريد الإلكتروني / ملاحظات', statuses: ['مكتملة', 'قيد الانتظار', 'ملغاة'] },
  purchases: { title: 'المشتريات', singular: 'طلب شراء', description: 'تابع طلبات الشراء ونظّم تعاملاتك مع الموردين.', nameLabel: 'اسم المورد', amountLabel: 'قيمة الطلب', detailLabel: 'تفاصيل الطلب', statuses: ['مكتملة', 'قيد الانتظار', 'ملغاة'] },
  inventory: { title: 'المنتجات والمخزون', singular: 'منتج', description: 'رؤية واضحة لمنتجاتك ومستويات المخزون.', nameLabel: 'اسم المنتج', amountLabel: 'سعر الوحدة', detailLabel: 'الكمية المتاحة', statuses: ['متوفر', 'مخزون منخفض', 'غير متوفر'] },
  customers: { title: 'العملاء', singular: 'عميل', description: 'ابنِ علاقات أقوى مع عملائك وتابع حساباتهم.', nameLabel: 'اسم العميل', amountLabel: 'رصيد الحساب', detailLabel: 'البريد الإلكتروني', statuses: ['نشط', 'غير نشط'] },
  suppliers: { title: 'الموردون', singular: 'مورد', description: 'أدر شبكة مورديك وتعاملاتك التجارية بسهولة.', nameLabel: 'اسم المورد', amountLabel: 'رصيد الحساب', detailLabel: 'البريد الإلكتروني', statuses: ['نشط', 'غير نشط'] },
  team: { title: 'فريق العمل', singular: 'عضو', description: 'تعرّف على فريقك ونظّم الأدوار في مساحة العمل.', nameLabel: 'اسم العضو', amountLabel: 'عدد المهام', detailLabel: 'الدور الوظيفي', statuses: ['نشط', 'غير نشط'] },
};
export const initialRecords: Omit<DemoRecord, 'id'>[] = [
  { module: 'sales', name: 'شركة الأفق للتقنية', reference: 'INV-2024-001', amount: 4500, status: 'مكتملة', date: '2024-06-24', detail: 'فاتورة خدمات تقنية' },
  { module: 'sales', name: 'مؤسسة النور التجارية', reference: 'INV-2024-002', amount: 2800, status: 'قيد الانتظار', date: '2024-06-24', detail: 'توريد أجهزة مكتبية' },
  { module: 'sales', name: 'شركة الرواد', reference: 'INV-2024-003', amount: 6200, status: 'مكتملة', date: '2024-06-23', detail: 'اشتراك سنوي' },
  { module: 'sales', name: 'متجر لمسة', reference: 'INV-2024-004', amount: 1350, status: 'ملغاة', date: '2024-06-23', detail: 'طلب ألغي بناءً على رغبة العميل' },
  { module: 'sales', name: 'مؤسسة الإبداع', reference: 'INV-2024-005', amount: 3900, status: 'مكتملة', date: '2024-06-22', detail: 'خدمات تصميم وتطوير' },
  { module: 'sales', name: 'شركة المسار الحديث', reference: 'INV-2024-006', amount: 7200, status: 'مكتملة', date: '2024-06-21', detail: 'أجهزة وشاشات' },
  { module: 'purchases', name: 'شركة التقنية المتقدمة', reference: 'PO-2024-001', amount: 12400, status: 'مكتملة', date: '2024-06-24', detail: 'توريد ١٠ أجهزة حاسب' },
  { module: 'purchases', name: 'مؤسسة الإمداد', reference: 'PO-2024-002', amount: 5800, status: 'قيد الانتظار', date: '2024-06-22', detail: 'مستلزمات مكتبية' },
  { module: 'purchases', name: 'شركة الورق العربية', reference: 'PO-2024-003', amount: 1200, status: 'مكتملة', date: '2024-06-20', detail: 'ورق طباعة وأحبار' },
  { module: 'inventory', name: 'حاسب محمول — Lenovo ThinkPad', reference: 'PRD-001', amount: 4200, status: 'متوفر', date: '2024-06-24', detail: '24' },
  { module: 'inventory', name: 'شاشة Dell مقاس ٢٧ بوصة', reference: 'PRD-002', amount: 1450, status: 'متوفر', date: '2024-06-23', detail: '18' },
  { module: 'inventory', name: 'لوحة مفاتيح لاسلكية', reference: 'PRD-003', amount: 240, status: 'مخزون منخفض', date: '2024-06-23', detail: '3' },
  { module: 'inventory', name: 'طابعة HP LaserJet', reference: 'PRD-004', amount: 1850, status: 'غير متوفر', date: '2024-06-21', detail: '0' },
  { module: 'customers', name: 'شركة الأفق للتقنية', reference: 'CUS-001', amount: 4500, status: 'نشط', date: '2024-06-24', detail: 'hello@horizon.example' },
  { module: 'customers', name: 'مؤسسة النور التجارية', reference: 'CUS-002', amount: 2800, status: 'نشط', date: '2024-06-24', detail: 'info@alnoor.example' },
  { module: 'customers', name: 'شركة الرواد', reference: 'CUS-003', amount: 6200, status: 'نشط', date: '2024-06-23', detail: 'contact@rowad.example' },
  { module: 'customers', name: 'متجر لمسة', reference: 'CUS-004', amount: 0, status: 'غير نشط', date: '2024-06-23', detail: 'hi@lamsa.example' },
  { module: 'suppliers', name: 'شركة التقنية المتقدمة', reference: 'SUP-001', amount: 12400, status: 'نشط', date: '2024-06-24', detail: 'sales@advanced.example' },
  { module: 'suppliers', name: 'مؤسسة الإمداد', reference: 'SUP-002', amount: 5800, status: 'نشط', date: '2024-06-22', detail: 'info@emdad.example' },
  { module: 'suppliers', name: 'شركة الورق العربية', reference: 'SUP-003', amount: 1200, status: 'نشط', date: '2024-06-20', detail: 'sales@paper.example' },
  { module: 'team', name: 'أحمد محمد', reference: 'EMP-001', amount: 12, status: 'نشط', date: '2024-06-24', detail: 'مدير مساحة العمل' },
  { module: 'team', name: 'سارة أحمد', reference: 'EMP-002', amount: 8, status: 'نشط', date: '2024-06-24', detail: 'مسؤولة المبيعات' },
  { module: 'team', name: 'خالد عبدالله', reference: 'EMP-003', amount: 6, status: 'نشط', date: '2024-06-23', detail: 'محاسب' },
];

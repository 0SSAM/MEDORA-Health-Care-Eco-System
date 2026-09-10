'use client';
import { useState } from 'react';
import { ChevronDown, ArrowUpRight, Target, TrendingUp } from 'lucide-react';
export type Period = 'month' | 'week' | 'year';
const chartValues: Record<Period, { sales: number[]; purchases: number[]; labels: string[] }> = {
  month: { sales: [12, 14, 12, 23, 20, 21, 15, 28, 26, 39, 33, 36, 31, 41, 36, 45], purchases: [7, 8, 7, 12, 9, 12, 8, 14, 12, 18, 15, 20, 17, 24, 20, 25], labels: ['01 يونيو', '05 يونيو', '10 يونيو', '15 يونيو', '20 يونيو', '25 يونيو', '30 يونيو'] },
  week: { sales: [18, 25, 20, 34, 29, 38, 45], purchases: [9, 12, 10, 18, 14, 20, 25], labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] },
  year: { sales: [15, 21, 18, 26, 24, 33, 29, 39, 34, 42, 38, 48], purchases: [8, 11, 9, 14, 13, 18, 15, 22, 18, 24, 21, 26], labels: ['يناير', 'مارس', 'مايو', 'يوليو', 'سبتمبر', 'نوفمبر'] },
};
function smoothPath(values: number[]) {
  const points = values.map((v, i) => [38 + (i / (values.length - 1)) * 662, 191 - v * 3.2]);
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) { const a = points[i - 1]; const b = points[i]; const mid = (a[0] + b[0]) / 2; path += ` C ${mid} ${a[1]}, ${mid} ${b[1]}, ${b[0]} ${b[1]}`; }
  return path;
}
export function RevenueChart({ period, setPeriod }: { period: Period; setPeriod: (v: Period) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showSales, setShowSales] = useState(true);
  const [showPurchases, setShowPurchases] = useState(true);
  const data = chartValues[period];
  const salesPath = smoothPath(data.sales);
  const purchasePath = smoothPath(data.purchases);
  return <section className="panel revenue-panel">
    <div className="panel-head"><div><h2>نظرة على الأداء المالي</h2><p>مقارنة المبيعات والمشتريات خلال الفترة</p></div><div className="small-select"><select aria-label="فترة الرسم البياني" value={period} onChange={e => setPeriod(e.target.value as Period)}><option value="month">هذا الشهر</option><option value="week">هذا الأسبوع</option><option value="year">هذا العام</option></select><ChevronDown size={13} /></div></div>
    <div className="chart-legend"><button onClick={() => setShowSales(!showSales)} className={!showSales ? 'muted' : ''}><i className="dot green" />المبيعات</button><button onClick={() => setShowPurchases(!showPurchases)} className={!showPurchases ? 'muted' : ''}><i className="dot light-green" />المشتريات</button><span>بالألف ر.س</span></div>
    <div className="chart-wrap" dir="ltr">
      <svg viewBox="0 0 725 229" role="img" aria-label="رسم توضيحي للمبيعات والمشتريات ببيانات تجريبية" onMouseLeave={() => setHover(null)}>
        <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b8864" stopOpacity=".15"/><stop offset="100%" stopColor="#1b8864" stopOpacity="0"/></linearGradient></defs>
        {[0, 10, 20, 30, 40, 50].map(v => <g key={v}><line x1="38" x2="700" y1={191-v*3.2} y2={191-v*3.2} stroke="#edf0ef" strokeDasharray="4 5"/><text x="26" y={195-v*3.2} textAnchor="end" fill="#9a9e9c" fontSize="10">{v === 0 ? '0' : `${v}k`}</text></g>)}
        {showSales && <><path d={`${salesPath} L 700 191 L 38 191 Z`} fill="url(#salesFill)"/><path d={salesPath} fill="none" stroke="#218966" strokeWidth="2.7" strokeLinecap="round"/></>}
        {showPurchases && <path d={purchasePath} fill="none" stroke="#a5c9b7" strokeWidth="2.3" strokeDasharray="6 5" strokeLinecap="round"/>}
        {data.labels.map((label, i) => <text key={label} x={43 + i / (data.labels.length - 1) * 650} y="220" textAnchor="middle" fill="#8a908d" fontSize="10" fontFamily="inherit">{label}</text>)}
        {data.sales.map((v, i) => <rect key={i} x={24+i/(data.sales.length-1)*662} y="15" width={662/data.sales.length} height="180" fill="transparent" onMouseEnter={() => setHover(i)}/>)}
        {hover !== null && <g pointerEvents="none"><line x1={38+hover/(data.sales.length-1)*662} x2={38+hover/(data.sales.length-1)*662} y1="22" y2="191" stroke="#7dac97" strokeDasharray="3 3"/><circle cx={38+hover/(data.sales.length-1)*662} cy={191-data.sales[hover]*3.2} r="4.5" fill="#218966" stroke="white" strokeWidth="2"/><rect x={Math.min(570, Math.max(40, 38+hover/(data.sales.length-1)*662-62))} y="2" width="126" height="27" rx="6" fill="#183d30"/><text x={Math.min(570, Math.max(40, 38+hover/(data.sales.length-1)*662-62))+63} y="20" fill="white" textAnchor="middle" fontSize="11">{data.sales[hover]},000 ر.س</text></g>}
      </svg>
    </div>
  </section>;
}
export function GoalCard({ total }: { total: number }) {
  const percent = Math.min(100, Math.round(total / 160000 * 100));
  return <section className="panel goal-panel"><div className="panel-head"><div><h2>الهدف الشهري</h2><p>خطوة أقرب إلى طموحاتك</p></div><span className="subtle-icon"><Target size={19}/></span></div>
    <div className="gauge"><svg viewBox="0 0 260 148" aria-label={`تم تحقيق ${percent} بالمائة من الهدف`}><path d="M 29 124 A 101 101 0 0 1 231 124" fill="none" stroke="#edf2ef" strokeWidth="15" strokeLinecap="round"/><path d="M 29 124 A 101 101 0 0 1 231 124" fill="none" stroke="#278c68" strokeWidth="15" strokeLinecap="round" pathLength="100" strokeDasharray={`${percent} 100`}/><text x="130" y="102" textAnchor="middle" className="gauge-number">{percent}<tspan fontSize="21">%</tspan></text><text x="130" y="126" textAnchor="middle" fill="#8a918c" fontSize="12" fontFamily="inherit">من الهدف الشهري</text></svg></div>
    <div className="goal-amounts"><div><span>المحقق</span><strong>{total.toLocaleString('en-US')} <small>ر.س</small></strong></div><i/><div><span>المستهدف</span><strong>160,000 <small>ر.س</small></strong></div></div>
    <div className="goal-note"><TrendingUp size={16}/><span>أداء رائع! أنت على الطريق الصحيح</span><ArrowUpRight size={14}/></div>
  </section>;
}

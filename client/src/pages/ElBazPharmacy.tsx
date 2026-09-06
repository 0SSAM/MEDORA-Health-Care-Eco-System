import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, BarChart3, Barcode, ClipboardList, FileText, MapPin, MessageCircle, Phone, Printer, ShieldCheck, Sparkles } from "lucide-react";
import { EL_BAZ_PHARMACY, barcodeBars } from "@/lib/elBazPharmacy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function BarcodePreview({ value }: { value: string }) {
  const bars = useMemo(() => barcodeBars(value), [value]);
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex h-16 items-end justify-center gap-px overflow-hidden">
        {bars.map((width, index) => (
          <span key={`${value}-${index}`} className="block h-full bg-slate-950" style={{ width: `${width}px` }} />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-xs tracking-[0.25em] text-slate-700">{value}</p>
    </div>
  );
}

export default function ElBazPharmacy() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[#0d1b2a] text-white">
        <img src={EL_BAZ_PHARMACY.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <Link href="/workspace"><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20"><ArrowLeft className="mr-2 h-4 w-4" /> MEDORA Workspace</Button></Link>
            <Badge className="border-0 bg-[#0f766e] px-4 py-2 text-white">MEDORA Pharmacy Profile</Badge>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
            <div>
              <img src={EL_BAZ_PHARMACY.logo} alt="El-Baz Pharmacy — صيدلية الباز" className="w-full max-w-3xl rounded-2xl shadow-2xl" />
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">A premium, practical pharmacy identity built directly into MEDORA — from point of sale and dispensing to printable receipts, product labels, barcode workflows and management reporting.</p>
            </div>
            <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
              <CardHeader><CardTitle className="text-xl">Pharmacy profile</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200">
                <p><strong className="text-white">Manager:</strong> {EL_BAZ_PHARMACY.manager}</p>
                <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-teal-300" /> {EL_BAZ_PHARMACY.addressAr}</p>
                <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-teal-300" /> {EL_BAZ_PHARMACY.landline}</p>
                <p className="flex gap-2"><MessageCircle className="h-4 w-4 shrink-0 text-teal-300" /> WhatsApp: {EL_BAZ_PHARMACY.whatsapp}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f766e]">Brand system</p><h1 className="mt-1 text-3xl font-bold tracking-tight">One identity. Every operational touchpoint.</h1></div><Sparkles className="hidden h-8 w-8 text-[#0f766e] sm:block" /></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[['Receipts', FileText, '58mm / 80mm thermal-ready hierarchy, bilingual header, manager and contact footer.'], ['Labels', ClipboardList, 'Product, batch, expiry and provenance fields with a clean clinical print hierarchy.'], ['Barcodes', Barcode, 'Scanner-facing product identifiers remain source-controlled; label rendering is deterministic.'], ['Reports', BarChart3, 'Daily sales, dispensing, stock, margin, expiry and operational KPI surfaces.']].map(([title, Icon, text]) => { const I = Icon as typeof FileText; return <Card key={title as string} className="border-slate-200 shadow-sm"><CardHeader><I className="h-7 w-7 text-[#0f766e]" /><CardTitle className="mt-2">{title as string}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-slate-600">{text as string}</CardContent></Card>; })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-white"><CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-[#0f766e]" /> Receipt preview</CardTitle></CardHeader>
            <CardContent className="bg-slate-100 p-6">
              <article className="mx-auto max-w-sm bg-white p-6 font-mono text-[11px] shadow-lg">
                <div className="text-center"><strong className="text-sm">El-Baz Pharmacy</strong><br /><span>صيدلية الباز</span><br /><span>{EL_BAZ_PHARMACY.addressAr}</span><br /><span>{EL_BAZ_PHARMACY.landline} · WA {EL_BAZ_PHARMACY.whatsapp}</span></div>
                <div className="my-4 border-t border-dashed" />
                <div className="space-y-1"><div className="flex justify-between"><span>Paracetamol 500mg</span><span>85.00</span></div><div className="flex justify-between"><span>Vitamin D</span><span>120.00</span></div><div className="flex justify-between"><span>Pharmacy service</span><span>25.00</span></div></div>
                <div className="my-4 border-t border-dashed" /><div className="flex justify-between text-sm font-bold"><span>TOTAL</span><span>230.00 EGP</span></div>
                <div className="my-4 border-t border-dashed" /><div className="text-center">{EL_BAZ_PHARMACY.receipt.footer}<br />{EL_BAZ_PHARMACY.manager}</div>
              </article>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Barcode className="h-5 w-5 text-[#0f766e]" /> Product label & barcode system</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sample label</p><h3 className="mt-3 font-semibold">منتج دوائي تجريبي</h3><p className="text-sm text-slate-600">Batch: DEMO-2409 · EXP: 2028-09</p><p className="mt-1 text-sm text-slate-600">SKU: EG-ELBAZ-0001</p><div className="mt-4"><BarcodePreview value="6220000000001" /></div></div>
                <div className="rounded-2xl border bg-slate-900 p-5 text-white"><p className="text-xs font-semibold uppercase tracking-wider text-teal-300">Governance</p><div className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><p>✓ Batch and expiry remain explicit.</p><p>✓ Product codes are not fabricated as official registrations.</p><p>✓ Real EDA/GS1 identifiers stay provenance-controlled.</p><p>✓ Print surfaces inherit the pharmacy brand without changing transaction truth.</p></div></div>
              </div>
              <div className="rounded-2xl border border-[#0f766e]/20 bg-[#0f766e]/5 p-5"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[#0f766e]" /><p className="text-sm leading-6 text-slate-700">The visual barcode in this preview is a deterministic design sample. Production product labels should use the verified barcode/GTIN already held by MEDORA's catalog and regulatory provenance chain.</p></div></div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

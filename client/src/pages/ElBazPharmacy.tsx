import { Link } from "wouter";
import { ArrowLeft, BarChart3, Barcode, Boxes, ClipboardList, FileText, MapPin, MessageCircle, Phone, Printer, ShieldCheck, ShoppingCart, Sparkles, Stethoscope, Truck, Users } from "lucide-react";
import { EL_BAZ_PHARMACY, barcodeBars } from "@/lib/elBazPharmacy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function BarcodePreview({ value }: { value: string }) {
  const bars = barcodeBars(value);
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex h-16 items-end justify-center gap-px overflow-hidden">
        {bars.map((width, index) => <span key={`${value}-${index}`} className="block h-full bg-slate-950" style={{ width: `${width}px` }} />)}
      </div>
      <p className="mt-2 text-center font-mono text-xs tracking-[0.25em] text-slate-700">{value}</p>
    </div>
  );
}

const operationalSurfaces = [
  ["POS & Sales", ShoppingCart, "Real MEDORA sales/POS workspace, cashier scope, invoices, returns and payment controls."],
  ["Inventory & FEFO", Boxes, "Products, batches, expiry-aware inventory, reorder signals and traceability foundations."],
  ["Dispensing", Stethoscope, "Prescription-linked dispensing with pharmacist/clinical policy gates and auditable records."],
  ["Procurement", Truck, "Supplier and purchase-order workflows with approval and receiving foundations."],
  ["Customers", Users, "Customer/CRM records and customer-care surfaces within the organization scope."],
  ["Reporting", BarChart3, "Branch KPI and management reporting surfaces connected to MEDORA operational data."],
] as const;

export default function ElBazPharmacy() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[#0d1b2a] text-white">
        <img src={EL_BAZ_PHARMACY.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/workspace"><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20"><ArrowLeft className="mr-2 h-4 w-4" /> MEDORA Workspace</Button></Link>
            <Badge className="border-0 bg-[#0f766e] px-4 py-2 text-white">El-Baz Pharmacy · MEDORA</Badge>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div>
              <img src={EL_BAZ_PHARMACY.logo} alt="El-Baz Pharmacy — صيدلية الباز" className="w-full max-w-3xl rounded-2xl shadow-2xl" />
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200">A production-oriented pharmacy profile for MEDORA. Branding is separated from transaction truth: sales, inventory, dispensing, procurement, customers and reporting remain governed by the platform's real organization, branch, jurisdiction and authorization boundaries.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/sales"><Button className="bg-white text-slate-900 hover:bg-slate-100"><ShoppingCart className="mr-2 h-4 w-4" /> Open POS</Button></Link>
                <Link href="/workspace"><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">Open Operations Workspace</Button></Link>
              </div>
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
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0f766e]">Operational surface</p><h1 className="mt-1 text-3xl font-bold tracking-tight">One pharmacy identity across the MEDORA operating model.</h1></div><Sparkles className="hidden h-8 w-8 text-[#0f766e] sm:block" /></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {operationalSurfaces.map(([title, Icon, text]) => <Card key={title} className="border-slate-200 shadow-sm"><CardHeader><Icon className="h-7 w-7 text-[#0f766e]" /><CardTitle className="mt-2">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-slate-600">{text}</CardContent></Card>)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-white"><CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-[#0f766e]" /> Bilingual receipt standard</CardTitle></CardHeader>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Barcode className="h-5 w-5 text-[#0f766e]" /> Product label & traceability contract</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sample label</p><h3 className="mt-3 font-semibold">منتج دوائي تجريبي</h3><p className="text-sm text-slate-600">Batch: SAMPLE-BATCH · EXP: 2028-09</p><p className="mt-1 text-sm text-slate-600">SKU: ELBAZ-SAMPLE-0001</p><div className="mt-4"><BarcodePreview value="6220000000001" /></div></div>
                <div className="rounded-2xl border bg-slate-900 p-5 text-white"><p className="text-xs font-semibold uppercase tracking-wider text-teal-300">Governance</p><div className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><p>✓ Batch and expiry remain explicit.</p><p>✓ Sample identifiers are visibly non-production.</p><p>✓ Verified EDA/GS1 identifiers remain provenance-controlled.</p><p>✓ Brand presentation cannot change transaction or regulatory truth.</p></div></div>
              </div>
              <div className="rounded-2xl border border-[#0f766e]/20 bg-[#0f766e]/5 p-5"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[#0f766e]" /><p className="text-sm leading-6 text-slate-700">The barcode in this page is a deterministic visual sample, not a claim of an official product registration. Production labels must use the verified product identifier stored in MEDORA's catalog/provenance chain.</p></div></div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-[#0f766e]" /> Completion boundary</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 text-sm leading-6 text-slate-600">
            <div><p className="font-semibold text-slate-900">Implemented in MEDORA's current pharmacy surface</p><ul className="mt-2 list-disc space-y-1 pl-5"><li>Organization/branch pharmacy identity provisioning.</li><li>Pharmacy profile and bilingual branding.</li><li>POS, inventory, dispensing and procurement foundations.</li><li>FEFO-aware batch/expiry model and DataMatrix parsing.</li><li>Auditable dispensing and pharmacy-scoped authorization paths.</li></ul></div>
            <div><p className="font-semibold text-slate-900">Still requires external evidence or broader platform completion</p><ul className="mt-2 list-disc space-y-1 pl-5"><li>Live EDA/ETA/UPA/UHIA connectivity and credentials.</li><li>Official product-registration/master-data evidence.</li><li>Full WMS, clinical safety and external interoperability completion.</li><li>Production acceptance, regulatory accreditation and operational deployment evidence.</li></ul></div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

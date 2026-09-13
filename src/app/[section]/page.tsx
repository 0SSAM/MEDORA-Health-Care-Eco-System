import { notFound } from 'next/navigation';
import Workspace from '@/components/workspace';
import { sections, type Section } from '@/lib/demo';
export function generateStaticParams() { return sections.map(s => ({ section: s.id })); }
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.some(s => s.id === section)) notFound();
  return <Workspace section={section as Section} />;
}

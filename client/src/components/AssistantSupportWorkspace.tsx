import { useMemo, useState } from "react";
import { Bot, LifeBuoy, Send, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { SmartTextInput } from "@/components/SmartTextInput";
import { useLocalization } from "@/contexts/LocalizationContext";
import { trpc } from "@/lib/trpc";

type Props = {
  organizationId: number | null;
  branchId: number | null;
  screen?: string;
  isOverlay?: boolean;
  initialDraft?: string;
};

export function AssistantSupportWorkspace({ organizationId, branchId, screen, isOverlay = false, initialDraft }: Props) {
  const { language, direction } = useLocalization();
  const uiLanguage = language === "en" ? "en" : "ar";
  const copy = uiLanguage === "en" ? {
    assistant: "Smart operational assistant",
    chatPlaceholder: "Ask about the next step or why something failed…",
    chooseOrganization: "Select an organization first",
    support: "Automated support centre",
    newTicket: "New ticket",
    howItWorks: "How it works",
    subject: "Issue title",
    description: "Describe the issue and what happened before it",
    submit: "Send for review",
    ticketSent: "The ticket was created. The support team can follow it up from the call centre.",
    guidance: "The assistant provides guidance based on the current screen. It does not diagnose patients or execute entries, purchases, or permission changes.",
    insufficient: "When information is insufficient, it guides you to open a support ticket instead of inventing an answer.",
    initial: "Hello, I am the MEDORA assistant. I can explain steps and review what appears on screen, but I do not perform sensitive actions without human review and confirmation.",
    unavailable: "I could not prepare a safe response right now. Please open a support ticket for human review.",
  } : {
    assistant: "المساعد التشغيلي الذكي",
    chatPlaceholder: "اسأل عن الخطوة التالية أو سبب المشكلة…",
    chooseOrganization: "اختر مؤسسة أولاً",
    support: "مركز الدعم الآلي",
    newTicket: "تذكرة جديدة",
    howItWorks: "كيف يعمل؟",
    subject: "عنوان المشكلة",
    description: "اشرح المشكلة والخطوات التي سبقتها",
    submit: "إرسال للمراجعة",
    ticketSent: "تم إنشاء التذكرة بنجاح، ويمكن لفريق الدعم متابعتها من مركز الاتصال.",
    guidance: "المساعد يقدم إرشادات مبنية على سياق الشاشة فقط، ولا يشخّص المرضى أو ينفذ قيوداً أو مشتريات أو تغييرات صلاحيات.",
    insufficient: "عند عدم كفاية البيانات، يحولك إلى تذكرة دعم بدل اختلاق إجابة.",
    initial: "مرحباً، أنا مساعد MEDORA. أشرح لك الخطوات وأحلل ما يظهر في الشاشة، لكنني لا أنفذ العمليات الحساسة دون مراجعة وتأكيد بشري.",
    unavailable: "لم أتمكن من إعداد إجابة آمنة الآن. افتح تذكرة دعم لتتم مراجعتها بشرياً.",
  };
  const scope = organizationId ? { organizationId, branchId } : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);
  const chat = trpc.assistant.chat.useMutation();
  const ticket = trpc.assistant.createTicket.useMutation({ onSuccess: () => { setSent(true); setSubject(""); setDescription(""); } });
  const disabled = !scope || chat.isPending;
  const initial = useMemo(() => ({ role: "assistant" as const, content: copy.initial }), [copy.initial]);

  const send = async (content: string) => {
    if (!scope || !content.trim()) return;
    const next = [...messages, { role: "user" as const, content: content.trim() }];
    setMessages(next);
    try {
      const result = await chat.mutateAsync({ ...scope, language: uiLanguage, screen, messages: next.map(({ role, content: text }) => ({ role: role === "system" ? "assistant" : role, content: text })) });
      setMessages([...next, { role: "assistant", content: result.text }]);
    } catch {
      setMessages([...next, { role: "assistant", content: copy.unavailable }]);
    }
  };

  return <div dir={direction} className="space-y-4">
    <div className={isOverlay ? "space-y-4" : "grid gap-4 lg:grid-cols-[1.25fr_.75fr]"}>
      <Card className="overflow-hidden border-cyan-100 bg-[linear-gradient(145deg,rgba(236,254,255,0.95),rgba(255,255,255,0.98))] shadow-sm">
        <CardHeader className="border-b border-cyan-100/80 bg-white/65 p-3 pb-3 sm:p-6 sm:pb-4"><CardTitle className="flex items-center gap-2 text-cyan-950"><span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-200"><Bot className="h-4 w-4" /></span> {copy.assistant}</CardTitle><p className="mt-2 text-xs leading-5 text-slate-600">{copy.guidance}</p></CardHeader>
        <CardContent className="p-3 sm:p-6">
          <AIChatBox messages={messages.length ? [initial, ...messages] : [initial]} onSendMessage={send} isLoading={chat.isPending} placeholder={disabled ? copy.chooseOrganization : copy.chatPlaceholder} height={isOverlay ? "min(50vh, 440px)" : "600px"} className="border-cyan-100 shadow-none" initialDraft={initialDraft} smartTyping={{ organizationId, branchId, language: uiLanguage, screen: screen ?? "assistant_support" }} />
        </CardContent>
      </Card>
      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-amber-600" /> {copy.support}</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="ticket">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="ticket"><Ticket className="me-2 h-4 w-4" />{copy.newTicket}</TabsTrigger><TabsTrigger value="policy">{copy.howItWorks}</TabsTrigger></TabsList>
            <TabsContent value="ticket" className="space-y-3 pt-4">
              <SmartTextInput value={subject} onValueChange={setSubject} organizationId={organizationId} branchId={branchId} language={uiLanguage} screen="assistant_support" fieldName="support_ticket_subject" placeholder={copy.subject} ariaLabel={copy.subject} />
              <SmartTextInput as="textarea" value={description} onValueChange={setDescription} organizationId={organizationId} branchId={branchId} language={uiLanguage} screen="assistant_support" fieldName="support_ticket_description" placeholder={copy.description} ariaLabel={copy.description} />
              <Button disabled={!scope || ticket.isPending || subject.trim().length < 4 || description.trim().length < 10} onClick={() => scope && ticket.mutate({ ...scope, subject, description, priority: "normal", channel: "web" })}><Send className="me-2 h-4 w-4" /> {copy.submit}</Button>
              {sent && <p className="text-sm text-emerald-700">{copy.ticketSent}</p>}
            </TabsContent>
            <TabsContent value="policy" className="space-y-2 pt-4 text-sm leading-6 text-muted-foreground"><p>{copy.guidance}</p><p>{copy.insufficient}</p></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </div>;
}

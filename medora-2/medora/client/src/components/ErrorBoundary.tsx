import { cn } from "@/lib/utils";
import { recordSafeUiDiagnostic, safeDiagnosticDigest } from "@/lib/safeDiagnostics";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    recordSafeUiDiagnostic("workspace_boundary_error", error, "global-error-boundary");
  }

  render() {
    if (this.state.hasError) {
      const isEnglish = typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("en");
      const direction = isEnglish ? "ltr" : "rtl";
      return (
        <div dir={direction} className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="mb-4 text-xl">{isEnglish ? "The workspace could not be loaded" : "تعذر تحميل مساحة العمل"}</h2>

            <p className="mb-4 text-center text-muted-foreground">
              {isEnglish
                ? "A temporary error occurred while loading a system module. Sensitive technical details are not displayed."
                : "حدث خطأ مؤقت أثناء تحميل إحدى وحدات النظام. لم يتم عرض تفاصيل تقنية حساسة."}
            </p>

            <div className="p-4 w-full rounded bg-muted mb-6 text-center" dir="ltr">
              <code className="text-sm text-muted-foreground">
                Diagnostic ID: {safeDiagnosticDigest(this.state.error)}
              </code>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              {isEnglish ? "Reload interface" : "إعادة تحميل الواجهة"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

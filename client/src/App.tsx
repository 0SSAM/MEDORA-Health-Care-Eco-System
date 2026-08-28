import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
const Home = lazy(() => import("@/pages/Home"));
const DeliveryPage = lazy(() => import("./pages/Delivery"));
const GpMaxPage = lazy(() => import("./pages/GpMax"));
const Icd11Page = lazy(() => import("./pages/Icd11"));
const AttendanceMobilePage = lazy(() => import("./pages/AttendanceMobile"));
const KpiDashboardPage = lazy(() => import("./pages/KpiDashboard"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const Login = lazy(() => import("@/pages/Login"));
const AdminConsole = lazy(() => import("@/pages/AdminConsole"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import InstallShortcutBanner from "./components/InstallShortcutBanner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocalizationProvider } from "./contexts/LocalizationContext";
import { NdaAccessGate } from "./components/NdaAccessGate";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/sales"} component={Home} />
      <Route path={"/workspace"} component={Home} />
      <Route path={"/pos"} component={Home} />
      <Route path={"/operations"} component={Home} />
      <Route path={"/delivery"} component={DeliveryPage} />
      <Route path={"/gp-max"} component={GpMaxPage} />
      <Route path={"/icd11"} component={Icd11Page} />
      <Route path={"/attendance"} component={AttendanceMobilePage} />
      <Route path={"/kpi"} component={KpiDashboardPage} />
      <Route path={"/finance"} component={Home} />
      <Route path={"/admin"} component={AdminConsole} />
      <Route path={"/"} component={Welcome} />
      <Route path={"/404"}>
        <Suspense fallback={<RouteLoadingState />}>
          <NotFound />
        </Suspense>
      </Route>
      {/* Final fallback route */}
      <Route>
        <Suspense fallback={<RouteLoadingState />}>
          <NotFound />
        </Suspense>
      </Route>
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function RouteLoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
      جاري تحميل الصفحة…
    </main>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LocalizationProvider>
          <TooltipProvider>
            <Toaster />
            <NdaAccessGate><Router /></NdaAccessGate>
            <InstallShortcutBanner />
          </TooltipProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

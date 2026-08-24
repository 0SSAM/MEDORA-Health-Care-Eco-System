// MEDORA | ميدورا — Integrated Health Care System
// Copyright (c) 2026 Hossam Naeim Osman | حسام نعيم عثمان. All rights reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use of this
// software, or of any portion of it, is strictly prohibited.
// Source: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
const Home = lazy(() => import("@/pages/Home"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocalizationProvider } from "./contexts/LocalizationContext";
import { SecurityOverlay } from "./components/SecurityOverlay";
import { AssistantSidebar } from "./components/AssistantSidebar";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/sales"} component={Home} />
      <Route path={"/workspace"} component={Home} />
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
            <SecurityOverlay />
            <AssistantSidebar />
            <Router />
          </TooltipProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

/**
 * react-resizable-panels v4 exposes `Group` / `Panel` / `Separator`. The
 * shadcn-era names and the v2/v3 `direction` prop are preserved here so the
 * existing call sites keep working unchanged:
 *   - `PanelGroup`   → `Group`
 *   - `Panel`        → `Panel`
 *   - `PanelResizeHandle` → `Separator`
 *   - `direction="horizontal" | "vertical"` → `orientation`
 */

type Direction = "horizontal" | "vertical";

function ResizablePanelGroup({
  className,
  direction = "horizontal",
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group> & {
  /** Legacy prop name (v2/v3): maps onto v4's `orientation`. */
  direction?: Direction;
}) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      orientation={direction}
      className={cn(
        "flex h-full w-full data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:data-[aria-orientation=horizontal]:after:h-1 data-[orientation=vertical]:data-[aria-orientation=horizontal]:after:w-full data-[orientation=vertical]:data-[aria-orientation=horizontal]:after:translate-x-0 data-[orientation=vertical]:data-[aria-orientation=horizontal]:after:-translate-y-1/2",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

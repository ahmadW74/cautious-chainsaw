import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { Pin, PinOff } from "lucide-react"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return (<TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />);
}

function Tooltip({
  ...props
}) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}>
        {children}
        <TooltipPrimitive.Arrow
          className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

// ---------------------------------------------------------------------------
// Pinned tooltip
// ---------------------------------------------------------------------------

const PinnedTooltipContext = React.createContext({
  pinned: false,
  togglePinned: () => {},
})

function PinnedTooltip({ isPinned, onUnpin, children, ...props }) {
  const [pinned, setPinned] = React.useState(isPinned ?? false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (isPinned !== undefined) {
      setPinned(isPinned)
    }
  }, [isPinned])

  React.useEffect(() => {
    if (!pinned && onUnpin) {
      onUnpin()
    }
  }, [pinned, onUnpin])

  const togglePinned = React.useCallback(() => {
    setPinned((p) => !p)
  }, [])

  const handleOpenChange = React.useCallback(
    (value) => {
      if (!pinned) {
        setOpen(value)
      }
    },
    [pinned]
  )

  return (
    <TooltipProvider>
      <PinnedTooltipContext.Provider value={{ pinned, togglePinned }}>
        <TooltipPrimitive.Root
          data-slot="pinned-tooltip"
          open={pinned || open}
          onOpenChange={handleOpenChange}
          {...props}
        >
          {children}
        </TooltipPrimitive.Root>
      </PinnedTooltipContext.Provider>
    </TooltipProvider>
  )
}

const PinnedTooltipTrigger = TooltipTrigger

function PinnedTooltipContent({
  className,
  sideOffset = 0,
  children,
  color,
  style,
  ...props
}) {
  const { pinned, togglePinned } = React.useContext(PinnedTooltipContext)
  const Icon = pinned ? PinOff : Pin

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="pinned-tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          color ? "text-primary-foreground" : "bg-primary text-primary-foreground",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        style={color ? { backgroundColor: color, color: "white", ...style } : style}
        {...props}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">{children}</div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              togglePinned()
            }}
            className={cn(
              color
                ? "text-white/80 hover:text-white"
                : "text-primary-foreground/80 hover:text-primary-foreground"
            )}
          >
            <Icon className="size-3" />
          </button>
        </div>
        <TooltipPrimitive.Arrow
          className={cn(
            "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
            color ? null : "bg-primary fill-primary"
          )}
          style={color ? { backgroundColor: color, fill: color } : undefined}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
}

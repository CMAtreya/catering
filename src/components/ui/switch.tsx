import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  const isSm = size === "sm"
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-300)] focus-visible:ring-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 cursor-pointer select-none",
        isSm ? "h-4 w-7" : "h-5 w-9",
        "data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ease-in-out",
          isSm 
            ? "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0" 
            : "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-3 py-1 text-xs font-sans font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30",
        gradient:
          "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30",
        secondary:
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md shadow-red-500/30",
        outline: "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        success: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30",
        warning: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/30",
        info: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

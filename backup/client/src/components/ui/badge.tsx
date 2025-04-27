import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success bg-opacity-10 text-success",
        get: "bg-green-100 text-green-800",
        post: "bg-blue-100 text-blue-800",
        put: "bg-yellow-100 text-yellow-800",
        delete: "bg-red-100 text-red-800",
        patch: "bg-purple-100 text-purple-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  method?: string;
}

function Badge(
  { className, variant, method, ...props }: BadgeProps
) {
  let methodVariant = variant;
  if (method) {
    const methodLower = method.toLowerCase();
    if (['get', 'post', 'put', 'delete', 'patch'].includes(methodLower)) {
      methodVariant = methodLower as any;
    }
  }
  return (
    <div className={cn(badgeVariants({ variant: methodVariant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

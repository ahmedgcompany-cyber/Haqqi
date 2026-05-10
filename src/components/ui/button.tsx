import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none ring-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary px-5 py-3 text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary-strong",
        secondary:
          "border border-border bg-card px-5 py-3 text-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card-strong",
        ghost:
          "px-4 py-2 text-foreground hover:bg-primary/8 hover:text-primary",
        danger:
          "bg-danger px-5 py-3 text-white hover:-translate-y-0.5 hover:opacity-90",
      },
      size: {
        default: "",
        sm: "px-4 py-2 text-xs",
        lg: "px-6 py-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
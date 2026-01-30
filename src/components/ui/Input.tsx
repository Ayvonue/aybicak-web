import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="relative pt-2">
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-md border bg-white/5 px-3 py-2 text-sm text-white shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                        error
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-white/20 focus-visible:ring-accent",
                        className
                    )}
                    placeholder={label} // Placeholder required for :placeholder-shown selector
                    ref={ref}
                    {...props}
                />
                <label
                    className={cn(
                        "floating-label absolute left-3 top-4 text-sm transition-all pointer-events-none",
                        error ? "text-red-400" : "text-white/50"
                    )}
                >
                    {label}
                </label>
                {error && (
                    <p className="text-xs text-red-400 mt-1 ml-1">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };


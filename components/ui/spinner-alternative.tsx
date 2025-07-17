import { SpinnerIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-row gap-2 items-center", className)}>
    <div className="font-medium text-sm">Thinking...</div>
    <div className="animate-spin">
      <SpinnerIcon />
    </div>
  </div>
);

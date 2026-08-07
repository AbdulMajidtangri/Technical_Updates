import { Inbox } from "lucide-react";

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))]/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))]">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
interface StatusDotProps {
  status: "active" | "pending" | "archived";
}

const config = {
  active:   { color: "bg-green",  label: "Active" },
  pending:  { color: "bg-amber",  label: "Pending" },
  archived: { color: "bg-tertiary", label: "Archived" },
};

export function StatusDot({ status }: StatusDotProps) {
  const { color, label } = config[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-xs text-secondary">{label}</span>
    </span>
  );
}

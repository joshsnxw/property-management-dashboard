interface BadgeProps {
  variant: "weg" | "mv";
}

export function Badge({ variant }: BadgeProps) {
  const styles =
    variant === "weg"
      ? "bg-accent-dim text-accent border border-accent-border"
      : "bg-green-dim text-green border border-green/20";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${styles}`}
    >
      {variant.toUpperCase()}
    </span>
  );
}

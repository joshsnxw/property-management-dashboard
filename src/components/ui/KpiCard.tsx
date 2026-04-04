interface KpiCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
}

export function KpiCard({ label, value, subLabel }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1 bg-bg-0 border border-border rounded-lg p-4">
      <span className="text-xs text-tertiary uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold text-primary">{value}</span>
      {subLabel && <span className="text-xs text-tertiary">{subLabel}</span>}
    </div>
  );
}

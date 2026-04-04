interface SectionDividerProps {
  label: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="border-b border-border pb-2 mb-4">
      <span className="text-xs font-semibold text-tertiary uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

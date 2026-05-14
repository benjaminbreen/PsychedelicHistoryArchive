type StatItem = {
  label: string;
  value: string | number;
};

type StatStripProps = {
  items: StatItem[];
};

export function StatStrip({ items }: StatStripProps) {
  return (
    <dl className="grid overflow-hidden rounded-md border border-[#DED2BD] bg-[#FFFDF8] sm:grid-cols-3">
      {items.map((item) => (
        <div className="border-b border-[#DED2BD] px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={item.label}>
          <dt className="display-label text-[0.7rem] text-archive-muted">{item.label}</dt>
          <dd className="mt-1 text-xl font-semibold text-archive-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

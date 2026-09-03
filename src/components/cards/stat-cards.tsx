export interface Stat {
  label: string;
  value: string;
}

export interface StatCardsProps {
  stats: Stat[];
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl bg-surface p-3">
          <p className="text-body text-muted-text">{stat.label}</p>
          <p className="text-label text-numeric text-text">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function KeywordPills({ items, tone = "blue", limit, emptyMessage = "No major gaps found." }: { items: string[]; tone?: "blue" | "green" | "red"; limit?: number; emptyMessage?: string }) {
  const colors = {
    blue: "bg-blue-50 text-[#2563eb] border-blue-100",
    green: "bg-emerald-50 text-[#16a34a] border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100"
  };
  if (items.length === 0) return <p className="text-sm font-semibold leading-6 text-[#64748b]">{emptyMessage}</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, limit ?? items.length).map((item) => (
        <span key={item} className={`rounded-full border px-3 py-1.5 text-sm font-extrabold ${colors[tone]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

import type { ProfileMetric } from "../types";

export function ProfileMetrics({
  metrics,
}: Readonly<{ metrics: readonly ProfileMetric[] }>) {
  if (metrics.length === 0) return null;

  return (
    <dl
      aria-label="Resumen de entrenamiento"
      className={`grid border-b border-[#343731] ${
        metrics.length === 1
          ? "grid-cols-1"
          : metrics.length === 2
            ? "grid-cols-2"
            : "grid-cols-3"
      }`}
    >
      {metrics.map((metric, index) => (
        <div
          className={`flex min-w-0 flex-col py-6 ${index > 0 ? "border-l border-[#292c28] pl-4" : "pr-4"}`}
          key={metric.label}
        >
          <dt className="order-2 mt-2 text-[0.68rem] leading-4 font-black uppercase text-[#858a82] sm:text-xs">
            {metric.label}
          </dt>
          <dd className="order-1 text-3xl font-black tabular-nums text-white sm:text-4xl">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

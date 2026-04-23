import { AlertTriangle } from "lucide-react";

export interface Alert {
  level: "warning" | "danger";
  message: string;
}

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b text-sm font-medium flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Alertas ({alerts.length})
      </div>
      <ul className="divide-y text-sm">
        {alerts.map((a, i) => (
          <li
            key={i}
            className={
              a.level === "danger"
                ? "px-4 py-2 bg-red-50 text-red-700"
                : "px-4 py-2 bg-amber-50 text-amber-700"
            }
          >
            <AlertTriangle className="inline h-4 w-4 mr-2 align-[-2px]" />
            {a.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

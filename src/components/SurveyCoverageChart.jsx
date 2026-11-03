import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SurveyCoverageChart({ data = [] }) {
  const hasData = data.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mt-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-900">
          Survey Coverage
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Number of facilities surveyed in each selected state
        </p>
      </div>

      {hasData ? (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="state"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="facilitiesSurveyed"
                name="Facilities surveyed"
                fill="#1F7A3F"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
          <p className="text-sm font-medium text-slate-700">
            Survey coverage data unavailable
          </p>
          <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
            Facility survey counts will appear here when the data is provided
            by the Server.
          </p>
        </div>
      )}
    </section>
  );
}
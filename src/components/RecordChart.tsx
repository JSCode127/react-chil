import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie
} from "recharts";

type Props = {
  milkData: { date: string; value: number }[];
  diaperData: { date: string; count: number }[];
  sleepData: { date: string; value: number }[];
  viewMode: string;
};

function RecordChart({ milkData, diaperData, sleepData, viewMode }: Props) {
    const formatDiff = (diff: number) => {
        if (diff > 0) return `+${diff} ↑`;
        if (diff < 0) return `${diff} ↓`;
        return "±0";
        };

  return (
    <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">{viewMode === "day" ? "日別グラフ" : "週別グラフ"}</h2>

        {/* 棒グラフ */}
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={milkData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => {
                    return [`${value}ml (${formatDiff(props.payload.diff)})`, name];
                }}/>
                <Bar dataKey="value" fill="#3b82f6" name="ミルク" />
            </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sleepData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" name="睡眠" />
            </BarChart>
        </ResponsiveContainer>

        {/* 円グラフ */}
        <PieChart width={300} height={200}>
            <Pie data={diaperData} dataKey="count" nameKey="オムツ回数" fill="#10b981"/>
        </PieChart>
    </div>
  );
}

export default RecordChart;
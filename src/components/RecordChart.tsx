import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

type Props = {
  milkData: { date: string; value: number }[];
  diaperData: { name: string; value: number; }[];
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
            <Pie data={diaperData} dataKey="value" nameKey="name">
                {diaperData.map((entry) => (
                <Cell
                    key={entry.name}
                    fill={entry.name === "おしっこ" ? "#60a5fa" : "#f59e0b"}
                />
                ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}回`, name]} />
            <Legend />
        </PieChart>
    </div>
  );
}

export default RecordChart;
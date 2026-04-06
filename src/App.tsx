import { useState } from "react";
import { useEffect } from "react";

import RecordItem from "./components/RecordItem";
import RecordChart from "./components/RecordChart";
import RecordModal from "./components/RecordModal";
// import ScratchImage from "./components/Scratch";

function App() {
  const [, setType] = useState("");
  const [value, setValue] = useState("");
  const [activeTab, setActiveTab] = useState<"record" | "chart">("record");

  const [records, setRecords] = useState<
    { type: string; value: string; date: string }[]
  >(() => {
    const saved = localStorage.getItem("records");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  const [modalType, setModalType] = useState<string | null>(null);

  const [time, setTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );

  const milkByDate = Object.values(
    records
      .filter((r) => r.type === "ミルク")
      .reduce<Record<string, { date: string; value: number }>>(
        (acc, r) => {
          const dateKey = r.date.split("T")[0];

          if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, value: 0 };
          }

          acc[dateKey].value += Number(r.value);
          return acc;
        },
        {}
      )
  );

  const diaperByDate = Object.values(
    records
      .filter((r) => r.type === "おしっこ" || r.type === "うんち")
      .reduce<
        Record<string, { date: string; pee: number; poop: number }>
      >((acc, r) => {
        const dateKey = r.date.split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = { date: dateKey, pee: 0, poop: 0 };
        }

        if (r.type === "おしっこ") {
          acc[dateKey].pee++;
        } else if (r.type === "うんち") {
          acc[dateKey].poop++;
        }

        return acc;
      }, {})
  );

  const sleepByDate = Object.values(
  (() => {
    const result: Record<string, { date: string; value: number }> = {};

    const sleepRecords = records
      .filter((r) => r.type === "眠る" || r.type === "起きる")
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    for (let i = 0; i < sleepRecords.length - 1; i++) {
      const current = sleepRecords[i];
      const next = sleepRecords[i + 1];

      if (current.type === "眠る" && next.type === "起きる") {
        const start = new Date(current.date).getTime();
        const end = new Date(next.date).getTime();

        const minutes = (end - start) / (1000 * 60);

        // 日付キー（眠る側を採用）
        const dateKey = current.date;

        if (!result[dateKey]) {
          result[dateKey] = { date: dateKey, value: 0 };
        }

        result[dateKey].value += minutes;
      }
    }

    return result;
  })()
  );

  const getWeekKey = (dateStr: string) => {
    const date = new Date(dateStr);
    const firstDay = new Date(date);

    firstDay.setDate(date.getDate() - date.getDay()); // 日曜始まり

    return firstDay.toISOString().split("T")[0];
  };

  const milkByWeek = Object.values(
    records
      .filter((r) => r.type === "ミルク")
      .reduce<Record<string, { date: string; value: number }>>((acc, r) => {
        const weekKey = getWeekKey(r.date);

        if (!acc[weekKey]) {
          acc[weekKey] = { date: weekKey, value: 0 };
        }

        acc[weekKey].value += Number(r.value);
        return acc;
      }, {})
  );

  const diaperByWeek = Object.values(
    records
      .filter((r) => r.type === "おしっこ" || r.type === "うんち")
      .reduce<
        Record<string, { date: string; pee: number; poop: number }>
      >((acc, r) => {
        const weekKey = getWeekKey(r.date);

        if (!acc[weekKey]) {
          acc[weekKey] = { date: weekKey, pee: 0, poop: 0 };
        }

        if (r.type === "おしっこ") {
          acc[weekKey].pee++;
        } else if (r.type === "うんち") {
          acc[weekKey].poop++;
        }

        return acc;
      }, {})
  );

  const sleepByWeek = Object.values(
  (() => {
    const result: Record<string, { date: string; value: number }> = {};

    const sleepRecords = records
      .filter((r) => r.type === "眠る" || r.type === "起きる")
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    for (let i = 0; i < sleepRecords.length - 1; i++) {
      const current = sleepRecords[i];
      const next = sleepRecords[i + 1];

      if (current.type === "眠る" && next.type === "起きる") {
        const start = new Date(current.date).getTime();
        const end = new Date(next.date).getTime();

        const minutes = (end - start) / (1000 * 60);

        // 日付キー（眠る側を採用）
        const dateKey = current.date;

        if (!result[dateKey]) {
          result[dateKey] = { date: dateKey, value: 0 };
        }

        result[dateKey].value += minutes;
      }
    }

    return result;
  })()
);


const selectedDiaper = diaperByDate.find(
  (d) => d.date === selectedDate
);

const diaperPieData = selectedDiaper
  ? [
      { name: "おしっこ", value: selectedDiaper.pee },
      { name: "うんち", value: selectedDiaper.poop },
    ]
  : [];

const selectedWeek = diaperByWeek.find(
  (d) => d.date === getWeekKey(selectedDate)
);

const diaperPieWeekData = selectedWeek
  ? [
      { name: "おしっこ", value: selectedWeek.pee },
      { name: "うんち", value: selectedWeek.poop },
    ]
  : [];

  const [editingIndex, setEditingIndex] = useState<number | null>(null);


  const startEdit = (index: number) => {
    setEditingIndex(index);

    const record = records[index];
    setType(record.type);
    setValue(record.value);
    setModalType(record.type);
  };

  const deleteRecord = (index: number) => {
    const newRecords = records.filter((_, i) => i !== index);
    setRecords(newRecords);
  };

  useEffect(() => {
    localStorage.setItem("records", JSON.stringify(records));
  }, [records]);


  const uniqueDates = Array.from(
    new Set(records.map((r) => r.date.split("T")[0]))
  ).sort();

  const filteredRecords = selectedDate
  ? records.filter((r) => r.date.split("T")[0] === selectedDate)
  : records;

  const groupedRecords = filteredRecords.reduce<
    Record<string, { type: string; value: string; date: string }[]>
  >((acc, record) => {
    const dateKey = record.date.split("T")[0];

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push(record);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedRecords).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-4">
          育児記録アプリ
        </h1>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        {/* タブ */}
        <div className="flex mb-4">
          <button
            className={`flex-1 p-2 ${
              activeTab === "record"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("record")}
          >
            記録
          </button>

          <button
            className={`flex-1 p-2 ${
              activeTab === "chart"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("chart")}
          >
            グラフ
          </button>
        </div>

        {/* 表示切り替え */}
        {activeTab === "record" && (
          <>
          <div className="flex justify-center gap-2 mb-4">
            <button onClick={() => setModalType("ミルク")}>🍼</button>
            <button onClick={() => setModalType("おしっこ")}>💧</button>
            <button onClick={() => setModalType("うんち")}>💩</button>
            <button onClick={() => setModalType("眠る")}>😴</button>
            <button onClick={() => setModalType("起きる")}>🌞</button>
          </div>
            {modalType && (
              <RecordModal
                type={modalType}
                value={value}
                time={time}
                setValue={setValue}
                setTime={setTime}
                onClose={() => {
                  setModalType(null);
                  setValue("");
                }}
                onSubmit={() => {
                  const newValue =
                    modalType === "おしっこ" || modalType === "うんち"
                      ? ""
                      : value;

                  if (editingIndex !== null) {
                    const updatedRecords = [...records];
                    updatedRecords[editingIndex] = {
                      ...updatedRecords[editingIndex],
                      type: modalType!,
                      value: newValue
                    };
                    setRecords(updatedRecords);
                    setEditingIndex(null);
                  } else {
                    const newRecord = {
                      type: modalType!,
                      value: newValue,
                      date: `${selectedDate}T${time}`
                    };
                    setRecords([...records, newRecord]);
                  }

                  setModalType(null);
                  setValue("");
                }}
                isEditing={editingIndex !== null}
              />
            )}

            <h2 className="mt-4">記録一覧</h2>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">すべて表示</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {sortedDates.map((date) => (
              <div key={date} className="mb-4">
                {/* 日付ヘッダー */}
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(date).toLocaleDateString("ja-JP")}
                </div>

                {/* 中身 */}
                <div className="space-y-2">
                  {groupedRecords[date].map((r, i) => {
                    const index = records.findIndex(
                      (item) =>
                        item.date === r.date &&
                        item.type === r.type &&
                        item.value === r.value
                    );

                    return (
                      <RecordItem
                        key={i}
                        record={r}
                        onDelete={() => deleteRecord(index)}
                        onEdit={() => startEdit(index)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "chart" && (
          <>
          <div className="flex mb-4">
            <button
                onClick={() => setViewMode("day")}
                className={`flex-1 p-2 ${viewMode === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
                日別
            </button>

            <button
                onClick={() => setViewMode("week")}
                className={`flex-1 p-2 ${viewMode === "week" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
                週別
            </button>
            </div>
          <RecordChart
            milkData={viewMode === "day" ? milkByDate : milkByWeek}
            diaperData={viewMode === "day" ? diaperPieData : diaperPieWeekData}
            sleepData={viewMode === "day" ? sleepByDate : sleepByWeek}
            viewMode={viewMode}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
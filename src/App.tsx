import { useState } from "react";
import { useEffect } from "react";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import RecordItem from "./components/RecordItem";
import RecordChart from "./components/RecordChart";
import RecordModal from "./components/RecordModal";
import DailyNoteModal from "./components/DailyNoteModal";
import TypeSelectModal from "./components/TypeSelectModal";
// import ScratchImage from "./components/Scratch";

function App() {
  const [, setType] = useState("");
  const [value, setValue] = useState("");
  //タブ切り替え状態を管理するstate
  const [activeTab, setActiveTab] = useState<"record" | "chart">("record");
  //記録を管理するstate
  const [records, setRecords] = useState<
    { type: string; value: string; date: string }[]
  >(() => {
    const saved = localStorage.getItem("records");
    return saved ? JSON.parse(saved) : [];
  });
  //選択した日付を管理するstate
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  //日別、週別グラフのタブを管理するstate
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  //モーダルの開閉状態を管理するstate
  const [modalType, setModalType] = useState<string | null>(null);
  //時間の登録状態を管理するstate
  const [time, setTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  //日記の内容を管理するstate
  const [dailyNotes, setDailyNotes] = useState<
    Record<string, { text: string; image: string | null }>
  >(() => {
    const saved = localStorage.getItem("dailyNotes");
    return saved ? JSON.parse(saved) : {};
  });
  const [noteText, setNoteText] = useState("");
  const [noteImage, setNoteImage] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  //種類選択モーダルの開閉状態を管理するstate
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

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
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((item, index, arr) => {
    if (index === 0) return { ...item, diff: 0 };

    return {
      ...item,
      diff: item.value - arr[index - 1].value
    };
  });

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
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((item, index, arr) => {
    if (index === 0) return { ...item, diff: 0 };

    return {
      ...item,
      diff: item.value - arr[index - 1].value
    };
  });

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
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
        let start = new Date(current.date);
        const end = new Date(next.date);

        while (start < end) {
          const dayEnd = new Date(start);
          dayEnd.setHours(23, 59, 59, 999);

          const segmentEnd = end < dayEnd ? end : dayEnd;

          const minutes =
            (segmentEnd.getTime() - start.getTime()) / (1000 * 60);

          const dateKey = start.toISOString().split("T")[0];

          if (!result[dateKey]) {
            result[dateKey] = { date: dateKey, value: 0 };
          }

          result[dateKey].value += minutes;

          // 次の日へ
          start = new Date(dayEnd);
          start.setMilliseconds(start.getMilliseconds() + 1);
        }
      }
    }

    return result;
  })()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


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

const getMilkIntervals = () => {
  const milkRecords = records
    .filter((r) => r.type === "ミルク")
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const result: Record<string, string> = {};

  for (let i = 1; i < milkRecords.length; i++) {
    const prev = milkRecords[i - 1];
    const current = milkRecords[i];

    const diffMs =
      new Date(current.date).getTime() -
      new Date(prev.date).getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    result[current.date] = `${hours}時間${mins}分`;
  }

  return result;
};

const milkIntervals = getMilkIntervals();

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

  const groupedRecords = records
    .filter((r) => r.date.split("T")[0] === selectedDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  
  //日記を保存する
  const saveNote = () => {
    const updated = {
      ...dailyNotes,
      [selectedDate]: {
        text: noteText,
        image: noteImage
      }
    };

    setDailyNotes(updated);
    setIsNoteModalOpen(false);
  };

  useEffect(() => {
    localStorage.setItem("dailyNotes", JSON.stringify(dailyNotes));
  }, [dailyNotes]);

  const note = dailyNotes[selectedDate];

  //カレンダーの記録日フォーマット
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("sv-SE");
  };

  //カレンダーアイコン表示用
  const recordMap: Record<string, Set<string>> = {};

  records.forEach((r) => {
    const dateKey = r.date.split("T")[0];

    if (!recordMap[dateKey]) {
      recordMap[dateKey] = new Set();
    }

    recordMap[dateKey].add(r.type);
  });

  const getIcons = (types: Set<string>) => {
    const icons: string[] = [];

    if (types.has("ミルク")) icons.push("🍼");
    if (types.has("おしっこ")) icons.push("💧");
    if (types.has("うんち")) icons.push("💩");
    if (types.has("眠る") || types.has("起きる")) icons.push("😴");

    return icons;
  };
  //週のデータを作成する
  const getWeekRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0(日)〜6(土)

    const start = new Date(date);
    start.setDate(date.getDate() - day); // 日曜始まり

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
  };

  const { start, end } = getWeekRange(selectedDate);

  const weeklyRecords = records.filter((r) => {
    const d = new Date(r.date);
    return d >= start && d <= end;
  });

  let milkTotal = 0;
  let peeCount = 0;
  let poopCount = 0;
  let sleepMinutes = 0;

  weeklyRecords.forEach((r) => {
    if (r.type === "ミルク") {
      milkTotal += Number(r.value);
    }

    if (r.type === "おしっこ") peeCount++;
    if (r.type === "うんち") poopCount++;
  });

  sleepByWeek.forEach((s) => {
    const d = new Date(s.date);

    if (d >= start && d <= end) {
      sleepMinutes += s.value;
    }
  });

  const formatMinutes = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h}時間${min}分`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-4">
          育児記録アプリ
        </h1>
        <div className="flex justify-center items-center p2 mb-2">
          <Calendar
            value={new Date(selectedDate)}
            onChange={(date) => {
              const d = date as Date;
              setSelectedDate(formatDate(d));
            }}
            tileContent={({ date }) => {
              const key = formatDate(date);
              const types = recordMap[key];

              if (!types) return null;

              const icons = getIcons(types);

              return (
                <div className="text-xs flex justify-center gap-1 mt-1">
                  {icons.map((icon, i) => (
                    <span key={i}>{icon}</span>
                  ))}
                </div>
              );
            }}
            onClickDay={(value) => {
              const d = value as Date;

              setSelectedDate(formatDate(d));
              setIsTypeModalOpen(true);
            }}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded mt-4">
          <h2 className="font-semibold mb-2">週間サマリー</h2>

          <p>🍼 ミルク合計：{milkTotal} ml</p>
          <p>💧 おしっこ：{peeCount} 回</p>
          <p>💩 うんち：{poopCount} 回</p>
          <p>😴 睡眠：{formatMinutes(sleepMinutes)}</p>
        </div>

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
            <button 
              className="p3 border"
              onClick={() => {
              const note = dailyNotes[selectedDate] || { text: "", image: null };

              setNoteText(note.text);
              setNoteImage(note.image);
              setIsNoteModalOpen(true);
            }}>日記を書く🖊
            </button>
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

            {isNoteModalOpen && (
              <DailyNoteModal
                date={selectedDate}
                text={noteText}
                image={noteImage}
                setText={setNoteText}
                setImage={setNoteImage}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={saveNote}
              />
            )}

            {isTypeModalOpen && (
              <TypeSelectModal
                onSelect={(type) => {
                  setModalType(type);
                  setIsTypeModalOpen(false);
                }}
                onClose={() => setIsTypeModalOpen(false)}
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

                {/* 中身 */}
                <div className="space-y-2">
                  {groupedRecords.map((r, i) => {
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
                        interval={
                          r.type === "ミルク" ? milkIntervals[r.date] : undefined
                        }
                        onDelete={() => deleteRecord(index)}
                        onEdit={() => startEdit(index)}
                      />
                    );
                  })}

                  {note && (
                  <div className="bg-yellow-100 p-2 rounded mb-2">
                    <p>{note.text}</p>
                    {note.image && (
                      <img src={note.image} className="mt-2 rounded" />
                    )}
                  </div>
                )}
                </div>
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
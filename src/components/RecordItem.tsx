type Props = {
  record: { type: string; value: string; date: string };
  onDelete: () => void;
  onEdit: () => void;
};

const getColor = (type: string) => {
  if (type === "ミルク") return "bg-blue-100";
  if (type === "オムツ") return "bg-green-100";
  if (type === "眠る" || type === "起きる") return "bg-purple-100";
  return "bg-gray-100";
};

const getIcon = (type: string) => {
  if (type === "ミルク") return "🍼";
  if (type === "おしっこ") return "💦";
  if (type === "うんち") return "💩";
  if (type === "眠る") return "😴";
  if (type === "起きる") return "🌞";
  if (type === "食事") return "🍴"
  return "";
};

function RecordItem({ record, onDelete, onEdit }: Props) {
  return (
    <div className={`${getColor(record.type)} p-2 rounded flex justify-between`}>
        <div>
            <span>{getIcon(record.type)} {record.type}</span>
            <p>{record.value}</p>
            <p className="text-sm text-gray-500">
              {new Date(record.date).toLocaleString("ja-JP")}
            </p>
        </div>

        <div className="mt-2">
            <button
            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
            onClick={onEdit}
            >
            編集
            </button>

            <button
            className="bg-red-500 text-white px-2 py-1 rounded"
            onClick={onDelete}
            >
            削除
            </button>
        </div>
    </div>
  );
}

export default RecordItem;
type Props = {
  type: string;
  value: string;
  setType: (v: string) => void;
  setValue: (v: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
};

const types = ["ミルク", "オムツ", "食事", "眠る", "起きる", "お出かけ"];



function RecordForm({
  type,
  value,
  setType,
  setValue,
  onSubmit,
  isEditing,
}: Props) {
  return (
    <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">記録入力</h2>

        <select
            className="w-full p-2 border rounded mb-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
            >
            <option value="">選択してください</option>
            {types.map((t) => (
                <option key={t} value={t}>
                {t}
                </option>
            ))}
        </select>

        {type === "ミルク" && (
            <select
                className="w-full p-2 border rounded mb-2"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            >
                <option value="">量を選択</option>
                {[...Array(11)].map((_, i) => {
                const ml = i * 20;
                return (
                    <option key={ml} value={ml}>
                    {ml} ml
                    </option>
                );
                })}
            </select>
        )}

        {type === "オムツ" && (
            <select
                className="w-full p-2 border rounded mb-2"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            >
                <option value="">選択</option>
                <option value="おしっこ">おしっこ</option>
                <option value="うんち">うんち</option>
            </select>
        )}

        {type !== "ミルク" && type !== "オムツ" && (
            <input
                className="w-full p-2 border rounded mb-2"
                placeholder="内容"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        )}

        <button
            className={`w-full p-2 rounded text-white ${
            isEditing ? "bg-blue-500" : "bg-green-500"
            }`}
            onClick={onSubmit}
        >
            {isEditing ? "更新" : "追加"}
        </button>
    </div>
  );
}

export default RecordForm;
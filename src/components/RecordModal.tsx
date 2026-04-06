type ModalProps = {
  type: string;
  value: string;
  time: string;
  setValue: (v: string) => void;
  setTime: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isEditing: boolean;
};

function RecordModal({ type, value, time, setValue, setTime, onSubmit, onClose, isEditing }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-80">

        <h2 className="text-lg mb-2">
          {isEditing ? "編集" : "記録"}：{type}
        </h2>

        {/* ミルク */}
        {type === "ミルク" && (
          <select
            className="w-full p-2 border mb-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            <option value="">量を選択</option>
            {[...Array(11)].map((_, i) => {
              const ml = i * 20;
              return <option key={ml} value={ml}>{ml}ml</option>;
            })}
          </select>
        )}

        {/* おしっこ・うんち → 入力不要 */}
        {(type === "おしっこ" || type === "うんち") && (
          <p className="mb-2 text-center">記録</p>
        )}

        {/* その他 */}
        {type !== "ミルク" && type !== "おしっこ" && type !== "うんち" && (
          <input
            className="w-full p-2 border mb-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}

        <input
          type="time"
          className="w-full p-2 border mb-2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-300 p-2">
            キャンセル
          </button>
          <button onClick={onSubmit} className="flex-1 bg-blue-500 text-white p-2">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordModal;
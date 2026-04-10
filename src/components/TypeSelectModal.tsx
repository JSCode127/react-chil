type Props = {
  onSelect: (type: string) => void;
  onClose: () => void;
};

function TypeSelectModal({ onSelect, onClose }: Props) {
  const types = ["ミルク", "おしっこ", "うんち", "眠る", "起きる"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded w-72">

        <h2 className="mb-2">記録タイプ選択</h2>

        <div className="grid grid-cols-3 gap-2">
          {types.map((t) => (
            <button
              key={t}
              className="p-2 bg-gray-100 rounded"
              onClick={() => onSelect(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-2 w-full bg-gray-300 p-2"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

export default TypeSelectModal;
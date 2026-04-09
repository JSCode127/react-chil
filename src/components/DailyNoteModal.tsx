type Props = {
  date: string;
  text: string;
  image: string | null;
  setText: (v: string) => void;
  setImage: (v: string | null) => void;
  onClose: () => void;
  onSave: () => void;
};

function DailyNoteModal({
  date,
  text,
  image,
  setText,
  setImage,
  onClose,
  onSave
}: Props) {
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded w-80">

        <h2 className="text-lg mb-2">日記：{date}</h2>

        <textarea
          className="w-full border p-2 mb-2"
          placeholder="今日の様子"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input type="file" accept="image/*" onChange={handleImage} />

        {image && (
          <img src={image} className="mt-2 rounded" />
        )}

        <div className="flex gap-2 mt-2">
          <button onClick={onClose} className="flex-1 bg-gray-300 p-2">
            キャンセル
          </button>
          <button onClick={onSave} className="flex-1 bg-blue-500 text-white p-2">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyNoteModal;
import { useState } from "react";

type Props = {
  onLogin: () => void;
};

const LoginPage = ({onLogin}: Props) => {
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    });

    const data = await res.json();

    localStorage.setItem("token", data.token);
    onLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-xl font-bold">ログイン</h1>

      <input
        className="border p-2 rounded"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        ログイン
      </button>
    </div>
  );
};

export default LoginPage;
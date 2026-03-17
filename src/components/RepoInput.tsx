import { useState } from "react";

export default function RepoInput({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");

  return (
    <div className="flex gap-2">
      <input
        className="border p-2 rounded w-80"
        placeholder="Paste GitHub repo URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="bg-black text-white px-4 rounded"
        onClick={() => onSubmit(url)}
      >
        Analyze
      </button>
    </div>
  );
}
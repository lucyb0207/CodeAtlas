import { useState } from "react";

export default function RepoInput({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");

  return (
    <div className="flex gap-2">
      <input
        className="border p-2 rounded"
        placeholder="Paste GitHub repo URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => onSubmit(url)}
      >
        Analyze
      </button>
    </div>
  );
}
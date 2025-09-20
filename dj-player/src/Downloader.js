import { useState } from "react";

export default function Downloader({ onAddSong }) {
  const [url, setUrl] = useState("");

  const handleDownload = async () => {
    try {
      const res = await fetch("http://localhost:5001/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (data.success) {
        // Add the new song to your DJ player playlist
        onAddSong(`/downloads/${data.file}`);
      } else {
        console.error("Download failed:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube link"
      />
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}

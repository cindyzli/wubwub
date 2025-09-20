// src/Downloader.js
import { useState } from "react";

export default function Downloader({ onAddSong }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const uuid = crypto.randomUUID();
      console.log("🚀 Sending request to server with URL:", url);
      fetch("http://localhost:5001/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, uuid }),
      });

      onAddSong(uuid); // add the song into playlist
    } catch (err) {
      console.error("⚠️ Fetch error:", err);
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  return (
    <div className="downloader">
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleDownload} type="button" disabled={loading}>
        {loading ? "Downloading..." : "Download"}
      </button>
    </div>
  );
}

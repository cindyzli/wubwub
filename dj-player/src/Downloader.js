// src/Downloader.js
import { useState } from "react";

export default function Downloader({ onAddSong }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      console.log("🚀 Sending request to server with URL:", url);
      const res = await fetch("http://localhost:5001/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      console.log("📡 Response status:", res.status);

      const data = await res.json();
      console.log("📥 Server response:", data);

      if (data.success && data.url) {
        onAddSong(data.url); // add the song into playlist
        console.log("🎶 Added to playlist:", data.url);
      } else {
        console.error("❌ Download failed:", data.error || "Unknown error");
      }
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
      <button onClick={handleDownload} disabled={loading}>
        {loading ? "Downloading..." : "Download"}
      </button>
    </div>
  );
}

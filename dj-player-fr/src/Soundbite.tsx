import { useState, useEffect } from "react";

interface SoundBite {
  label: string;
  public_url: string;
  name?: string;
  thumbnail?: string;
}

export function SoundBites({ onTriggerBite }: { onTriggerBite: (url: string) => void }) {
  const [bites, setBites] = useState<SoundBite[]>([]);

  const fetchBites = async () => {
    const res = await fetch("http://localhost:5001/download?kind=soundbite");
    const data = await res.json();
    setBites(data.songs);
  };

  useEffect(() => {
    fetchBites();
  }, []);

  const handleSetUrl = async (label: string) => {
    const youtubeUrl = prompt(`Enter YouTube URL for ${label}:`);
    if (!youtubeUrl) return;

    const uuid = crypto.randomUUID();
    await fetch("http://localhost:5001/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: youtubeUrl,
        uuid,
        kind: "soundbite",
        label,
      }),
    });

    await fetchBites();
  };

  return (
    <div className="flex gap-2">
      {["Bite 1", "Bite 2", "Bite 3"].map((label) => {
        const bite = bites.find((b) => b.label === label);

        return (
          <div key={label} className="relative group">
            {/* Main button: plays bite */}
            <button
              onClick={() => {
                if (bite?.public_url) {
                  onTriggerBite(`http://localhost:5001${bite.public_url}`);
                } else {
                  handleSetUrl(label);
                }
              }}
              className="px-3 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition"
            >
              {bite ? bite.name || label : label}
            </button>

            {/* Edit overlay: only shows on hover */}
            <button
              onClick={() => handleSetUrl(label)}
              className="absolute top-0 right-0 hidden group-hover:block bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded"
            >
              ✎
            </button>
          </div>
        );
      })}
    </div>
  );
}

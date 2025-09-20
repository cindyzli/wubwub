from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp, os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Save mp3s directly into the React public/songs folder
DOWNLOADS_DIR = os.path.join("..", "dj-player", "public", "songs")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

@app.route("/download", methods=["POST"])
def download():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(DOWNLOADS_DIR, "%(title)s.%(ext)s"),
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            # Get final mp3 filename
            filename = ydl.prepare_filename(info).rsplit(".", 1)[0] + ".mp3"

        # Public URL React can use — /public is the root, so /songs/... works
        public_url = f"/songs/{os.path.basename(filename)}"

        return jsonify({
            "success": True,
            "file": os.path.basename(filename),  # just filename
            "url": public_url                     # ✅ what frontend should add
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp, os
from urllib.parse import quote
from flask_socketio import SocketIO, emit

app = Flask(
    __name__,
    static_folder=os.path.join("..", "dj-player", "public"),
    static_url_path=""
)

CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://10.50.16.48:3000"]}})

socketio = SocketIO(app, cors_allowed_origins="*")

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

@socketio.on('gesture')
def handle_gesture(data):
    print("Received gesture:", data)
    # Forward gesture to all connected clients (e.g., browser)
    emit('gesture', data, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, port=5001, debug=True)

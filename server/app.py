from flask import Flask
from flask_restful import Resource, Api, reqparse
import yt_dlp, os
from flask_cors import CORS
from threading import Thread
from pymongo.mongo_client import MongoClient
from urllib.parse import quote
from flask_socketio import SocketIO, emit


app = Flask(__name__)
api = Api(app)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

DOWNLOADS_DIR = os.path.join("..", "dj-player-fr", "songs")
DOWNLOADS_DIR = os.path.join("..", "dj-player-fr", "songs")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)
uri = "mongodb+srv://cyang2023_db_user:iSJA0hg0pcXui2kc@cluster0.ld8hzph.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
database = client["wubwub"]
collection = database["queue"]

def download_audio(url, uuid):
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(DOWNLOADS_DIR, f"{uuid}.%(ext)s"),
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

class Response(Resource):
    def get(self):
        # Fetch from MongoDB
        records = list(collection.find({}, {'_id': 0}))

        # Sort by timestamp (most recent last)
        records.sort(key=lambda x: x.get('timestamp', 0), reverse=True)

        return {"songs": records}
    
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('url', type=str)
        parser.add_argument('uuid', type=str)

        args = parser.parse_args()
        url = args.get('url')
        uuid = args.get('uuid')

        filename = f"{uuid}.mp3"

        ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(DOWNLOADS_DIR, f"{uuid}.%(ext)s"),
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
    }
        
        # Public URL React can use — /public is the root, so /songs/... works
        public_url = f"/songs/{os.path.basename(filename)}"

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            # Insert into MongoDB
            collection.insert_one({
                "uuid": uuid,
                "url": url,
                "filename": filename,
                "public_url": public_url,
                "name": info['title'],
                "duration": info['duration'],
                "channel": info['uploader'],
                "thumbnail": info['thumbnail']
            })
        
        Thread(target=download_audio, args=(url,uuid)).start()

        return {
            "success": True,
            "file": os.path.basename(filename),  # just filename
            "url": public_url                     # ✅ what frontend should add
        }
    
@socketio.on('gesture')
def handle_gesture(data):
    print("Received gesture:", data)
    # Forward gesture to all connected clients (e.g., browser)
    emit("gesture", data, broadcast=True)

api.add_resource(Response, '/download')

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5001, debug=True)

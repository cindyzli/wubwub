from flask import Flask
from flask_restful import Resource, Api, reqparse
import yt_dlp, os
from flask_cors import CORS
from threading import Thread
from pymongo.mongo_client import MongoClient
from urllib.parse import quote
from flask_socketio import SocketIO, emit
# from google import genai
from dotenv import load_dotenv
# from google.genai import types

load_dotenv()

app = Flask(__name__)
api = Api(app)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")
# genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


DOWNLOADS_DIR = os.path.join("..", "dj-player-fr", "public", "songs")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)
uri = "mongodb+srv://cyang2023_db_user:iSJA0hg0pcXui2kc@cluster0.ld8hzph.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)
database = client["wubwub"]
collection = database["queue"]
soundbite_collection = database["soundbites"]


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
        
        records = list(collection.find({}, {'_id': 0}))
        
        records.sort(key=lambda x: x.get('timestamp', 0), reverse=True)

        return {"songs": records}

    def delete(self):
        # Only makes sense for the queue
        doc = collection.find_one_and_delete({}, sort=[("timestamp", 1)])
        if doc:
            doc.pop("_id", None)
            return {"success": True, "deleted": doc}
        return {"success": False, "error": "queue empty"}, 404

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('url', type=str)
        parser.add_argument('uuid', type=str)
        parser.add_argument('kind', type=str, default="queue")  # queue or soundbite
        parser.add_argument('label', type=str, required=False)  # optional for soundbite
        args = parser.parse_args()

        url, uuid, kind = args['url'], args['uuid'], args['kind']
        filename = f"{uuid}.mp3"
        public_url = f"/songs/{os.path.basename(filename)}"

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
            info = ydl.extract_info(url, download=False)

            # response = genai_client.models.generate_content(
            #     model="gemini-2.5-flash", contents="Generate a color range between 0 and 360 for hues inspired by the following song: " + info['title'] + 
            #     " by " + info.get('uploader') + ". Respond with just two numbers min and max, separated by a space.",
            #     config=types.GenerateContentConfig(
            #         thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
            #     ),
            # )

            # print("Gemini response:", response)
            # color_range = response.text.strip()
            # min_hue, max_hue = color_range.split()
            min_hue, max_hue = 75, 180

            doc = {
                "uuid": uuid,
                "url": url,
                "filename": filename,
                "public_url": public_url,
                "name": info['title'],
                "duration": info.get('duration'),
                "channel": info.get('uploader'),
                "thumbnail": info.get('thumbnail'),
                "min_hue": int(min_hue),
                "max_hue": int(max_hue),
            }

            

            if kind == "queue":
                collection.insert_one(doc)
            else:
                # Upsert soundbite by label
                label = args.get("label") or f"Soundbite-{uuid[:4]}"
                doc["label"] = label
                soundbite_collection.update_one({"label": label}, {"$set": doc}, upsert=True)

        Thread(target=download_audio, args=(url, uuid)).start()

        return {"success": True, "url": public_url}
    
class Response2(Resource):
    def get(self):
        records = list(soundbite_collection.find({}, {'_id': 0}))
        return {"soundbites": records}

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=str)
        parser.add_argument('label', type=str)
        args = parser.parse_args()

        id, label = args['id'], args['label']
        soundbite_collection.update_one({"id": id}, {"$set": {"label": label}})

        return {"success": True}


api.add_resource(Response, '/download')
api.add_resource(Response2, '/sound-bites')

@socketio.on('gesture')
def handle_gesture(data):
    print("Received gesture:", data)
    # Forward gesture to all connected clients (e.g., browser)
    emit('gesture', data, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, port=5001, debug=True)
import yt_dlp
from pydub import AudioSegment
import os

def youtube_to_mp3(url, output_folder="downloads"):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_folder}/%(title)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


url = "https://www.youtube.com/watch?v=RDH71p3LgWM&list=RDRDH71p3LgWM&start_radio=1" 
youtube_to_mp3(url)

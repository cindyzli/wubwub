import yt_dlp
import os
import sys

def youtube_to_mp3(url, output_folder="downloads"):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": f"{output_folder}/%(title)s.%(ext)s",
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        # Convert to .mp3 filename
        filename = ydl.prepare_filename(info).rsplit(".", 1)[0] + ".mp3"
        return filename

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 youtubemp3converter.py <YouTube_URL> [output_folder]")
        sys.exit(1)

    url = sys.argv[1]
    output_folder = sys.argv[2] if len(sys.argv) > 2 else "downloads"

    filename = youtube_to_mp3(url, output_folder)
    print(f"Downloaded: {filename}")

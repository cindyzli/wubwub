import time
import cv2
from time import sleep
from cvzone.HandTrackingModule import HandDetector

# Initialize HandDetector for hand tracking
detector = HandDetector(staticMode=False, maxHands=2, modelComplexity=1, detectionCon=0.5, minTrackCon=0.5)

# Global counter variables
fingers = 0
dj_hands_ids = []
bass_boost = 50 # starting bass boost
volume = 50 # starting volume
prev_bass_y = None # vertical position of right hand
prev_vol_y = None # vertical position of left hand

# Initialize video capture
cap = cv2.VideoCapture(0)

# Detect flat palm facing down
def isFist(hand):
    if not hand or "lmList" not in hand:
        return False
    fingerup = detector.fingersUp(hand)
    return fingerup == [0, 1, 0, 0, 0]

# Function to process the frame and generate JSON commands
def process_frame_and_generate_command(img):
    global dj_hands_ids, bass_boost, volume, prev_bass_y, prev_vol_y

    # Hand detection
    hands, new_img = detector.findHands(img, draw=True, flipType=True)
    r_found = False
    l_found = False

    if hands:
        # pick largest bounding boxes for R + L
        hand_sizes = []
        for i, h in enumerate(hands):
            x, y, w, h_box = h["bbox"]
            area = w * h_box
            hand_sizes.append((area, i, h))
        hand_sizes.sort(key=lambda d: d[0], reverse=True)

        dj_hands_ids = []
        for area, idx, h in hand_sizes:
            if h["type"] == "Right" and not r_found:
                dj_hands_ids.append(idx)
                r_found = True
            elif h["type"] == "Left" and not l_found:
                dj_hands_ids.append(idx)
                l_found = True

        # Process hands
        for h in range(len(hands)):
            hand = hands[h]

            if h in dj_hands_ids and hand["type"] == "Right":
                _, y, _, _ = hand["bbox"]
                if isFist(hand):
                    if prev_bass_y is not None:
                        if y < prev_bass_y - 30 and bass_boost < 100:
                            bass_boost = min(100, bass_boost + 10)
                            print("bass boost:", bass_boost)
                            return {"action": "adjust_bass", "bass": bass_boost}, new_img
                        elif y > prev_bass_y + 30 and bass_boost > 0:
                            bass_boost = max(0, bass_boost - 10)
                            print("bass boost:", bass_boost)
                            return {"action": "adjust_bass", "bass": bass_boost}, new_img
                    prev_bass_y = y  # update every frame

            if h in dj_hands_ids and hand["type"] == "Left":
                _, y, _, _ = hand["bbox"]
                if isFist(hand):
                    if prev_vol_y is not None:
                        if y < prev_vol_y - 30 and volume < 100:
                            volume = min(100, volume + 10)
                            print("volume:", volume)
                            return {"action": "adjust_vol", "volume": volume}, new_img
                        elif y > prev_vol_y + 30 and volume > 0:
                            volume = max(0, volume - 10)
                            print("volume:", volume)
                            return {"action": "adjust_vol", "volume": volume}, new_img
                    prev_vol_y = y  # update every frame

    return {"action": "none"}, new_img

# Main loop for video capture and processing
next_time_can_send = 0
while True:
    ret, frame = cap.read()  # Capture a frame
    if not ret:
        break
    
    # Process the frame for hand gesture and send commands
    command, img = process_frame_and_generate_command(frame)
    
    # Display the frame (optional for debugging)
    cv2.imshow("Camera Feed", img)

    # Exit the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    time.sleep(0.1)  # Delay to control frame rate

cap.release()  # Release the camera
cv2.destroyAllWindows()  # Close the window
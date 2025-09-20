import time
import cv2
from time import sleep
from cvzone.HandTrackingModule import HandDetector

# Initialize HandDetector for hand tracking
detector = HandDetector(staticMode=False, maxHands=2, modelComplexity=1, detectionCon=0.5, minTrackCon=0.5)

# Global counter variables
dj_hands_ids = [] # locked hands

fingers = 0
nightcore = 0

nightcore_frames = 0
not_nightcore_frames = 0 # cooldown variables
swipe_cooldown = 0 

bass_boost = 50 # starting bass boost
volume = 50 # starting volume

prev_bass_y = None # vertical position of right hand
prev_vol_y = None # vertical position of left hand
prev_right_x = None # for swipe

# Initialize video capture
cap = cv2.VideoCapture(0)

# Detect fist
def isFist(hand):
    if not hand or "lmList" not in hand:
        return False
    fingerup = detector.fingersUp(hand)
    return fingerup == [0, 0, 0, 0, 0]

# Function to process frame and count fingers raised
def isSoundBite(hand):
    global fingers
    fingerup = detector.fingersUp(hand)   
    
    if fingerup == [0, 1, 0, 0, 0] and fingers != 1: 
        fingers = 1
        return True
    elif fingerup == [0, 1, 1, 0, 0] and fingers != 2: 
        fingers = 2
        return True
    elif fingerup == [0, 1, 1, 1, 0] and fingers != 3: 
        fingers = 3
        return True
    elif fingerup == [0, 1, 1, 1, 1] and fingers != 4: 
        fingers = 4
        return True
    return False

# Function to check if left hand is making rock sign
def isNightCore(hand):
    landmarks = hand['lmList']

    thumb_tip = landmarks[4]   # Thumb tip (x, y)
    index_tip = landmarks[8]   # Index tip (x, y)
    middle_tip = landmarks[12] # Middle tip (x, y)
    ring_tip = landmarks[16]   # Ring tip (x, y)
    pinky_tip = landmarks[20]  # Pinky tip (x, y)
    
    # Check if thumb and pinky are extended
    thumb_extended = thumb_tip[1] < landmarks[3][1]
    index_extended = index_tip[1] < landmarks[9][1]
    pinky_extended = pinky_tip[1] < landmarks[17][1]

    # Check if other fingers are curled
    middle_curl = middle_tip[1] > landmarks[10][1]
    ring_curl = ring_tip[1] > landmarks[14][1]

    if thumb_extended and pinky_extended and index_extended and middle_curl and ring_curl:
        return True
    return False

# Function to process the frame and generate JSON commands
def process_frame_and_generate_command(img):
    global dj_hands_ids, bass_boost, volume, prev_bass_y, prev_vol_y
    global fingers, nightcore_frames, not_nightcore_frames, nightcore
    global prev_right_x, swipe_cooldown

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

                # Next song control
                if swipe_cooldown > 0:
                    swipe_cooldown -= 1
                else:
                    if detector.fingersUp(hand) == [1,1,1,1,1]:
                        if prev_right_x is not None and (prev_right_x - x) > 80:
                            print("going to next song")
                            swipe_cooldown = 10  # buffer so it doesn't spam
                            return {"action": "next_song"}, new_img
                        prev_right_x = x
                    else:
                        prev_right_x = None

                # Bass boost control
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

                # Soundbite control
                elif isSoundBite(hand):
                    print("sound bite: " + str(fingers))
                    return {"action": "sound_bite", "number": fingers}, new_img
                
            if h in dj_hands_ids and hand["type"] == "Left":
                _, y, _, _ = hand["bbox"]

                # Volume control
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

                # Nightcore control
                elif isNightCore(hand):
                    nightcore_frames += 1
                    if nightcore_frames >= 5 and not_nightcore_frames >= 10:
                        nightcore_frames = 0
                        not_nightcore_frames = 0
                        nightcore = 1 - nightcore
                        print("nightcore:", nightcore)
                        return {"action": "toggle_nightcore", "state": nightcore}, new_img
                else:
                    if not_nightcore_frames < 10:
                        not_nightcore_frames += 1
                    nightcore_frames = 0

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
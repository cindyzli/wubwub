import time
import cv2
from time import sleep
from cvzone.HandTrackingModule import HandDetector
from datetime import datetime

# Initialize HandDetector for hand tracking
detector = HandDetector(staticMode=False, maxHands=2, modelComplexity=1, detectionCon=0.5, minTrackCon=0.5)

# Load face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Global counter variables
fingers = 0
dj_face_center = None
dj_hands_ids = []
face_missing_frames = 0
FACE_MISSING_TOLERANCE = 30

# Initialize video capture
cap = cv2.VideoCapture(0)

# Function to process frame and count fingers raised
def isChangeVolume(hand):
    global fingers
    fingerup = detector.fingersUp(hand)   
    
    if fingerup == [0, 0, 0, 0, 0] and fingers != 0:
        fingers = 0
        return True
    elif fingerup == [0, 1, 0, 0, 0] and fingers != 1: 
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
    elif fingerup == [1, 1, 1, 1, 1] and fingers != 5: 
        fingers = 5
        return True
    return False

# Select most central face + closest to cam
def select_dj_face(faces, frame_shape):
    h, w = frame_shape[:2]
    frame_center = (w // 2, h // 2)

    best_score = -1
    best_face = None

    for (x, y, fw, fh) in faces:
        area = fw * fh
        face_center = (x + fw // 2, y + fh // 2)
        dist_to_center = ((face_center[0] - frame_center[0])**2 +
                          (face_center[1] - frame_center[1])**2) ** 0.5

        # Weighted scoring
        score = area - dist_to_center * 2 # Adjust

        if score > best_score:
            best_score = score
            best_face = (x, y, fw, fh, face_center)

    return best_face

# Function to process the frame and generate JSON commands
def process_frame_and_generate_command(img):
    global dj_face_center, dj_hands_ids, face_missing_frames

    # Face detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.2, 6)

    if len(faces) > 0:
        best_face = select_dj_face(faces, img.shape)
        if best_face:
            x, y, fw, fh, center = best_face
            dj_face_center = center
            face_missing_frames = 0
            cv2.circle(img, dj_face_center, 10, (255, 0, 0), -1)
    else:
        face_missing_frames += 1
        if face_missing_frames > FACE_MISSING_TOLERANCE:
            dj_face_center = None
            dj_hands_ids = [] # unlock hands

    # Hand detection
    hands, new_img = detector.findHands(img, draw=True, flipType=True)
    changeVolume = False

    if hands and dj_face_center:
        # If no hands locked, pick closest hands
        if not dj_hands_ids:
            hand_distances = []
            for h in hands:
                x, y = h["center"]
                dist = ((x - dj_face_center[0])**2 + (y - dj_face_center[1])**2) ** 0.5
                hand_distances.append((dist, h))
            
            hand_distances.sort(key=lambda d: d[0])

            for i in range(len(hand_distances)):
                dist, h = hand_distances[i]
                if h["type"] == "Right":
                    dj_hands_ids = [i]
                    break

        # Process only locked hands
        for h in range(len(hands)):
            if h in dj_hands_ids and h["type"] == "Right":
                changeVolume = isChangeVolume(hands[h])

    if changeVolume:
        print("fingers: " + fingers)
        return {
            "action": "adjust_volume",
            "volume": fingers * 20,
        }, new_img
    
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
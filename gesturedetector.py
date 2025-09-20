import time
import cv2
from time import sleep
from cvzone.HandTrackingModule import HandDetector
from datetime import datetime

# Initialize HandDetector for hand tracking
detector = HandDetector(staticMode=False, maxHands=2, modelComplexity=1, detectionCon=0.5, minTrackCon=0.5)

# Global counter variables
fingers = 0
dj_hands_ids = []

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

# Function to process the frame and generate JSON commands
def process_frame_and_generate_command(img):
    global dj_hands_ids

    # Hand detection
    hands, new_img = detector.findHands(img, draw=True, flipType=True)
    changeVolume = False

    if hands:
        # If no hand locked pick largest bounding box
        hand_sizes = []
        for i, h in enumerate(hands):
            x, y, w, h_box = h["bbox"]
            area = w * h_box
            hand_sizes.append((area, i, h))
        # Sort by area
        hand_sizes.sort(key=lambda d: d[0], reverse=True)
        for area, idx, h in hand_sizes:
            if h["type"] == "Right":  # only right hand for now
                dj_hands_ids = [idx]
                break

        # Process only locked hands
        for h in range(len(hands)):
            if h in dj_hands_ids and hands[h]["type"] == "Right":
                changeVolume = isChangeVolume(hands[h])

    if changeVolume:
        print("fingers: " + str(fingers))
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
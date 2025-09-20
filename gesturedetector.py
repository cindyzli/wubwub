import time
import cv2
from time import sleep
from cvzone.HandTrackingModule import HandDetector
from datetime import datetime

# Initialize HandDetector for hand tracking
detector = HandDetector(staticMode=False, maxHands=2, modelComplexity=1, detectionCon=0.5, minTrackCon=0.5)

# Global counter variables
fingers = 0

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

# Function to process the frame and generate JSON commands based on finger count
def process_frame_and_generate_command(img):
    hand, new_img = detector.findHands(img, draw=True, flipType=True)
    changeVolume = False
    global fingers
    global buzzerFrames
    global pillFrames

    if hand:   
        # Process both hands if detected
        for h in hand:
            if h["type"] == "Right":
                # Count fingers for the right hand
                changeVolume = isChangeVolume(h)

    if changeVolume:
        print(fingers)
        return {
            "action": "adjust_volume",
            "volume": fingers * 20,
        }, img
    
    return {
        "action": "none",
    }, img

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
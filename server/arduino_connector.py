import serial, time

PORT = "COM6" # "/dev/cu.usbmodem1401"  # <-- replace with your Arduino port
BAUD = 9600

ser = serial.Serial(PORT, BAUD, timeout=1)
time.sleep(2)  # wait for Arduino reset

def send_cmd(cmd):
    ser.write(cmd.encode('utf-8'))
    line = ser.readline().decode('utf-8').strip()
    if line:
        print("Arduino:", line)

# examples
# send_cmd('r')  # red

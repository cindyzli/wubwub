import serial
import time

# adjust port name to your Arduino's
arduino = serial.Serial(port="COM6", baudrate=9600, timeout=1)
time.sleep(2)  # wait for Arduino reset

def send_command(cmd):
    arduino.write(cmd.encode())   # send as bytes
    print(f"Sent: {cmd}")
    line = arduino.readline().decode().strip()
    if line:
        print("Arduino replied:", line)

# Example: cycle colors
send_command("r")
time.sleep(2)

send_command("g")
time.sleep(2)

send_command("b")
time.sleep(2)

send_command("0")   # turn off

arduino.close()

#include <Adafruit_DotStar.h>
#include <SPI.h>

#define NUMPIXELS 70 // number of LEDs
Adafruit_DotStar strip(NUMPIXELS, DOTSTAR_BRG);

void setup()
{
    Serial.begin(9600);
    strip.begin();
    strip.show(); // start with all LEDs off
    Serial.println("Ready for commands (r,g,b,0)");
}

void loop()
{
    if (Serial.available() > 0)
    {
        char cmd = Serial.read();

        if (cmd == 'r')
        {
            setColor(255, 0, 0); // red
            Serial.println("Set RED");
        }
        else if (cmd == 'g')
        {
            setColor(0, 255, 0); // green
            Serial.println("Set GREEN");
        }
        else if (cmd == 'b')
        {
            setColor(0, 0, 255); // blue
            Serial.println("Set BLUE");
        }
        else if (cmd == '0')
        {
            setColor(0, 0, 0); // off
            Serial.println("Turned OFF");
        }
    }
}

void setColor(uint8_t r, uint8_t g, uint8_t b)
{
    for (int i = 0; i < NUMPIXELS; i++)
    {
        strip.setPixelColor(i, r, g, b);
    }
    strip.show();
}

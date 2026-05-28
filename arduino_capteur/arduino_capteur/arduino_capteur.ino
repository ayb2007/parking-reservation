#include <WiFiS3.h>

char ssid[] = "iPhone de Ayb";
char pass[] = "12345678";

char server[] = "192.168.56.1";
int port = 8001;

int status = WL_IDLE_STATUS;
WiFiClient client;

const int pinCapteur = 4;
int etatPrecedent = LOW;

void setup() {
  Serial.begin(115200);
  pinMode(pinCapteur, INPUT_PULLUP);

  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    delay(5000);
  }
}

void loop() {
  int etatActuel = digitalRead(pinCapteur);

  if (etatActuel != etatPrecedent) {
    if (client.connect(server, port)) {
      client.println("POST /api/spots/A1/toggle HTTP/1.1");
      client.print("Host: ");
      client.println(server);
      client.println("Content-Type: application/json");
      client.println("Content-Length: 0");
      client.println();
      client.stop();
    }
    etatPrecedent = etatActuel;
    delay(1000);
  }
}
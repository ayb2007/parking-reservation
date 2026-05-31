Markdown
# ParkEase - Parking 2.0

Projet de fin d'année ESILV : Système de réservation et de gestion de parking intelligent en temps réel avec capteurs IoT.

## Équipe Projet
- Ayoub Oumouma
- Ebby
- Stéphane
- Emmanuel (Koffi)

## Architecture du Projet
Le projet est divisé en trois parties connectées :
1. **Frontend** : Interface web (HTML/CSS/JS) type Landing Page avec plan interactif.
2. **Backend** : API Symfony et base de données MySQL.
3. **Hardware** : Arduino UNO R4 WiFi avec capteur de présence.

---

## 1. Prérequis et Base de données

Assurez-vous d'avoir PHP, Symfony CLI et un serveur MySQL (ex: XAMPP) allumés sur le PC.

Ouvrez phpMyAdmin (`http://localhost/phpmyadmin`) et exécutez le script SQL suivant sur la base `parkease_db` pour initialiser les 4 places de démonstration :

CREATE DATABASE IF NOT EXISTS parkease_db;
USE parkease_db;

CREATE TABLE IF NOT EXISTS spot (
  id VARCHAR(10) PRIMARY KEY,
  zone VARCHAR(10),
  type VARCHAR(50),
  price DECIMAL(5,2),
  status VARCHAR(20)
);

DELETE FROM spot;

INSERT INTO spot (id, zone, type, price, status) VALUES 
('1', 'A', 'Standard', 2.5, 'free'),
('2', 'A', 'Standard', 2.5, 'free'),
('3', 'A', 'Standard', 2.5, 'free'),
('4', 'A', 'PMR', 2.5, 'free');


2. Lancement du Serveur Web (Backend)
Ouvrez un terminal dans le dossier backend du projet et lancez le serveur en autorisant impérativement les connexions réseau externes :

Bash
symfony server:start --port=8000 --allow-all-ip
Le site est désormais accessible depuis un navigateur à l'adresse suivante :
http://127.0.0.1:8000/parkease.html

Laissez ce terminal ouvert en arrière-plan pendant toute la durée de la démonstration.

3. Configuration Hardware (Arduino UNO R4 WiFi)
Code Arduino à téléverser
C++
#include <WiFiS3.h>

char ssid[] = "TON_RESEAU_WIFI";
char pass[] = "TON_MOT_DE_PASSE";

char server[] = "192.168.X.X";
int port = 8000;

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
      client.println("POST /api/spots/1/toggle HTTP/1.1");
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
Vérifications cruciales avant la présentation
Pour que le jour de la présentation soit un succès, vérifiez juste ces 3 points techniques avant d'allumer le montage :

L'Arduino et le PC doivent être sur le même réseau Wi-Fi (le partage de connexion d'un smartphone est souvent le plus fiable pour éviter les blocages des réseaux publics).

Remplacez 192.168.X.X dans le code par la véritable adresse IPv4 du PC qui héberge le site (vous la trouvez en tapant ipconfig dans le terminal Windows du PC qui fait tourner le serveur).

Le terminal du PC doit bien afficher que le serveur tourne avec la commande symfony server:start --port=8000 --allow-all-ip. Sans la fin de cette commande, le PC refusera de discuter avec l'Arduino.

4. Guide d'utilisation de l'interface
Assurez-vous que le serveur tourne et que l'Arduino est branché et connecté au Wi-Fi.

Ouvrez le site web sur le navigateur.

Passez un objet devant le capteur physique infrarouge/ultrason : la requête HTTP est envoyée via Wi-Fi.

La place 1 sur le plan interactif web passera automatiquement de l'état "Libre" (vert) à "Occupée" (rouge) grâce au rafraîchissement automatique de la page.

Accès Administrateur Restreint
Cliquez sur l'icône cadenas en haut à droite du menu de navigation.

Mot de passe : 1234

Le panel de contrôle permet d'avoir une vue directe sur la base de données matérielle et d'inverser manuellement l'état des capteurs si nécessaire lors de la démonstration.

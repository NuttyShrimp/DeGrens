# Elevators

Om meerdere toe te voegen volg deze template in dg-config/elevators/json:

```ts
  "index": { // Interne naam van de lift, MOET uniek zijn
    "name": "Arcadius Building Lift", // Display naam van lift, wordt getoond in menu
    "levels": {
      "levelindex": { // Interne naam van de verdieping, MOET uniek zijn
        "name": "Tuning Shop", // Display naam van verdieping, wordt getoond in menu
        "interact": { "x": -140.15, "y": -586.24, "z": 167.18 }, // Positie van de liftknop waar je moet interacten. Deze coordinaat is middelpunt van de peekable bol.
        "spawn": { "x": -138.87, "y": -588.26, "z": 167.0, "w": 131.3 }, //  Positie van de spawnplaats na het gebruiken van de lift. Vector4 voor de heading niet vergeten!
        "job": "police" // De vereiste job die nodig is om deze optie te kunnen zien. Indien voor iedereen dan deze lijn weglaten.
      },
      "levelindex2": { // zo meerdere verdiepingen
        ...
      }
    }
  }
```

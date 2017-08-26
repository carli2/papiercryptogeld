# Papier-Cryptogeld
Implementiert eine Kryptowährung, die man auf Papier ausdrucken kann

## Funktionsweise
Mittels ECC-Kryptografie werden Geldscheine erstellt, die aus einem privaten und einem öffentlichen Schlüssel bestehen.

Ein Geldschein wird so gefaltet, dass der öffentliche Schlüssel als QR-Code sichtbar ist, während der QR-Code mit dem private Schlüssel weggeknickt wird.

Ein Geldschein kann auf zwei Weisen gescannt werden: Zum Überprüfen der Richtigkeit scant man den öffentlichen Schlüssel. Zum Bezahlen wird hingegen der private Schlüssel gescant.

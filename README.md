# Apostemos ⚽

Aplicación de pronósticos para el Mundial FIFA 2026. Vero y Jose compiten prediciendo los marcadores de todos los partidos — el que más puntos acumule gana el viaje.

## Usuarios

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| Vero | password | Admin |
| Jose | 2828jose | Usuario |

## Sistema de puntos

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto | 5 pts |
| Ganador correcto (sin marcador exacto) | 3 pts |
| Empate correcto (sin marcador exacto) | 1 pt |
| Predicción incorrecta | 0 pts |

## Reglas

- **Cierre de apuestas:** cada partido se bloquea automáticamente a la hora de inicio. No se pueden hacer ni editar apuestas una vez comenzado el partido.
- **Pronósticos:** se predice el resultado al final del tiempo reglamentario (90 min). En partidos de eliminatorias, si hay prórroga o penales, el marcador que cuenta es el del final del tiempo reglamentario.
- **Una apuesta por partido:** se puede editar la apuesta antes del cierre.
- **Resultados:** solo Vero (admin) puede ingresar los marcadores oficiales. Los puntos se calculan automáticamente.
- **Clasificación:** el ranking se actualiza en tiempo real en la sección "Clasificación".

## Stack técnico

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL
- **Deploy:** Render.com

## Estructura del proyecto

```
apostemos/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Schedule, Leaderboard, Login
│       └── components/  # Header, MatchCard, BetModal
├── server/          # Express backend
│   ├── routes/      # auth, matches, bets
│   ├── db.js        # Pool + schema + seed data
│   └── index.js     # App entry point
└── render.yaml      # Render deployment config
```

## Deploy en Render

1. Crear una base de datos PostgreSQL en Render (plan free), llamada `apostemos-db`.
2. Crear un Web Service apuntando a este repositorio.
3. Configurar la variable de entorno `DATABASE_URL` copiándola del tab "Connect" de la base de datos.
4. El build command y start command ya están en `render.yaml`.

La base de datos se inicializa automáticamente con usuarios y partidos al primer arranque.

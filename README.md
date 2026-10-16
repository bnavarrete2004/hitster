# Tiempo — prototipo de cartas

Prototipo local de la fase 0 del juego musical. Utiliza canciones ficticias y se centra en arrastrar una carta oculta a una línea de tiempo, revelar su año y animarla hasta la posición correcta cuando falla la elección.

## Ejecutar

Requiere Node.js 24 o superior para ejecutar las pruebas TypeScript directamente.

```bash
npm install
npm run dev
```

Abre la URL local que muestra Vite. Para comprobar la lógica y crear el build:

```bash
npm test
npm run build
```

El arrastre funciona con puntero y pantalla táctil. También se puede elegir cada hueco mediante sus botones, con teclado, y confirmar la posición.

## Alcance actual

La puntuación y la validación son **simulaciones locales** para probar la interacción. Todavía no hay servidor, multijugador ni reproducción de música. Antes de una partida real, esas reglas deberán pasar al servidor autoritativo y la canción oculta no deberá enviarse al navegador.

Consulta [PROJECT_STATE.md](PROJECT_STATE.md) para el estado y [AGENTS.md](AGENTS.md) para las reglas del proyecto.

# GARAGE OS — Portafolio

Prototipo interactivo: PC estilo CRT → garage NFS Underground con coche rotatorio.

## Correr

```bash
npm install
npm run dev
```

## Flujo

1. Boot screen
2. Habitación con PC — click **ENTRAR AL MONITOR** o el CRT
3. Garage: arrastra el coche para rotar, click piezas (o chips abajo) para abrir secciones del CV

## Editar contenido

`src/data/cv.ts` — textos, skills, links, proyectos.

## Música

Track actual: `public/music/riders-on-the-storm.mp3`  
(Riders On The Storm — Fredwreck Remix / NFSU2)

Para cambiar canción: reemplaza ese archivo o edita `src/components/MusicPlayer.tsx`.
Usa nombres simples sin espacios ni `&` `[]` `()` para evitar problemas de URL.

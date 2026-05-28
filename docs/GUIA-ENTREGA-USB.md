# Guía de entrega en USB — Care Sync

Esta guía explica cómo preparar el proyecto para entregarlo en una memoria USB a tu profesor.

---

## Importante: qué es (y qué no es) este proyecto

Care Sync **no es un programa `.exe` tradicional** (como un instalador de Windows). Es una **aplicación web full-stack**:

| Componente | Dónde vive |
|------------|------------|
| Interfaz + API (`/api/*`) | Tu carpeta del proyecto (Node.js + Vite) |
| Base de datos | **Supabase en la nube** (PostgreSQL) |

Por eso, en el USB va el **código + launcher**, y para demostrar el sistema hace falta:

1. **Node.js** instalado en la PC donde se ejecute (o incluir instrucciones).
2. **Conexión a internet** (para hablar con Supabase).

Convertir todo a un solo `.exe` (Electron, Tauri, etc.) es posible pero **mucho más complejo** y no aporta valor para una materia de bases de datos; lo habitual es entregar código + documentación + script de inicio.

---

## Contenido recomendado del USB

```
USB/
├── health-harmony-portal/          ← Carpeta completa del proyecto
│   ├── INICIAR.bat                 ← Doble clic para arrancar (Windows)
│   ├── .env                        ← Credenciales Supabase (incluir en entrega)
│   ├── docs/
│   │   ├── analisis-sistema.md     ← Arquitectura BD y algoritmos
│   │   ├── prd.md
│   │   └── GUIA-ENTREGA-USB.md     ← Este archivo
│   ├── supabase/migrations/        ← Scripts SQL (001–015)
│   ├── src/                        ← Código fuente
│   ├── node_modules/               ← Opcional: pre-instalar para no esperar
│   └── package.json
└── LEEME.txt                       ← Instrucciones de 3 líneas para el profesor
```

---

## Pasos para preparar el USB (en tu PC)

### 1. Verificar que el proyecto funciona

```powershell
cd health-harmony-portal
npm install
npm run build
npm run dev
```

Abre `http://localhost:8080` y prueba login doctor/paciente y una receta.

### 2. Copiar la carpeta al USB

Copia **toda** la carpeta `health-harmony-portal` al pendrive.

**Opción rápida para el profesor:** antes de copiar, ejecuta `npm install` en tu PC para que `node_modules` ya venga en el USB (ocupa ~300–500 MB, pero evita instalación en clase).

**Opción ligera:** no copies `node_modules`; el script `INICIAR.bat` ejecutará `npm install` la primera vez (requiere internet).

### 3. Incluir el archivo `.env`

El profesor necesita las variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Puedes usar el mismo `.env` de tu proyecto de demo (la clave `anon` es pública por diseño de Supabase; no incluyas la `service_role`).

### 4. Documentación impresa o en PDF (opcional)

Exporta a PDF:

- `docs/analisis-sistema.md` — arquitectura y algoritmos de BD
- `supabase/migrations/README.md` — orden de migraciones

### 5. Crear `LEEME.txt` en la raíz del USB

Ejemplo:

```text
Care Sync — Proyecto Administración de Base de Datos

1. Instalar Node.js LTS: https://nodejs.org/
2. Abrir carpeta health-harmony-portal
3. Doble clic en INICIAR.bat
4. Se abrirá http://localhost:8080

Requiere internet (base de datos en Supabase).
Documentación: docs/analisis-sistema.md
```

---

## Cómo lo ejecuta tu profesor (Windows)

1. Instalar **Node.js 20 LTS** (si no lo tiene): https://nodejs.org/
2. Insertar USB → abrir `health-harmony-portal`
3. **Doble clic en `INICIAR.bat`**
4. Esperar a que abra el navegador en `http://localhost:8080`

Para detener: cerrar la ventana negra del script o `Ctrl+C`.

---

## Alternativa: entrega solo con URL (sin ejecutar en USB)

Si despliegas la app (Cloudflare, Vercel, etc.) y la BD sigue en Supabase:

- USB con **documentación + migraciones SQL + código fuente**
- En `LEEME.txt` pones la **URL pública** del demo

Ventaja: el profesor solo abre el enlace; no instala Node.

---

## Checklist antes de entregar

- [ ] `INICIAR.bat` probado en otra PC (o al menos `npm run dev` funciona)
- [ ] `.env` presente con Supabase válido
- [ ] Hay al menos un doctor y un paciente de prueba en la BD
- [ ] Hay una receta de ejemplo con alertas
- [ ] `docs/analisis-sistema.md` actualizado
- [ ] Migraciones SQL en `supabase/migrations/` completas
- [ ] USB formateado FAT32/exFAT (compatible Mac/Windows si aplica)

---

## Preguntas frecuentes

**¿Puedo hacer un `.exe`?**  
Solo empaquetando Node + el proyecto con herramientas como Electron o un instalador NSIS; pesa cientos de MB y sigue necesitando internet para Supabase. No es lo usual para este tipo de entrega académica.

**¿La base de datos va en el USB?**  
No. Los datos están en Supabase. En el USB van los **scripts SQL** (`supabase/migrations/`) que documentan el diseño.

**¿Funciona sin internet?**  
No completamente: login, recetas y citas requieren conexión a Supabase.

**¿Mac o Linux?**  
En Mac/Linux: `npm install` y `npm run dev` desde terminal (no hay `.bat`; equivalente: `npm run dev`).

---

## Comandos útiles

| Acción | Comando |
|--------|---------|
| Desarrollo | `npm run dev` |
| Compilar | `npm run build` |
| Vista previa build | `npm preview` |

---

*Care Sync — health-harmony-portal*

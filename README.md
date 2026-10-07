# DFKMusic: Taller Reproductor de Música

## 1. Nombre del proyecto

**Taller Reproductor de Música**: reproductor web hecho con TypeScript, React y Vite, cuya lista de reproducción principal es una **lista doblemente enlazada** implementada desde cero.

## 2. Descripción

Aplicación web con registro e inicio de sesión. Cada usuario carga canciones desde su propio dispositivo, las organiza en una biblioteca y las reproduce con controles completos. La interfaz incluye una vista **Estructura de la lista** que muestra los nodos (`previous`, `value`, `next`), `head`, `tail` y los recorridos hacia adelante y hacia atrás.

## 3. Objetivo

Aplicar estructuras de datos, programación orientada a objetos y patrones de diseño en un proyecto real, desplegable en Vercel.

## 4. Tecnologías

| Uso | Tecnología |
|---|---|
| Lenguaje | TypeScript (todo el código en inglés) |
| Interfaz | React 18 + React Router, HTML5, CSS |
| Empaquetado | Vite |
| Audio | `HTMLAudioElement` (HTML5 Audio) |
| Metadatos (artista, carátula) | `jsmediatags` |
| Backend | Vercel Functions (carpeta `api/`) |
| Base de datos | Neon (PostgreSQL) con `@neondatabase/serverless` |
| Sesión | JWT firmado (`jose`) en cookie `HttpOnly` |
| Contraseñas | `scrypt` del módulo `crypto` de Node |
| Pruebas | Vitest |

Node y npm se usan solo como herramientas de desarrollo. No hay servidor Node propio.

## 5. Instalación

Requisitos: Node 20 o superior.

```bash
npm install
```

## 6. Ejecución

El frontend necesita la carpeta `api/` para autenticarse, así que para desarrollar con todo funcionando usa Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel link              # vincula la carpeta con tu proyecto de Vercel
vercel env pull .env.local   # descarga DATABASE_URL y AUTH_SECRET
npm run dev:full         # = vercel dev (frontend + API)
```

Otros comandos:

```bash
npm run dev         # solo frontend (las llamadas a /api fallarán)
npm test            # pruebas de estructuras, biblioteca y autenticación
npm run typecheck   # tipos del frontend y de la API
npm run build       # build de producción
```

`localhost` solo se usa para desarrollar. En producción todas las URLs son relativas (`/api/...`).

## 7. Estructura del proyecto

```
api/                        Vercel Functions
  _lib/                     db, password, session, http (no son rutas)
  auth/                     register, login, logout, session
  library-state.ts          GET/PUT de preferencias y listas
db/schema.sql               tablas de Neon
src/
  data-structures/          SongNode, DoublyLinkedList, SinglyLinkedList, Stack, Queue
  models/                   Song, SongSource, Playlist, User + tipos de estado
  patterns/                 SongBuilder, SongCreator, SortStrategy, AudioEngine, FadeInAudioEngine
  services/                 MusicPlayer, MediaLibrary, AuthenticationService, LocalFileService, ...
  hooks/                    usePlayer, usePersistence, useKeyboardShortcuts
  components/  pages/       interfaz
  styles/  utils/
```

## 8. Programación orientada a objetos

| Clase | Responsabilidad |
|---|---|
| `SongNode<T>` | Nodo con `previous`, `value`, `next`. |
| `DoublyLinkedList<T>` | `head`, `tail`, `size` y todas las operaciones de la lista. Los punteros son privados al exterior (se leen con `getHead()` y `getTail()`). |
| `Playlist` | Posee una `DoublyLinkedList<Song>` y un **cursor** (`current`) al nodo actual. Implementa `moveNext()` y `movePrevious()`. |
| `Song` | Datos inmutables de una canción y acceso a su `SongSource`. |
| `SongSource` (interfaz) | `getUrl()` y `release()`. |
| `LocalFileSource`, `RemoteUrlSource` | Dos implementaciones: **polimorfismo** real. |
| `MediaLibrary` | Biblioteca, listas del usuario, favoritos y claves pendientes de resolver. |
| `MusicPlayer` | Reproducción, cola, historial, repetir y aleatorio. |
| `AuthenticationService` | Cliente de registro, login, logout y sesión. |
| `ApiError extends Error` | **Herencia** con sentido: añade `code` y `status`. |
| `SongCreator<T>` (abstracta) | Base de `LocalFileSongCreator` y `RemoteUrlSongCreator`. |

Encapsulación: `DoublyLinkedList` oculta `head`, `tail` y `size`; `Playlist` oculta su cursor; `MusicPlayer` oculta su estado y expone un estado inmutable.

## 9. Data Structures

### Doubly Linked List (`DoublyLinkedList<Song>`): estructura principal

Es la lista de reproducción. Cada nodo apunta al anterior y al siguiente, por lo que **Next y Previous cuestan O(1)** y se puede recorrer en ambos sentidos. Un `Array` obligaría a manejar índices; aquí se usa `node.next` y `node.previous`.

| Operación | Método |
|---|---|
| Agregar al inicio / final | `addFirst()` / `addLast()` |
| Insertar en una posición | `insertAt(index, value)` |
| Eliminar por valor / por posición | `remove()` / `removeAt()` |
| Obtener / buscar | `get()` / `find()` |
| Navegar | `next(node)` / `previous(node)` |
| Vaciar, vacía, tamaño | `clear()` / `isEmpty()` / `getSize()` |
| Ordenar | `sortAlphabetically()` / `sort()` |
| Reubicar un nodo | `moveNode(node, index)` / `indexOf(node)` |

`getNode(index)` recorre desde `head` o desde `tail`, según cuál esté más cerca. El ordenamiento es **merge sort sobre nodos** (estable, O(n log n)): reordena los enlaces y reconstruye los `previous`, por lo que los nodos conservan su identidad y el cursor de la playlist sigue siendo válido.

### Queue (cola de reproducción)

FIFO. "Añadir a la cola" hace `enqueue()`; al pulsar Next, si la cola tiene elementos, `dequeue()` decide qué suena. Está construida sobre una `SinglyLinkedList` con puntero a `tail`, así `enqueue` y `dequeue` son O(1).

### Stack (historial)

LIFO. Cada canción que empieza a sonar se apila (`push`). Alimenta "Reproducidas hace poco" y el botón Previous en modo aleatorio (se desapila para volver a la canción anterior). Está respaldada por un array porque `push` y `pop` al final son O(1).

### Singly Linked List (favoritos)

Colección secundaria: los favoritos solo se insertan al inicio (los más recientes primero), se eliminan y se recorren hacia adelante. No necesita ir hacia atrás, así que un enlace por nodo es suficiente.

### Array

Archivos seleccionados antes de convertirse en `Song`, resultados de búsqueda y vistas para renderizar la interfaz.

## 10. Design Patterns

| Patrón | Dónde | Qué problema resuelve |
|---|---|---|
| **Singleton** | `MusicPlayer.getInstance()` | Solo puede haber un reproductor; dos instancias sonarían a la vez. |
| **Builder** | `SongBuilder` | `Song` tiene varios atributos opcionales (artista, álbum, portada, duración). |
| **Factory Method** | `SongCreator.createSource()` en `LocalFileSongCreator` y `RemoteUrlSongCreator` | El método `createSong()` define los pasos y cada subclase decide qué `SongSource` crear. |
| **Bridge** | `MusicPlayer` (abstracción) ↔ `AudioEngine` (implementación) | La lógica de lista, cola y estado no depende de `HTMLAudioElement`. |
| **Decorator** | `FadeInAudioEngine` envuelve a cualquier `AudioEngine` | Añade fade-in al reproducir sin modificar `HtmlAudioEngine`. |
| **Strategy** | `SortStrategy`: `AlphabeticalAscending`, `AlphabeticalDescending`, `InsertionOrder` | Cada criterio es una clase intercambiable que ordena la lista doble. |
| **Observer** | `MusicPlayer.subscribe()` + `useSyncExternalStore` | React se actualiza cuando cambia el reproductor. |

**Abstract Factory no se usa**: solo hay una familia de productos y no aportaría nada.

Cómo interactúan con las estructuras: `SongCreator` crea la `Song`, `MediaLibrary` la inserta en la `DoublyLinkedList`, `MusicPlayer` mueve el cursor con `node.next` o `node.previous`, y la ordenación (Strategy) reordena los nodos. El `AudioEngine` (Bridge + Decorator) solo recibe la URL de la canción actual.

## 11. Funcionamiento de la lista doble

```
null ← [ A ] ⇄ [ B ] ⇄ [ C ] → null
        head              tail
```

- **Insertar en el medio** (`insertAt`): se enlazan `previous` y `next` del nuevo nodo con sus vecinos y se actualizan los dos vecinos.
- **Eliminar** (`unlink`): el anterior apunta al siguiente y el siguiente al anterior; si era `head` o `tail`, esos punteros se actualizan.
- **Ordenar**: merge sort sobre los enlaces `next` y una pasada final que reconstruye `previous` y `tail`.
- **Mover una canción** (`moveNode`): se desenlaza el nodo (`unlink`) y se vuelve a enlazar en la nueva posición (`linkBefore` o `linkAfterTail`). Es el mismo objeto nodo, no una copia, así que el cursor de la playlist y la canción que está sonando siguen siendo válidos. En la interfaz, el botón ⇅ de cada canción abre el formulario para elegir la posición.

Abre **Estructura de la lista** en la barra lateral para ver los nodos, sus enlaces, `head`, `tail`, la canción actual y los recorridos en ambos sentidos. Las posiciones de inserción (inicio, final, posición N) se eligen en **Añadir música**.

## 12. Funcionamiento del reproductor

- `next()`: 1) si la cola tiene elementos, `dequeue()`; 2) si el aleatorio está activo, elige un nodo al azar; 3) si no, `current.next`; 4) si no hay siguiente y repetir es "toda la lista", vuelve a `head`.
- `previous()`: si llevas más de 3 s, reinicia la canción; en aleatorio usa el Stack; si no, `current.previous`.
- Al terminar una canción pasa a la siguiente (o la repite si repetir es "una canción").
- Controles: play, pausa, anterior, siguiente, barra de progreso, tiempo, duración, volumen, silencio, repetir, aleatorio, portada y artista.
- Atajos: `Espacio`, `N`, `P`, `←`, `→`, `M`, `S`, `R`.

## 13. Autenticación

- **Registro**: valida correo, contraseña (mínimo 8) y confirmación en el cliente y en el servidor. La contraseña se guarda como `salt:hash` con `scrypt`. Nunca en texto plano.
- **Login**: compara con `timingSafeEqual`. El error es genérico (`INVALID_CREDENTIALS`) para no revelar si el correo existe.
- **Sesión**: JWT firmado con `AUTH_SECRET`, guardado en cookie `HttpOnly`, `SameSite=Lax` y `Secure` en Vercel. JavaScript del navegador no puede leerlo.
- **Rutas protegidas**: `ProtectedRoute` redirige a `/login`; `PublicOnlyRoute` evita ver el login con sesión activa.
- **Logout**: borra la cookie y reinicia el reproductor.

Limitaciones asumidas por ser un trabajo académico: no hay verificación de correo, recuperación de contraseña ni límite de intentos.

## 14. Manejo de archivos locales

1. **Seleccionar música**: usa `showOpenFilePicker` (Chrome y Edge de escritorio). Si el navegador no lo soporta (Firefox, Safari, iOS), usa `<input type="file" multiple accept="audio/*">`.
2. Los `File` se guardan en un **Array** temporal y se filtran por tipo (MP3, WAV, OGG, M4A/AAC, FLAC según el navegador).
3. `LocalFileSongCreator` crea una `LocalFileSource` con `URL.createObjectURL(file)`, lee los tags con `jsmediatags` y la duración con un `Audio` temporal, y construye la `Song` con `SongBuilder`.
4. El audio se reproduce directamente desde esa URL temporal. **Nada se sube a ningún servidor.**
5. `Song.release()` revoca la URL cuando la canción se elimina.

Qué se guarda en Neon: solo correo, hash, preferencias (volumen, repetir, aleatorio), nombres de listas y **claves** de canciones (`nombreDeArchivo|tamaño`). Como el navegador no permite recordar archivos del disco, al volver a abrir la app debes **seleccionar otra vez tus archivos**; las listas y favoritos se reconstruyen solos al reconocer esas claves.

---

## 15. Despliegue en Vercel con Neon

### Paso 1. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Taller Reproductor de Música"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

`.env`, `.env.local` y `node_modules` están en `.gitignore`.

### Paso 2. Importar en Vercel

1. En [vercel.com/new](https://vercel.com/new) elige tu repositorio.
2. Vercel detecta **Vite** y toma `vercel.json`: build `npm run build`, salida `dist`.
3. Pulsa **Deploy**. Aún no funcionará el login; faltan la base de datos y el secreto.

### Paso 3. Crear la base de datos Neon

**Opción A (recomendada): desde Vercel**

1. En tu proyecto de Vercel abre **Storage** (o **Marketplace**) → **Neon** → **Create / Add**.
2. Acepta crear la base de datos y conéctala al proyecto, marcando los entornos Production, Preview y Development.
3. Vercel añade automáticamente variables de entorno. Entra a **Settings → Environment Variables** y confirma que existe **`DATABASE_URL`**.
   - Si la integración solo creó otro nombre (por ejemplo `POSTGRES_URL`), crea tú `DATABASE_URL` con el mismo valor.

**Opción B: manual**

1. Crea un proyecto en [neon.tech](https://neon.tech).
2. En el panel pulsa **Connect** y copia la cadena de conexión (con `?sslmode=require`; la versión *pooled* es la ideal para funciones serverless).
3. En Vercel: **Settings → Environment Variables → Add** con nombre `DATABASE_URL` y esa cadena como valor.

### Paso 4. Crear las tablas

1. En la consola de Neon abre **SQL Editor**.
2. Pega el contenido de `db/schema.sql` y ejecútalo.
3. En **Tables** deben aparecer `users`, `user_preferences` y `playlists`.

### Paso 5. Crear `AUTH_SECRET`

Genera un secreto aleatorio:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

En Vercel: **Settings → Environment Variables → Add**, nombre `AUTH_SECRET`, pega el valor y marca Production, Preview y Development. Debe tener al menos 32 caracteres. No lo subas a GitHub.

### Paso 6. Volver a desplegar

Las variables solo se aplican a despliegues nuevos. En **Deployments**, abre el último y pulsa **Redeploy**.

### Paso 7. Probar

1. Abre la URL de Vercel y pulsa **Regístrate**.
2. Cierra sesión e inicia sesión de nuevo.
3. En **Añadir música** → **Seleccionar música**, elige varios archivos y añádelos.
4. Ordena A-Z, reproduce, avanza, retrocede y abre **Estructura de la lista**.
5. Crea una lista, recarga la página y comprueba que la lista sigue ahí.

### Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Conexión a Neon. |
| `AUTH_SECRET` | Firma de la sesión (mínimo 32 caracteres). |

Ver `.env.example`.

### Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| Al registrarte aparece "Ocurrió un error inesperado" | Falta `DATABASE_URL` o `AUTH_SECRET`, o no se hizo Redeploy. Revisa **Deployments → Functions → Logs**. |
| Error `relation "users" does not exist` en los logs | No se ejecutó `db/schema.sql` en la base correcta. |
| Al refrescar `/login` sale 404 | Falta el rewrite de `vercel.json`; verifica que el archivo esté en la raíz. |
| Una canción no suena | El navegador no soporta ese formato (por ejemplo FLAC en algunos). |
| En iPhone no se ven los archivos | Usa el selector del sistema: iOS no soporta `showOpenFilePicker`, se usa el `<input>` de respaldo. |
| `npm run dev` y el login falla | `npm run dev` no sirve `/api`; usa `npm run dev:full` (Vercel CLI). |

## Pruebas

```bash
npm test
```

Cubren la lista doble (inserción, eliminación, navegación, ordenamiento), Stack, Queue, lista simple, `Playlist` y `MediaLibrary`, y el hash de contraseñas y la sesión firmada.

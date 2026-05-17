# Spotydle 🎵

Spotydle es una aplicación web Full-Stack inspirada en los populares juegos de retos diarios, enfocada íntegramente en el ecosistema musical. El proyecto ha sido desarrollado de forma individual como Proyecto Final de Ciclo para el **CFGS de Desarrollo de Aplicaciones Web (DAW)** en el **Instituto Puig Castellar**.

La plataforma permite a los usuarios poner a prueba sus conocimientos musicales intentando adivinar una canción oculta cada 24 horas a través de un sistema dinámico de pistas funcionales y un buscador inteligente.

---

## 🚀 Características Principales

- **Desafío Diario Automatizado:** Una composición musical única oculta cada 24 horas para toda la comunidad de jugadores.
- **Motor de Pistas Progresivas:** Tras cada intento fallido, el sistema libera secuencialmente información crítica:
  - *Pista 1:* Fragmento de audio en modo invertido de 5 segundos.
  - *Pistas 2 y 3:* Metadatos técnicos (año de lanzamiento y género musical) junto con una ampliación del audio normal.
  - *Pistas 4 y 5:* Reducción matemática progresiva del filtro de desenfoque (*blur*) en la carátula oficial provista por iTunes.
  - *Pista 6:* Desvelado de las iniciales del artista y el título mediante expresiones regulares.
- **Buscador Predictivo Asíncrono:** Barra de búsqueda inteligente alimentada en tiempo real por el catálogo de iTunes API que normaliza las cadenas de texto (eliminando tildes, mayúsculas y espacios huérfanos) para evitar fallos ortográficos.
- **Persistencia Multidispositivo:** Sincronización atómica del estado de la partida en la nube mediante objetos JSON en PostgreSQL. Permite empezar el reto diario en un ordenador de escritorio de la estación local y finalizarlo en un dispositivo móvil doméstico exactamente en el mismo intento.
- **Gamificación Competitiva:** Panel de clasificaciones globales (*Leaderboard*) en tiempo real y módulo analítico que calcula el volumen de victorias, rachas de días consecutivos y vectores de distribución de aciertos mediante una matriz de enteros.

---

## 🛠️ Stack Tecnológico

El ecosistema de software se ha desarrollado bajo una arquitectura de monolito moderno unificado proporcionado por Next.js, garantizando una deuda técnica nula y alta cohesión:

- **Frontend & Backend:** Next.js (App Router) & React
- **Lenguaje:** TypeScript (Tipado estático estricto)
- **Estilos y Animaciones:** Tailwind CSS & Framer Motion
- **Persistencia de Datos:** PostgreSQL alojado en Neon (Serverless Postgres)
- **Acceso a Datos (ORM):** Prisma ORM
- **Seguridad y Autenticación:** NextAuth.js (Credenciales nativas cifradas con `bcryptjs` y acceso federado con Google OAuth 2.0)
- **Consumo Multimedia:** iTunes Search API
- **Suite de Testing:** Vitest & React Testing Library

---

## 📦 Instalación y Despliegue Local

Sigue estos pasos secuenciales en tu terminal para inicializar el entorno de desarrollo basándote en los scripts nativos del proyecto:

### 1. Clonar el repositorio e instalar dependencias
```
git clone [https://github.com/tu-usuario/spotydle-oficial.git](https://github.com/tu-usuario/spotydle-oficial.git)
cd spotydle-oficial
npm install
```
### 2. Configurar las variables de entorno
Crea un archivo .env en la raíz del proyecto tomando como referencia la estructura de variables técnicas esenciales:

```
# PERSISTENCIA Y BASE DE DATOS (NEON POSTGRESQL)
DATABASE_URL="postgresql://usuario:contraseña@servidor-neon.tech/spotydle?sslmode=require"

# AUTENTICACIÓN Y SEGURIDAD (NEXTAUTH)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cadena_aleatoria_de_cifrado_criptografico_jwt"

# PROVEEDOR DE IDENTIDAD (GOOGLE CLOUD CONSOLE OAUTH)
GOOGLE_CLIENT_ID="identificador_de_cliente_proveedor_google.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="clave_secreta_del_cliente_proveedor_google"

# CONFIGURACIÓN DE SERVICIOS AUXILIARES
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
### 3. Generar el cliente de datos de Prisma
Mapea los tipos estáticos de TypeScript leyendo el archivo schema.prisma para interactuar de forma segura con Neon:
```
npx prisma generate
```
### 4. Verificar la compilación del software
Ejecuta una comprobación completa del código fuente para asegurar que no existan errores de compilación ni de tipado antes de producción:
```
npm run build
```
### 5. Lanzar el servidor en entorno local
Inicializa el entorno local de Next.js para desarrollo (por defecto, en el puerto 3000) con refresco en caliente (Fast Refresh) activo:
```
npm run dev
```
La aplicación estará disponible de forma interactiva en http://localhost:3000.

---

## 🧪 Ejecución de Pruebas Automatizadas
Para validar el comportamiento determinista del motor lúdico y el procesamiento seguro de endpoints en memoria mediante Vitest, ejecuta el comando de pruebas:
```
npm run test
```

---

## 📄 Licencia
Este proyecto está bajo la licencia Creative Commons Reconocimiento-NoComercial-SinObraDerivada 3.0 España (CC BY-NC-ND 3.0 ES).

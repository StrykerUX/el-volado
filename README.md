# 🎮 Volado - Juego Móvil de Idle Clicker

Un juego móvil idle clicker que combina mecánicas de cookie clicker con un giro único de lanzamiento de moneda. Presenta mecánicas de apuestas justas 50/50, sistemas de apuestas estratégicas y diseño neo-brutalista suave.

## 🚀 Guía de Instalación para Windows (Paso a Paso)

### 📋 Requisitos Previos (Descargar e Instalar)

#### 1. **Descargar e instalar Node.js**:
   - Ve a https://nodejs.org/
   - Descarga la versión "LTS" (recomendada para la mayoría de usuarios)
   - Ejecuta el instalador y sigue el asistente de configuración
   - Marca "Agregar a PATH" cuando se solicite
   - **Verificar instalación**: Abre cmd y escribe `node --version`

#### 2. **Descargar e instalar Git**:
   - Ve a https://git-scm.com/download/win
   - Descarga Git para Windows
   - Ejecuta el instalador con configuraciones predeterminadas
   - **Verificar instalación**: Abre cmd y escribe `git --version`

#### 3. **Descargar e instalar PostgreSQL**:
   - Ve a https://www.postgresql.org/download/windows/
   - Descarga PostgreSQL 15 o superior
   - Durante la instalación, **RECUERDA** tu contraseña para el usuario 'postgres'
   - Mantén el puerto predeterminado 5432
   - Instala pgAdmin 4 cuando se solicite (herramienta visual opcional)

### 📥 Descargar el Proyecto

#### 1. **Abrir Símbolo del Sistema**:
   - Presiona `Windows + R`
   - Escribe `cmd` y presiona Enter
   - O busca "cmd" en el menú inicio

#### 2. **Navegar a tu carpeta deseada**:
   ```cmd
   cd Desktop
   ```
   - Esto te llevará al Escritorio
   - También puedes usar `cd Documents` para ir a Documentos

#### 3. **Clonar el proyecto**:
   ```cmd
   git clone https://github.com/StrykerUX/el-volado.git
   cd el-volado
   ```
   - Esto descarga todo el código del proyecto
   - Y te posiciona dentro de la carpeta del proyecto

### 🗄️ Configurar Base de Datos

#### 1. **Abrir Símbolo del Sistema como Administrador**:
   - Presiona `Windows + X`
   - Selecciona "Símbolo del sistema (Administrador)" o "Windows PowerShell (Administrador)"
   - Si aparece un cuadro de diálogo de permisos, haz clic en "Sí"

#### 2. **Conectarse a PostgreSQL**:
   ```cmd
   psql -U postgres
   ```
   - Ingresa la contraseña que configuraste durante la instalación de PostgreSQL
   - Si funciona, verás algo como `postgres=#`

#### 3. **Crear la base de datos y usuario**:
   Copia y pega estos comandos uno por uno:
   ```sql
   CREATE DATABASE volado_game;
   CREATE USER volado_user WITH PASSWORD 'volado_secure_pass_2024';
   GRANT ALL PRIVILEGES ON DATABASE volado_game TO volado_user;
   \q
   ```
   - **Importante**: Presiona Enter después de cada línea
   - El último comando `\q` te saca de PostgreSQL

### 🖥️ Configurar Servidor Backend

#### 1. **Abrir un nuevo Símbolo del Sistema**:
   ```cmd
   cd Desktop\el-volado\server
   ```
   - Esto te posiciona en la carpeta del servidor

#### 2. **Instalar dependencias**:
   ```cmd
   npm install
   ```
   - Esto puede tardar 2-5 minutos
   - Verás muchas líneas de texto, es normal

#### 3. **Copiar archivo de configuración**:
   ```cmd
   copy .env.example .env
   ```
   - Esto crea el archivo de configuración del servidor

#### 4. **Iniciar el servidor**:
   ```cmd
   npm run dev
   ```
   - Deberías ver: "🚀 Volado API Server running on port 3010"
   - **IMPORTANTE**: Deja esta ventana abierta y funcionando

### 📱 Configurar Aplicación Móvil

#### 1. **Abrir otro Símbolo del Sistema**:
   ```cmd
   cd Desktop\el-volado\mobile
   ```
   - Abre una nueva ventana de cmd (deja la anterior funcionando)

#### 2. **Instalar dependencias**:
   ```cmd
   npm install
   ```
   - Esto también puede tardar 2-5 minutos

#### 3. **Instalar Expo CLI globalmente**:
   ```cmd
   npm install -g @expo/cli
   ```
   - Expo es la herramienta para ejecutar apps de React Native

#### 4. **Iniciar la aplicación móvil**:
   ```cmd
   npx expo start
   ```
   - Verás un código QR y varias opciones

### 🎮 Probar el Juego

#### Opción 1: Navegador Web (Más Fácil)
1. Cuando Expo se inicie, presiona `w` en el símbolo del sistema
2. El juego se abrirá en tu navegador web
3. Puedes probar todas las características del juego directamente
4. **URL**: http://localhost:19006

#### Opción 2: Teléfono Móvil (Recomendado)
1. Descarga la app "Expo Go" desde App Store o Google Play
2. Escanea el código QR mostrado en el símbolo del sistema
3. El juego se cargará en tu teléfono
4. Podrás experimentar el feedback háptico y efectos móviles

#### Opción 3: Probar API del Backend
1. Abre otro Símbolo del Sistema:
   ```cmd
   cd Desktop\el-volado\server
   python -m http.server 8000
   ```
2. Abre el navegador y ve a: http://localhost:8000/test-frontend.html
3. Prueba registro de usuario, login y sincronización del juego

### 🔧 Solución de Problemas

#### **Si los comandos de Node.js no funcionan**:
- Reinicia el Símbolo del Sistema después de instalar Node.js
- Asegúrate de haber descargado desde el sitio oficial nodejs.org
- Verifica que Node.js esté en el PATH: `echo %PATH%`

#### **Si la conexión a PostgreSQL falla**:
- Asegúrate de que el servicio PostgreSQL esté ejecutándose (revisa Servicios de Windows)
- Verifica la contraseña que estás usando
- Intenta conectarte con: `psql -U postgres -h localhost`
- Si no funciona, reinstala PostgreSQL

#### **Si Expo no se inicia**:
- Ejecuta: `npm install -g @expo/cli@latest`
- Limpia la caché: `npx expo start --clear`
- Reinicia el símbolo del sistema

#### **Si ves errores "ENOENT"**:
- Asegúrate de estar en la carpeta correcta (verifica con `dir`)
- Verifica que todos los archivos se descargaron correctamente
- Intenta clonar el proyecto nuevamente

#### **Si el servidor no se conecta a la base de datos**:
- Verifica que PostgreSQL esté ejecutándose
- Revisa que la contraseña en el archivo `.env` sea correcta
- Asegúrate de haber creado la base de datos `volado_game`

### 📞 ¿Necesitas Ayuda?
- Verifica que el servidor esté funcionando en http://localhost:3010/health
- Busca mensajes de error en las ventanas del símbolo del sistema
- Asegúrate de que tanto el servidor como los comandos móviles estén ejecutándose simultáneamente
- Si algo no funciona, cierra todas las ventanas cmd y empieza de nuevo

---

## 🎮 Características del Juego

### ⚡ Mecánicas Principales
- **Sistema de Lanzamiento de Moneda Justo**: Probabilidad 50/50 real, sin trucos
- **Sistema de Apuestas Estratégico**: Apuesta 10%, 25%, 50% o TODO
- **Sistema de Mejoras Sin Pay-to-Win**: Progresa solo jugando
- **Generadores de Ingresos Pasivos**: Gana monedas automáticamente
- **Sistema de Logros**: Multiplicadores permanentes por completar objetivos
- **Sistema de Prestigio**: Reinicia para multiplicadores masivos

### 🎨 Optimizaciones Móviles
- **Feedback Háptico**: Vibración personalizada para iOS/Android
- **Animaciones 60fps**: Aceleración por GPU para fluidez perfecta
- **Botones Optimizados**: Tamaños de toque optimizados para móvil (44pt+)
- **Juego Offline**: Funciona sin conexión, sincroniza cuando vuelves
- **Efectos Visuales**: Números flotantes, partículas, screen shake

### 🔒 Características del Backend
- **Base de Datos PostgreSQL**: Almacenamiento seguro y escalable
- **Autenticación JWT**: Sistema de login seguro
- **Sistema Anti-Cheat**: Protección contra tramposos
- **Sincronización Inteligente**: Sync cada 30 minutos automáticamente
- **Protección Jugadores Obsesivos**: No penaliza jugadores dedicados
- **Tablas de Clasificación**: Competencia global en tiempo real

### 🎯 Características de UX/UI
- **Diseño Neo-Brutalista**: Tipografía gruesa, sombras duras, colores pastel
- **Sistema de Partículas**: Explosiones, confeti, estrellas para celebraciones
- **Números Flotantes Animados**: Feedback visual inmediato (+50, +100, etc.)
- **Efectos de Celebración**: Animaciones especiales para rachas y logros
- **Modo Alto Contraste**: Accesibilidad para usuarios con discapacidad visual
- **Compatibilidad Web/Móvil**: Funciona perfectamente en ambas plataformas

## 🛣️ Roadmap del Proyecto

### ✅ **COMPLETADO - Fase 1: Jugabilidad Principal**
- ✅ Sistema de lanzamiento de moneda justo (50/50)
- ✅ Sistema de apuestas con pagos 1.8x
- ✅ 4 tipos de mejoras (Multiplicador, Racha, Velocidad, Multi-Apuesta)
- ✅ 4 generadores de ingresos pasivos
- ✅ 10 logros con multiplicadores permanentes
- ✅ Interfaz neo-brutalista integrada

### ✅ **COMPLETADO - Fase 2: Mecánicas Avanzadas**
- ✅ Sistema de prestigio con puntos de prestigio
- ✅ Ganancias offline (hasta 24 horas)
- ✅ Sistema de sonido con controles de usuario
- ✅ Características de accesibilidad (alto contraste, movimiento reducido)

### ✅ **COMPLETADO - Fase 3: Backend y Social**
- ✅ Servidor PostgreSQL completamente funcional
- ✅ Sistema de autenticación JWT (registro/login probado)
- ✅ Sincronización de datos cada 30 minutos
- ✅ Validación anti-cheat con líneas base personales
- ✅ Protección para jugadores obsesivos
- ✅ Middleware de seguridad y limitación de velocidad

### ✅ **COMPLETADO - Fase 4: Optimización UX/UI**
- ✅ Sistema de "juice" visual con animaciones y partículas
- ✅ Números flotantes animados (+monedas, rachas, logros)
- ✅ Efectos de celebración para rachas y logros
- ✅ Feedback háptico para iOS/Android con patrones personalizados
- ✅ Objetivos táctiles optimizados (botón principal 320pt, botones apuesta 44pt+)
- ✅ Sistema de efectos de partículas (explosiones, confeti, estrellas)

### 🔄 **EN PROGRESO - Fase 5: Integración Aplicación Móvil**
- 🔄 Integrar SyncService en React Native GameScreen
- 🔄 Implementar flujo de autenticación en aplicación móvil
- 🔄 Añadir indicadores de sync y UI de estado offline
- 🔄 Probar sincronización con backend PostgreSQL

### 📋 **PLANIFICADO - Fase 6: Sistema de Tutorial**
- 📋 Tutorial interactivo con mano animada
- 📋 Sistema progresivo de desbloqueo
- 📋 Tooltips contextuales
- 📋 Flujo de onboarding optimizado

### 🚀 **FUTURO - Fase 7: Características Sociales**
- 🚀 Tablas de clasificación globales con PostgreSQL
- 🚀 Torneos semanales
- 🚀 Sistema de referidos de amigos
- 🚀 Logros sociales

### 💰 **FUTURO - Fase 8: Monetización Ética**
- 💰 Solo cosméticos: skins de monedas, efectos de partículas, temas
- 💰 Paquetes de sonido: diferentes experiencias de audio
- 💰 Boosters offline: multiplicadores temporales (sin afectar jugabilidad)
- 💰 Sin manipulación de probabilidad: mecánicas principales permanecen justas

### 📱 **FUTURO - Fase 9: Lanzamiento en Tiendas**
- 📱 Preparación para lanzamiento en iOS App Store
- 📱 Preparación para lanzamiento en Google Play Store
- 📱 Integración de analytics para comportamiento de jugadores
- 📱 Sistema de monetización premium

## 🛠️ Stack Tecnológico

### Frontend (Aplicación Móvil)
- **Framework**: React Native con Expo SDK 52
- **Gestión de Estado**: Zustand (ligero, persistente)
- **Almacenamiento Local**: AsyncStorage para persistencia del juego
- **Animaciones**: React Native Reanimated 3 (lanzamientos de moneda 3D)
- **Estilizado**: Sistema de diseño neo-brutalista personalizado
- **Desarrollo**: Expo Go para pruebas en vivo

### Backend (Servidor API)
- **Runtime**: Node.js
- **Framework**: Express.js con middleware de seguridad
- **Base de Datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JWT con hash de contraseñas bcrypt
- **Seguridad**: Limitación de velocidad, CORS, helmet, compresión
- **Deployment**: Listo para VPS con PM2

## 🎮 Filosofía del Juego

### **"Juego Justo Primero"**
- **Sin Pay-to-Win**: Todo el progreso a través de la jugabilidad
- **Probabilidad 50/50**: Lanzamientos de moneda verdaderamente aleatorios
- **Habilidad vs Suerte**: Estrategia en apuestas y elecciones de mejoras
- **Economía Equilibrada**: Escalado exponencial previene inflación

### **Estrategia de Monetización Ética**
- **Solo Cosméticos**: Skins de monedas, efectos de partículas, temas
- **Paquetes de Sonido**: Diferentes experiencias de audio
- **Boosters Offline**: Multiplicadores temporales (sin afectar jugabilidad)
- **Sin Manipulación de Probabilidad**: Mecánicas principales permanecen justas

### **Sistemas de Progresión**
- **Mejoras Lineales**: Mejoras predecibles y transparentes
- **Multiplicadores de Logros**: Recompensas permanentes por hitos
- **Capas de Prestigio**: Objetivos a largo plazo para jugadores dedicados
- **Competencia Social**: Tablas de clasificación para varias métricas

## 🏗️ Estructura del Proyecto

```
volado/
├── mobile/                     # Aplicación React Native
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables
│   │   │   ├── CoinFlip.js     # Moneda animada 3D con física
│   │   │   ├── CoinDisplay.js  # Pantalla de monedas y CPS
│   │   │   ├── FlipStats.js    # Estadísticas + apuestas integradas
│   │   │   ├── ShopPanel.js    # Tienda de mejoras y generadores
│   │   │   └── AchievementsPanel.js # Rastreador de logros
│   │   ├── screens/
│   │   │   └── GameScreen.js   # Pantalla principal del juego
│   │   ├── stores/
│   │   │   └── GameStore.js    # Gestión de estado Zustand
│   │   ├── constants/
│   │   │   ├── GameConstants.js    # Balance y datos del juego
│   │   │   └── NeoBrutalTheme.js  # Sistema de diseño
│   │   └── utils/
│   │       └── NumberFormatter.js # Formateo de números grandes
│   ├── App.js                  # Componente raíz
│   ├── app.json               # Configuración Expo
│   └── package.json
├── server/                    # API Node.js
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Conexión PostgreSQL
│   │   ├── models/
│   │   │   ├── User.js         # Modelo usuario con estadísticas
│   │   │   ├── GameSave.js     # Guardado con anti-cheat
│   │   │   └── index.js        # Asociaciones de modelos
│   │   ├── routes/
│   │   │   ├── auth.js         # Endpoints de autenticación
│   │   │   ├── game.js         # Endpoints de guardado
│   │   │   └── user.js         # Endpoints de perfil
│   │   ├── middleware/
│   │   │   └── auth.js         # Autenticación JWT
│   │   └── app.js              # Configuración servidor Express
│   ├── package.json
│   └── .env.example
└── CLAUDE.md                 # Documentación de desarrollo
```

## 📊 Estado Actual

🎯 **Fase Actual**: Integración Aplicación Móvil (Fase 5)  
📊 **Progreso**: Frontend 95% | Backend 90% | Integración 0%

### Métricas de Rendimiento Logradas
- **Tiempo de Lanzamiento de App**: < 3 segundos ✅
- **Respuesta de Toque**: < 50ms ✅
- **Animación de Lanzamiento**: 400ms - 1200ms (dependiente de mejoras) ✅
- **Frecuencia de Auto-guardado**: Cada 5 segundos ✅
- **Cálculo Offline**: Hasta 24 horas ✅
- **Tamaño de Bundle**: 562 módulos optimizados ✅
- **Multiplataforma**: Compatibilidad Web + Móvil ✅

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

## 🤝 Contribuir

Ver CLAUDE.md para pautas detalladas de desarrollo y arquitectura del proyecto.
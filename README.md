# Circuito Andino · Tienda de componentes electrónicos

E‑commerce completo para la venta de componentes electrónicos en Ecuador, hecho con **React, Node.js (Express) y MongoDB**. Proyecto de portafolio de Galo Alejandro Orellana (06/2024 – 09/2024).

- **406 productos** generados por un script de seed: microcontroladores (Arduino, ESP32, Raspberry Pi Pico, STM32), sensores, módulos, pantallas, resistencias, capacitores, semiconductores, LEDs, cables, motores, fuentes y herramientas. Cada uno con SKU, marca, categoría, especificaciones técnicas, precio en USD y stock.
- **Búsqueda y filtros** por categoría, voltaje, interfaz, encapsulado, potencia, color, longitud, marca, precio y disponibilidad, con orden y paginación. Los filtros viven en la URL, así que se pueden compartir.
- **Detalle de producto** con tabla de especificaciones y productos relacionados.
- **Carrito persistente** (en el navegador y, con sesión iniciada, también en la cuenta).
- **Registro e inicio de sesión** con JWT y contraseñas cifradas con bcrypt.
- **Checkout** con dirección de envío de Ecuador (24 provincias, validación de cédula y celular), envío estándar, express o retiro en tienda, e IVA del 15 % incluido.
- **Pasarela de pagos simulada**: solo acepta tarjetas de prueba documentadas y no guarda el número, la fecha ni el CVC.
- **Historial de pedidos** con línea de tiempo del estado.
- **Panel de administración**: métricas (ventas, pedidos, ticket promedio, ventas diarias, más vendidos, stock bajo), CRUD de productos, control rápido de stock, visibilidad en la tienda y gestión de pedidos con cambios de estado (al cancelar se devuelve el stock).
- Imágenes **100 % generadas en SVG** a partir de los datos del producto (por ejemplo, las resistencias muestran sus bandas de color reales). No hay imágenes ni servicios externos.

Sin APIs de pago ni claves: todo funciona gratis.

## Cómo correrlo en local

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:5181>. La API corre en el puerto 3011 y Vite le redirige `/api`.

Sin configurar nada, la tienda arranca en **modo demo en memoria**: carga el seed al iniciar y los cambios se pierden al reiniciar el servidor. No hace falta instalar MongoDB.

### Con MongoDB (opcional)

1. Crea un clúster gratis **MongoDB Atlas M0** (o usa un MongoDB local).
2. Copia `.env.example` a `.env` y completa `MONGODB_URI` y `JWT_SECRET`.
3. `npm run dev`. Si la base está vacía, se carga sola con los datos de ejemplo.

`npm run seed` borra y vuelve a cargar los datos de ejemplo en MongoDB (sin `MONGODB_URI` solo muestra qué se carga en memoria).

### Otros comandos

| Comando | Qué hace |
| --- | --- |
| `npm test` | Pruebas de las reglas de la tienda (catálogo, filtros, cédula, tarjetas, envío) |
| `npm run build` | Compila el frontend en `dist/` |
| `npm start` | Sirve la API y el frontend compilado en <http://localhost:3011> |

## Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administración | `admin@circuitoandino.demo` | `admin1234` |
| Cliente | `cliente@circuitoandino.demo` | `cliente1234` |

En la pantalla de inicio de sesión hay botones que completan estos datos. También puedes crear tu propia cuenta.

## Tarjetas de prueba

La pasarela es **solo una demostración**: no se conecta con ningún banco ni proveedor de pagos. Usa cualquier nombre, una fecha de vencimiento futura y cualquier CVC de 3 dígitos.

| Número | Resultado |
| --- | --- |
| `4242 4242 4242 4242` | Visa · pago aprobado |
| `5555 5555 5555 4444` | Mastercard · pago aprobado |
| `4000 0000 0000 0002` | Rechazada: fondos insuficientes |
| `4000 0000 0000 0069` | Rechazada: tarjeta vencida |

Cualquier otro número se rechaza. Del pago solo se guarda la marca, los 4 últimos dígitos y un código de autorización de prueba.

Para la dirección de envío puedes usar la cédula de prueba `1712345675` y un celular como `0991234567`.

## Desplegar gratis en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio con el plan **Hobby**. Vercel detecta Vite; `vercel.json` ya envía `/api/*` a la función de Express (`api/index.js`) y el resto a la SPA.
3. Sin variables de entorno, la demo funciona en **modo memoria**: no necesita base de datos.
4. Opcional: para que los datos persistan, añade `MONGODB_URI` (Atlas M0) y `JWT_SECRET` en *Settings → Environment Variables* y vuelve a desplegar. En Atlas, permite el acceso desde `0.0.0.0/0` en *Network Access*, porque Vercel no tiene IP fija.

> En modo memoria, cada instancia de la función de Vercel guarda sus propios datos y se reinicia cuando queda inactiva. Los productos y las cuentas de prueba tienen IDs fijos, así que el catálogo, las sesiones y los carritos siguen funcionando, pero los pedidos y las cuentas nuevas pueden desaparecer tras un reinicio. Para una demo persistente, usa MongoDB Atlas.

## Estructura

```
api/index.js            Función serverless de Vercel (usa la app de Express)
server/
  app.js                Rutas de la API y manejo de errores
  auth.js               JWT y permisos (cliente / administración)
  payments.js           Pasarela de pagos simulada
  catalogQuery.js       Filtros, facetas, orden y paginación del catálogo
  routes/               auth, products, cart, orders, admin
  store/                Modo memoria y modo MongoDB (Mongoose) con la misma interfaz
  data/catalog.js       Generador determinista del catálogo
  data/seed.js          npm run seed
shared/shop.js          Reglas compartidas: categorías, IVA, envío, cédula, tarjetas de prueba
src/                    Frontend en React (Vite + React Router)
  components/ProductArt.jsx   Ilustraciones SVG de los productos
  pages/                Tienda, carrito, checkout, pedidos y panel de administración
test/                   Pruebas con node:test
```

## Aviso

Tienda ficticia para un portafolio: no vende productos reales y la pasarela de pagos es simulada. Las marcas mencionadas pertenecen a sus dueños.

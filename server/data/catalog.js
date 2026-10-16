// Genera el catálogo de ejemplo (más de 300 productos) de forma determinista:
// mismos SKU, precios y stock en cada arranque, para que la demo sea reproducible.
import { buildSearchText, deriveFacets, normalize } from '../../shared/shop.js';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PREFIX = {
  microcontroladores: 'MCU', sensores: 'SEN', modulos: 'MOD', pantallas: 'PAN', resistencias: 'RES', capacitores: 'CAP',
  semiconductores: 'SEM', leds: 'LED', 'cables-conectores': 'CAB', motores: 'MOT', fuentes: 'FUE', herramientas: 'HER',
};

const slugify = (text) => normalize(text).replace(/µ/g, 'u').replace(/ω/g, 'ohm').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function buildCatalog() {
  const random = rng(20240601);
  const counters = {};
  const products = [];

  function add(category, { name, brand = 'Genérico', price, specs, tags = [], art, use, featured = false, stock }) {
    counters[category] = (counters[category] ?? 0) + 1;
    const sku = `${PREFIX[category]}-${String(counters[category]).padStart(3, '0')}`;
    const roll = random();
    // Unos pocos agotados y otros con stock bajo, para que se vean los estados en la tienda y el panel.
    const qty = stock ?? (roll < 0.03 ? 0 : roll < 0.08 ? 1 + Math.floor(random() * 5) : 8 + Math.floor(random() * 140));
    const specList = specs.map(([label, value]) => ({ label, value: String(value) }));
    const product = {
      sku,
      slug: `${slugify(name)}-${sku.toLowerCase()}`,
      name,
      brand,
      category,
      description: use,
      priceCents: Math.round(price * 100),
      stock: qty,
      sold: Math.floor(random() * 60),
      specs: specList,
      tags,
      art,
      featured,
      createdAt: new Date(Date.UTC(2024, 5, 1) + Math.floor(random() * 100) * 86400000).toISOString(),
    };
    product.facets = deriveFacets(specList);
    product.searchText = buildSearchText(product);
    products.push(product);
  }

  // ───────── Microcontroladores y placas ─────────
  const boards = [
    ['Arduino Uno R3 original', 'Arduino', 32.0, 'ATmega328P', '5 V', '7–12 V', '16 MHz', '32 KB', '2 KB', 14, 'USB / UART / I2C / SPI', 'USB-B', '#00878f', 'La placa más usada para aprender y prototipar: robusta, con enorme comunidad y compatible con miles de shields.', true],
    ['Placa compatible Uno R3 (CH340)', 'Genérico', 12.5, 'ATmega328P', '5 V', '7–12 V', '16 MHz', '32 KB', '2 KB', 14, 'USB / UART / I2C / SPI', 'USB-B', '#1565c0', 'Versión compatible con el Uno R3 y conversor USB CH340, ideal para laboratorios y proyectos donde se necesitan varias placas.'],
    ['Arduino Uno R4 Minima', 'Arduino', 27.9, 'Renesas RA4M1', '5 V', '6–24 V', '48 MHz', '256 KB', '32 KB', 14, 'USB / UART / I2C / SPI', 'USB-C', '#00878f', 'La nueva generación del Uno con procesador Arm Cortex-M4 de 32 bits, DAC de 12 bits y bus CAN.'],
    ['Arduino Uno R4 WiFi', 'Arduino', 38.5, 'Renesas RA4M1 + ESP32-S3', '5 V', '6–24 V', '48 MHz', '256 KB', '32 KB', 14, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'USB-C', '#00878f', 'Uno R4 con Wi‑Fi y Bluetooth integrados y una matriz de 12×8 LEDs en la placa para proyectos IoT.', true],
    ['Arduino Nano compatible (CH340)', 'Genérico', 8.9, 'ATmega328P', '5 V', '7–12 V', '16 MHz', '32 KB', '2 KB', 22, 'USB / UART / I2C / SPI', 'Mini USB', '#1565c0', 'Formato pequeño que entra directo en el protoboard. Perfecto para proyectos compactos.'],
    ['Arduino Nano Every', 'Arduino', 17.9, 'ATmega4809', '5 V', '7–21 V', '20 MHz', '48 KB', '6 KB', 22, 'USB / UART / I2C / SPI', 'Micro USB', '#00878f', 'Nano oficial con más memoria y un precio accesible; se puede soldar directamente sobre una PCB.'],
    ['Arduino Nano ESP32', 'Arduino', 24.9, 'ESP32-S3', '3.3 V', '5–18 V', '240 MHz', '16 MB', '512 KB', 21, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'USB-C', '#00878f', 'El formato Nano con la potencia del ESP32-S3: Wi‑Fi, Bluetooth LE y compatibilidad con Arduino IoT Cloud.'],
    ['Arduino Mega 2560 R3 compatible', 'Genérico', 21.5, 'ATmega2560', '5 V', '7–12 V', '16 MHz', '256 KB', '8 KB', 54, 'USB / UART / I2C / SPI', 'USB-B', '#1565c0', 'Muchos pines y 4 puertos serie para impresoras 3D, robots y proyectos con muchos sensores.'],
    ['Arduino Leonardo', 'Arduino', 26.0, 'ATmega32U4', '5 V', '7–12 V', '16 MHz', '32 KB', '2.5 KB', 20, 'USB / UART / I2C / SPI', 'Micro USB', '#00878f', 'Con USB nativo: puede comportarse como teclado o mouse para crear controladores personalizados.'],
    ['Arduino Pro Mini 5 V 16 MHz', 'Genérico', 6.5, 'ATmega328P', '5 V', '5–12 V', '16 MHz', '32 KB', '2 KB', 14, 'UART / I2C / SPI', 'Sin USB', '#c62828', 'Placa mínima y económica para instalar de forma permanente. Se programa con un adaptador FTDI.'],
    ['Arduino Pro Mini 3.3 V 8 MHz', 'Genérico', 6.5, 'ATmega328P', '3.3 V', '3.35–12 V', '8 MHz', '32 KB', '2 KB', 14, 'UART / I2C / SPI', 'Sin USB', '#c62828', 'Versión de bajo consumo a 3.3 V, pensada para proyectos con batería.'],
    ['ESP32 DevKit V1 (ESP32-WROOM-32)', 'Espressif', 9.5, 'ESP32-D0WD', '3.3 V', '5 V', '240 MHz', '4 MB', '520 KB', 30, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'Micro USB', '#212121', 'Doble núcleo con Wi‑Fi y Bluetooth por menos de diez dólares: la base de la mayoría de proyectos IoT.', true],
    ['ESP32-S3-DevKitC-1 N8R8', 'Espressif', 16.9, 'ESP32-S3', '3.3 V', '5 V', '240 MHz', '8 MB', '8 MB PSRAM', 45, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'USB-C', '#212121', 'Con instrucciones vectoriales para IA en el borde, USB nativo y 8 MB de PSRAM para cámaras y pantallas.'],
    ['ESP32-C3 SuperMini', 'Genérico', 5.9, 'ESP32-C3', '3.3 V', '5 V', '160 MHz', '4 MB', '400 KB', 13, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'USB-C', '#212121', 'Diminuta placa RISC-V con Wi‑Fi y Bluetooth LE, del tamaño de una uña.'],
    ['ESP32-CAM con cámara OV2640', 'Genérico', 11.9, 'ESP32-S', '3.3 V', '5 V', '240 MHz', '4 MB', '4 MB PSRAM', 10, 'UART / SPI / Wi-Fi / Bluetooth', 'Sin USB', '#212121', 'Cámara de 2 MP con Wi‑Fi y ranura microSD para videovigilancia, timbres inteligentes y reconocimiento de imágenes.'],
    ['NodeMCU V3 ESP8266 (CH340)', 'Genérico', 7.2, 'ESP8266EX', '3.3 V', '5 V', '80 MHz', '4 MB', '80 KB', 11, 'USB / UART / I2C / SPI / Wi-Fi', 'Micro USB', '#212121', 'Clásica placa Wi‑Fi para domótica y lectura de sensores en red.'],
    ['Wemos D1 Mini ESP8266', 'Genérico', 5.5, 'ESP8266EX', '3.3 V', '5 V', '80 MHz', '4 MB', '80 KB', 11, 'USB / UART / I2C / SPI / Wi-Fi', 'Micro USB', '#1565c0', 'Compacta y con shields apilables, ideal para sensores Wi‑Fi alimentados por USB.'],
    ['Raspberry Pi Pico', 'Raspberry Pi', 7.5, 'RP2040', '3.3 V', '1.8–5.5 V', '133 MHz', '2 MB', '264 KB', 26, 'USB / UART / I2C / SPI', 'Micro USB', '#2e7d32', 'Doble núcleo Arm Cortex-M0+ con PIO programable. Se programa en MicroPython o C/C++.', true],
    ['Raspberry Pi Pico H (con headers)', 'Raspberry Pi', 8.9, 'RP2040', '3.3 V', '1.8–5.5 V', '133 MHz', '2 MB', '264 KB', 26, 'USB / UART / I2C / SPI', 'Micro USB', '#2e7d32', 'La Pico con pines soldados y conector de depuración: lista para el protoboard.'],
    ['Raspberry Pi Pico W', 'Raspberry Pi', 10.9, 'RP2040 + CYW43439', '3.3 V', '1.8–5.5 V', '133 MHz', '2 MB', '264 KB', 26, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'Micro USB', '#2e7d32', 'La Pico con Wi‑Fi y Bluetooth, perfecta para proyectos conectados en MicroPython.'],
    ['Raspberry Pi Pico 2', 'Raspberry Pi', 9.2, 'RP2350', '3.3 V', '1.8–5.5 V', '150 MHz', '4 MB', '520 KB', 26, 'USB / UART / I2C / SPI', 'Micro USB', '#2e7d32', 'Segunda generación con núcleos Arm Cortex-M33 o RISC-V a elección y el doble de memoria.'],
    ['Raspberry Pi Zero 2 W', 'Raspberry Pi', 24.9, 'RP3A0 (Cortex-A53)', '3.3 V', '5 V', '1 GHz', 'microSD', '512 MB', 40, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'Micro USB', '#2e7d32', 'Computadora Linux de cuatro núcleos del tamaño de una goma de mascar.'],
    ['Raspberry Pi 5 de 4 GB', 'Raspberry Pi', 92.0, 'BCM2712 (Cortex-A76)', '3.3 V', '5 V', '2.4 GHz', 'microSD', '4 GB', 40, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'USB-C', '#2e7d32', 'La Raspberry Pi más rápida: doble salida 4K, PCIe y hasta tres veces el rendimiento de la Pi 4.', true],
    ['STM32 Blue Pill (STM32F103C8T6)', 'STMicroelectronics', 6.9, 'STM32F103C8T6', '3.3 V', '5 V', '72 MHz', '64 KB', '20 KB', 32, 'USB / UART / I2C / SPI', 'Micro USB', '#1565c0', 'Arm Cortex-M3 de 32 bits a precio de placa de 8 bits. Muy usada para aprender STM32CubeIDE.'],
    ['STM32 Black Pill (STM32F411CEU6)', 'STMicroelectronics', 11.5, 'STM32F411CEU6', '3.3 V', '5 V', '100 MHz', '512 KB', '128 KB', 32, 'USB / UART / I2C / SPI', 'USB-C', '#212121', 'Cortex-M4 con FPU y USB-C, una de las mejores relaciones potencia/precio.'],
    ['Seeed Studio XIAO ESP32C3', 'Seeed Studio', 8.5, 'ESP32-C3', '3.3 V', '5 V', '160 MHz', '4 MB', '400 KB', 11, 'USB / UART / I2C / SPI / Wi-Fi / Bluetooth', 'USB-C', '#212121', 'Placa de 21 × 17.5 mm con cargador de batería integrado, para wearables y sensores remotos.'],
    ['Seeed Studio XIAO RP2040', 'Seeed Studio', 7.9, 'RP2040', '3.3 V', '5 V', '133 MHz', '2 MB', '264 KB', 11, 'USB / UART / I2C / SPI', 'USB-C', '#212121', 'El RP2040 en formato miniatura, compatible con MicroPython, CircuitPython y Arduino.'],
    ['Teensy 4.0', 'PJRC', 34.9, 'NXP i.MX RT1062', '3.3 V', '5 V', '600 MHz', '2 MB', '1 MB', 40, 'USB / UART / I2C / SPI', 'Micro USB', '#2e7d32', 'Cortex-M7 a 600 MHz para audio digital, controladores MIDI y procesamiento en tiempo real.'],
    ['Digispark ATtiny85 USB', 'Genérico', 3.9, 'ATtiny85', '5 V', '7–12 V', '16.5 MHz', '8 KB', '512 B', 6, 'USB / I2C', 'USB-A', '#1565c0', 'Microcontrolador mínimo que se conecta directo al puerto USB. Ideal para atajos de teclado y tareas simples.'],
  ];
  for (const [name, brand, price, mcu, logic, vin, freq, flash, ram, gpio, iface, usb, color, use, featured] of boards) {
    add('microcontroladores', {
      name, brand, price, use, featured,
      specs: [['Microcontrolador', mcu], ['Voltaje', logic], ['Voltaje de entrada', vin], ['Frecuencia', freq], ['Memoria flash', flash], ['RAM', ram], ['Pines GPIO', gpio], ['Interfaz', iface], ['Conector', usb], ['Encapsulado', 'Placa de desarrollo']],
      tags: ['placa', 'desarrollo', mcu],
      art: { kind: 'board', color, label: mcu.split(' ')[0] },
    });
  }

  // ───────── Sensores ─────────
  const sensors = [
    ['Sensor de temperatura y humedad DHT11', 'Aosong', 2.9, '3.3 / 5 V', 'Digital', '0–50 °C · 20–90 % HR', '±2 °C · ±5 % HR', 'temperatura', 'Sensor básico y económico para estaciones meteorológicas y control de ambiente.'],
    ['Sensor de temperatura y humedad DHT22 (AM2302)', 'Aosong', 6.5, '3.3 / 5 V', 'Digital', '−40–80 °C · 0–100 % HR', '±0.5 °C · ±2 % HR', 'temperatura', 'Más preciso y con mayor rango que el DHT11, para invernaderos y registro de datos.'],
    ['Sonda de temperatura sumergible DS18B20 (1 m)', 'Analog Devices', 3.8, '3.3 / 5 V', '1-Wire', '−55–125 °C', '±0.5 °C', 'temperatura', 'Sonda de acero inoxidable impermeable; puedes conectar varias en un solo pin.'],
    ['Sensor de temperatura DS18B20 TO-92', 'Analog Devices', 1.9, '3.3 / 5 V', '1-Wire', '−55–125 °C', '±0.5 °C', 'temperatura', 'Termómetro digital en encapsulado de transistor, con dirección única de 64 bits.'],
    ['Sensor de temperatura analógico LM35', 'Texas Instruments', 2.4, '5 V', 'Analógica', '−55–150 °C', '±0.5 °C', 'temperatura', 'Salida lineal de 10 mV/°C, muy fácil de leer con cualquier entrada analógica.'],
    ['Módulo de presión barométrica BMP280', 'Genérico', 3.5, '3.3 V', 'I2C / SPI', '300–1100 hPa', '±1 hPa', 'presion', 'Mide presión y temperatura; también sirve como altímetro.'],
    ['Módulo ambiental BME280', 'Genérico', 8.9, '3.3 V', 'I2C / SPI', '300–1100 hPa · 0–100 % HR', '±1 hPa · ±3 % HR', 'presion', 'Temperatura, humedad y presión en un solo chip de Bosch, para estaciones meteorológicas.', true],
    ['Sensor de CO₂ y VOC SGP30', 'Genérico', 14.9, '3.3 V', 'I2C', '0–60000 ppb TVOC', '±15 %', 'gas', 'Calidad del aire interior con medición de compuestos orgánicos volátiles y CO₂ equivalente.'],
    ['Sensor de gas MQ-2 (humo, GLP)', 'Genérico', 3.2, '5 V', 'Analógica / Digital', '300–10000 ppm', '—', 'gas', 'Detecta humo, gas licuado y propano. Base de alarmas de fugas caseras.'],
    ['Sensor de gas MQ-135 (calidad de aire)', 'Genérico', 3.9, '5 V', 'Analógica / Digital', '10–1000 ppm', '—', 'gas', 'Sensible a amoníaco, benceno y CO₂ para monitores de calidad del aire.'],
    ['Sensor de alcohol MQ-3', 'Genérico', 3.6, '5 V', 'Analógica / Digital', '0.05–10 mg/L', '—', 'gas', 'Detecta vapores de alcohol; se usa en alcoholímetros de práctica.'],
    ['Sensor de monóxido MQ-7', 'Genérico', 3.9, '5 V', 'Analógica / Digital', '20–2000 ppm', '—', 'gas', 'Detección de monóxido de carbono para proyectos de seguridad.'],
    ['Sensor ultrasónico HC-SR04', 'Genérico', 2.5, '5 V', 'Digital', '2–400 cm', '±3 mm', 'distancia', 'El sensor de distancia más popular para robots evasores de obstáculos y medidores de nivel.', true],
    ['Sensor ultrasónico impermeable JSN-SR04T', 'Genérico', 11.5, '5 V', 'Digital / UART', '25–450 cm', '±1 cm', 'distancia', 'Transductor sellado para medir nivel de tanques y cisternas en exteriores.'],
    ['Sensor de distancia láser VL53L0X', 'Genérico', 6.9, '3.3 / 5 V', 'I2C', '3–200 cm', '±3 %', 'distancia', 'Tiempo de vuelo (ToF) con láser: medición rápida y precisa en un módulo diminuto.'],
    ['Sensor infrarrojo de obstáculos FC-51', 'Genérico', 1.5, '3.3 / 5 V', 'Digital', '2–30 cm', 'Ajustable', 'distancia', 'Detecta objetos cercanos con LED infrarrojo; distancia regulable con potenciómetro.'],
    ['Sensor de movimiento PIR HC-SR501', 'Genérico', 2.8, '5 V', 'Digital', 'Hasta 7 m · 120°', 'Ajustable', 'movimiento', 'Detecta personas por calor corporal. Para luces automáticas y alarmas.'],
    ['Sensor PIR miniatura AM312', 'Genérico', 2.6, '3.3 / 5 V', 'Digital', 'Hasta 5 m · 100°', 'Fijo', 'movimiento', 'Versión compacta del PIR, ideal para cajas pequeñas y proyectos a 3.3 V.'],
    ['Radar de microondas RCWL-0516', 'Genérico', 2.2, '5 V', 'Digital', 'Hasta 7 m', 'Fijo', 'movimiento', 'Detecta movimiento incluso a través de plástico o madera delgada.'],
    ['Acelerómetro y giroscopio MPU-6050', 'Genérico', 3.9, '3.3 / 5 V', 'I2C', '±2–16 g · ±250–2000 °/s', '16 bits', 'movimiento', 'IMU de 6 ejes para drones, robots que se equilibran y control por gestos.', true],
    ['IMU de 9 ejes MPU-9250', 'Genérico', 12.9, '3.3 V', 'I2C / SPI', '±16 g · ±2000 °/s · ±4800 µT', '16 bits', 'movimiento', 'Acelerómetro, giroscopio y magnetómetro para orientación absoluta.'],
    ['Brújula digital QMC5883L (GY-271)', 'Genérico', 3.5, '3.3 / 5 V', 'I2C', '±8 gauss', '2 mGauss', 'movimiento', 'Magnetómetro de 3 ejes para orientar robots y vehículos.'],
    ['Sensor de luz LDR (fotorresistencia) x10', 'Genérico', 1.2, '3.3 / 5 V', 'Analógica', '1 kΩ–1 MΩ', '—', 'luz', 'Resistencias que cambian con la luz: para luces nocturnas automáticas.'],
    ['Sensor de luz digital BH1750', 'Genérico', 2.9, '3.3 / 5 V', 'I2C', '1–65535 lux', '±20 %', 'luz', 'Mide iluminación en lux directamente, sin calibrar.'],
    ['Sensor de color TCS34725', 'Genérico', 7.9, '3.3 / 5 V', 'I2C', 'RGB + luz clara', '16 bits', 'luz', 'Identifica colores con filtro IR, para clasificadores de objetos.'],
    ['Sensor UV GUVA-S12SD', 'Genérico', 4.5, '3.3 / 5 V', 'Analógica', '240–370 nm', '—', 'luz', 'Mide el índice UV para estaciones meteorológicas.'],
    ['Sensor de humedad de suelo capacitivo v2.0', 'Genérico', 2.7, '3.3 / 5 V', 'Analógica', '0–100 %', '—', 'agua', 'Capacitivo, no se corroe como los resistivos. Para riego automático.', true],
    ['Sensor de humedad de suelo resistivo YL-69', 'Genérico', 1.6, '3.3 / 5 V', 'Analógica / Digital', '0–100 %', '—', 'agua', 'Opción económica para prácticas de riego y macetas inteligentes.'],
    ['Sensor de lluvia FC-37', 'Genérico', 1.9, '3.3 / 5 V', 'Analógica / Digital', 'Detección de gotas', '—', 'agua', 'Placa que detecta lluvia para cerrar ventanas o proteger equipos.'],
    ['Sensor de nivel de agua', 'Genérico', 1.4, '3.3 / 5 V', 'Analógica', '0–40 mm', '—', 'agua', 'Mide la altura del agua sobre la placa, para depósitos pequeños.'],
    ['Caudalímetro YF-S201 1/2"', 'Genérico', 8.9, '5 V', 'Digital', '1–30 L/min', '±10 %', 'agua', 'Sensor de flujo de efecto Hall para medir consumo de agua.'],
    ['Sensor de corriente ACS712 20 A', 'Allegro', 3.9, '5 V', 'Analógica', '±20 A', '100 mV/A', 'energia', 'Mide corriente continua o alterna por efecto Hall con aislamiento.'],
    ['Medidor de corriente y voltaje INA219', 'Genérico', 4.9, '3.3 / 5 V', 'I2C', '0–26 V · ±3.2 A', '12 bits', 'energia', 'Mide voltaje, corriente y potencia de baterías y paneles solares.'],
    ['Sensor de voltaje 0–25 V', 'Genérico', 1.5, '3.3 / 5 V', 'Analógica', '0–25 V DC', '±1 %', 'energia', 'Divisor resistivo listo para medir baterías con una entrada analógica.'],
    ['Sensor de corriente no invasivo SCT-013 30 A', 'YHDC', 12.5, '—', 'Analógica', '0–30 A AC', '±1 %', 'energia', 'Pinza que mide el consumo eléctrico de la casa sin cortar cables.'],
    ['Celda de carga 5 kg + amplificador HX711', 'Genérico', 6.9, '3.3 / 5 V', 'Digital', '0–5 kg', '24 bits', 'fuerza', 'Kit para construir balanzas digitales y básculas de cocina.'],
    ['Sensor de fuerza FSR402', 'Interlink', 7.5, '3.3 / 5 V', 'Analógica', '0.2–20 N', '—', 'fuerza', 'Resistencia sensible a la presión para botones y detectores de peso ligero.'],
    ['Sensor de pulso y oxímetro MAX30102', 'Genérico', 5.9, '3.3 V', 'I2C', 'SpO₂ y frecuencia cardiaca', '18 bits', 'salud', 'Mide pulso y oxigenación en sangre para wearables de práctica (no es un dispositivo médico).'],
    ['Sensor de sonido KY-038', 'Genérico', 1.8, '3.3 / 5 V', 'Analógica / Digital', 'Micrófono electret', 'Ajustable', 'sonido', 'Detecta aplausos y ruido para encender luces o contar eventos.'],
    ['Micrófono I2S INMP441', 'Genérico', 4.9, '3.3 V', 'I2S', '60 Hz–15 kHz', '24 bits', 'sonido', 'Micrófono digital omnidireccional para grabar audio con ESP32.'],
    ['Sensor de llama infrarrojo', 'Genérico', 1.7, '3.3 / 5 V', 'Analógica / Digital', '760–1100 nm', 'Ajustable', 'luz', 'Detecta fuego por radiación infrarroja, para robots bomberos.'],
    ['Sensor táctil capacitivo TTP223', 'Genérico', 0.9, '3.3 / 5 V', 'Digital', 'Contacto', '—', 'tacto', 'Botón táctil sin partes móviles, funciona detrás de vidrio delgado.'],
    ['Sensor de efecto Hall A3144', 'Allegro', 0.8, '5 V', 'Digital', 'Campo magnético', '—', 'movimiento', 'Detecta imanes para contar vueltas o fines de carrera sin contacto.'],
    ['Lector de huella dactilar AS608', 'Genérico', 19.9, '3.3 V', 'UART', '162 huellas', 'FAR < 0.001 %', 'seguridad', 'Módulo óptico que guarda huellas para cerraduras y control de asistencia.'],
    ['Lector RFID RC522 13.56 MHz con tarjetas', 'Genérico', 4.5, '3.3 V', 'SPI', 'Hasta 5 cm', 'MIFARE', 'seguridad', 'Lee y escribe tarjetas y llaveros RFID para control de acceso.', true],
  ];
  for (const [name, brand, price, volt, iface, range, precision, group, use, featured] of sensors) {
    add('sensores', {
      name, brand, price, use, featured,
      specs: [['Voltaje', volt.replace('3.3 / 5 V', '3.3 V / 5 V')], ['Interfaz', iface], ['Rango', range], ['Precisión', precision], ['Encapsulado', name.includes('TO-92') || name.includes('A3144') ? 'TO-92' : name.includes('x10') ? 'THT' : 'Módulo']],
      tags: ['sensor', group],
      art: { kind: 'sensor', variant: group === 'movimiento' && iface.includes('I2C') ? 'chip' : group },
    });
  }

  // ───────── Módulos ─────────
  const modules = [
    ['Módulo relé de 1 canal 5 V', 2.5, '5 V', 'Digital', 'relé', '10 A · 250 V AC', '#1565c0', 'Controla focos, bombas y electrodomésticos desde un microcontrolador.'],
    ['Módulo relé de 2 canales 5 V con optoacoplador', 3.9, '5 V', 'Digital', 'relé', '10 A · 250 V AC', '#1565c0', 'Dos cargas independientes con aislamiento óptico para mayor seguridad.'],
    ['Módulo relé de 4 canales 5 V', 6.5, '5 V', 'Digital', 'relé', '10 A · 250 V AC', '#1565c0', 'Para tableros de domótica con varias luces o tomacorrientes.'],
    ['Módulo relé de 8 canales 5 V', 11.9, '5 V', 'Digital', 'relé', '10 A · 250 V AC', '#1565c0', 'Controla hasta ocho cargas: riego por zonas, iluminación y más.'],
    ['Relé de estado sólido SSR 2 canales', 7.9, '5 V', 'Digital', 'relé', '2 A · 240 V AC', '#1565c0', 'Conmutación silenciosa y sin desgaste para cargas de corriente alterna.'],
    ['Driver de motores L298N', 4.9, '5 V / 12 V', 'Digital / PWM', 'motor', '2 A por canal · 5–35 V', '#c62828', 'Puente H doble para controlar dos motores DC o un paso a paso. Clásico de robótica.', true],
    ['Driver de motores TB6612FNG', 4.5, '3.3 V / 5 V', 'Digital / PWM', 'motor', '1.2 A por canal · 4.5–13.5 V', '#c62828', 'Más eficiente y pequeño que el L298N; ideal para robots seguidores de línea.'],
    ['Driver de motor paso a paso A4988', 2.9, '3.3 V / 5 V', 'Digital', 'motor', '2 A · 8–35 V', '#c62828', 'Para impresoras 3D y CNC con micro pasos de hasta 1/16.'],
    ['Driver de motor paso a paso DRV8825', 3.9, '3.3 V / 5 V', 'Digital', 'motor', '2.5 A · 8.2–45 V', '#7b1fa2', 'Micro pasos de hasta 1/32 para movimientos más suaves.'],
    ['Driver silencioso TMC2209', 7.9, '3.3 V / 5 V', 'UART / Digital', 'motor', '2 A · 4.75–29 V', '#7b1fa2', 'Motores paso a paso casi silenciosos con StealthChop2.'],
    ['Módulo MOSFET IRF520', 2.2, '3.3 V / 5 V', 'PWM', 'motor', '5 A · hasta 24 V', '#1565c0', 'Controla tiras LED, ventiladores o motores con PWM.'],
    ['Módulo Bluetooth HC-05', 7.5, '3.3 V / 5 V', 'UART / Bluetooth', 'radio', 'Bluetooth 2.0 · 10 m', '#1565c0', 'Comunicación serie inalámbrica con el celular; puede ser maestro o esclavo.', true],
    ['Módulo Bluetooth HC-06', 6.5, '3.3 V / 5 V', 'UART / Bluetooth', 'radio', 'Bluetooth 2.0 · 10 m', '#1565c0', 'Versión esclavo del HC-05, la más simple para recibir comandos desde una app.'],
    ['Transceptor NRF24L01+ 2.4 GHz', 2.4, '3.3 V', 'SPI', 'radio', '2 Mbps · 100 m', '#2e7d32', 'Radio de bajo consumo para comunicar varios microcontroladores entre sí.'],
    ['Transceptor NRF24L01+ PA/LNA con antena', 5.9, '3.3 V', 'SPI', 'radio', '2 Mbps · 1000 m', '#2e7d32', 'Con amplificador y antena externa para alcanzar hasta un kilómetro en línea de vista.'],
    ['Módulo LoRa SX1278 433 MHz (Ra-02)', 8.9, '3.3 V', 'SPI / LoRa', 'radio', 'Hasta 10 km', '#212121', 'Comunicación de largo alcance y bajo consumo para sensores en el campo.'],
    ['Módulo GSM/GPRS SIM800L', 9.9, '3.7 V / 4.2 V', 'UART / GSM', 'radio', '2G cuatribanda', '#c62828', 'Envía SMS y hace llamadas desde tu proyecto (requiere red 2G disponible).'],
    ['Módulo GPS NEO-6M con antena', 10.9, '3.3 V / 5 V', 'UART', 'radio', 'Precisión 2.5 m', '#1565c0', 'Posición, hora y velocidad para rastreadores y drones.', true],
    ['Receptor IR VS1838B + control remoto', 2.9, '3.3 V / 5 V', 'Digital', 'radio', '38 kHz · 8 m', '#212121', 'Controla tu proyecto con un control remoto infrarrojo.'],
    ['Módulo de reloj RTC DS3231', 3.5, '3.3 V / 5 V', 'I2C', 'tiempo', '±2 ppm', '#1565c0', 'Reloj de tiempo real muy preciso con batería de respaldo.'],
    ['Módulo de reloj RTC DS1307', 2.2, '5 V', 'I2C', 'tiempo', '±20 ppm', '#1565c0', 'Mantiene fecha y hora aunque se apague el microcontrolador.'],
    ['Lector de tarjetas microSD', 1.9, '3.3 V / 5 V', 'SPI', 'memoria', 'Hasta 32 GB', '#1565c0', 'Guarda registros de sensores en archivos CSV.'],
    ['Convertidor reductor LM2596 (buck)', 2.9, '3.2–40 V', 'Analógica', 'energia', 'Salida 1.25–35 V · 3 A', '#1565c0', 'Baja el voltaje de forma eficiente: de 12 V a 5 V para alimentar tus placas.', true],
    ['Convertidor elevador MT3608 (boost)', 1.9, '2–24 V', 'Analógica', 'energia', 'Salida hasta 28 V · 2 A', '#1565c0', 'Sube el voltaje de una batería de litio a 5, 9 o 12 V.'],
    ['Cargador de baterías de litio TP4056 USB-C', 1.2, '5 V', 'USB', 'energia', '1 A · con protección', '#1565c0', 'Carga celdas 18650 y LiPo de forma segura por USB-C.'],
    ['Módulo BMS 3S 12.6 V 20 A', 5.9, '12.6 V', '—', 'energia', '20 A · balanceo', '#212121', 'Protección y balanceo para baterías de tres celdas en serie.'],
    ['Conversor de niveles lógicos 4 canales', 1.5, '3.3 V / 5 V', 'I2C / SPI / UART', 'interfaz', 'Bidireccional', '#1565c0', 'Conecta sensores de 5 V con placas de 3.3 V sin dañarlas.'],
    ['Adaptador USB a serie FTDI FT232RL', 6.9, '3.3 V / 5 V', 'USB / UART', 'interfaz', 'Hasta 3 Mbps', '#c62828', 'Programa placas sin USB como el Pro Mini y depura por puerto serie.'],
    ['Adaptador USB a TTL CP2102', 3.9, '3.3 V / 5 V', 'USB / UART', 'interfaz', 'Hasta 1 Mbps', '#212121', 'Conversor serie estable para ESP8266, ESP32-CAM y otros módulos.'],
    ['Expansor de I/O PCF8574 I2C', 2.5, '3.3 V / 5 V', 'I2C', 'interfaz', '8 pines extra', '#1565c0', 'Añade ocho entradas o salidas usando solo dos pines.'],
    ['Multiplexor analógico CD74HC4067 16 canales', 2.9, '3.3 V / 5 V', 'Analógica / Digital', 'interfaz', '16 canales', '#c62828', 'Lee 16 sensores analógicos con una sola entrada.'],
    ['Teclado matricial de membrana 4×4', 1.9, '3.3 V / 5 V', 'Digital', 'entrada', '16 teclas', '#212121', 'Para cerraduras con clave, calculadoras y menús.'],
    ['Joystick analógico KY-023', 1.6, '3.3 V / 5 V', 'Analógica', 'entrada', '2 ejes + botón', '#212121', 'Control de dos ejes para robots, cámaras y juegos.'],
    ['Encoder rotativo KY-040', 1.8, '3.3 V / 5 V', 'Digital', 'entrada', '20 pasos por vuelta', '#212121', 'Perilla giratoria infinita con pulsador para navegar menús.'],
    ['Amplificador de audio PAM8403 2×3 W', 1.5, '5 V', 'Analógica', 'audio', '2 × 3 W', '#1565c0', 'Amplificador estéreo diminuto para parlantes pequeños.'],
    ['Reproductor MP3 DFPlayer Mini', 3.9, '3.3 V / 5 V', 'UART', 'audio', 'microSD · 3 W', '#212121', 'Reproduce archivos MP3 desde una microSD con un parlante directo.'],
    ['Módulo de cámara para Raspberry Pi v1.3 (OV5647)', 9.9, '3.3 V', 'CSI', 'camara', '5 MP · 1080p30', '#2e7d32', 'Cámara compatible para Raspberry Pi: visión artificial y timelapse.'],
  ];
  for (const [name, price, volt, iface, group, rating, color, use, featured] of modules) {
    add('modulos', {
      name, price, use, featured,
      brand: name.includes('Raspberry') ? 'Arducam' : name.includes('FT232') ? 'FTDI' : name.includes('TMC2209') ? 'BigTreeTech' : 'Genérico',
      specs: [['Voltaje', volt], ['Interfaz', iface], ['Capacidad', rating], ['Encapsulado', 'Módulo']],
      tags: ['modulo', group],
      art: { kind: 'module', color, variant: group },
    });
  }

  // ───────── Pantallas ─────────
  const displays = [
    ['Pantalla OLED 0.96" 128×64 I2C (SSD1306)', 4.9, '3.3 V / 5 V', 'I2C', '0.96"', '128 × 64', 'Monocromática blanca', '#0d47a1', 'oled', true],
    ['Pantalla OLED 0.96" 128×64 I2C azul/amarillo', 4.9, '3.3 V / 5 V', 'I2C', '0.96"', '128 × 64', 'Bicolor', '#0d47a1', 'oled'],
    ['Pantalla OLED 1.3" 128×64 I2C (SH1106)', 7.5, '3.3 V / 5 V', 'I2C', '1.3"', '128 × 64', 'Monocromática blanca', '#0d47a1', 'oled'],
    ['Pantalla OLED 0.91" 128×32 I2C', 3.9, '3.3 V / 5 V', 'I2C', '0.91"', '128 × 32', 'Monocromática blanca', '#0d47a1', 'oled'],
    ['LCD 16×2 con módulo I2C (fondo azul)', 5.5, '5 V', 'I2C', '16 × 2', '80 × 16', 'Caracteres blancos', '#1565c0', 'lcd', true],
    ['LCD 16×2 paralela (fondo verde)', 3.9, '5 V', 'Paralela', '16 × 2', '80 × 16', 'Caracteres negros', '#558b2f', 'lcd'],
    ['LCD 20×4 con módulo I2C', 9.5, '5 V', 'I2C', '20 × 4', '100 × 32', 'Caracteres blancos', '#1565c0', 'lcd'],
    ['TFT 1.8" 128×160 SPI (ST7735)', 6.9, '3.3 V / 5 V', 'SPI', '1.8"', '128 × 160', '65K colores', '#212121', 'tft'],
    ['TFT 2.4" táctil 240×320 shield para Uno', 11.9, '5 V', 'Paralela', '2.4"', '240 × 320', '65K colores', '#c62828', 'tft'],
    ['TFT 2.8" táctil 240×320 SPI (ILI9341)', 14.5, '3.3 V', 'SPI', '2.8"', '240 × 320', '65K colores', '#c62828', 'tft', true],
    ['Pantalla de tinta electrónica 2.9" (e-paper)', 21.9, '3.3 V', 'SPI', '2.9"', '296 × 128', 'Blanco y negro', '#212121', 'epaper'],
    ['Display 7 segmentos 4 dígitos TM1637', 2.5, '3.3 V / 5 V', 'Digital', '0.36"', '4 dígitos', 'Rojo', '#212121', 'segmentos'],
    ['Matriz LED 8×8 con MAX7219', 3.9, '5 V', 'SPI', '32 mm', '8 × 8', 'Rojo', '#c62828', 'matriz'],
    ['Matriz LED 8×32 con MAX7219 (4 en 1)', 9.9, '5 V', 'SPI', '128 × 32 mm', '8 × 32', 'Rojo', '#c62828', 'matriz'],
  ];
  for (const [name, price, volt, iface, size, res, colors, color, variant, featured] of displays) {
    add('pantallas', {
      name, price, featured,
      brand: name.includes('tinta') ? 'Waveshare' : 'Genérico',
      use: `Pantalla ${variant === 'oled' ? 'OLED de alto contraste, sin retroiluminación y de bajo consumo' : variant === 'lcd' ? 'LCD de caracteres, fácil de usar con la librería LiquidCrystal' : variant === 'tft' ? 'TFT a color para interfaces gráficas' : variant === 'epaper' ? 'que conserva la imagen sin consumir energía' : 'LED de alta visibilidad'} para mostrar datos de tus proyectos.`,
      specs: [['Voltaje', volt], ['Interfaz', iface], ['Tamaño', size], ['Resolución', res], ['Colores', colors], ['Encapsulado', 'Módulo']],
      tags: ['pantalla', 'display', variant],
      art: { kind: 'display', color, variant },
    });
  }

  // ───────── Resistencias (serie E12) ─────────
  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  const formatOhms = (ohms) => {
    if (ohms >= 1e6) return `${+(ohms / 1e6).toFixed(2)} MΩ`;
    if (ohms >= 1e3) return `${+(ohms / 1e3).toFixed(2)} kΩ`;
    return `${ohms} Ω`;
  };
  const shortCode = (ohms) => (ohms >= 1e6 ? `${ohms / 1e6}m` : ohms >= 1e3 ? `${ohms / 1e3}k` : `${ohms}`);
  const resistor = (ohms, watts, price) => {
    const label = formatOhms(ohms);
    add('resistencias', {
      name: `Resistencia ${label} ${watts} (paquete de 10)`,
      brand: watts === '1/2 W' ? 'Vishay' : 'Yageo',
      price,
      use: `Resistencias de película de carbón de ${label}, ${watts} y tolerancia de ±5 %. El paquete trae 10 unidades.`,
      specs: [['Resistencia', label], ['Potencia', watts], ['Tolerancia', '±5 %'], ['Tipo', 'Película de carbón'], ['Encapsulado', 'THT axial'], ['Unidades', 10]],
      tags: ['resistor', shortCode(ohms), String(ohms), `${label.replace(' ', '')}`],
      art: { kind: 'resistor', ohms },
    });
  };
  for (let decade = 1; decade <= 1e5; decade *= 10) for (const base of E12) resistor(base * decade, '1/4 W', 0.6);
  resistor(1e6, '1/4 W', 0.6);
  for (let decade = 10; decade <= 1e3; decade *= 10) for (const base of [10, 15, 22, 33, 47, 68]) resistor(base * decade, '1/2 W', 0.9);
  add('resistencias', {
    name: 'Kit de resistencias 600 piezas (30 valores)', price: 7.9, featured: true,
    use: 'Surtido de 30 valores de 10 Ω a 1 MΩ, 20 unidades de cada uno, organizado por valor. El kit básico de todo laboratorio.',
    specs: [['Resistencia', '10 Ω – 1 MΩ'], ['Potencia', '1/4 W'], ['Tolerancia', '±1 %'], ['Tipo', 'Película metálica'], ['Encapsulado', 'THT axial'], ['Unidades', 600]],
    tags: ['kit', 'surtido'], art: { kind: 'resistor', ohms: 4700, kit: true },
  });
  add('resistencias', {
    name: 'Kit de resistencias SMD 0805 (170 valores)', price: 12.9,
    use: 'Libro con 170 valores en encapsulado 0805, 25 unidades por valor, para reparaciones y diseño de PCB.',
    specs: [['Resistencia', '0 Ω – 10 MΩ'], ['Potencia', '1/8 W'], ['Tolerancia', '±1 %'], ['Tipo', 'Película gruesa'], ['Encapsulado', 'SMD 0805'], ['Unidades', 4250]],
    tags: ['kit', 'smd'], art: { kind: 'chip', variant: 'smd' },
  });
  for (const value of ['1 kΩ', '5 kΩ', '10 kΩ', '50 kΩ', '100 kΩ']) {
    add('resistencias', {
      name: `Potenciómetro lineal ${value}`, price: 0.95,
      use: `Potenciómetro rotativo de ${value} con eje de 15 mm para regular volumen, brillo o velocidad.`,
      specs: [['Resistencia', value], ['Potencia', '1/4 W'], ['Curva', 'Lineal (B)'], ['Encapsulado', 'THT'], ['Unidades', 1]],
      tags: ['potenciometro', 'perilla', value.replace(' kΩ', 'k')], art: { kind: 'pot' },
    });
  }
  for (const value of ['1 kΩ', '10 kΩ', '100 kΩ']) {
    add('resistencias', {
      name: `Trimpot multivuelta 3296W ${value} (paquete de 5)`, brand: 'Bourns', price: 2.5,
      use: `Resistencia ajustable de precisión de 25 vueltas, ${value}, para calibrar circuitos.`,
      specs: [['Resistencia', value], ['Potencia', '1/2 W'], ['Vueltas', 25], ['Encapsulado', 'THT'], ['Unidades', 5]],
      tags: ['trimpot', 'ajustable'], art: { kind: 'pot', variant: 'trim' },
    });
  }

  // ───────── Capacitores ─────────
  const ceramics = [['10 pF', '100'], ['22 pF', '220'], ['33 pF', '330'], ['47 pF', '470'], ['100 pF', '101'], ['1 nF', '102'], ['10 nF', '103'], ['100 nF', '104'], ['1 µF', '105']];
  for (const [value, code] of ceramics) {
    add('capacitores', {
      name: `Capacitor cerámico ${value} 50 V (${code}) x10`, brand: 'Murata', price: code === '105' ? 1.2 : 0.7,
      use: `Capacitores cerámicos multicapa de ${value} (código ${code}) para filtrado, desacople y osciladores. Paquete de 10.`,
      specs: [['Capacitancia', value], ['Voltaje', '50 V'], ['Dieléctrico', code === '105' ? 'X7R' : 'C0G'], ['Código', code], ['Encapsulado', 'THT radial'], ['Unidades', 10]],
      tags: ['condensador', 'ceramico', code], art: { kind: 'capacitor', variant: 'ceramic', label: code },
    });
  }
  const electrolytics = [
    ['1 µF', '50 V', 0.8], ['2.2 µF', '50 V', 0.8], ['4.7 µF', '50 V', 0.8], ['10 µF', '25 V', 0.8], ['10 µF', '50 V', 0.9],
    ['22 µF', '25 V', 0.9], ['47 µF', '25 V', 1.0], ['47 µF', '50 V', 1.2], ['100 µF', '16 V', 1.0], ['100 µF', '25 V', 1.2],
    ['100 µF', '50 V', 1.5], ['220 µF', '16 V', 1.3], ['220 µF', '25 V', 1.6], ['470 µF', '16 V', 1.8], ['470 µF', '25 V', 2.2],
    ['1000 µF', '16 V', 2.6], ['1000 µF', '25 V', 3.2], ['2200 µF', '25 V', 4.9],
  ];
  for (const [value, volt, price] of electrolytics) {
    add('capacitores', {
      name: `Capacitor electrolítico ${value} ${volt} x5`, brand: Number.parseFloat(value) >= 470 ? 'Nichicon' : 'Panasonic', price,
      use: `Capacitores electrolíticos de aluminio de ${value} y ${volt}, 105 °C, para fuentes y filtros de rizado. Paquete de 5.`,
      specs: [['Capacitancia', value], ['Voltaje', volt], ['Temperatura', '105 °C'], ['Tolerancia', '±20 %'], ['Encapsulado', 'THT radial'], ['Unidades', 5]],
      tags: ['condensador', 'electrolitico'], art: { kind: 'capacitor', variant: 'electrolytic', label: value },
    });
  }
  for (const [value, volt] of [['1 µF', '35 V'], ['10 µF', '16 V'], ['47 µF', '10 V']]) {
    add('capacitores', {
      name: `Capacitor de tantalio ${value} ${volt} x5`, brand: 'Kemet', price: 2.4,
      use: `Capacitores de tantalio de ${value}: baja resistencia serie y tamaño reducido para reguladores y audio.`,
      specs: [['Capacitancia', value], ['Voltaje', volt], ['Tolerancia', '±10 %'], ['Encapsulado', 'THT radial'], ['Unidades', 5]],
      tags: ['condensador', 'tantalio'], art: { kind: 'capacitor', variant: 'tantalum', label: value },
    });
  }
  add('capacitores', {
    name: 'Kit de capacitores electrolíticos 120 piezas', brand: 'Genérico', price: 8.5, featured: true,
    use: 'Surtido de 12 valores de 1 µF a 470 µF con voltajes de 16 V a 50 V, en caja organizadora.',
    specs: [['Capacitancia', '1 µF – 470 µF'], ['Voltaje', '16 V / 25 V / 50 V'], ['Encapsulado', 'THT radial'], ['Unidades', 120]],
    tags: ['kit', 'surtido', 'condensador'], art: { kind: 'capacitor', variant: 'electrolytic', label: 'KIT' },
  });
  add('capacitores', {
    name: 'Kit de capacitores cerámicos 300 piezas', brand: 'Genérico', price: 6.9,
    use: 'Surtido de 30 valores de 2 pF a 100 nF, 10 unidades por valor.',
    specs: [['Capacitancia', '2 pF – 100 nF'], ['Voltaje', '50 V'], ['Encapsulado', 'THT radial'], ['Unidades', 300]],
    tags: ['kit', 'surtido', 'condensador'], art: { kind: 'capacitor', variant: 'ceramic', label: 'KIT' },
  });
  add('capacitores', {
    name: 'Supercapacitor 5.5 V 1 F', brand: 'Genérico', price: 2.9,
    use: 'Supercondensador para respaldo de memoria y relojes durante cortes de energía.',
    specs: [['Capacitancia', '1 F'], ['Voltaje', '5.5 V'], ['Encapsulado', 'THT radial'], ['Unidades', 1]],
    tags: ['supercapacitor'], art: { kind: 'capacitor', variant: 'super', label: '1F' },
  });

  // ───────── Semiconductores ─────────
  const semis = [
    ['Diodo rectificador 1N4007 x10', 'onsemi', 0.8, 'DO-41', '1000 V', '1 A', 'diodo', 'Diodo de uso general para protección contra polaridad inversa y fuentes.'],
    ['Diodo de conmutación 1N4148 x20', 'onsemi', 0.9, 'DO-35', '100 V', '200 mA', 'diodo', 'Diodo rápido de señal para lógica y protección de entradas.'],
    ['Diodo Schottky 1N5819 x10', 'onsemi', 1.2, 'DO-41', '40 V', '1 A', 'diodo', 'Baja caída de voltaje para fuentes conmutadas y paneles solares.'],
    ['Diodo rectificador 1N5408 x5', 'onsemi', 1.2, 'DO-201', '1000 V', '3 A', 'diodo', 'Para fuentes de mayor corriente y cargadores.'],
    ['Diodo Zener 3.3 V 1N4728A x10', 'onsemi', 0.9, 'DO-41', '3.3 V', '1 W', 'zener', 'Regulación y referencia de 3.3 V para circuitos simples.'],
    ['Diodo Zener 5.1 V 1N4733A x10', 'onsemi', 0.9, 'DO-41', '5.1 V', '1 W', 'zener', 'Protege entradas de 5 V y genera referencias de voltaje.'],
    ['Diodo Zener 12 V 1N4742A x10', 'onsemi', 0.9, 'DO-41', '12 V', '1 W', 'zener', 'Referencia y protección para circuitos de 12 V.'],
    ['Puente rectificador KBP206 2 A', 'Genérico', 0.9, 'THT', '600 V', '2 A', 'diodo', 'Convierte corriente alterna en continua para fuentes lineales.'],
    ['Transistor NPN 2N2222A x10', 'onsemi', 1.2, 'TO-92', '40 V', '800 mA', 'transistor', 'El transistor de propósito general más conocido para conmutar relés y LEDs.'],
    ['Transistor NPN BC547 x10', 'onsemi', 0.9, 'TO-92', '45 V', '100 mA', 'transistor', 'Amplificador y conmutador de señal pequeña.'],
    ['Transistor PNP BC557 x10', 'onsemi', 0.9, 'TO-92', '45 V', '100 mA', 'transistor', 'Complemento PNP del BC547 para etapas push-pull.'],
    ['Transistor NPN 2N3904 x10', 'onsemi', 0.9, 'TO-92', '40 V', '200 mA', 'transistor', 'NPN de baja potencia para lógica y amplificación.'],
    ['Transistor PNP 2N3906 x10', 'onsemi', 0.9, 'TO-92', '40 V', '200 mA', 'transistor', 'PNP de baja potencia, par complementario del 2N3904.'],
    ['Transistor Darlington TIP120', 'STMicroelectronics', 0.85, 'TO-220', '60 V', '5 A', 'transistor', 'Alta ganancia para manejar motores y solenoides desde un pin digital.'],
    ['Transistor de potencia TIP31C', 'STMicroelectronics', 0.75, 'TO-220', '100 V', '3 A', 'transistor', 'NPN de potencia para amplificadores y control de cargas.'],
    ['MOSFET de canal N IRFZ44N', 'Infineon', 1.1, 'TO-220', '55 V', '49 A', 'mosfet', 'MOSFET de alta corriente para tiras LED, motores y control PWM.'],
    ['MOSFET de nivel lógico IRLZ44N', 'Infineon', 1.5, 'TO-220', '55 V', '47 A', 'mosfet', 'Se activa completamente con 5 V: ideal para controlar desde Arduino.', true],
    ['MOSFET de canal N 2N7000 x10', 'onsemi', 1.5, 'TO-92', '60 V', '200 mA', 'mosfet', 'MOSFET pequeño para cambiar niveles lógicos y conmutar cargas ligeras.'],
    ['Regulador de voltaje 7805 5 V', 'STMicroelectronics', 0.6, 'TO-220', '5 V', '1.5 A', 'regulador', 'Regulador lineal clásico: de 7–35 V a 5 V estables.', true],
    ['Regulador de voltaje 7809 9 V', 'STMicroelectronics', 0.6, 'TO-220', '9 V', '1.5 A', 'regulador', 'Salida fija de 9 V para circuitos de audio y fuentes.'],
    ['Regulador de voltaje 7812 12 V', 'STMicroelectronics', 0.6, 'TO-220', '12 V', '1.5 A', 'regulador', 'Salida fija de 12 V a partir de fuentes de mayor voltaje.'],
    ['Regulador ajustable LM317T', 'Texas Instruments', 0.9, 'TO-220', '1.25–37 V', '1.5 A', 'regulador', 'Voltaje de salida ajustable con dos resistencias. Base de fuentes variables.'],
    ['Regulador LDO AMS1117-3.3 x5', 'AMS', 1.2, 'SOT-223', '3.3 V', '1 A', 'regulador', 'Regulador de baja caída para alimentar módulos de 3.3 V desde 5 V.'],
    ['Regulador LDO AMS1117-5.0 x5', 'AMS', 1.2, 'SOT-223', '5 V', '1 A', 'regulador', 'Regulador de baja caída de 5 V en encapsulado de montaje superficial.'],
    ['Temporizador NE555 x5', 'Texas Instruments', 1.2, 'DIP-8', '4.5–16 V', '200 mA', 'ic', 'El integrado más famoso: temporizadores, osciladores y generadores PWM.', true],
    ['Amplificador operacional LM358 x5', 'Texas Instruments', 1.2, 'DIP-8', '3–32 V', '—', 'ic', 'Doble amplificador operacional de alimentación simple para sensores.'],
    ['Amplificador operacional LM741', 'Texas Instruments', 0.5, 'DIP-8', '±5–18 V', '—', 'ic', 'Amplificador operacional clásico para prácticas de laboratorio.'],
    ['Registro de desplazamiento 74HC595 x5', 'Texas Instruments', 1.5, 'DIP-16', '2–6 V', '35 mA', 'ic', 'Controla 8 salidas con tres pines; se pueden encadenar.'],
    ['Contador decimal CD4017', 'Texas Instruments', 0.5, 'DIP-16', '3–18 V', '—', 'ic', 'Contador Johnson de 10 salidas para secuenciadores de luces.'],
    ['Driver Darlington ULN2003A', 'Texas Instruments', 0.6, 'DIP-16', '50 V', '500 mA', 'ic', 'Siete canales para relés y motores paso a paso unipolares.'],
    ['Driver puente H L293D', 'Texas Instruments', 2.5, 'DIP-16', '4.5–36 V', '600 mA', 'ic', 'Controla dos motores DC pequeños en ambas direcciones.'],
    ['Microcontrolador ATmega328P-PU con bootloader', 'Microchip', 4.9, 'DIP-28', '5 V', '—', 'ic', 'El chip del Arduino Uno, listo para montar tu propia placa.'],
    ['Microcontrolador ATtiny85-20PU', 'Microchip', 2.9, 'DIP-8', '2.7–5.5 V', '—', 'ic', 'Microcontrolador de 8 pines para proyectos muy pequeños.'],
    ['Optoacoplador PC817 x10', 'Sharp', 1.5, 'DIP-4', '35 V', '50 mA', 'ic', 'Aísla eléctricamente el microcontrolador de cargas ruidosas.'],
    ['Optoacoplador para triac MOC3021 x5', 'onsemi', 2.5, 'DIP-6', '400 V', '—', 'ic', 'Disparo aislado de triacs para controlar cargas de corriente alterna.'],
    ['Triac BT136 600 V', 'NXP', 0.6, 'TO-220', '600 V', '4 A', 'transistor', 'Control de cargas de corriente alterna como focos y ventiladores.'],
    ['Zócalo DIP de 8 pines x10', 'Genérico', 0.9, 'DIP-8', '—', '—', 'zocalo', 'Monta tus integrados sin soldarlos directamente y reemplázalos fácilmente.'],
    ['Zócalo DIP de 16 pines x10', 'Genérico', 1.2, 'DIP-16', '—', '—', 'zocalo', 'Zócalos para integrados de 16 pines como el 74HC595.'],
  ];
  for (const [name, brand, price, pkg, volt, current, group, use, featured] of semis) {
    add('semiconductores', {
      name, brand, price, use, featured,
      specs: [['Encapsulado', pkg], ['Voltaje', volt], ['Corriente', current], ['Tipo', { diodo: 'Diodo', zener: 'Diodo Zener', transistor: 'Transistor', mosfet: 'MOSFET', regulador: 'Regulador de voltaje', ic: 'Circuito integrado', zocalo: 'Zócalo' }[group]]],
      tags: ['semiconductor', group],
      art: { kind: 'chip', variant: pkg.startsWith('DIP') ? 'dip' : pkg.startsWith('TO-220') ? 'to220' : pkg === 'TO-92' ? 'to92' : pkg === 'SOT-223' ? 'smd' : pkg === 'THT' ? 'bridge' : 'diode', pins: Number(pkg.split('-')[1]) || 8, label: name.match(/[A-Z0-9]{3,}[A-Z0-9.-]*/)?.[0] },
    });
  }

  // ───────── LEDs ─────────
  const ledColors = [['rojo', '#ff3b30', '2.0 V'], ['verde', '#34c759', '2.2 V'], ['azul', '#0a84ff', '3.2 V'], ['amarillo', '#ffd60a', '2.1 V'], ['blanco', '#f5f5f7', '3.2 V'], ['naranja', '#ff9f0a', '2.1 V']];
  for (const size of ['5 mm', '3 mm']) {
    for (const [color, hex, vf] of ledColors) {
      add('leds', {
        name: `LED ${size} ${color} difuso x20`, price: size === '5 mm' ? 1.5 : 1.3,
        use: `LEDs ${color}s de ${size} para indicadores y prácticas. Recuerda usar una resistencia en serie (220 Ω a 5 V).`,
        specs: [['Color', color[0].toUpperCase() + color.slice(1)], ['Voltaje', vf], ['Corriente', '20 mA'], ['Encapsulado', size], ['Unidades', 20]],
        tags: ['led', color], art: { kind: 'led', color: hex },
      });
    }
  }
  for (const type of ['cátodo común', 'ánodo común']) {
    add('leds', {
      name: `LED RGB 5 mm ${type} x10`, price: 2.4,
      use: `LED de tres colores con ${type}: mezcla rojo, verde y azul con PWM para obtener cualquier color.`,
      specs: [['Color', 'RGB'], ['Voltaje', '2.0 V / 3.2 V'], ['Corriente', '20 mA'], ['Encapsulado', '5 mm'], ['Unidades', 10]],
      tags: ['led', 'rgb', 'multicolor'], art: { kind: 'led', color: 'rgb' },
    });
  }
  const pixels = [
    ['Tira LED WS2812B 1 m 60 LEDs IP30', 9.9, '1 m', '60 LEDs', true],
    ['Tira LED WS2812B 5 m 30 LEDs/m IP65', 29.9, '5 m', '150 LEDs'],
    ['Tira LED WS2812B 1 m 144 LEDs IP65', 19.9, '1 m', '144 LEDs'],
    ['Anillo NeoPixel WS2812B de 16 LEDs', 4.9, '45 mm', '16 LEDs'],
    ['Anillo NeoPixel WS2812B de 24 LEDs', 6.9, '66 mm', '24 LEDs'],
    ['Matriz flexible WS2812B 8×32', 24.9, '80 × 320 mm', '256 LEDs'],
  ];
  for (const [name, price, length, count, featured] of pixels) {
    add('leds', {
      name, price, featured, brand: 'Worldsemi',
      use: `${count} direccionables individualmente con un solo pin de datos. Para iluminación ambiental, letreros y efectos.`,
      specs: [['Color', 'RGB'], ['Voltaje', '5 V'], ['Interfaz', 'Digital'], ['Longitud', length], ['Cantidad', count], ['Encapsulado', 'SMD 5050']],
      tags: ['neopixel', 'direccionable', 'rgb', 'tira'], art: { kind: 'strip', color: 'rgb' },
    });
  }
  add('leds', {
    name: 'Tira LED 12 V 5050 blanco cálido 5 m', price: 14.9,
    use: 'Iluminación decorativa para muebles y vitrinas, con adhesivo 3M. Se corta cada 3 LEDs.',
    specs: [['Color', 'Blanco cálido'], ['Voltaje', '12 V'], ['Longitud', '5 m'], ['Cantidad', '300 LEDs'], ['Encapsulado', 'SMD 5050']],
    tags: ['tira', 'iluminacion'], art: { kind: 'strip', color: '#ffd60a' },
  });
  add('leds', {
    name: 'LED de potencia 3 W blanco con disipador', price: 1.9,
    use: 'LED de alta luminosidad en estrella de aluminio para linternas y lámparas.',
    specs: [['Color', 'Blanco'], ['Voltaje', '3.2 V'], ['Corriente', '700 mA'], ['Potencia', '3 W'], ['Encapsulado', 'Estrella 20 mm']],
    tags: ['led', 'potencia'], art: { kind: 'led', color: '#f5f5f7', variant: 'power' },
  });
  add('leds', {
    name: 'LED infrarrojo 940 nm 5 mm x10', price: 1.8,
    use: 'Emisores infrarrojos para controles remotos y barreras de detección.',
    specs: [['Color', 'Infrarrojo'], ['Voltaje', '1.2 V'], ['Corriente', '20 mA'], ['Encapsulado', '5 mm'], ['Unidades', 10]],
    tags: ['led', 'ir', 'infrarrojo'], art: { kind: 'led', color: '#5e5ce6' },
  });

  // ───────── Cables y conectores ─────────
  const jumperKinds = [['macho-macho', 'M-M'], ['macho-hembra', 'M-H'], ['hembra-hembra', 'H-H']];
  for (const len of ['10 cm', '20 cm', '30 cm']) {
    for (const [kind, short] of jumperKinds) {
      add('cables-conectores', {
        name: `Cables jumper ${kind} ${len} x40`, price: len === '10 cm' ? 2.2 : len === '20 cm' ? 2.8 : 3.4, featured: len === '20 cm' && short === 'M-M',
        use: `Cinta de 40 cables dupont ${kind} de ${len} en colores, separables uno a uno. Indispensables para el protoboard.`,
        specs: [['Tipo', `Jumper ${short}`], ['Longitud', len], ['Calibre', '26 AWG'], ['Encapsulado', 'Dupont 2.54 mm'], ['Unidades', 40]],
        tags: ['jumper', 'dupont', 'cable', short], art: { kind: 'cable' },
      });
    }
  }
  for (const [name, price, points, featured] of [['Protoboard de 830 puntos', 3.5, 830, true], ['Protoboard de 400 puntos', 2.2, 400], ['Mini protoboard de 170 puntos', 1.2, 170]]) {
    add('cables-conectores', {
      name, price, featured,
      use: `Placa de pruebas sin soldadura de ${points} puntos con adhesivo en la base, para armar circuitos rápidamente.`,
      specs: [['Puntos', points], ['Paso', '2.54 mm'], ['Encapsulado', 'Placa'], ['Unidades', 1]],
      tags: ['breadboard', 'protoboard'], art: { kind: 'breadboard' },
    });
  }
  const connectors = [
    ['Tira de pines macho 1×40 2.54 mm x10', 1.9, 'Header macho', '2.54 mm'],
    ['Tira de pines hembra 1×40 2.54 mm x5', 2.5, 'Header hembra', '2.54 mm'],
    ['Tira de pines macho en ángulo 1×40 x5', 1.9, 'Header en ángulo', '2.54 mm'],
    ['Kit de conectores JST-XH 2/3/4/5 pines (230 piezas)', 6.9, 'JST-XH', '2.54 mm'],
    ['Kit de conectores Dupont 620 piezas', 5.9, 'Dupont', '2.54 mm'],
    ['Bornera de tornillo 2 pines 5.08 mm x10', 1.9, 'Bornera', '5.08 mm'],
    ['Bornera de tornillo 3 pines 5.08 mm x10', 2.5, 'Bornera', '5.08 mm'],
    ['Conector jack DC 5.5×2.1 mm hembra x5', 1.5, 'Jack DC', '5.5 × 2.1 mm'],
    ['Conector de batería 9 V con cable x5', 1.2, 'Broche 9 V', '—'],
    ['Placa perforada de cobre 7×9 cm x5', 2.9, 'Placa perforada', '2.54 mm'],
    ['Placa perforada doble cara 5×7 cm x5', 2.5, 'Placa perforada', '2.54 mm'],
  ];
  for (const [name, price, type, pitch] of connectors) {
    add('cables-conectores', {
      name, price, use: `${type} de paso ${pitch} para conexiones confiables en tus proyectos y prototipos.`,
      specs: [['Tipo', type], ['Paso', pitch], ['Encapsulado', type.startsWith('Placa') ? 'Placa' : 'THT']],
      tags: ['conector', type.toLowerCase()], art: { kind: type.startsWith('Placa') ? 'breadboard' : 'connector' },
    });
  }
  const cables = [
    ['Cable USB-A a USB-B 1.5 m (Arduino Uno/Mega)', 2.9, 'USB-A a USB-B', '1.5 m'],
    ['Cable USB-A a micro USB de datos 1 m', 2.5, 'USB-A a micro USB', '1 m'],
    ['Cable USB-A a USB-C de datos 1 m', 3.5, 'USB-A a USB-C', '1 m'],
    ['Cable USB-C a USB-C 60 W 1 m', 4.9, 'USB-C a USB-C', '1 m'],
    ['Cable de silicona 22 AWG 6 colores (5 m c/u)', 9.9, 'Cable flexible', '30 m'],
    ['Cable rígido 22 AWG para protoboard (kit 6 colores)', 7.9, 'Cable rígido', '54 m'],
    ['Cable plano IDC de 40 hilos 20 cm', 2.2, 'Cable plano', '20 cm'],
  ];
  for (const [name, price, type, length] of cables) {
    add('cables-conectores', {
      name, price, use: `${type} de ${length}. ${type.startsWith('USB') ? 'Con hilos de datos para programar tus placas, no solo cargar.' : 'Para cableado limpio de prototipos y equipos.'}`,
      specs: [['Tipo', type], ['Longitud', length], ['Interfaz', type.startsWith('USB') ? 'USB' : '—'], ['Encapsulado', 'Cable']],
      tags: ['cable', type.toLowerCase()], art: { kind: type.startsWith('USB') ? 'usb' : 'cable' },
    });
  }

  // ───────── Motores ─────────
  const motors = [
    ['Servomotor SG90 9 g', 'TowerPro', 2.9, '4.8–6 V', 'PWM', '1.8 kg·cm', '180°', 'servo', 'Microservo para brazos robóticos, timones y mecanismos ligeros.', true],
    ['Servomotor MG90S engranajes metálicos', 'TowerPro', 4.9, '4.8–6 V', 'PWM', '2.2 kg·cm', '180°', 'servo', 'Como el SG90, pero con engranajes de metal más resistentes.'],
    ['Servomotor MG996R 13 kg', 'TowerPro', 8.9, '4.8–7.2 V', 'PWM', '13 kg·cm', '180°', 'servo', 'Servo de alto torque para brazos robóticos y vehículos RC.'],
    ['Servomotor de rotación continua 360°', 'Genérico', 5.9, '4.8–6 V', 'PWM', '1.5 kg·cm', '360°', 'servo', 'Gira de forma continua; se controla velocidad y dirección.'],
    ['Motor paso a paso 28BYJ-48 + driver ULN2003', 'Genérico', 3.9, '5 V', 'Digital', '0.3 kg·cm', '2048 pasos/vuelta', 'paso', 'Combo económico para persianas, relojes y mecanismos lentos.', true],
    ['Motor paso a paso NEMA 17 17HS4401 1.7 A', 'Genérico', 12.9, '12 V', 'Digital', '4.2 kg·cm', '200 pasos/vuelta', 'paso', 'El estándar de impresoras 3D y CNC de escritorio.'],
    ['Motor paso a paso NEMA 23 2.8 A', 'Genérico', 29.9, '24 V', 'Digital', '19 kg·cm', '200 pasos/vuelta', 'paso', 'Mayor torque para routers CNC y máquinas más grandes.'],
    ['Motor DC con reductora TT y rueda', 'Genérico', 2.9, '3–6 V', 'PWM', '0.8 kg·cm', '200 RPM', 'dc', 'Motor amarillo con rueda de 65 mm, base de robots móviles.'],
    ['Kit chasis de robot 2WD', 'Genérico', 11.9, '3–6 V', 'PWM', '0.8 kg·cm', '200 RPM', 'dc', 'Chasis acrílico con dos motores TT, ruedas, rueda loca y portapilas.', true],
    ['Motor DC 130 3–6 V x2', 'Genérico', 1.9, '3–6 V', 'PWM', '—', '10000 RPM', 'dc', 'Motor pequeño para ventiladores, juguetes y prácticas.'],
    ['Micromotor N20 con reductora 100 RPM', 'Genérico', 4.5, '6 V', 'PWM', '1.2 kg·cm', '100 RPM', 'dc', 'Motor metálico compacto para minisumos y robots pequeños.'],
    ['Minibomba de agua sumergible 3–6 V', 'Genérico', 2.9, '3–6 V', 'PWM', '120 L/h', '—', 'bomba', 'Bomba silenciosa para riego automático y fuentes de agua.'],
    ['Motor vibrador de moneda 3 V x5', 'Genérico', 2.5, '3 V', 'Digital', '—', '12000 RPM', 'dc', 'Vibración háptica para wearables y alertas silenciosas.'],
    ['Buzzer activo 5 V x5', 'Genérico', 1.5, '5 V', 'Digital', '85 dB', '2.3 kHz', 'buzzer', 'Suena con solo aplicar voltaje: alarmas y avisos.'],
    ['Buzzer pasivo 5 V x5', 'Genérico', 1.5, '5 V', 'PWM', '85 dB', '2–5 kHz', 'buzzer', 'Reproduce tonos y melodías con PWM.'],
    ['Solenoide de empuje 12 V', 'Genérico', 6.9, '12 V', 'Digital', '5 N', '10 mm', 'solenoide', 'Actuador lineal para cerraduras eléctricas y dispensadores.'],
    ['Ventilador 5 V 40×40 mm', 'Genérico', 2.5, '5 V', 'Digital', '—', '6000 RPM', 'ventilador', 'Enfriamiento para Raspberry Pi, cajas de proyecto e impresoras 3D.'],
  ];
  for (const [name, brand, price, volt, iface, torque, speed, group, use, featured] of motors) {
    add('motores', {
      name, brand, price, use, featured,
      specs: [['Voltaje', volt], ['Interfaz', iface], ['Torque / fuerza', torque], ['Velocidad / rango', speed], ['Encapsulado', group === 'buzzer' ? 'THT' : 'Módulo']],
      tags: ['motor', group], art: { kind: 'motor', variant: group },
    });
  }

  // ───────── Fuentes y baterías ─────────
  const power = [
    ['Adaptador de corriente 5 V 2 A micro USB', 4.9, '5 V', '2 A', 'adaptador', 'Fuente de pared para Raspberry Pi 3, ESP32 y módulos USB.'],
    ['Adaptador de corriente 5 V 3 A USB-C', 7.9, '5 V', '3 A', 'adaptador', 'Fuente recomendada para Raspberry Pi 4 y placas USB-C.'],
    ['Fuente USB-C 27 W para Raspberry Pi 5', 'Raspberry Pi', 14.9, '5.1 V', '5 A', 'adaptador', 'Fuente oficial que entrega 5 A para aprovechar todos los puertos de la Pi 5.'],
    ['Adaptador de corriente 9 V 1 A jack 5.5 mm', 4.5, '9 V', '1 A', 'adaptador', 'Alimenta tu Arduino Uno sin computadora.'],
    ['Adaptador de corriente 12 V 2 A jack 5.5 mm', 5.9, '12 V', '2 A', 'adaptador', 'Para tiras LED, motores pequeños y routers.'],
    ['Adaptador de corriente 12 V 5 A jack 5.5 mm', 9.9, '12 V', '5 A', 'adaptador', 'Mayor corriente para impresoras 3D pequeñas y tiras LED largas.'],
    ['Fuente conmutada 5 V 10 A metálica', 14.9, '5 V', '10 A', 'conmutada', 'Ideal para alimentar varios metros de tiras WS2812B.'],
    ['Fuente conmutada 12 V 10 A metálica', 16.9, '12 V', '10 A', 'conmutada', 'Fuente de 120 W para CNC, impresoras 3D y cámaras de seguridad.'],
    ['Fuente conmutada 24 V 5 A metálica', 18.9, '24 V', '5 A', 'conmutada', 'Para motores NEMA 23 y tableros industriales.'],
    ['Fuente de laboratorio regulable 30 V 5 A', 69.9, '0–30 V', '0–5 A', 'laboratorio', 'Voltaje y corriente ajustables con limitación, indispensable para el banco de trabajo.', true],
    ['Módulo fuente para protoboard MB102', 1.9, '3.3 V / 5 V', '700 mA', 'modulo', 'Se inserta en el protoboard y entrega 3.3 V y 5 V seleccionables.'],
    ['Batería de litio 18650 3000 mAh', 5.9, '3.7 V', '15 A', 'bateria', 'Celda recargable de alta capacidad para power banks y robots.', true],
    ['Batería LiPo 3.7 V 1000 mAh con conector JST', 6.5, '3.7 V', '1 A', 'bateria', 'Batería delgada para wearables y placas con cargador integrado.'],
    ['Batería alcalina 9 V', 2.5, '9 V', '—', 'bateria', 'Para multímetros, prototipos portátiles y alarmas.'],
    ['Portapilas 2×18650 con cables', 1.5, '7.4 V', '—', 'portapilas', 'Dos celdas en serie para alimentar robots y drivers de motor.'],
    ['Portapilas 4×AA con interruptor', 1.5, '6 V', '—', 'portapilas', 'Alimentación portátil con interruptor de encendido.'],
    ['Panel solar 6 V 2 W', 6.9, '6 V', '330 mA', 'solar', 'Recarga baterías para estaciones meteorológicas y sensores autónomos.'],
  ];
  for (const row of power) {
    const [name, maybeBrand, ...rest] = row;
    const [brand, price, volt, current, group, use, featured] = typeof maybeBrand === 'string' ? [maybeBrand, ...rest] : ['Genérico', maybeBrand, ...rest];
    add('fuentes', {
      name, brand, price, use, featured,
      specs: [['Voltaje', volt], ['Corriente', current], ['Potencia', /^\d+(\.\d+)? A$/.test(current) && /^\d+(\.\d+)? V$/.test(volt) ? `${+(Number.parseFloat(volt) * Number.parseFloat(current)).toFixed(1)} W` : '—'], ['Tipo', { adaptador: 'Adaptador de pared', conmutada: 'Fuente conmutada', laboratorio: 'Fuente de laboratorio', modulo: 'Módulo', bateria: 'Batería', portapilas: 'Portapilas', solar: 'Panel solar' }[group]]],
      tags: ['energia', 'alimentacion', group], art: { kind: group === 'bateria' || group === 'portapilas' ? 'battery' : group === 'solar' ? 'solar' : 'power', variant: group },
    });
  }

  // ───────── Herramientas ─────────
  const tools = [
    ['Cautín tipo lápiz 60 W con temperatura regulable', 'Genérico', 12.9, '110 V', '60 W', 'soldadura', 'iron', 'Calienta en segundos y regula de 200 °C a 450 °C. Incluye 5 puntas.', true],
    ['Estación de soldadura digital 75 W', 'Hakko', 89.0, '110 V', '75 W', 'soldadura', 'station', 'Control digital de temperatura y punta intercambiable para trabajo profesional.'],
    ['Cautín portátil Pinecil V2 USB-C', 'Pine64', 39.9, '12–24 V', '88 W', 'soldadura', 'iron', 'Cautín inteligente alimentado por USB-C PD, calienta en 6 segundos.', true],
    ['Estaño 60/40 0.8 mm con flux, carrete 100 g', 'Genérico', 6.9, '—', '—', 'soldadura', 'solder', 'Soldadura de alma de resina para electrónica fina.'],
    ['Estaño sin plomo 1 mm, carrete 100 g', 'Genérico', 9.9, '—', '—', 'soldadura', 'solder', 'Aleación SAC305 libre de plomo.'],
    ['Pasta flux 10 g', 'Genérico', 2.9, '—', '—', 'soldadura', 'solder', 'Mejora el flujo de la soldadura en SMD y reparaciones.'],
    ['Malla desoldadora 2 mm × 1.5 m', 'Genérico', 1.9, '—', '—', 'soldadura', 'solder', 'Retira estaño de pads y pines de forma limpia.'],
    ['Bomba desoldadora de aluminio', 'Genérico', 3.9, '—', '—', 'soldadura', 'plier', 'Succiona el estaño fundido para desmontar componentes.'],
    ['Multímetro digital UNI-T UT33D+', 'UNI-T', 19.9, '600 V', '10 A', 'medicion', 'meter', 'Multímetro compacto con continuidad, prueba de diodos y retroiluminación.', true],
    ['Multímetro True RMS UNI-T UT61E+', 'UNI-T', 79.9, '1000 V', '20 A', 'medicion', 'meter', 'Alta precisión con 22000 cuentas y conexión USB.'],
    ['Pinza amperimétrica UNI-T UT210E', 'UNI-T', 44.9, '600 V', '100 A', 'medicion', 'meter', 'Mide corriente AC/DC sin cortar el cable.'],
    ['Analizador lógico USB 8 canales 24 MHz', 'Genérico', 11.9, '5 V', '—', 'medicion', 'meter', 'Depura I2C, SPI y UART con software libre como PulseView.'],
    ['Osciloscopio de bolsillo DSO138 (kit para armar)', 'JYE Tech', 24.9, '9 V', '—', 'medicion', 'meter', 'Osciloscopio de 200 kHz que tú mismo sueldas: aprende y mide.'],
    ['Probador de componentes LCR-T4', 'Genérico', 9.9, '9 V', '—', 'medicion', 'meter', 'Identifica transistores, capacitores, resistencias y diodos automáticamente.'],
    ['Pinza de punta fina 5"', 'Genérico', 3.9, '—', '—', 'mano', 'plier', 'Para doblar patas de componentes y sujetar piezas pequeñas.'],
    ['Alicate de corte diagonal 5"', 'Genérico', 3.9, '—', '—', 'mano', 'plier', 'Corta al ras las patas de los componentes soldados.'],
    ['Pelacables automático', 'Genérico', 9.9, '—', '—', 'mano', 'plier', 'Pela cables de 0.2 a 6 mm² con un solo movimiento.'],
    ['Juego de destornilladores de precisión 25 en 1', 'Genérico', 8.9, '—', '—', 'mano', 'screwdriver', 'Puntas magnéticas Phillips, planas y Torx para equipos electrónicos.'],
    ['Tercera mano con lupa y pinzas', 'Genérico', 7.9, '—', '—', 'mano', 'plier', 'Sujeta las piezas mientras sueldas, con lupa de aumento.'],
    ['Pistola de silicona 20 W + 10 barras', 'Genérico', 5.9, '110 V', '20 W', 'mano', 'iron', 'Fija cables y módulos dentro de cajas de proyecto.'],
    ['Kit de tubo termocontraíble 328 piezas', 'Genérico', 5.9, '—', '—', 'mano', 'solder', 'Aísla empalmes y soldaduras con 8 diámetros y 5 colores.'],
    ['Organizador de componentes 24 compartimientos', 'Genérico', 6.9, '—', '—', 'mano', 'box', 'Caja con divisiones ajustables para mantener ordenado el taller.'],
  ];
  for (const [name, brand, price, volt, watts, group, variant, use, featured] of tools) {
    add('herramientas', {
      name, brand, price, use, featured,
      specs: [['Voltaje', volt], [group === 'medicion' ? 'Rango de corriente' : 'Potencia', watts], ['Uso', group === 'soldadura' ? 'Soldadura' : group === 'medicion' ? 'Medición' : 'Herramienta de mano']],
      tags: ['herramienta', group], art: { kind: 'tool', variant },
    });
  }

  return products;
}

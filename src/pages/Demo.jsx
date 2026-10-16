import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { TEST_CARDS } from '../../shared/shop.js';

export default function Demo() {
  const { data } = useApi('/health');
  return (
    <div className="page narrow prose">
      <p className="eyebrow">Sobre esta demo</p>
      <h1>Una tienda completa, sin cobros reales</h1>
      <p>
        Circuito Andino es un proyecto de portafolio: un e‑commerce de componentes electrónicos hecho con React, Node.js (Express) y MongoDB. Puedes buscar y filtrar el catálogo,
        crear una cuenta, pagar con una tarjeta de prueba, seguir tu pedido y gestionarlo desde el panel de administración.
      </p>
      <p className="muted small">
        Datos: {data ? (data.mode === 'mongodb' ? 'MongoDB' : 'modo demo en memoria (se reinician cuando el servidor se reinicia)') : '…'}.
      </p>

      <h2>Cuentas de prueba</h2>
      <table className="specs-table">
        <tbody>
          <tr><th scope="row">Cliente</th><td><code>cliente@circuitoandino.demo</code> · <code>cliente1234</code></td></tr>
          <tr><th scope="row">Administración</th><td><code>admin@circuitoandino.demo</code> · <code>admin1234</code></td></tr>
        </tbody>
      </table>
      <p>También puedes <Link to="/registro">crear tu propia cuenta</Link>.</p>

      <h2 id="tarjetas">Tarjetas de prueba</h2>
      <p>La pasarela de pagos es simulada: no se conecta con bancos ni proveedores de pago y no guarda el número, la fecha ni el CVC (solo la marca y los 4 últimos dígitos). Usa cualquier nombre, una fecha de vencimiento futura y cualquier CVC de 3 dígitos.</p>
      <table className="specs-table">
        <tbody>
          {TEST_CARDS.map((c) => (
            <tr key={c.number}>
              <th scope="row"><code>{c.number.replace(/(\d{4})(?=\d)/g, '$1 ')}</code></th>
              <td>{c.brand} · {c.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Cualquier otro número se rechaza. Para la cédula de la dirección de envío puedes usar <code>1712345675</code>.</p>

      <h2>Qué puedes probar</h2>
      <ol>
        <li>Busca «sensor I2C» o «10k» y filtra por voltaje, interfaz, encapsulado, marca, precio y disponibilidad.</li>
        <li>Agrega productos al carrito (se guarda en el navegador y en tu cuenta).</li>
        <li>Paga con <code>4242 4242 4242 4242</code> y revisa el pedido en <Link to="/cuenta/pedidos">Mis pedidos</Link>.</li>
        <li>Entra como administración y cambia el estado del pedido, ajusta stock o crea un producto en el <Link to="/admin">panel</Link>.</li>
      </ol>
    </div>
  );
}

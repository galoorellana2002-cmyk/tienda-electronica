// Ilustraciones SVG generadas a partir de los datos del producto: no hay imágenes externas.
import { useId } from 'react';

const TONES = {
  board: ['#eef6ff', '#d6e8fb'], sensor: ['#f0faf4', '#d3efdf'], module: ['#eef2ff', '#d9defa'], display: ['#f2f1ff', '#dcdaf7'],
  resistor: ['#fbf6ee', '#efe2cc'], capacitor: ['#fdf3ee', '#f5dccd'], chip: ['#f2f2f4', '#dcdce1'], led: ['#fff8ec', '#fbe5bf'],
  strip: ['#f6f0ff', '#e3d6fb'], cable: ['#eefaf9', '#cdeeea'], breadboard: ['#f4f4f6', '#e1e1e6'], connector: ['#f4f4f6', '#e1e1e6'],
  usb: ['#eef6ff', '#d6e8fb'], motor: ['#f1f7ee', '#dbebd2'], power: ['#f2f2f4', '#dcdce1'], battery: ['#effaf2', '#d0efd9'],
  solar: ['#eef5ff', '#d3e3fa'], tool: ['#fff5ef', '#fbdfcf'], pot: ['#eef2ff', '#d9defa'],
};

const BAND = ['#1d1d1f', '#8b5a2b', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#9e9e9e', '#fafafa'];

function bandsFor(ohms = 1000) {
  const digits = String(Math.round(ohms));
  const first = Number(digits[0]);
  const second = Number(digits[1] ?? 0);
  const multiplier = Math.max(0, digits.length - 2);
  return [BAND[first], BAND[second], BAND[multiplier] ?? BAND[0], '#c9a227'];
}

const Pins = ({ x, y, count, gap = 9, vertical = false, color = '#d4af37', w = 5, h = 5 }) =>
  Array.from({ length: count }, (_, i) => (
    <rect key={i} x={vertical ? x : x + i * gap} y={vertical ? y + i * gap : y} width={w} height={h} rx={1} fill={color} />
  ));

const Legs = ({ xs, y1, y2, color = '#b0b0b8' }) => xs.map((x, i) => <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round" />);

function Board({ color = '#1565c0', label = 'MCU' }) {
  return (
    <g>
      <rect x="28" y="52" width="144" height="96" rx="10" fill={color} />
      <rect x="28" y="52" width="144" height="96" rx="10" fill="url(#shine)" />
      <Pins x={44} y={58} count={13} />
      <Pins x={44} y={137} count={13} />
      <rect x="18" y="84" width="26" height="30" rx="4" fill="#c7c7cc" stroke="#8e8e93" />
      <rect x="82" y="78" width="44" height="44" rx="4" fill="#1d1d1f" />
      <text x="104" y="104" textAnchor="middle" fontSize="8" fill="#d1d1d6" fontFamily="ui-monospace, monospace">{String(label).slice(0, 9)}</text>
      <circle cx="152" cy="80" r="4" fill="#34c759" />
      <circle cx="152" cy="94" r="4" fill="#ff9f0a" />
      <rect x="138" y="108" width="20" height="12" rx="2" fill="#e5e5ea" />
    </g>
  );
}

function SensorElement({ variant }) {
  switch (variant) {
    case 'distancia':
      return (
        <g>
          {[76, 124].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="98" r="22" fill="#d1d1d6" stroke="#8e8e93" strokeWidth="3" />
              <circle cx={cx} cy="98" r="14" fill="#3a3a3c" />
              <circle cx={cx} cy="98" r="14" fill="url(#mesh)" />
            </g>
          ))}
        </g>
      );
    case 'movimiento':
      return <path d="M70 112 a30 30 0 0 1 60 0 z" fill="#f5f5f7" stroke="#c7c7cc" strokeWidth="2" />;
    case 'temperatura':
      return (
        <g>
          <rect x="80" y="66" width="40" height="52" rx="4" fill="#f5f5f7" stroke="#c7c7cc" />
          {[0, 1, 2, 3, 4].map((r) => <rect key={r} x="86" y={72 + r * 9} width="28" height="4" rx="1" fill="#d1d1d6" />)}
        </g>
      );
    case 'gas':
      return (
        <g>
          <circle cx="100" cy="94" r="26" fill="#c7c7cc" />
          <circle cx="100" cy="94" r="20" fill="url(#mesh)" />
        </g>
      );
    case 'agua':
      return (
        <g>
          <rect x="82" y="70" width="12" height="70" rx="3" fill="#d4af37" />
          <rect x="106" y="70" width="12" height="70" rx="3" fill="#d4af37" />
        </g>
      );
    case 'luz':
      return (
        <g>
          <circle cx="100" cy="92" r="16" fill="#ffd60a" opacity=".35" />
          <circle cx="100" cy="92" r="10" fill="#ff9f0a" />
          <path d="M92 88 h16 M92 92 h16 M92 96 h16" stroke="#8b5a2b" strokeWidth="1.5" />
        </g>
      );
    case 'seguridad':
      return (
        <g>
          <rect x="70" y="72" width="60" height="40" rx="4" fill="none" stroke="#ffd60a" strokeWidth="3" />
          <rect x="80" y="80" width="40" height="24" rx="3" fill="none" stroke="#ffd60a" strokeWidth="2" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="84" y="78" width="32" height="32" rx="3" fill="#1d1d1f" />
          <Pins x={86} y={72} count={4} gap={8} color="#c7c7cc" w={4} h={6} />
          <Pins x={86} y={110} count={4} gap={8} color="#c7c7cc" w={4} h={6} />
        </g>
      );
  }
}

function Sensor({ variant }) {
  return (
    <g>
      <rect x="44" y="56" width="112" height="84" rx="8" fill="#1565c0" />
      <rect x="44" y="56" width="112" height="84" rx="8" fill="url(#shine)" />
      <SensorElement variant={variant} />
      <Legs xs={[82, 94, 106, 118]} y1={140} y2={160} color="#d4af37" />
    </g>
  );
}

function Module({ color = '#1565c0', variant }) {
  return (
    <g>
      <rect x="32" y="58" width="136" height="86" rx="8" fill={color} />
      <rect x="32" y="58" width="136" height="86" rx="8" fill="url(#shine)" />
      {variant === 'relé' && (
        <g>
          <rect x="52" y="70" width="44" height="50" rx="4" fill="#0a84ff" />
          <text x="74" y="99" textAnchor="middle" fontSize="7" fill="#fff" fontFamily="ui-monospace, monospace">SRD-05V</text>
          <rect x="120" y="76" width="36" height="22" rx="2" fill="#34c759" />
          <circle cx="129" cy="87" r="4" fill="#1d1d1f" />
          <circle cx="147" cy="87" r="4" fill="#1d1d1f" />
        </g>
      )}
      {variant === 'motor' && (
        <g>
          <rect x="60" y="64" width="80" height="20" rx="2" fill="#1d1d1f" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={62 + i * 10} y="64" width="5" height="44" rx="1" fill="#2c2c2e" />)}
          <rect x="132" y="112" width="26" height="20" rx="2" fill="#0a84ff" />
        </g>
      )}
      {variant === 'radio' && (
        <g>
          <rect x="60" y="80" width="40" height="40" rx="4" fill="#c7c7cc" />
          <path d="M120 76 h28 v8 h-24 v8 h24 v8 h-24 v8 h24 v8 h-28" fill="none" stroke="#d4af37" strokeWidth="3" />
        </g>
      )}
      {variant === 'energia' && (
        <g>
          <circle cx="78" cy="100" r="20" fill="#3a3a3c" />
          <circle cx="78" cy="100" r="11" fill="#8e8e93" />
          <rect x="112" y="80" width="30" height="16" rx="3" fill="#0a84ff" />
          <rect x="112" y="104" width="30" height="20" rx="2" fill="#1d1d1f" />
        </g>
      )}
      {!['relé', 'motor', 'radio', 'energia'].includes(variant) && (
        <g>
          <rect x="80" y="80" width="40" height="40" rx="3" fill="#1d1d1f" />
          <Pins x={82} y={73} count={5} gap={8} color="#c7c7cc" w={4} h={6} />
          <Pins x={82} y={121} count={5} gap={8} color="#c7c7cc" w={4} h={6} />
        </g>
      )}
      <Pins x={52} y={134} count={6} gap={10} />
    </g>
  );
}

function Display({ color = '#0d47a1', variant }) {
  const screen = {
    oled: ['#0b0b0f', '#7fdbff'], lcd: ['#1e63d6', '#ffffff'], tft: ['#111', null], epaper: ['#e5e5ea', '#1d1d1f'],
    segmentos: ['#111', '#ff3b30'], matriz: ['#111', '#ff3b30'],
  }[variant] ?? ['#0b0b0f', '#7fdbff'];
  return (
    <g>
      <rect x="26" y="50" width="148" height="100" rx="8" fill={color} />
      <rect x="38" y="62" width="124" height="72" rx="4" fill={screen[0]} />
      {variant === 'tft' && <rect x="38" y="62" width="124" height="72" rx="4" fill="url(#rainbow)" opacity=".9" />}
      {(variant === 'oled' || variant === 'epaper' || variant === undefined) && (
        <g fill={screen[1]}>
          <rect x="48" y="74" width="60" height="7" rx="2" />
          <rect x="48" y="88" width="96" height="5" rx="2" opacity=".7" />
          <rect x="48" y="100" width="80" height="5" rx="2" opacity=".7" />
          <path d="M48 124 l14 -8 l12 4 l14 -12 l14 6 l14 -10 l18 6" fill="none" stroke={screen[1]} strokeWidth="2" />
        </g>
      )}
      {variant === 'lcd' &&
        Array.from({ length: 32 }, (_, i) => (
          <rect key={i} x={44 + (i % 16) * 7.2} y={78 + Math.floor(i / 16) * 22} width="5.6" height="16" rx="1" fill={screen[1]} opacity={i % 16 < 11 && Math.floor(i / 16) === 0 ? 0.95 : i % 16 < 7 ? 0.95 : 0.15} />
        ))}
      {variant === 'segmentos' && (
        <text x="100" y="114" textAnchor="middle" fontSize="40" fill={screen[1]} fontFamily="ui-monospace, monospace" fontWeight="700">
          88:88
        </text>
      )}
      {variant === 'matriz' &&
        Array.from({ length: 64 }, (_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          const on = [0x18, 0x3c, 0x7e, 0xff, 0xff, 0x7e, 0x3c, 0x18][y] & (1 << x);
          return <circle key={i} cx={72 + x * 8} cy={70 + y * 8} r="2.8" fill={on ? screen[1] : '#3a1a1a'} />;
        })}
    </g>
  );
}

function Resistor({ ohms, kit }) {
  const bands = bandsFor(ohms);
  const one = (dy) => (
    <g transform={`translate(0 ${dy})`}>
      <line x1="20" y1="100" x2="180" y2="100" stroke="#b0b0b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 84 q8 -6 16 0 h52 q8 -6 16 0 v32 q-8 6 -16 0 h-52 q-8 6 -16 0 z" fill="#e8c99a" />
      {bands.map((c, i) => <rect key={i} x={[70, 84, 98, 124][i]} y="82" width="7" height="36" fill={c} />)}
    </g>
  );
  return kit ? (
    <g>
      {one(-34)}
      {one(0)}
      {one(34)}
    </g>
  ) : (
    one(0)
  );
}

function Capacitor({ variant, label }) {
  if (variant === 'ceramic') {
    return (
      <g>
        <Legs xs={[90, 110]} y1={120} y2={172} />
        <ellipse cx="100" cy="92" rx="34" ry="32" fill="#f4a73b" />
        <ellipse cx="92" cy="84" rx="12" ry="8" fill="#fff" opacity=".25" />
        <text x="100" y="99" textAnchor="middle" fontSize="16" fill="#5d3a00" fontFamily="ui-monospace, monospace" fontWeight="700">{label}</text>
      </g>
    );
  }
  if (variant === 'tantalum') {
    return (
      <g>
        <Legs xs={[90, 110]} y1={122} y2={172} />
        <path d="M100 46 c26 20 34 44 30 62 a30 22 0 0 1 -60 0 c-4 -18 4 -42 30 -62z" fill="#f2c94c" />
        <text x="100" y="108" textAnchor="middle" fontSize="12" fill="#6b4e00" fontFamily="ui-monospace, monospace">+ {label}</text>
      </g>
    );
  }
  const body = variant === 'super' ? '#2c2c2e' : '#1f4fbf';
  return (
    <g>
      <Legs xs={[90, 110]} y1={150} y2={176} />
      <rect x="66" y="38" width="68" height="114" rx="12" fill={body} />
      <rect x="66" y="38" width="68" height="114" rx="12" fill="url(#cyl)" />
      <rect x="112" y="40" width="14" height="110" fill="#c7d2fe" opacity=".55" />
      <ellipse cx="100" cy="42" rx="32" ry="6" fill="#c7c7cc" />
      <text x="96" y="104" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="ui-monospace, monospace" transform="rotate(-90 96 100)">{label}</text>
    </g>
  );
}

function Chip({ variant, pins = 8, label }) {
  const text = String(label ?? '').slice(0, 9);
  if (variant === 'to220') {
    return (
      <g>
        <rect x="70" y="30" width="60" height="44" rx="4" fill="#c7c7cc" />
        <circle cx="100" cy="50" r="9" fill="#e5e5ea" />
        <rect x="68" y="70" width="64" height="58" rx="3" fill="#1d1d1f" />
        <text x="100" y="104" textAnchor="middle" fontSize="9" fill="#d1d1d6" fontFamily="ui-monospace, monospace">{text}</text>
        <Legs xs={[82, 100, 118]} y1={128} y2={176} />
      </g>
    );
  }
  if (variant === 'to92') {
    return (
      <g>
        <path d="M70 70 h60 v34 a30 30 0 0 1 -60 0 z" fill="#1d1d1f" />
        <text x="100" y="96" textAnchor="middle" fontSize="9" fill="#d1d1d6" fontFamily="ui-monospace, monospace">{text}</text>
        <Legs xs={[86, 100, 114]} y1={132} y2={178} />
      </g>
    );
  }
  if (variant === 'diode') {
    return (
      <g>
        <line x1="20" y1="100" x2="180" y2="100" stroke="#b0b0b8" strokeWidth="4" strokeLinecap="round" />
        <rect x="64" y="84" width="72" height="32" rx="6" fill="#1d1d1f" />
        <rect x="118" y="84" width="8" height="32" fill="#c7c7cc" />
        <text x="92" y="104" textAnchor="middle" fontSize="8" fill="#d1d1d6" fontFamily="ui-monospace, monospace">{text}</text>
      </g>
    );
  }
  if (variant === 'smd') {
    return (
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${46 + (i % 3) * 40} ${70 + Math.floor(i / 3) * 40})`}>
            <rect width="30" height="16" rx="2" fill="#1d1d1f" />
            <rect width="6" height="16" fill="#c7c7cc" />
            <rect x="24" width="6" height="16" fill="#c7c7cc" />
          </g>
        ))}
      </g>
    );
  }
  if (variant === 'bridge') {
    return (
      <g>
        <rect x="64" y="56" width="72" height="64" rx="6" fill="#1d1d1f" />
        <text x="100" y="94" textAnchor="middle" fontSize="11" fill="#d1d1d6" fontFamily="ui-monospace, monospace">~ + − ~</text>
        <Legs xs={[76, 92, 108, 124]} y1={120} y2={172} />
      </g>
    );
  }
  const side = Math.max(2, Math.round(pins / 2));
  const width = Math.max(52, side * 11 + 8);
  const x0 = 100 - width / 2;
  return (
    <g>
      <Pins x={x0 + 8} y={58} count={side} gap={11} color="#c7c7cc" w={6} h={14} />
      <Pins x={x0 + 8} y={128} count={side} gap={11} color="#c7c7cc" w={6} h={14} />
      <rect x={x0} y="70" width={width} height="60" rx="5" fill="#1d1d1f" />
      <circle cx={x0 + 12} cy="82" r="4" fill="#3a3a3c" />
      <text x="100" y="105" textAnchor="middle" fontSize="11" fill="#d1d1d6" fontFamily="ui-monospace, monospace">{text}</text>
    </g>
  );
}

function Led({ color = '#ff3b30', variant, id }) {
  const fill = color === 'rgb' ? `url(#${id}-rgbled)` : color;
  if (variant === 'power') {
    return (
      <g>
        <path d="M100 40 l18 30 l34 6 l-24 24 l6 34 l-34 -16 l-34 16 l6 -34 l-24 -24 l34 -6z" fill="#c7c7cc" />
        <circle cx="100" cy="92" r="18" fill="#fff8e1" />
        <circle cx="100" cy="92" r="30" fill="#fff" opacity=".35" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="100" cy="76" r="44" fill={fill} opacity=".18" />
      <Legs xs={[90]} y1={128} y2={178} />
      <Legs xs={[110]} y1={128} y2={168} />
      <path d="M76 128 v-50 a24 24 0 0 1 48 0 v50 z" fill={fill} opacity=".92" />
      <rect x="72" y="122" width="56" height="8" rx="2" fill={fill} />
      <path d="M86 82 a14 14 0 0 1 14 -18" stroke="#fff" strokeWidth="5" fill="none" opacity=".6" strokeLinecap="round" />
    </g>
  );
}

function Strip({ color }) {
  return (
    <g>
      <path d="M14 140 C 60 60, 140 160, 190 70" stroke="#f5f5f7" strokeWidth="26" fill="none" strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        const x = 14 + 176 * t;
        const y = 140 - 70 * t + Math.sin(t * Math.PI * 1.6) * -26;
        const hue = Math.round(t * 300);
        return <rect key={i} x={x - 6} y={y - 6} width="12" height="12" rx="2" fill={color === 'rgb' ? `hsl(${hue} 90% 55%)` : color} stroke="#fff" />;
      })}
    </g>
  );
}

function Cable() {
  const colors = ['#ff3b30', '#ff9f0a', '#ffd60a', '#34c759', '#0a84ff', '#5e5ce6', '#1d1d1f'];
  return (
    <g>
      {colors.map((c, i) => (
        <g key={c}>
          <path d={`M${40 + i * 18} 52 C ${30 + i * 20} 110, ${90 + i * 8} 120, ${70 + i * 14} 150`} stroke={c} strokeWidth="6" fill="none" strokeLinecap="round" />
          <rect x={36 + i * 18} y="34" width="9" height="20" rx="1.5" fill="#1d1d1f" />
          <rect x={66 + i * 14} y="148" width="9" height="20" rx="1.5" fill="#1d1d1f" />
        </g>
      ))}
    </g>
  );
}

function Breadboard() {
  return (
    <g>
      <rect x="22" y="48" width="156" height="104" rx="8" fill="#fafafa" stroke="#d1d1d6" />
      <line x1="30" y1="58" x2="170" y2="58" stroke="#ff3b30" strokeWidth="2" />
      <line x1="30" y1="142" x2="170" y2="142" stroke="#0a84ff" strokeWidth="2" />
      <rect x="30" y="97" width="140" height="6" fill="#e5e5ea" />
      {Array.from({ length: 140 }, (_, i) => (
        <rect key={i} x={34 + (i % 14) * 10} y={66 + Math.floor(i / 14) * 7.4 + (Math.floor(i / 14) >= 5 ? 6 : 0)} width="3.4" height="3.4" fill="#8e8e93" />
      ))}
    </g>
  );
}

function Connector() {
  return (
    <g>
      <rect x="30" y="96" width="140" height="18" rx="2" fill="#1d1d1f" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={36 + i * 13.5} y="60" width="5" height="76" rx="1" fill="#d4af37" />
      ))}
    </g>
  );
}

function Usb() {
  return (
    <g>
      <path d="M40 150 C 40 70, 160 140, 150 60" stroke="#1d1d1f" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="132" y="28" width="36" height="36" rx="5" fill="#2c2c2e" />
      <rect x="140" y="12" width="20" height="20" rx="2" fill="#c7c7cc" />
      <rect x="24" y="144" width="32" height="30" rx="5" fill="#2c2c2e" />
      <rect x="30" y="168" width="20" height="14" rx="2" fill="#c7c7cc" />
    </g>
  );
}

function Motor({ variant }) {
  switch (variant) {
    case 'servo':
      return (
        <g>
          <rect x="54" y="72" width="92" height="56" rx="6" fill="#0a84ff" />
          <rect x="40" y="84" width="120" height="8" rx="3" fill="#0a84ff" />
          <circle cx="78" cy="72" r="14" fill="#f5f5f7" />
          <path d="M78 66 L150 58 a6 6 0 0 1 0 12 L78 78 z" fill="#f5f5f7" />
          <path d="M100 128 c0 20 20 20 20 40" stroke="#ff9f0a" strokeWidth="3" fill="none" />
        </g>
      );
    case 'paso':
      return (
        <g>
          <rect x="52" y="52" width="96" height="96" rx="10" fill="#3a3a3c" />
          <rect x="60" y="60" width="80" height="80" rx="6" fill="#636366" />
          <circle cx="100" cy="100" r="18" fill="#3a3a3c" />
          <rect x="96" y="30" width="8" height="70" rx="2" fill="#c7c7cc" />
          {[64, 136].flatMap((x) => [64, 136].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#1d1d1f" />))}
        </g>
      );
    case 'buzzer':
      return (
        <g>
          <circle cx="100" cy="96" r="40" fill="#1d1d1f" />
          <circle cx="100" cy="96" r="6" fill="#3a3a3c" />
          <Legs xs={[90, 110]} y1={136} y2={172} />
        </g>
      );
    case 'ventilador':
      return (
        <g>
          <rect x="44" y="44" width="112" height="112" rx="14" fill="#1d1d1f" />
          <circle cx="100" cy="100" r="46" fill="#2c2c2e" />
          {[0, 72, 144, 216, 288].map((a) => <path key={a} d="M100 100 q18 -40 6 -46 q-14 4 -6 46" fill="#636366" transform={`rotate(${a} 100 100)`} />)}
          <circle cx="100" cy="100" r="12" fill="#3a3a3c" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="40" y="76" width="80" height="48" rx="6" fill="#ffd60a" />
          <rect x="112" y="84" width="40" height="32" rx="12" fill="#c7c7cc" />
          <circle cx="62" cy="100" r="40" fill="#1d1d1f" opacity=".9" />
          <circle cx="62" cy="100" r="22" fill="#ffd60a" />
          <circle cx="62" cy="100" r="6" fill="#1d1d1f" />
        </g>
      );
  }
}

function Power({ variant }) {
  if (variant === 'conmutada' || variant === 'laboratorio') {
    const lab = variant === 'laboratorio';
    return (
      <g>
        <rect x="30" y="56" width="140" height="92" rx="8" fill={lab ? '#2c2c2e' : '#c7c7cc'} />
        {lab ? (
          <g>
            <rect x="44" y="70" width="50" height="26" rx="3" fill="#0b0b0f" />
            <text x="69" y="89" textAnchor="middle" fontSize="15" fill="#ff3b30" fontFamily="ui-monospace, monospace">12.0</text>
            <rect x="106" y="70" width="50" height="26" rx="3" fill="#0b0b0f" />
            <text x="131" y="89" textAnchor="middle" fontSize="15" fill="#34c759" fontFamily="ui-monospace, monospace">1.50</text>
            <circle cx="69" cy="122" r="12" fill="#8e8e93" />
            <circle cx="131" cy="122" r="12" fill="#8e8e93" />
          </g>
        ) : (
          Array.from({ length: 9 }, (_, i) => <rect key={i} x={44 + i * 13} y="68" width="6" height="56" rx="3" fill="#8e8e93" />)
        )}
        <rect x="30" y="134" width="140" height="14" rx="4" fill="#1d1d1f" opacity=".2" />
      </g>
    );
  }
  if (variant === 'modulo') return <Module color="#c62828" variant="energia" />;
  return (
    <g>
      <rect x="56" y="42" width="72" height="92" rx="12" fill="#1d1d1f" />
      <rect x="74" y="28" width="8" height="18" rx="2" fill="#c7c7cc" />
      <rect x="102" y="28" width="8" height="18" rx="2" fill="#c7c7cc" />
      <path d="M92 134 C 92 170, 150 150, 160 176" stroke="#1d1d1f" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="92" cy="74" r="6" fill="#34c759" />
    </g>
  );
}

function Battery({ variant }) {
  if (variant === 'portapilas') {
    return (
      <g>
        <rect x="34" y="60" width="132" height="80" rx="8" fill="#1d1d1f" />
        <rect x="44" y="70" width="112" height="26" rx="12" fill="#34c759" />
        <rect x="44" y="104" width="112" height="26" rx="12" fill="#34c759" />
        <path d="M166 80 h18 M166 120 h18" stroke="#ff3b30" strokeWidth="4" />
      </g>
    );
  }
  return (
    <g>
      <rect x="48" y="74" width="104" height="52" rx="14" fill="#30b158" />
      <rect x="48" y="74" width="104" height="52" rx="14" fill="url(#cylh)" />
      <rect x="152" y="88" width="10" height="24" rx="3" fill="#c7c7cc" />
      <text x="100" y="106" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="ui-monospace, monospace" fontWeight="700">3.7 V</text>
    </g>
  );
}

function Solar() {
  return (
    <g>
      <rect x="34" y="50" width="132" height="100" rx="6" fill="#1c3f8f" stroke="#c7c7cc" strokeWidth="4" />
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={40 + (i % 6) * 21} y={56 + Math.floor(i / 6) * 23.5} width="19" height="21" fill="#2a5bd7" />)}
    </g>
  );
}

function Pot({ variant }) {
  if (variant === 'trim') {
    return (
      <g>
        <rect x="64" y="64" width="72" height="64" rx="4" fill="#0a84ff" />
        <circle cx="120" cy="80" r="9" fill="#d4af37" />
        <path d="M114 80 h12" stroke="#8b5a2b" strokeWidth="3" />
        <Legs xs={[80, 100, 120]} y1={128} y2={170} />
      </g>
    );
  }
  return (
    <g>
      <rect x="62" y="96" width="76" height="40" rx="6" fill="#0a84ff" />
      <rect x="92" y="38" width="16" height="64" rx="3" fill="#c7c7cc" />
      <rect x="99" y="38" width="2" height="24" fill="#8e8e93" />
      <Legs xs={[80, 100, 120]} y1={136} y2={174} />
    </g>
  );
}

function Tool({ variant }) {
  switch (variant) {
    case 'meter':
      return (
        <g>
          <rect x="58" y="28" width="84" height="144" rx="16" fill="#ffcc00" />
          <rect x="66" y="36" width="68" height="128" rx="10" fill="#2c2c2e" />
          <rect x="74" y="46" width="52" height="28" rx="3" fill="#c9d8b6" />
          <text x="100" y="66" textAnchor="middle" fontSize="15" fill="#1d1d1f" fontFamily="ui-monospace, monospace">5.02</text>
          <circle cx="100" cy="110" r="20" fill="#3a3a3c" stroke="#636366" strokeWidth="3" />
          <rect x="98" y="92" width="4" height="16" rx="2" fill="#ffcc00" />
          {[80, 100, 120].map((x) => <circle key={x} cx={x} cy="148" r="5" fill={x === 120 ? '#ff3b30' : '#1d1d1f'} stroke="#636366" />)}
        </g>
      );
    case 'iron':
    case 'station':
      return (
        <g transform="rotate(-35 100 100)">
          <rect x="30" y="90" width="80" height="22" rx="10" fill="#1d1d1f" />
          <rect x="108" y="94" width="32" height="14" rx="4" fill="#3a3a3c" />
          <rect x="138" y="98" width="34" height="6" rx="3" fill="#c7c7cc" />
          <path d="M172 98 l12 3 l-12 3z" fill="#8e8e93" />
          <rect x="44" y="96" width="40" height="10" rx="5" fill="#0a84ff" />
        </g>
      );
    case 'solder':
      return (
        <g>
          <circle cx="100" cy="100" r="54" fill="#c7c7cc" />
          <circle cx="100" cy="100" r="40" fill="#8e8e93" />
          <circle cx="100" cy="100" r="16" fill="#e5e5ea" />
          <path d="M140 136 C 160 160, 176 150, 186 170" stroke="#c7c7cc" strokeWidth="4" fill="none" />
        </g>
      );
    case 'screwdriver':
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${56 + i * 26} 0)`}>
              <rect x="0" y="40" width="16" height="64" rx="6" fill={['#ff3b30', '#0a84ff', '#34c759', '#ff9f0a'][i]} />
              <rect x="6" y="104" width="4" height="56" fill="#c7c7cc" />
            </g>
          ))}
        </g>
      );
    case 'box':
      return (
        <g>
          <rect x="30" y="54" width="140" height="96" rx="8" fill="#e5f0ff" stroke="#0a84ff" strokeWidth="3" />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={38 + (i % 3) * 44} y={62 + Math.floor(i / 3) * 42} width="38" height="36" rx="4" fill="#fff" stroke="#9ec5ff" />)}
        </g>
      );
    default:
      return (
        <g>
          <path d="M100 104 L64 172" stroke="#ff3b30" strokeWidth="14" strokeLinecap="round" />
          <path d="M100 104 L136 172" stroke="#ff3b30" strokeWidth="14" strokeLinecap="round" />
          <path d="M100 104 L88 34" stroke="#8e8e93" strokeWidth="10" strokeLinecap="round" />
          <path d="M100 104 L112 34" stroke="#8e8e93" strokeWidth="10" strokeLinecap="round" />
          <circle cx="100" cy="104" r="8" fill="#636366" />
        </g>
      );
  }
}

const KINDS = { board: Board, sensor: Sensor, module: Module, display: Display, resistor: Resistor, capacitor: Capacitor, chip: Chip, led: Led, strip: Strip, cable: Cable, breadboard: Breadboard, connector: Connector, usb: Usb, motor: Motor, power: Power, battery: Battery, solar: Solar, tool: Tool, pot: Pot };

export default function ProductArt({ art = {}, title, className = '' }) {
  const id = useId().replace(/:/g, '');
  const Kind = KINDS[art.kind] ?? Chip;
  const [from, to] = TONES[art.kind] ?? TONES.chip;
  return (
    <svg className={`product-art ${className}`} viewBox="0 0 200 200" role="img" aria-label={title ? `Ilustración: ${title}` : 'Ilustración del producto'}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${id}-rgbled`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3b30" />
          <stop offset=".5" stopColor="#34c759" />
          <stop offset="1" stopColor="#0a84ff" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${id}-bg)`} />
      <g className="art-shape">
        <Kind {...art} id={id} />
      </g>
    </svg>
  );
}

// Gradientes comunes (brillo de PCB, malla, cilindros) declarados una vez en la página.
export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id="cyl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".25" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".2" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
        <linearGradient id="cylh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".25" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
        <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5e5ce6" />
          <stop offset=".5" stopColor="#ff2d55" />
          <stop offset="1" stopColor="#ff9f0a" />
        </linearGradient>
        <pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0 L4 4 M4 0 L0 4" stroke="#8e8e93" strokeWidth=".8" />
        </pattern>
      </defs>
    </svg>
  );
}

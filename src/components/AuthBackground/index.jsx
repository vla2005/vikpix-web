import './style.css'

const gridSquares = [
  ['53', '989', '0.19825298472715075'],
  ['157', '1405', '0.18736062109994236'],
  ['469', '1197', '0.1744825949735241'],
  ['365', '625', '0.16039231877948623'],
  ['417', '157', '0.14498063817445656'],
  ['365', '677', '0.12789530384063255'],
  ['209', '157', '0.11008056639984716'],
  ['1', '209', '0.09067312001890969'],
  ['365', '1457', '0.07059292608464603'],
  ['53', '729', '0.04971526171604637'],
  ['157', '1457', '0.026921265802229755'],
  ['1', '209', '0.003477851118077524'],
  ['209', '885', '0'],
  ['261', '1093', '0'],
  ['1', '1197', '0'],
  ['1', '937', '0'],
  ['157', '1301', '0'],
  ['417', '573', '0'],
  ['261', '781', '0'],
  ['469', '261', '0'],
  ['53', '157', '0'],
  ['261', '1301', '0'],
  ['209', '833', '0'],
  ['313', '417', '0.0081896720075747'],
  ['209', '1301', '0.020057874079211616'],
  ['417', '261', '0.03157914893992711'],
  ['261', '989', '0.042744369824067686'],
  ['157', '937', '0.05374768229376059'],
]

function AuthBackground({ patternId = 'auth-background-grid' }) {
  return (
    <>
      <div className="auth-background-grid-layer" aria-hidden="true">
        <svg className="auth-background-grid" aria-hidden="true">
          <defs>
            <pattern
              id={patternId}
              width="52"
              height="52"
              patternUnits="userSpaceOnUse"
              x="-1"
              y="-1"
            >
              <path d="M.5 52V.5H52" fill="none" strokeDasharray="0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          <svg x="-1" y="-1" className="auth-background-grid-squares">
            {gridSquares.map(([x, y, opacity], index) => (
              <rect
                key={`${x}-${y}-${opacity}-${index}`}
                width="51"
                height="51"
                x={x}
                y={y}
                opacity={opacity}
              />
            ))}
          </svg>
        </svg>
      </div>
      <div className="auth-background-shade" aria-hidden="true"></div>
    </>
  )
}

export default AuthBackground

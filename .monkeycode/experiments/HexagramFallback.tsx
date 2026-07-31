const lines = [false, false, true, false, true, true]

export function HexagramFallback({ enhanced = false }: { enhanced?: boolean }) {
  return (
    <div className={`hexagram-scene ${enhanced ? 'hexagram-scene-enhanced' : ''}`} aria-hidden="true">
      <div className="hexagram-orbit" />
      <div className="hexagram-plane">
        <div className="hexagram-lines">
          {lines.map((solid, index) => (
            <span key={index} className={`hexagram-line ${solid ? 'solid' : 'broken'}`} style={{ '--line-index': index } as React.CSSProperties}>
              <i />
              {!solid && <i />}
            </span>
          ))}
        </div>
        <span className="hexagram-caption">风山渐</span>
      </div>
    </div>
  )
}

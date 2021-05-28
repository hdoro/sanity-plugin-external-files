import React from 'react'
import { hues, ColorHueKey } from '@sanity/color'

const WaveformDisplay: React.FC<{
  waveformData?: number[]
  colorHue?: ColorHueKey
  style?: React.CSSProperties
}> = ({ waveformData, colorHue = 'magenta', style = {} }) => {
  if (!Array.isArray(waveformData)) {
    return null
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        width: '100%',
        gap: '1px',
        height: '3.5rem',
        ...style,
      }}
    >
      {waveformData.map((bar, i) => (
        <div
          key={`${bar}-${i}`}
          style={{
            flex: '1 0 1px',
            height: `${bar * 100}%`,
            background: hues[colorHue]?.[400]?.hex || hues.magenta[400].hex,
          }}
        />
      ))}
    </div>
  )
}

export default WaveformDisplay

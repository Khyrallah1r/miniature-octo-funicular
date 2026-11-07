import Svg, { Circle, Defs, G, Line, Path, Pattern, Rect } from 'react-native-svg';

type PatternProps = {
  color: string;
  opacity?: number;
  size?: number;
};

/** Repeating eight-point star lattice used as a subtle background texture. */
export function StarPattern({ color, opacity = 0.08, size = 44 }: PatternProps) {
  return (
    <Svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} pointerEvents="none">
      <Defs>
        <Pattern id="hisn-stars" width={size} height={size} patternUnits="userSpaceOnUse">
          <G stroke={color} strokeWidth={1} fill="none" opacity={opacity}>
            <Rect x={size / 8} y={size / 8} width={(size * 3) / 4} height={(size * 3) / 4} />
            <Rect
              x={size / 8}
              y={size / 8}
              width={(size * 3) / 4}
              height={(size * 3) / 4}
              transform={`rotate(45 ${size / 2} ${size / 2})`}
            />
            <Circle cx={size / 2} cy={size / 2} r={size / 10} />
          </G>
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#hisn-stars)" />
    </Svg>
  );
}

/** Horizontal rule finished with a small diamond, for section breaks. */
export function Divider({ color, width = 1 }: { color: string; width?: number }) {
  return (
    <Svg width="100%" height={12} viewBox="0 0 200 12" preserveAspectRatio="none">
      <Line x1="6" y1="6" x2="88" y2="6" stroke={color} strokeWidth={width} />
      <Line x1="112" y1="6" x2="194" y2="6" stroke={color} strokeWidth={width} />
      <Path d="M100 1 L105 6 L100 11 L95 6 Z" fill={color} />
      <Circle cx="90" cy="6" r="1.6" fill={color} />
      <Circle cx="110" cy="6" r="1.6" fill={color} />
    </Svg>
  );
}

/** Pointed-arch outline inspired by mashrabiya openings. */
export function ArchOutline({ color, opacity = 0.35 }: { color: string; opacity?: number }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax meet">
      <G fill="none" stroke={color} strokeWidth={1.2} opacity={opacity}>
        <Path d="M18 200 V96 C18 52 74 16 160 16 C246 16 302 52 302 96 V200" />
        <Path d="M34 200 V100 C34 62 84 30 160 30 C236 30 286 62 286 100 V200" opacity={0.6} />
      </G>
    </Svg>
  );
}

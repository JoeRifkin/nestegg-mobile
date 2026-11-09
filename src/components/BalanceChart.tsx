import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Cents, formatCents } from '../lib/money';
import { colors } from '../theme/tokens';

interface Props {
  points: Cents[];
  width: number;
  height?: number;
  /** Used in the accessibility label, e.g. "Balance over the last 5 years". */
  label: string;
}

/** Builds an SVG path for the points, scaled to the box. Exported for tests. */
export function buildPath(points: number[], width: number, height: number, pad = 4) {
  if (points.length < 2) return { line: '', area: '' };
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = (width - pad * 2) / (points.length - 1);
  const xy = points.map((p, i) => [pad + i * step, pad + (1 - (p - min) / span) * (height - pad * 2)] as const);
  const line = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = xy[xy.length - 1];
  const area = `${line} L${last[0].toFixed(1)},${height} L${pad},${height} Z`;
  return { line, area };
}

/**
 * Lightweight line chart drawn with react-native-svg. Screen readers get a
 * plain-language summary instead of the drawing.
 */
export function BalanceChart({ points, width, height = 140, label }: Props) {
  const { line, area } = useMemo(() => buildPath(points, width, height), [points, width, height]);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}. From ${formatCents(first)} to ${formatCents(last)}.`}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.25} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#fill)" />
        <Path d={line} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { WeatherType } from '../../types';
import { horizonY } from './geometry';

interface Props {
  width: number;
  height: number;
  weather: WeatherType;
  locationId: string;
}

const SKY: Record<WeatherType, [string, string]> = {
  cold: ['#A9C6DE', '#DCE9F2'],
  rainy: ['#7E93A3', '#B6C6D0'],
  cloudy: ['#AEBBC4', '#DDE3E8'],
  sunny: ['#6FB4E3', '#CFE9FA'],
  hot: ['#E79A55', '#FBDCB4'],
};

const SHOP_COLORS = ['#C1440E', '#3E6B8F', '#6B8F5A', '#B7891F', '#8F5A8F'];

interface Facade {
  w: number;
  h: number;
  body: string;
  roof: string;
  cols: number;
  rows: number;
}

const PALETTES: Record<string, Facade[]> = {
  barrio: [
    { w: 0.19, h: 0.2, body: '#D9B48F', roof: '#8A5A3E', cols: 2, rows: 2 },
    { w: 0.16, h: 0.26, body: '#C9CDBB', roof: '#7E7A63', cols: 2, rows: 3 },
    { w: 0.21, h: 0.17, body: '#E0C3A8', roof: '#94614A', cols: 3, rows: 2 },
    { w: 0.17, h: 0.23, body: '#BFC9CC', roof: '#6F7B80', cols: 2, rows: 3 },
    { w: 0.2, h: 0.19, body: '#D6B9A0', roof: '#8A6247', cols: 3, rows: 2 },
  ],
  plaza: [
    { w: 0.18, h: 0.28, body: '#E4D3B4', roof: '#9A7040', cols: 3, rows: 4 },
    { w: 0.22, h: 0.34, body: '#DCC9A8', roof: '#8C6438', cols: 4, rows: 4 },
    { w: 0.17, h: 0.26, body: '#E9DAC0', roof: '#A17A48', cols: 2, rows: 3 },
    { w: 0.2, h: 0.31, body: '#D7C4A2', roof: '#8F6739', cols: 3, rows: 4 },
    { w: 0.16, h: 0.24, body: '#E4D3B4', roof: '#9A7040', cols: 2, rows: 3 },
  ],
  estacion: [
    { w: 0.26, h: 0.22, body: '#B9C2C8', roof: '#6D767C', cols: 4, rows: 2 },
    { w: 0.3, h: 0.28, body: '#C6CDD2', roof: '#79838A', cols: 5, rows: 3 },
    { w: 0.24, h: 0.2, body: '#B2BBC2', roof: '#69727A', cols: 4, rows: 2 },
    { w: 0.22, h: 0.25, body: '#C0C8CE', roof: '#727C84', cols: 3, rows: 3 },
  ],
  discoteca: [
    { w: 0.22, h: 0.3, body: '#3A3155', roof: '#241E38', cols: 3, rows: 4 },
    { w: 0.19, h: 0.36, body: '#453A63', roof: '#2B2444', cols: 3, rows: 5 },
    { w: 0.24, h: 0.27, body: '#332C4C', roof: '#211B33', cols: 4, rows: 3 },
    { w: 0.2, h: 0.33, body: '#3F3559', roof: '#282141', cols: 3, rows: 4 },
    { w: 0.18, h: 0.26, body: '#372F51', roof: '#231D36', cols: 2, rows: 3 },
  ],
  playa: [
    { w: 0.2, h: 0.17, body: '#F0E2C4', roof: '#5FB4D8', cols: 3, rows: 2 },
    { w: 0.17, h: 0.21, body: '#FBF0DA', roof: '#4E9FC4', cols: 2, rows: 2 },
    { w: 0.22, h: 0.15, body: '#EFDFBE', roof: '#63BBDF', cols: 3, rows: 1 },
    { w: 0.18, h: 0.19, body: '#F6E9CE', roof: '#559DC0', cols: 2, rows: 2 },
  ],
  estadio: [
    { w: 0.34, h: 0.26, body: '#B7BEC4', roof: '#727B82', cols: 6, rows: 3 },
    { w: 0.4, h: 0.31, body: '#C2C9CF', roof: '#7B848B', cols: 7, rows: 3 },
    { w: 0.3, h: 0.24, body: '#B0B8BF', roof: '#6C757C', cols: 5, rows: 2 },
  ],
};

export function SceneBackground({ width, height, weather, locationId }: Props) {
  const hy = horizonY(height);
  const isNight = locationId === 'discoteca';
  const isSand = locationId === 'playa';
  const [skyTop, skyBottom] = SKY[weather];
  const facades = PALETTES[locationId] ?? PALETTES.barrio;

  const groundTop = isSand ? '#EBD9A6' : '#C9C2B6';
  const groundBottom = isSand ? '#DCC793' : '#AFA79A';

  // Vanishing point sits slightly left of centre, on the horizon.
  const vpx = width * 0.42;

  const bands: number[] = [];
  for (let k = 1; k <= 10; k++) {
    bands.push(hy + (height - hy) * Math.pow(k / 10, 1.85));
  }

  const rays: number[] = [];
  for (let k = -9; k <= 10; k++) {
    rays.push(width * 0.5 + k * width * 0.17);
  }

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={isNight ? '#241E3C' : skyTop} />
          <Stop offset="1" stopColor={isNight ? '#4A3D6B' : skyBottom} />
        </LinearGradient>
        <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={groundTop} />
          <Stop offset="1" stopColor={groundBottom} />
        </LinearGradient>
        <RadialGradient id="vignette" cx="50%" cy="52%" r="72%">
          <Stop offset="0.62" stopColor="#2A1F14" stopOpacity="0" />
          <Stop offset="1" stopColor="#2A1F14" stopOpacity="0.16" />
        </RadialGradient>
        <LinearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={isNight ? '#3A3158' : '#FFFFFF'} stopOpacity="0" />
          <Stop offset="1" stopColor={isNight ? '#3A3158' : '#FFFFFF'} stopOpacity={isNight ? '0.35' : '0.5'} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={hy + 2} fill="url(#sky)" />
      <Clouds weather={weather} width={width} hy={hy} isNight={isNight} />

      {locationId === 'playa' && <Rect x={0} y={hy - height * 0.09} width={width} height={height * 0.09} fill="#4FA6CE" />}

      <Skyline facades={facades} width={width} height={height} hy={hy} isNight={isNight} />
      <Rect x={0} y={hy - height * 0.1} width={width} height={height * 0.1} fill="url(#haze)" />

      {/* Pavement: real paving stones drawn in perspective */}
      <Rect x={0} y={hy} width={width} height={height - hy} fill="url(#ground)" />
      <Paving width={width} height={height} hy={hy} vpx={vpx} bands={bands} rays={rays} />
      <Rect x={0} y={hy} width={width} height={4} fill="#000" opacity={0.12} />

      <Landmark locationId={locationId} width={width} height={height} hy={hy} />
      <StreetProps locationId={locationId} width={width} height={height} hy={hy} isNight={isNight} />

      <Rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
    </Svg>
  );
}

function Paving({
  width,
  height,
  hy,
  vpx,
  bands,
  rays,
}: {
  width: number;
  height: number;
  hy: number;
  vpx: number;
  bands: number[];
  rays: number[];
}) {
  // A ray running from the vanishing point to `rayX` at the bottom edge,
  // sampled at depth y.
  const xAt = (rayX: number, y: number) => vpx + (rayX - vpx) * ((y - hy) / (height - hy));

  const rows = [hy, ...bands, height];
  const stones: React.ReactNode[] = [];

  for (let r = 0; r < rows.length - 1; r++) {
    const yTop = rows[r];
    const yBottom = rows[r + 1];
    for (let c = 0; c < rays.length - 1; c++) {
      const x1 = xAt(rays[c], yTop);
      const x2 = xAt(rays[c + 1], yTop);
      const x3 = xAt(rays[c + 1], yBottom);
      const x4 = xAt(rays[c], yBottom);
      if (x2 < -40 && x3 < -40) continue;
      if (x1 > width + 40 && x4 > width + 40) continue;
      const shade = (r + c) % 2 === 0 ? 0.05 : 0.018;
      stones.push(
        <Path
          key={`s${r}-${c}`}
          d={`M ${x1} ${yTop} L ${x2} ${yTop} L ${x3} ${yBottom} L ${x4} ${yBottom} Z`}
          fill="#4A3A28"
          opacity={shade}
          stroke="#4A3A28"
          strokeWidth={1}
          strokeOpacity={0.09}
        />
      );
    }
  }

  return <G>{stones}</G>;
}

function Clouds({ weather, width, hy, isNight }: { weather: WeatherType; width: number; hy: number; isNight: boolean }) {
  if (isNight) {
    return (
      <G>
        <Circle cx={width * 0.78} cy={hy * 0.3} r={16} fill="#F5EFD9" opacity={0.92} />
        {[0.12, 0.3, 0.55, 0.68, 0.88].map((x, i) => (
          <Circle key={i} cx={width * x} cy={hy * (0.16 + (i % 3) * 0.12)} r={1.6} fill="#FFFFFF" opacity={0.8} />
        ))}
      </G>
    );
  }
  const overcast = weather === 'rainy' || weather === 'cloudy';
  return (
    <G>
      {!overcast && (
        <Circle
          cx={width * 0.74}
          cy={hy * 0.24}
          r={weather === 'hot' ? 26 : 21}
          fill={weather === 'hot' ? '#FF9F40' : '#FFDC6A'}
          opacity={0.95}
        />
      )}
      <G opacity={overcast ? 0.95 : 0.75}>
        <Ellipse cx={width * 0.22} cy={hy * 0.3} rx={44} ry={15} fill="#FFFFFF" />
        <Ellipse cx={width * 0.3} cy={hy * 0.36} rx={30} ry={11} fill="#FFFFFF" />
        <Ellipse cx={width * 0.62} cy={hy * 0.2} rx={36} ry={13} fill="#FFFFFF" />
      </G>
    </G>
  );
}

function Skyline({
  facades,
  width,
  height,
  hy,
  isNight,
}: {
  facades: Facade[];
  width: number;
  height: number;
  hy: number;
  isNight: boolean;
}) {
  let x = -width * 0.04;
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (x < width && i < 40) {
    const f = facades[i % facades.length];
    const w = width * f.w;
    const h = height * f.h;
    const y = hy - h;

    const windows: React.ReactNode[] = [];
    const padX = w * 0.16;
    const padY = h * 0.16;
    const cellW = (w - padX * 2) / f.cols;
    const cellH = (h - padY * 2) / f.rows;
    for (let c = 0; c < f.cols; c++) {
      for (let r = 0; r < f.rows; r++) {
        const lit = isNight ? (c + r + i) % 3 !== 0 : false;
        const wx = x + padX + c * cellW + cellW * 0.16;
        const wy = y + padY + r * cellH + cellH * 0.14;
        const ww = cellW * 0.62;
        const wh = cellH * 0.6;
        windows.push(
          <G key={`w${c}-${r}`}>
            <Rect
              x={wx}
              y={wy}
              width={ww}
              height={wh}
              rx={1.5}
              fill={lit ? '#FFD98A' : isNight ? '#1E1930' : '#8FA9BC'}
              opacity={isNight ? 0.95 : 0.85}
            />
            <Path d={`M ${wx} ${wy + wh} L ${wx + ww * 0.62} ${wy} L ${wx + ww} ${wy} L ${wx + ww} ${wy + wh * 0.2} L ${wx + ww * 0.2} ${wy + wh} Z`} fill="#FFFFFF" opacity={lit ? 0.12 : 0.22} />
            <Rect x={wx - ww * 0.09} y={wy + wh} width={ww * 1.18} height={Math.max(1.2, wh * 0.1)} rx={0.8} fill="#000" opacity={0.14} />
          </G>
        );
      }
    }

    const shopH = Math.max(26, h * 0.26);
    const shopY = hy - shopH;
    const awningColor = SHOP_COLORS[i % SHOP_COLORS.length];

    blocks.push(
      <G key={`b${i}`}>
        <Rect x={x} y={y} width={w} height={h} fill={f.body} />
        <Rect x={x - 3} y={y - 8} width={w + 6} height={9} rx={2} fill={f.roof} />
        {windows}

        {/* ground-floor shopfront */}
        <Rect x={x} y={shopY} width={w} height={shopH} fill={isNight ? '#241E38' : '#F0E7D8'} />
        <Rect
          x={x + w * 0.08}
          y={shopY + shopH * 0.3}
          width={w * 0.5}
          height={shopH * 0.58}
          fill={isNight ? '#FFD98A' : '#9FC3D8'}
          opacity={isNight ? 0.85 : 0.75}
        />
        <Rect
          x={x + w * 0.66}
          y={shopY + shopH * 0.24}
          width={w * 0.22}
          height={shopH * 0.76}
          rx={2}
          fill={isNight ? '#4A3F66' : '#8A6A4A'}
        />
        <Rect x={x + w * 0.05} y={shopY + shopH * 0.06} width={w * 0.9} height={shopH * 0.14} rx={2} fill={awningColor} opacity={0.9} />
        {Array.from({ length: 5 }).map((_, s) => (
          <Path
            key={`aw${s}`}
            d={`M ${x + w * 0.05 + (s * w * 0.9) / 5} ${shopY + shopH * 0.2} A ${(w * 0.9) / 10} ${(w * 0.9) / 10} 0 0 0 ${
              x + w * 0.05 + ((s + 1) * w * 0.9) / 5
            } ${shopY + shopH * 0.2} Z`}
            fill={s % 2 === 0 ? awningColor : '#FFF8EE'}
            opacity={0.92}
          />
        ))}
      </G>
    );

    x += w + width * 0.008;
    i += 1;
  }

  return <G opacity={0.96}>{blocks}</G>;
}

function Landmark({
  locationId,
  width,
  height,
  hy,
}: {
  locationId: string;
  width: number;
  height: number;
  hy: number;
}) {
  const baseY = hy + (height - hy) * 0.14;

  switch (locationId) {
    case 'plaza':
      return (
        <G>
          <Ellipse cx={width * 0.74} cy={baseY} rx={52} ry={13} fill="#AFC2CF" />
          <Ellipse cx={width * 0.74} cy={baseY - 3} rx={44} ry={10} fill="#CFE3EE" />
          <Rect x={width * 0.74 - 5} y={baseY - 34} width={10} height={32} fill="#9AA9B4" />
          <Ellipse cx={width * 0.74} cy={baseY - 34} rx={19} ry={7} fill="#DCEEF7" />
          <Path
            d={`M ${width * 0.74 - 14} ${baseY - 37} Q ${width * 0.74} ${baseY - 62} ${width * 0.74 + 14} ${baseY - 37}`}
            stroke="#BFE0F0"
            strokeWidth={3}
            fill="none"
          />
        </G>
      );
    case 'estacion':
      return (
        <G>
          <Rect x={0} y={hy + 2} width={width} height={5} fill="#8C8478" />
          <Rect x={width * 0.52} y={hy - height * 0.11} width={width * 0.46} height={height * 0.11} rx={7} fill="#8894A0" />
          <Rect x={width * 0.55} y={hy - height * 0.088} width={width * 0.07} height={height * 0.035} rx={3} fill="#D7E5EF" />
          <Rect x={width * 0.65} y={hy - height * 0.088} width={width * 0.07} height={height * 0.035} rx={3} fill="#D7E5EF" />
          <Rect x={width * 0.75} y={hy - height * 0.088} width={width * 0.07} height={height * 0.035} rx={3} fill="#D7E5EF" />
          <Circle cx={width * 0.6} cy={hy + 3} r={6} fill="#2F343A" />
          <Circle cx={width * 0.84} cy={hy + 3} r={6} fill="#2F343A" />
        </G>
      );
    case 'discoteca':
      return (
        <G>
          <Path d={`M ${width * 0.18} ${hy} L ${width * 0.3} ${hy - height * 0.3} L ${width * 0.42} ${hy} Z`} fill="#E6469C" opacity={0.2} />
          <Path d={`M ${width * 0.58} ${hy} L ${width * 0.7} ${hy - height * 0.3} L ${width * 0.82} ${hy} Z`} fill="#4FC7E8" opacity={0.2} />
          <Circle cx={width * 0.5} cy={hy * 0.34} r={15} fill="#C9D2DC" />
          <Line x1={width * 0.5 - 15} y1={hy * 0.34} x2={width * 0.5 + 15} y2={hy * 0.34} stroke="#8F9AA6" strokeWidth={1.2} />
          <Line x1={width * 0.5} y1={hy * 0.34 - 15} x2={width * 0.5} y2={hy * 0.34 + 15} stroke="#8F9AA6" strokeWidth={1.2} />
        </G>
      );
    case 'playa':
      return (
        <G>
          <Rect x={width * 0.72 - 2} y={baseY - 46} width={4} height={46} fill="#8A5A1E" />
          <Path
            d={`M ${width * 0.72} ${baseY - 46} L ${width * 0.55} ${baseY - 32} Q ${width * 0.72} ${baseY - 58} ${width * 0.89} ${baseY - 32} Z`}
            fill="#E85D5D"
          />
          <Ellipse cx={width * 0.72} cy={baseY} rx={26} ry={6} fill="#000" opacity={0.08} />
        </G>
      );
    case 'estadio':
      return (
        <G>
          <Rect x={14} y={hy - height * 0.3} width={6} height={height * 0.3} fill="#7C8B99" />
          <Rect x={2} y={hy - height * 0.33} width={30} height={12} rx={3} fill="#FFF6D8" />
          <Rect x={width - 20} y={hy - height * 0.3} width={6} height={height * 0.3} fill="#7C8B99" />
          <Rect x={width - 32} y={hy - height * 0.33} width={30} height={12} rx={3} fill="#FFF6D8" />
        </G>
      );
    default:
      return null;
  }
}

function StreetProps({
  locationId,
  width,
  height,
  hy,
  isNight,
}: {
  locationId: string;
  width: number;
  height: number;
  hy: number;
  isNight: boolean;
}) {
  const nearY = hy + (height - hy) * 0.36;
  const farY = hy + (height - hy) * 0.1;

  return (
    <G>
      {/* Lamp post */}
      <Ellipse cx={width * 0.9} cy={nearY} rx={12} ry={4} fill="#000" opacity={0.1} />
      <Rect x={width * 0.9 - 3} y={nearY - 84} width={6} height={84} fill="#5A6068" />
      <Rect x={width * 0.9 - 11} y={nearY - 94} width={22} height={12} rx={5} fill={isNight ? '#FFE08A' : '#8B939B'} />

      {/* Bench */}
      <G opacity={locationId === 'estadio' ? 0 : 1}>
        <Ellipse cx={width * 0.55} cy={farY + 6} rx={30} ry={5} fill="#000" opacity={0.08} />
        <Rect x={width * 0.55 - 28} y={farY - 12} width={56} height={6} rx={2} fill="#9A6B3F" />
        <Rect x={width * 0.55 - 28} y={farY - 22} width={56} height={5} rx={2} fill="#A87747" />
        <Rect x={width * 0.55 - 24} y={farY - 6} width={4} height={10} fill="#6E7379" />
        <Rect x={width * 0.55 + 20} y={farY - 6} width={4} height={10} fill="#6E7379" />
      </G>

      {/* Bin */}
      <Ellipse cx={width * 0.32} cy={farY + 4} rx={11} ry={4} fill="#000" opacity={0.08} />
      <Path
        d={`M ${width * 0.32 - 9} ${farY - 20} L ${width * 0.32 + 9} ${farY - 20} L ${width * 0.32 + 7} ${farY + 2} L ${width * 0.32 - 7} ${farY + 2} Z`}
        fill="#6B7A6E"
      />
      <Rect x={width * 0.32 - 11} y={farY - 23} width={22} height={4} rx={2} fill="#54604F" />

      {/* Pigeons pecking around the square */}
      <Pigeon x={width * 0.44} y={nearY + 14} flip={false} />
      <Pigeon x={width * 0.5} y={nearY + 26} flip />
      <Pigeon x={width * 0.66} y={farY + 16} flip={false} scale={0.8} />
    </G>
  );
}

function Pigeon({ x, y, flip, scale = 1 }: { x: number; y: number; flip: boolean; scale?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <Ellipse cx={0} cy={5} rx={7} ry={2} fill="#000" opacity={0.1} />
      <Ellipse cx={0} cy={0} rx={6.5} ry={4.5} fill="#8A93A0" />
      <Ellipse cx={-1.5} cy={0.6} rx={4.2} ry={3} fill="#6F7A88" />
      <Circle cx={5.4} cy={-3.4} r={3} fill="#8A93A0" />
      <Path d="M 8 -3.6 L 11 -2.8 L 8 -1.9 Z" fill="#D8A24A" />
      <Circle cx={6.4} cy={-4} r={0.7} fill="#2A2F36" />
      <Rect x={-1.5} y={3.6} width={1.2} height={3} rx={0.6} fill="#D8A24A" />
      <Rect x={1.6} y={3.6} width={1.2} height={3} rx={0.6} fill="#D8A24A" />
    </G>
  );
}

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { FONT } from '../theme/type';

const W = 160;
const H = 140;
const TEETH = 8;
const TOOTH_W = W / TEETH;
const BODY_TOP = 22;

function ChurroCup({ cx, cy }: { cx: number; cy: number }) {
  const sticks = [-9, 0, 9];
  return (
    <G>
      {sticks.map((dx, i) => (
        <G key={i} transform={`translate(${cx + dx} ${cy - 6}) rotate(${dx * 2 - 4})`}>
          <Rect x={-3.2} y={-28} width={6.4} height={28} rx={3.2} fill="url(#churroStick)" stroke="#8A5A1E" strokeWidth={1} />
          <Path d="M -1.4 -26 L -1.4 -4" stroke="#B97324" strokeWidth={0.8} opacity={0.6} />
          <Path d="M 1.4 -26 L 1.4 -4" stroke="#B97324" strokeWidth={0.8} opacity={0.6} />
          {i === 1 && <Circle cx={0} cy={-24} r={3.4} fill="#4B2E1A" />}
        </G>
      ))}
      <Path
        d={`M ${cx - 14} ${cy} L ${cx + 14} ${cy} L ${cx + 10} ${cy + 11} L ${cx - 10} ${cy + 11} Z`}
        fill="#FFF8EE"
        stroke="#8A5A1E"
        strokeWidth={1.3}
      />
      <Path d={`M ${cx - 14} ${cy} L ${cx + 14} ${cy} L ${cx + 12} ${cy + 4} L ${cx - 12} ${cy + 4} Z`} fill="#C1440E" />
    </G>
  );
}

function Vendor({ cx, cy }: { cx: number; cy: number }) {
  return (
    <G>
      <Rect x={cx - 11} y={cy - 20} width={22} height={26} rx={9} fill="#F2F2F0" />
      <Rect x={cx - 11} y={cy - 20} width={22} height={7} rx={3.5} fill="#C1440E" />
      <Circle cx={cx} cy={cy - 28} r={9} fill="#E3B183" />
      <Path d={`M ${cx - 9} ${cy - 30} Q ${cx} ${cy - 42} ${cx + 9} ${cy - 30} Z`} fill="#FFFFFF" />
      <Rect x={cx - 11} y={cy - 32} width={22} height={3.4} rx={1.7} fill="#FFFFFF" />
      <Circle cx={cx - 3.2} cy={cy - 27} r={1.1} fill="#2A1F14" />
      <Circle cx={cx + 3.2} cy={cy - 27} r={1.1} fill="#2A1F14" />
      <Path d={`M ${cx - 3} ${cy - 23} Q ${cx} ${cy - 20.5} ${cx + 3} ${cy - 23}`} stroke="#2A1F14" strokeWidth={1.1} fill="none" strokeLinecap="round" />
    </G>
  );
}

export function StandRig({
  price,
  scale = 1,
  soldOutLabel,
}: {
  price: string;
  scale?: number;
  soldOutLabel?: string;
}) {
  const steam = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(steam, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(steam, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [steam]);

  const steamY = steam.interpolate({ inputRange: [0, 1], outputRange: [0, -24] });
  const steamOpacity = steam.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 0.5, 0.12, 0] });

  const teeth = Array.from({ length: TEETH }).map((_, i) => (
    <Path
      key={i}
      d={`M ${i * TOOTH_W} ${BODY_TOP} A ${TOOTH_W / 2} ${TOOTH_W / 2} 0 0 0 ${(i + 1) * TOOTH_W} ${BODY_TOP} Z`}
      fill={i % 2 === 0 ? '#C1440E' : '#FFF8EE'}
    />
  ));

  return (
    <View style={[styles.wrap, { width: W * scale }]}>
      <View style={[styles.priceTag, { transform: [{ rotate: '-6deg' }, { scale }] }]}>
        <Text style={styles.priceTagText}>{price}</Text>
      </View>

      {soldOutLabel && (
        <View style={[styles.soldOutTag, { transform: [{ rotate: '-8deg' }, { scale }] }]}>
          <Text style={styles.soldOutText}>{soldOutLabel}</Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.steamWrap,
          { left: W * scale * 0.34, opacity: steamOpacity, transform: [{ translateY: steamY }, { scale }] },
        ]}
      >
        <Svg width={26} height={28} viewBox="0 0 26 28">
          <Path d="M 7 26 Q 3 18 8 12 Q 12 7 8 1" stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <Path d="M 17 26 Q 13 18 18 12 Q 22 7 18 1" stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>

      <Svg width={W * scale} height={H * scale} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="cartBody" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F0B96A" />
            <Stop offset="1" stopColor="#D9902E" />
          </LinearGradient>
          <LinearGradient id="churroStick" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#D9902E" />
            <Stop offset="0.5" stopColor="#F3D9A4" />
            <Stop offset="1" stopColor="#D9902E" />
          </LinearGradient>
        </Defs>

        <Ellipse cx={W / 2} cy={H - 3} rx={W * 0.44} ry={7} fill="#000" opacity={0.16} />

        <Vendor cx={W * 0.72} cy={BODY_TOP + 50} />

        <G>{teeth}</G>
        <Rect x={0} y={BODY_TOP - 7} width={W} height={7} fill="#8A5A1E" />
        <Rect x={W * 0.06} y={0} width={5} height={BODY_TOP - 6} fill="#8A5A1E" />
        <Rect x={W * 0.9} y={0} width={5} height={BODY_TOP - 6} fill="#8A5A1E" />

        {/* string of bulbs along the awning */}
        <Path d={`M 6 ${BODY_TOP - 3} Q ${W / 2} ${BODY_TOP + 7} ${W - 6} ${BODY_TOP - 3}`} stroke="#6B4A2A" strokeWidth={1.2} fill="none" />
        {[0.16, 0.34, 0.52, 0.7, 0.86].map((f, i) => {
          const bx = 6 + (W - 12) * f;
          const by = BODY_TOP - 3 + Math.sin(Math.PI * f) * 7;
          return <Circle key={i} cx={bx} cy={by + 2.5} r={2.6} fill={i % 2 === 0 ? '#FFD98A' : '#FFF3CE'} />;
        })}

        {/* chalkboard menu leaning against the cart */}
        <G>
          <Rect x={W - 34} y={BODY_TOP + 62} width={30} height={34} rx={2} fill="#3E3A33" stroke="#6B4A2A" strokeWidth={2} />
          <Rect x={W - 29} y={BODY_TOP + 68} width={20} height={2.4} rx={1.2} fill="#E9DFC8" opacity={0.8} />
          <Rect x={W - 29} y={BODY_TOP + 74} width={14} height={2.4} rx={1.2} fill="#E9DFC8" opacity={0.6} />
          <Rect x={W - 29} y={BODY_TOP + 80} width={17} height={2.4} rx={1.2} fill="#E9DFC8" opacity={0.6} />
          <Rect x={W - 29} y={BODY_TOP + 86} width={11} height={2.4} rx={1.2} fill="#E9DFC8" opacity={0.4} />
        </G>

        <Rect x={4} y={BODY_TOP + 46} width={W - 8} height={44} rx={4} fill="url(#cartBody)" stroke="#8A5A1E" strokeWidth={2} />
        {[1, 2, 3, 4].map((i) => (
          <Path
            key={i}
            d={`M ${(i * (W - 8)) / 5 + 4} ${BODY_TOP + 48} L ${(i * (W - 8)) / 5 + 4} ${BODY_TOP + 88}`}
            stroke="#B97324"
            strokeWidth={1.4}
            opacity={0.5}
          />
        ))}

        <Rect x={2} y={BODY_TOP + 34} width={W - 4} height={12} rx={3} fill="#FDECD2" stroke="#8A5A1E" strokeWidth={2} />
        <ChurroCup cx={W * 0.3} cy={BODY_TOP + 34} />

        <Rect x={18} y={BODY_TOP + 90} width={20} height={6} rx={3} fill="#6B4A2A" />
        <Rect x={W - 38} y={BODY_TOP + 90} width={20} height={6} rx={3} fill="#6B4A2A" />
        <Circle cx={38} cy={BODY_TOP + 106} r={10} fill="#3A2A1A" />
        <Circle cx={38} cy={BODY_TOP + 106} r={4} fill="#8A6A4A" />
        <Circle cx={W - 38} cy={BODY_TOP + 106} r={10} fill="#3A2A1A" />
        <Circle cx={W - 38} cy={BODY_TOP + 106} r={4} fill="#8A6A4A" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  priceTag: {
    position: 'absolute',
    top: -8,
    right: -6,
    zIndex: 3,
    backgroundColor: '#FFF8EE',
    borderWidth: 2,
    borderColor: '#8A5A1E',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priceTagText: { fontSize: 12, fontFamily: FONT.black, fontWeight: '800', color: '#4A2E1A' },
  soldOutTag: {
    position: 'absolute',
    top: 46,
    left: 10,
    zIndex: 4,
    backgroundColor: '#C1440E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soldOutText: { fontSize: 10, fontFamily: FONT.black, fontWeight: '900', color: '#FFF8EE', letterSpacing: 0.6 },
  steamWrap: { position: 'absolute', top: 4, zIndex: 2 },
});

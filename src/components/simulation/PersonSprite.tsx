import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export type CustomerMood = 'satisfied' | 'unsatisfied' | 'price' | 'stockout';

const SKIN_TONES = ['#F2C6A0', '#D9A066', '#B87C4C', '#8D5A3C', '#F0D5B8', '#C68A5E'];
const HAIR_TONES = ['#2A1F14', '#5A3A1E', '#1B1410', '#7A5230', '#3A2A1A', '#8C6B3F'];
const BAG_TONES = ['#C1440E', '#3E6B8F', '#6B8F5A', '#8F5A8F'];

const OUTFITS: Record<CustomerMood, string[]> = {
  satisfied: ['#4FA37D', '#3E8FC1', '#E0954F', '#D65C8A', '#4FAF6E', '#7A6AC4'],
  unsatisfied: ['#B7A96A', '#A98F5C', '#8FA37A', '#9C9464'],
  price: ['#C77C7C', '#B98A8A', '#A67373', '#C98F6E'],
  stockout: ['#8896A3', '#9AA3AB', '#7C8896', '#8E9AA8'],
};

function pick(list: string[], seed: number) {
  return list[Math.abs(seed) % list.length];
}

export function PersonSprite({
  mood,
  seed = 0,
  size = 34,
  carrying = false,
  umbrella = false,
}: {
  mood: CustomerMood;
  seed?: number;
  size?: number;
  carrying?: boolean;
  umbrella?: boolean;
}) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 240 + (seed % 4) * 25, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 240 + (seed % 4) * 25, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, seed]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -2.5] });

  const skin = pick(SKIN_TONES, seed);
  const hair = pick(HAIR_TONES, seed + 1);
  const outfit = pick(OUTFITS[mood], seed);
  const pants = mood === 'satisfied' ? '#3A4A5C' : seed % 2 === 0 ? '#4A4438' : '#5A5044';
  const hairStyle = seed % 3;
  const hasBag = !carrying && seed % 4 === 0;

  // Two-frame walk cycle: the stride swaps halfway through each bob, the way
  // classic sprite animation does it. Stepped opacity keeps it on the native driver.
  const frameA = bob.interpolate({ inputRange: [0, 0.499, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const frameB = bob.interpolate({ inputRange: [0, 0.499, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const figure = (stride: number) => (
    <Svg width={size} height={size * 1.5} viewBox="0 0 40 60">
      <Ellipse cx={20} cy={57.5} rx={10} ry={2.4} fill="#000" opacity={0.16} />

        {/* back leg */}
        <G transform={`rotate(${13 * stride} 23 40)`}>
          <Rect x={20} y={40} width={6} height={16} rx={3} fill={pants} opacity={0.88} />
          <Ellipse cx={23.5} cy={56.6} rx={4} ry={2.3} fill="#241C14" />
        </G>

        {/* front leg */}
        <G transform={`rotate(${-13 * stride} 16 40)`}>
          <Rect x={13} y={40} width={6} height={16} rx={3} fill={pants} />
          <Ellipse cx={15.5} cy={56.6} rx={4} ry={2.3} fill="#2A1F14" />
        </G>

        {/* back arm (+ shopping bag) */}
        <G transform={`rotate(${22 * stride} 26 22)`}>
          <Rect x={24} y={22} width={4.4} height={13} rx={2.2} fill={outfit} opacity={0.82} />
          <Circle cx={26.2} cy={35} r={2.1} fill={skin} opacity={0.9} />
        </G>
        {hasBag && (
          <G>
            <Rect x={26.5} y={36} width={9} height={11} rx={1.5} fill={pick(BAG_TONES, seed + 2)} />
            <Path d="M 28.5 36 Q 31 32.5 33.5 36" stroke="#3A2A1A" strokeWidth={1} fill="none" />
          </G>
        )}

        {/* torso */}
        <Rect x={11} y={19} width={18} height={22} rx={8} fill={outfit} />
        <Path d="M 20 19 L 29 19 L 29 41 L 20 41 Z" fill="#000" opacity={0.1} />
        <Rect x={11} y={33} width={18} height={8} rx={4} fill="#000" opacity={0.07} />
        <Rect x={12.5} y={20.5} width={4} height={12} rx={2} fill="#FFFFFF" opacity={0.12} />

        {/* front arm */}
        <G transform={`rotate(${-18 * stride} 11 22)`}>
          <Rect x={9} y={22} width={4.4} height={13} rx={2.2} fill={outfit} />
          <Circle cx={11.2} cy={35} r={2.1} fill={skin} />
        </G>

        {/* churro cup in hand */}
        {carrying && <ChurroCup x={7} y={31} />}

        {/* head */}
        <Circle cx={20} cy={11} r={8.5} fill={skin} />
        <Path d="M 20 2.6 A 8.5 8.5 0 0 1 20 19.4 Z" fill="#000" opacity={0.08} />
        <Rect x={17.6} y={17.6} width={4.8} height={2.6} rx={1.2} fill={skin} />
        <Hair style={hairStyle} color={hair} />
        <Circle cx={17} cy={11.5} r={1.1} fill="#2A1F14" />
        <Circle cx={23} cy={11.5} r={1.1} fill="#2A1F14" />
        <Mouth mood={mood} />

        {umbrella && (
          <G>
            <Rect x={19.2} y={-6} width={1.6} height={26} rx={0.8} fill="#5A4632" />
            <Path d="M 3 -4 Q 20 -20 37 -4 Q 28 -8.5 20 -4 Q 12 -8.5 3 -4 Z" fill="#3E6B8F" />
            <Path d="M 20 -13.6 Q 27 -10.6 30.5 -5.4 Q 25 -8.2 20 -5.6 Z" fill="#FFFFFF" opacity={0.22} />
          </G>
        )}
    </Svg>
  );

  return (
    <Animated.View style={{ width: size, height: size * 1.5, transform: [{ translateY }] }}>
      <Animated.View style={{ opacity: frameA }}>{figure(1)}</Animated.View>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, opacity: frameB }}>{figure(-1)}</Animated.View>
    </Animated.View>
  );
}

function Hair({ style, color }: { style: number; color: string }) {
  if (style === 0) {
    return <Path d="M 11.5 10 Q 12 1 20 1 Q 28 1 28.5 10 Q 24 6 20 6.5 Q 16 6 11.5 10 Z" fill={color} />;
  }
  if (style === 1) {
    // short cropped
    return <Path d="M 11.6 9.5 Q 13 1.5 20 1.5 Q 27 1.5 28.4 9.5 Q 26 5.5 20 5.5 Q 14 5.5 11.6 9.5 Z" fill={color} />;
  }
  // longer, falls past the ears
  return (
    <G>
      <Path d="M 11.5 10 Q 12 1 20 1 Q 28 1 28.5 10 Q 24 6 20 6.5 Q 16 6 11.5 10 Z" fill={color} />
      <Path d="M 11.4 9 Q 10 15 11.6 18 L 13.4 18 Q 12.4 14 13 9.6 Z" fill={color} />
      <Path d="M 28.6 9 Q 30 15 28.4 18 L 26.6 18 Q 27.6 14 27 9.6 Z" fill={color} />
    </G>
  );
}

function ChurroCup({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Rect x={x - 1.6} y={y - 6} width={1.8} height={7} rx={0.9} fill="#E7B457" />
      <Rect x={x + 1} y={y - 7} width={1.8} height={8} rx={0.9} fill="#F3D9A4" />
      <Path
        d={`M ${x - 3.4} ${y} L ${x + 4.6} ${y} L ${x + 3.4} ${y + 7} L ${x - 2.2} ${y + 7} Z`}
        fill="#FFF8EE"
        stroke="#8A5A1E"
        strokeWidth={0.7}
      />
      <Path d={`M ${x - 3.4} ${y} L ${x + 4.6} ${y} L ${x + 4.2} ${y + 2} L ${x - 3} ${y + 2} Z`} fill="#C1440E" />
    </G>
  );
}

function Mouth({ mood }: { mood: CustomerMood }) {
  switch (mood) {
    case 'satisfied':
      return <Path d="M 16.5 15 Q 20 18.5 23.5 15" stroke="#2A1F14" strokeWidth={1.3} fill="none" strokeLinecap="round" />;
    case 'price':
      return <Path d="M 16.5 16.5 Q 20 13.5 23.5 16.5" stroke="#2A1F14" strokeWidth={1.3} fill="none" strokeLinecap="round" />;
    case 'unsatisfied':
    case 'stockout':
    default:
      return <Rect x={16.5} y={15.4} width={7} height={1.3} rx={0.6} fill="#2A1F14" />;
  }
}

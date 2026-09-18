import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'flour'
  | 'oil'
  | 'sugar'
  | 'bag'
  | 'churro'
  | 'cart'
  | 'recipe'
  | 'upgrade'
  | 'location'
  | 'cash'
  | 'coinOff'
  | 'emptyCup'
  | 'sad'
  | 'sunny'
  | 'hot'
  | 'cloudy'
  | 'rainy'
  | 'cold';

/** Flat two-tone icon set drawn to a 24x24 grid so every glyph shares a weight. */
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyph(name)}
    </Svg>
  );
}

function glyph(name: IconName) {
  switch (name) {
    case 'flour':
      return (
        <G>
          <Path
            d="M6.5 10 Q6.5 7.5 9 7 L15 7 Q17.5 7.5 17.5 10 L18.5 19 Q18.5 21.5 16 21.5 L8 21.5 Q5.5 21.5 5.5 19 Z"
            fill="#EADCBE"
            stroke="#9C7F4E"
            strokeWidth={1.3}
          />
          <Path d="M9 7 Q10.5 3.6 12 6 Q13.5 3.6 15 7 Q12 8.6 9 7 Z" fill="#C8B48C" stroke="#9C7F4E" strokeWidth={1.1} />
          <Path d="M8.5 15.5 L15.5 15.5" stroke="#9C7F4E" strokeWidth={1.2} strokeLinecap="round" opacity={0.8} />
          <Ellipse cx={12} cy={18.4} rx={3.2} ry={1.9} fill="#C8B48C" opacity={0.75} />
        </G>
      );
    case 'oil':
      return (
        <G>
          <Rect x={10} y={2.5} width={4} height={3.5} rx={1} fill="#8FA37A" />
          <Path d="M8.5 8 Q8.5 6 10 6 L14 6 Q15.5 6 15.5 8 L17 18.5 Q17 21 14.5 21 L9.5 21 Q7 21 7 18.5 Z" fill="#D8B65C" />
          <Path d="M9 13 L15.4 13 L16.3 18.6 Q16.3 20 14.6 20 L9.4 20 Q7.7 20 7.7 18.6 Z" fill="#B98F2E" />
          <Circle cx={12} cy={16} r={2.1} fill="#F2DC9A" opacity={0.8} />
        </G>
      );
    case 'sugar':
      return (
        <G>
          <Path
            d="M5.5 11 L18.5 11 L17 20 Q16.8 21.5 15.2 21.5 L8.8 21.5 Q7.2 21.5 7 20 Z"
            fill="#F6FAFD"
            stroke="#8FA3B2"
            strokeWidth={1.3}
          />
          <Path d="M6.6 14.5 L17.4 14.5 L17 20 Q16.8 21.5 15.2 21.5 L8.8 21.5 Q7.2 21.5 7 20 Z" fill="#D8E4EC" />
          <Path d="M5.5 11 Q12 6.5 18.5 11 Z" fill="#FFFFFF" stroke="#8FA3B2" strokeWidth={1.2} />
          <Rect x={9.4} y={4} width={2.6} height={2.6} rx={0.5} fill="#FFFFFF" stroke="#8FA3B2" strokeWidth={1.1} />
          <Rect x={12.4} y={5.6} width={2.6} height={2.6} rx={0.5} fill="#FFFFFF" stroke="#8FA3B2" strokeWidth={1.1} />
        </G>
      );
    case 'bag':
      return (
        <G>
          <Path d="M6 8 L18 8 L16.8 20.5 Q16.7 21.5 15.6 21.5 L8.4 21.5 Q7.3 21.5 7.2 20.5 Z" fill="#E7D2AE" />
          <Path d="M6 8 L18 8 L17.7 11 L6.3 11 Z" fill="#D3BC94" />
          <Path d="M9 8 Q9 4 12 4 Q15 4 15 8" stroke="#B08E5E" strokeWidth={1.5} fill="none" />
        </G>
      );
    case 'churro':
      return (
        <G>
          <Path d="M4.5 19 L16 7.5" stroke="#9C6B21" strokeWidth={9.4} strokeLinecap="round" />
          <Path d="M4.5 19 L16 7.5" stroke="#EFC169" strokeWidth={7.4} strokeLinecap="round" />
          <Path d="M3.2 17.7 L14.7 6.2" stroke="#F7E0AE" strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M5.8 20.3 L17.3 8.8" stroke="#C98A3E" strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={17.6} cy={6.4} r={4} fill="#4B2E1A" />
        </G>
      );
    case 'cart':
      return (
        <G>
          <Rect x={2.5} y={6.5} width={19} height={3} rx={1} fill="#C1440E" />
          {[0, 1, 2, 3].map((i) => (
            <Path
              key={i}
              d={`M ${2.5 + i * 4.75} 9.5 A 2.4 2.4 0 0 0 ${2.5 + (i + 1) * 4.75} 9.5 Z`}
              fill={i % 2 === 0 ? '#C1440E' : '#FFF3E2'}
            />
          ))}
          <Rect x={4} y={12.5} width={16} height={6.5} rx={1.4} fill="#E8A855" stroke="#8A5A1E" strokeWidth={1.2} />
          <Rect x={4} y={12.5} width={16} height={2.2} rx={1} fill="#FDECD2" stroke="#8A5A1E" strokeWidth={1.1} />
          <Circle cx={8} cy={20.4} r={1.9} fill="#3A2A1A" />
          <Circle cx={16} cy={20.4} r={1.9} fill="#3A2A1A" />
        </G>
      );
    case 'recipe':
      return (
        <G>
          <Rect x={4.5} y={3.5} width={15} height={17} rx={2} fill="#FDECD2" stroke="#B08E5E" strokeWidth={1.4} />
          <Rect x={9} y={2} width={6} height={3.2} rx={1.4} fill="#B08E5E" />
          <Rect x={7.5} y={9} width={9} height={1.6} rx={0.8} fill="#C1440E" />
          <Rect x={7.5} y={12.5} width={7} height={1.6} rx={0.8} fill="#C8A97A" />
          <Rect x={7.5} y={16} width={8} height={1.6} rx={0.8} fill="#C8A97A" />
        </G>
      );
    case 'upgrade':
      return (
        <G>
          <Path
            d="M12 2.8 L14.5 8.7 L21 9.3 L16.1 13.6 L17.6 20 L12 16.6 L6.4 20 L7.9 13.6 L3 9.3 L9.5 8.7 Z"
            fill="#F2C24C"
            stroke="#C89A2C"
            strokeWidth={1.1}
          />
        </G>
      );
    case 'location':
      return (
        <G>
          <Path d="M12 2.5 Q19 2.5 19 9.5 Q19 15 12 21.5 Q5 15 5 9.5 Q5 2.5 12 2.5 Z" fill="#C1440E" />
          <Circle cx={12} cy={9.4} r={3.1} fill="#FFF3E2" />
        </G>
      );
    case 'cash':
      return (
        <G>
          <Ellipse cx={12} cy={7} rx={7.5} ry={3} fill="#F2C24C" />
          <Path d="M4.5 7 L4.5 16 Q4.5 19 12 19 Q19.5 19 19.5 16 L19.5 7" fill="#E0AE33" />
          <Ellipse cx={12} cy={12.5} rx={7.5} ry={3} fill="#F2C24C" />
          <Ellipse cx={12} cy={7} rx={4} ry={1.5} fill="#FBE1A0" opacity={0.7} />
        </G>
      );
    case 'coinOff':
      return (
        <G>
          <Circle cx={11} cy={12} r={7.4} fill="#E9C9C9" stroke="#C77C7C" strokeWidth={1.4} />
          <Path d="M6.5 7.2 L16.4 17.4" stroke="#C1440E" strokeWidth={2.2} strokeLinecap="round" />
        </G>
      );
    case 'emptyCup':
      return (
        <G>
          <Path d="M6.5 7 L17.5 7 L15.8 20 Q15.7 21 14.6 21 L9.4 21 Q8.3 21 8.2 20 Z" fill="#EDEDED" stroke="#B3B3B3" strokeWidth={1.3} />
          <Path d="M6.5 7 L17.5 7 L17.2 9.6 L6.8 9.6 Z" fill="#C9C9C9" />
        </G>
      );
    case 'sad':
      return (
        <G>
          <Circle cx={12} cy={12} r={8.4} fill="#F3D98F" />
          <Circle cx={9.2} cy={10.4} r={1.2} fill="#4A3A1E" />
          <Circle cx={14.8} cy={10.4} r={1.2} fill="#4A3A1E" />
          <Path d="M8.6 16.4 Q12 13.4 15.4 16.4" stroke="#4A3A1E" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'sunny':
      return (
        <G>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <Rect
              key={a}
              x={11.2}
              y={1.5}
              width={1.6}
              height={4}
              rx={0.8}
              fill="#F2B33C"
              transform={`rotate(${a} 12 12)`}
            />
          ))}
          <Circle cx={12} cy={12} r={5.6} fill="#FFD24C" stroke="#E0A62E" strokeWidth={1.2} />
        </G>
      );
    case 'hot':
      return (
        <G>
          <Circle cx={12} cy={10} r={6.2} fill="#FF9F40" stroke="#DE7A22" strokeWidth={1.2} />
          <Path d="M6 18.5 Q9 16.5 12 18.5 Q15 20.5 18 18.5" stroke="#DE7A22" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <Path d="M6 21.5 Q9 19.5 12 21.5 Q15 23.5 18 21.5" stroke="#DE7A22" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.6} />
        </G>
      );
    case 'cloudy':
      return (
        <G>
          <Circle cx={16} cy={8.5} r={4.4} fill="#FFD24C" opacity={0.9} />
          <Path
            d="M7 18.5 Q3.5 18.5 3.5 15.5 Q3.5 12.8 6.4 12.5 Q7 8.5 11 8.5 Q14.6 8.5 15.5 12 Q19.5 12 19.5 15.4 Q19.5 18.5 16.4 18.5 Z"
            fill="#EFF3F6"
            stroke="#A9B8C4"
            strokeWidth={1.3}
          />
        </G>
      );
    case 'rainy':
      return (
        <G>
          <Path
            d="M7 15.5 Q3.5 15.5 3.5 12.5 Q3.5 9.8 6.4 9.5 Q7 5.5 11 5.5 Q14.6 5.5 15.5 9 Q19.5 9 19.5 12.4 Q19.5 15.5 16.4 15.5 Z"
            fill="#D8E1E8"
            stroke="#8FA3B2"
            strokeWidth={1.3}
          />
          {[7.5, 12, 16.5].map((x, i) => (
            <Path
              key={i}
              d={`M ${x} 17.5 L ${x - 1.4} 21.5`}
              stroke="#4F9FD1"
              strokeWidth={1.9}
              strokeLinecap="round"
            />
          ))}
        </G>
      );
    case 'cold':
      return (
        <G>
          {[0, 60, 120].map((a) => (
            <Rect key={a} x={11.1} y={2.5} width={1.8} height={19} rx={0.9} fill="#7FC4E8" transform={`rotate(${a} 12 12)`} />
          ))}
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <Path
              key={`b${a}`}
              d="M 12 5.5 L 9.6 8 M 12 5.5 L 14.4 8"
              stroke="#7FC4E8"
              strokeWidth={1.6}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(${a} 12 12)`}
            />
          ))}
          <Circle cx={12} cy={12} r={2.2} fill="#BFE3F5" />
        </G>
      );
    default:
      return null;
  }
}

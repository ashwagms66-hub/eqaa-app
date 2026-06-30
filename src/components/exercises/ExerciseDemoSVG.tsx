// TODO: Replace these movement diagrams with licensed or generated exercise demo images/animations.
// These SVG components are vector placeholder diagrams that convey the exercise movement
// using react-native-svg until real photos or animations are available.

import React from "react";
import Svg, {
  Circle,
  Rect,
  Line,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Polygon,
} from "react-native-svg";

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitive helpers
// ─────────────────────────────────────────────────────────────────────────────

const EQUIP = "rgba(255,255,255,0.60)";
const PLATE = "rgba(255,255,255,0.40)";
const FLOOR_STROKE = "rgba(255,255,255,0.16)";

function ArrowUp({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <G opacity={0.88}>
      <Line x1={x} y1={y + 20} x2={x} y2={y + 3} stroke={color} strokeWidth="2.5" />
      <Polygon points={`${x},${y} ${x - 6},${y + 9} ${x + 6},${y + 9}`} fill={color} />
    </G>
  );
}

function ArrowDown({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <G opacity={0.88}>
      <Line x1={x} y1={y} x2={x} y2={y + 17} stroke={color} strokeWidth="2.5" />
      <Polygon points={`${x},${y + 24} ${x - 6},${y + 15} ${x + 6},${y + 15}`} fill={color} />
    </G>
  );
}

function ArrowRight({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <G opacity={0.88}>
      <Line x1={x} y1={y} x2={x + 17} y2={y} stroke={color} strokeWidth="2.5" />
      <Polygon points={`${x + 24},${y} ${x + 15},${y - 6} ${x + 15},${y + 6}`} fill={color} />
    </G>
  );
}

function Limb({
  x1, y1, x2, y2, color, w = 12,
}: { x1: number; y1: number; x2: number; y2: number; color: string; w?: number }) {
  return (
    <Line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={w} strokeLinecap="round" opacity={0.87}
    />
  );
}

function Joint({ cx, cy, color, r = 9 }: { cx: number; cy: number; color: string; r?: number }) {
  return <Circle cx={cx} cy={cy} r={r} fill={color} opacity={0.95} />;
}

function HeadCircle({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return <Circle cx={cx} cy={cy} r={13} fill={color} opacity={0.95} />;
}

function Barbell({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const pr = 12;
  return (
    <G>
      <Rect x={x1 + pr} y={y - 4.5} width={x2 - x1 - pr * 2} height={9} rx={4.5} fill={EQUIP} />
      <Circle cx={x1 + pr} cy={y} r={pr} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
      <Circle cx={x2 - pr} cy={y} r={pr} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
    </G>
  );
}

function Dumbbell({ cx, cy }: { cx: number; cy: number }) {
  const pr = 7;
  return (
    <G>
      <Rect x={cx - 15} y={cy - 4} width={30} height={8} rx={4} fill={EQUIP} />
      <Circle cx={cx - 15} cy={cy} r={pr} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
      <Circle cx={cx + 15} cy={cy} r={pr} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
    </G>
  );
}

function FloorLine({ y = 210 }: { y?: number }) {
  return <Line x1={14} y1={y} x2={346} y2={y} stroke={FLOOR_STROKE} strokeWidth={2.5} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hip Thrust  ·  glute_001
// ─────────────────────────────────────────────────────────────────────────────

function HipThrustSVG() {
  const C = "#FF6FAE";
  return (
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <SvgGradient id="ht_bg" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={C} stopOpacity="0.13" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect width="360" height="220" fill="url(#ht_bg)" />
      <FloorLine />

      {/* Bench */}
      <Rect x={30} y={132} width={60} height={78} rx={6}
        fill="rgba(255,255,255,0.06)" stroke={C} strokeWidth={1.5} strokeOpacity={0.35} />

      {/* Figure */}
      <HeadCircle cx={57} cy={112} color={C} />
      {/* Upper back resting on bench */}
      <Limb x1={65} y1={132} x2={118} y2={132} color={C} w={13} />
      {/* Torso → hips */}
      <Limb x1={114} y1={134} x2={163} y2={94} color={C} w={13} />
      {/* Hips */}
      <Joint cx={165} cy={90} color={C} r={15} />
      {/* Barbell across hips */}
      <Barbell x1={98} x2={256} y={83} />
      {/* Thigh */}
      <Limb x1={165} y1={102} x2={218} y2={158} color={C} />
      {/* Knee */}
      <Joint cx={218} cy={158} color={C} />
      {/* Shin */}
      <Limb x1={218} y1={158} x2={218} y2={210} color={C} />
      {/* Foot */}
      <Rect x={202} y={205} width={34} height={9} rx={4.5} fill={C} opacity={0.7} />

      {/* Upward movement arrows */}
      <ArrowUp x={165} y={48} color="rgba(255,255,255,0.90)" />
      <ArrowUp x={185} y={54} color="rgba(255,255,255,0.55)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Glute Bridge  ·  glute_002
// ─────────────────────────────────────────────────────────────────────────────

function GluteBridgeSVG() {
  const C = "#FF6FAE";
  return (
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <SvgGradient id="gb_bg" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={C} stopOpacity="0.10" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect width="360" height="220" fill="url(#gb_bg)" />
      <FloorLine />

      {/* Head resting on floor */}
      <HeadCircle cx={47} cy={196} color={C} />
      {/* Shoulders/upper back flat on floor */}
      <Limb x1={53} y1={207} x2={110} y2={209} color={C} w={13} />
      {/* Torso rising from shoulders to hips */}
      <Limb x1={107} y1={206} x2={157} y2={142} color={C} w={13} />
      {/* Hips */}
      <Joint cx={158} cy={138} color={C} r={15} />
      {/* Thigh */}
      <Limb x1={158} y1={150} x2={207} y2={186} color={C} />
      {/* Knee */}
      <Joint cx={207} cy={186} color={C} />
      {/* Shin vertical */}
      <Limb x1={207} y1={186} x2={207} y2={210} color={C} />
      {/* Foot */}
      <Rect x={192} y={205} width={34} height={9} rx={4.5} fill={C} opacity={0.7} />

      {/* Upward arrow */}
      <ArrowUp x={158} y={100} color="rgba(255,255,255,0.90)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Barbell Back Squat  ·  legs_001
// ─────────────────────────────────────────────────────────────────────────────

function SquatSVG() {
  const C = "#FF9F0A";
  return (
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <SvgGradient id="sq_bg" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={C} stopOpacity="0.13" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect width="360" height="220" fill="url(#sq_bg)" />
      <FloorLine />

      {/* Head */}
      <HeadCircle cx={150} cy={38} color={C} />
      {/* Barbell on upper back */}
      <Barbell x1={88} x2={248} y={54} />
      {/* Torso forward lean at bottom of squat */}
      <Limb x1={150} y1={50} x2={168} y2={118} color={C} w={13} />
      {/* Hips */}
      <Joint cx={168} cy={118} color={C} r={15} />
      {/* Thigh */}
      <Limb x1={168} y1={130} x2={215} y2={174} color={C} />
      {/* Knee */}
      <Joint cx={215} cy={174} color={C} />
      {/* Shin */}
      <Limb x1={215} y1={174} x2={210} y2={210} color={C} />
      {/* Foot */}
      <Rect x={192} y={205} width={35} height={9} rx={4.5} fill={C} opacity={0.7} />

      {/* Downward arrow (squat descent) */}
      <ArrowDown x={292} y={58} color="rgba(255,255,255,0.90)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulgarian Split Squat  ·  legs_002
// ─────────────────────────────────────────────────────────────────────────────

function BulgarianSplitSquatSVG() {
  const C = "#FF9F0A";
  return (
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <SvgGradient id="bs_bg" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={C} stopOpacity="0.13" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect width="360" height="220" fill="url(#bs_bg)" />
      <FloorLine />

      {/* Rear bench */}
      <Rect x={248} y={157} width={78} height={53} rx={6}
        fill="rgba(255,255,255,0.06)" stroke={C} strokeWidth={1.5} strokeOpacity={0.35} />

      {/* Head */}
      <HeadCircle cx={150} cy={44} color={C} />
      {/* Torso slightly forward */}
      <Limb x1={150} y1={56} x2={160} y2={122} color={C} w={13} />
      {/* Hips */}
      <Joint cx={160} cy={122} color={C} r={14} />

      {/* Front leg */}
      <Limb x1={160} y1={132} x2={180} y2={178} color={C} />
      <Joint cx={180} cy={178} color={C} />
      <Limb x1={180} y1={178} x2={165} y2={210} color={C} />
      <Rect x={148} y={205} width={34} height={9} rx={4.5} fill={C} opacity={0.7} />

      {/* Rear leg (extended back, foot on bench) */}
      <Limb x1={160} y1={132} x2={248} y2={148} color={C} />
      <Joint cx={248} cy={148} color={C} />
      <Limb x1={248} y1={148} x2={263} y2={160} color={C} />

      {/* Downward arrow */}
      <ArrowDown x={255} y={55} color="rgba(255,255,255,0.90)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leg Press  ·  legs_003
// ─────────────────────────────────────────────────────────────────────────────

function LegPressSVG() {
  const C = "#FF9F0A";
  return (
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <SvgGradient id="lp_bg" x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor={C} stopOpacity="0.12" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect width="360" height="220" fill="url(#lp_bg)" />

      {/* Machine frame: angled back support */}
      <Limb x1={30} y1={58} x2={80} y2={175} color="rgba(255,255,255,0.18)" w={20} />
      {/* Machine seat */}
      <Rect x={70} y={172} width={60} height={15} rx={7}
        fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} />
      {/* Footplate (vertical sled) */}
      <Rect x={302} y={76} width={22} height={96} rx={7}
        fill="rgba(255,255,255,0.08)" stroke={C} strokeWidth={2} strokeOpacity={0.5} />
      {/* Rails */}
      <Line x1={110} y1={162} x2={302} y2={100}
        stroke="rgba(255,255,255,0.14)" strokeWidth={5} />
      <Line x1={110} y1={178} x2={302} y2={118}
        stroke="rgba(255,255,255,0.14)" strokeWidth={5} />

      {/* Person reclined */}
      <HeadCircle cx={44} cy={52} color={C} />
      {/* Torso along back support */}
      <Limb x1={44} y1={64} x2={78} y2={174} color={C} w={13} />
      {/* Hips */}
      <Joint cx={78} cy={174} color={C} r={13} />
      {/* Thigh */}
      <Limb x1={78} y1={167} x2={187} y2={127} color={C} />
      {/* Knee */}
      <Joint cx={187} cy={127} color={C} />
      {/* Shin (near-horizontal toward footplate) */}
      <Limb x1={187} y1={127} x2={300} y2={110} color={C} />
      {/* Feet on plate */}
      <Rect x={292} y={100} width={14} height={28} rx={4} fill={C} opacity={0.80} />

      {/* Push direction arrow (rightward toward plate) */}
      <ArrowRight x={228} y={110} color="rgba(255,255,255,0.88)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lat Pulldown  ·  back_001
// ─────────────────────────────────────────────────────────────────────────────

function LatPulldownSVG() {
  const C = "#64D2FF";
  return (
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <SvgGradient id="lat_bg" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={C} stopOpacity="0.13" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect width="360" height="220" fill="url(#lat_bg)" />

      {/* Machine top bar */}
      <Rect x={66} y={17} width={228} height={9} rx={4.5} fill={EQUIP} />
      {/* Pulleys */}
      <Circle cx={66} cy={21} r={9} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
      <Circle cx={294} cy={21} r={9} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
      {/* Cables */}
      <Line x1={66} y1={30} x2={118} y2={74} stroke="rgba(255,255,255,0.30)" strokeWidth={2} />
      <Line x1={294} y1={30} x2={242} y2={74} stroke="rgba(255,255,255,0.30)" strokeWidth={2} />
      {/* Pull bar */}
      <Rect x={112} y={70} width={136} height={9} rx={4.5} fill={EQUIP} opacity={0.90} />
      <Circle cx={112} cy={74} r={7} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
      <Circle cx={248} cy={74} r={7} fill={PLATE} stroke={EQUIP} strokeWidth={1.5} />
      {/* Thigh pad */}
      <Rect x={147} y={172} width={66} height={12} rx={6} fill="rgba(255,255,255,0.16)" />
      {/* Seat */}
      <Rect x={150} y={182} width={60} height={20} rx={8}
        fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.20)" strokeWidth={1.5} />

      {/* Person */}
      <HeadCircle cx={180} cy={98} color={C} />
      {/* Left arm reaching up */}
      <Limb x1={163} y1={112} x2={116} y2={77} color={C} w={10} />
      {/* Right arm reaching up */}
      <Limb x1={197} y1={112} x2={244} y2={77} color={C} w={10} />
      {/* Torso */}
      <Limb x1={180} y1={110} x2={180} y2={174} color={C} w={13} />
      {/* Thighs under pad */}
      <Limb x1={174} y1={172} x2={148} y2={174} color={C} w={10} />
      <Limb x1={186} y1={172} x2={212} y2={174} color={C} w={10} />

      {/* Downward arrows flanking bar */}
      <ArrowDown x={132} y={33} color="rgba(255,255,255,0.90)" />
      <ArrowDown x={228} y={33} color="rgba(255,255,255,0.90)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dumbbell Overhead Press  ·  shoulders_001
// ─────────────────────────────────────────────────────────────────────────────

function ShoulderPressSVG() {
  const C = "#C6A7FF";
  return (
    <Svg width="100%" height={220} viewBox="0 0 360 220">
      <Defs>
        <SvgGradient id="sp_bg" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={C} stopOpacity="0.13" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Rect width="360" height="220" fill="url(#sp_bg)" />

      {/* Seat */}
      <Rect x={154} y={175} width={52} height={30} rx={8}
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />

      {/* Person */}
      <HeadCircle cx={180} cy={45} color={C} />
      {/* Torso */}
      <Limb x1={180} y1={57} x2={180} y2={175} color={C} w={13} />
      {/* Hips */}
      <Joint cx={180} cy={175} color={C} r={12} />

      {/* Left arm — upper arm horizontal, forearm vertical pressing up */}
      <Limb x1={166} y1={84} x2={126} y2={84} color={C} w={10} />
      <Joint cx={126} cy={84} color={C} r={8} />
      <Limb x1={126} y1={84} x2={126} y2={50} color={C} w={10} />
      {/* Left dumbbell at top of forearm */}
      <Dumbbell cx={126} cy={44} />

      {/* Right arm */}
      <Limb x1={194} y1={84} x2={234} y2={84} color={C} w={10} />
      <Joint cx={234} cy={84} color={C} r={8} />
      <Limb x1={234} y1={84} x2={234} y2={50} color={C} w={10} />
      {/* Right dumbbell */}
      <Dumbbell cx={234} cy={44} />

      {/* Upward arrows */}
      <ArrowUp x={126} y={13} color="rgba(255,255,255,0.90)" />
      <ArrowUp x={234} y={13} color="rgba(255,255,255,0.90)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export map
// ─────────────────────────────────────────────────────────────────────────────

export const EXERCISE_SVG_MAP: Record<string, React.FC> = {
  glute_001:     HipThrustSVG,
  glute_002:     GluteBridgeSVG,
  legs_001:      SquatSVG,
  legs_002:      BulgarianSplitSquatSVG,
  legs_003:      LegPressSVG,
  back_001:      LatPulldownSVG,
  shoulders_001: ShoulderPressSVG,
};

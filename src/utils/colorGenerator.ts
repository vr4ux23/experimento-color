import { ShapeType, shapes } from '../components/Shapes';

export type Difficulty = 'easy' | 'intermediate' | 'difficult';

export interface TrialData {
  shapes: {
    type: ShapeType;
    style: React.CSSProperties;
  }[];
  isAllSame: boolean;
  differentIndex: number | null;
}

const getRandomShape = (): ShapeType => {
  const keys = Object.keys(shapes) as ShapeType[];
  return keys[Math.floor(Math.random() * keys.length)];
};

const getRandomHSL = (hRange = [0, 360], sRange = [50, 90], lRange = [40, 60]) => {
  const h = Math.floor(Math.random() * (hRange[1] - hRange[0])) + hRange[0];
  const s = Math.floor(Math.random() * (sRange[1] - sRange[0])) + sRange[0];
  const l = Math.floor(Math.random() * (lRange[1] - lRange[0])) + lRange[0];
  return { h, s, l };
};

const hslToString = ({ h, s, l }: { h: number; s: number; l: number }) => `hsl(${h}, ${s}%, ${l}%)`;

export const generateTrial = (difficulty: Difficulty): TrialData => {
  const isAllSame = Math.random() > 0.5;
  const shapeType = getRandomShape();
  const differentIndex = isAllSame ? null : Math.floor(Math.random() * 4);
  
  const trialShapes: TrialData['shapes'] = [];
  
  if (difficulty === 'easy') {
    const baseColor = getRandomHSL();
    const differentColor = getRandomHSL([(baseColor.h + 120) % 360, (baseColor.h + 240) % 360]);
    
    for (let i = 0; i < 4; i++) {
      const color = (!isAllSame && i === differentIndex) ? differentColor : baseColor;
      trialShapes.push({
        type: shapeType,
        style: { color: hslToString(color) }
      });
    }
  } else if (difficulty === 'intermediate') {
    const baseColor = getRandomHSL();
    // Subtle difference: change hue by 10-15 degrees or lightness by 10%
    const diffType = Math.random() > 0.5 ? 'h' : 'l';
    const differentColor = { ...baseColor };
    if (diffType === 'h') {
      differentColor.h = (baseColor.h + 15) % 360;
    } else {
      differentColor.l = baseColor.l > 50 ? baseColor.l - 12 : baseColor.l + 12;
    }

    for (let i = 0; i < 4; i++) {
      const color = (!isAllSame && i === differentIndex) ? differentColor : baseColor;
      trialShapes.push({
        type: shapeType,
        style: { color: hslToString(color) }
      });
    }
  } else {
    // Difficult: Gradients
    const baseColor1 = getRandomHSL();
    const baseColor2 = getRandomHSL();
    const baseAngle = Math.floor(Math.random() * 360);
    
    const getGradient = (angle: number, c1: {h:number, s:number, l:number}, c2: {h:number, s:number, l:number}) => 
      `linear-gradient(${angle}deg, ${hslToString(c1)} 0%, ${hslToString(c2)} 100%)`;

    const baseStyle = {
      background: getGradient(baseAngle, baseColor1, baseColor2),
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent' // Fallback
    };

    // Very subtle difference in gradient angle or one color
    const diffAngle = (baseAngle + 25) % 360;
    const diffStyle = {
      ...baseStyle,
      background: getGradient(diffAngle, baseColor1, baseColor2)
    };

    for (let i = 0; i < 4; i++) {
      trialShapes.push({
        type: shapeType,
        style: (!isAllSame && i === differentIndex) ? diffStyle : baseStyle as React.CSSProperties
      });
    }
  }

  return { shapes: trialShapes, isAllSame, differentIndex };
};

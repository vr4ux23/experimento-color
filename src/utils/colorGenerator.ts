import type { ShapeType } from '../components/Shapes';
import { shapes } from '../components/Shapes';

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

const getRandomHSL = (hRange = [0, 360], sRange = [60, 90], lRange = [45, 55]) => {
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
    const differentColor = getRandomHSL([(baseColor.h + 60) % 360, (baseColor.h + 300) % 360]);
    
    for (let i = 0; i < 4; i++) {
      const color = (!isAllSame && i === differentIndex) ? differentColor : baseColor;
      trialShapes.push({
        type: shapeType,
        style: { color: hslToString(color) }
      });
    }
  } else if (difficulty === 'intermediate') {
    const baseColor = getRandomHSL();
    const differentColor = { ...baseColor };
    // Diferencia sutil de tono (12 grados)
    differentColor.h = (baseColor.h + 12) % 360;

    for (let i = 0; i < 4; i++) {
      const color = (!isAllSame && i === differentIndex) ? differentColor : baseColor;
      trialShapes.push({
        type: shapeType,
        style: { color: hslToString(color) }
      });
    }
  } else {
    // Difícil: Gradientes
    const baseColor1 = getRandomHSL();
    const baseColor2 = getRandomHSL([(baseColor1.h + 40) % 360, (baseColor1.h + 320) % 360]);
    
    const getGradient = (c1: {h:number, s:number, l:number}, c2: {h:number, s:number, l:number}) => 
      `linear-gradient(180deg, ${hslToString(c1)} 0%, ${hslToString(c2)} 100%)`;

    const baseStyle = {
      background: getGradient(baseColor1, baseColor2)
    };

    // Gradiente diferente: invertimos los colores o cambiamos uno sutilmente
    const diffStyle = {
      background: getGradient(baseColor2, baseColor1)
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

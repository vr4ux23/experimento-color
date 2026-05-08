import React from 'react';

export interface ShapeProps {
  style?: React.CSSProperties;
  className?: string;
  gradientId?: string;
}

const WithColor = ({ children, style, gradientId }: { children: React.ReactNode, style?: React.CSSProperties, gradientId?: string }) => {
  if (gradientId && style?.background) {
    const background = style.background.toString();
    const colors = background.match(/hsl\([^)]+\)/g);
    
    if (colors && colors.length >= 2) {
      return (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          <g fill={`url(#${gradientId})`}>{children}</g>
        </>
      );
    }
  }

  // Fallback a color sólido (HSL directo)
  return <g fill={style?.color || 'currentColor'}>{children}</g>;
};

const Paths = {
  apple: (
    <>
      <path d="M12,2C11.38,2 10.5,2.44 10.15,3.15C9.4,2.44 8.5,2 7.5,2C5.57,2 4,3.57 4,5.5C4,8.22 7.07,11.3 12,16.5C16.93,11.3 20,8.22 20,5.5C20,3.57 18.43,2 16.5,2C15.5,2 14.6,2.44 13.85,3.15C13.5,2.44 12.62,2 12,2M12,18.5C11.5,18.5 11,18.56 10.55,18.67L10.33,19H7C6.45,19 6,19.45 6,20C6,20.55 6.45,21 7,21H17C17.55,21 18,20.55 18,20C18,19.45 17.55,19 17,19H13.67L13.45,18.67C13,18.56 12.5,18.5 12,18.5Z" />
      <path d="M12,2C13.08,2 14.33,2.77 15,3.75C14,3.88 13.14,4.5 12.6,5.32C12.43,5.1 12.22,4.91 12,4.75C11.78,4.91 11.57,5.1 11.4,5.32C10.86,4.5 10,3.88 9,3.75C9.67,2.77 10.92,2 12,2Z" />
    </>
  ),
  car: <path d="M18.92,6.01C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6.01L3,12V20C3,20.55 3.45,21 4,21H5C5.55,21 6,20.55 6,20V19H18V20C18,20.55 18.45,21 19,21H20C20.55,21 21,20.55 21,20V12L18.92,6.01M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M5,11L6.5,6.5H17.5L19,11H5Z" />,
  bird: <path d="M21,5C21,5 19,4 17,4C14,4 12,6 12,6C12,6 10,4 7,4C5,4 3,5 3,5C3,5 3,8 5,10C3,13 3,16 5,18C7,20 10,21 12,21C14,21 17,20 19,18C21,16 21,13 19,10C21,8 21,5 21,5M12,19C10.34,19 9,17.66 9,16C9,14.34 10.34,13 12,13C13.66,13 15,14.34 15,16C15,17.66 13.66,19 12,19Z" />,
  leaf: <path d="M17,8C17,11.31 14.31,14 11,14C7.69,14 5,11.31 5,8C5,4.69 7.69,2 11,2C14.31,2 17,4.69 17,8M11,16C13.78,16 16.34,15.04 18.37,13.41L21,16L19,18L21,20L19,22L11,16Z" />,
  bottle: <path d="M10,2V4H14V2H10M7,12C7,10 8.5,7.12 10,6H14C15.5,7.12 17,10 17,12V20C17,21.11 16.11,22 15,22H9C7.89,22 7,21.11 7,20V12Z" />,
  chair: <path d="M4,18V21H6V18H18V21H20V18C20,15.79 18.21,14 16,14H8C5.79,14 4,15.79 4,18M17,13H7V3H5V13H7V13H17V13V13H19V3H17V13Z" />
};

export const Apple = (props: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={props.className}>
    <WithColor style={props.style} gradientId={props.gradientId}>{Paths.apple}</WithColor>
  </svg>
);

export const Car = (props: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={props.className}>
    <WithColor style={props.style} gradientId={props.gradientId}>{Paths.car}</WithColor>
  </svg>
);

export const Bird = (props: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={props.className}>
    <WithColor style={props.style} gradientId={props.gradientId}>{Paths.bird}</WithColor>
  </svg>
);

export const Leaf = (props: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={props.className}>
    <WithColor style={props.style} gradientId={props.gradientId}>{Paths.leaf}</WithColor>
  </svg>
);

export const Bottle = (props: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={props.className}>
    <WithColor style={props.style} gradientId={props.gradientId}>{Paths.bottle}</WithColor>
  </svg>
);

export const Chair = (props: ShapeProps) => (
  <svg viewBox="0 0 24 24" className={props.className}>
    <WithColor style={props.style} gradientId={props.gradientId}>{Paths.chair}</WithColor>
  </svg>
);

export const shapes = {
  apple: Apple,
  car: Car,
  bird: Bird,
  leaf: Leaf,
  bottle: Bottle,
  chair: Chair,
};

export type ShapeType = keyof typeof shapes;

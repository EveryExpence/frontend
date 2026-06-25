import React from "react";
import { PixelRatio, TextStyle } from "react-native";

const MIN_FONT_SIZE = 18;
const STEP = 1;

export const useAutoFitText = (
  text: string,
  maxFontSize: number,
  options?: { weight?: TextStyle["fontWeight"]; letterSpacing?: number }
) => {
  const [fontSize, setFontSize] = React.useState(maxFontSize);
  const [width, setWidth] = React.useState(0);

  const onLayout = React.useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      setWidth(e.nativeEvent.layout.width);
    },
    []
  );

  React.useEffect(() => {
    if (!text || width <= 0) return;
    const fontScale = PixelRatio.getFontScale();
    const measured = measureTextWidth(text, {
      fontSize: maxFontSize,
      fontWeight: options?.weight,
      letterSpacing: options?.letterSpacing,
    });
    let next = maxFontSize;
    while (next > MIN_FONT_SIZE && measured * (next / maxFontSize) > width) {
      next -= STEP;
    }
    setFontSize(next / fontScale);
  }, [text, width, maxFontSize, options?.weight, options?.letterSpacing]);

  return { fontSize, onLayout };
};

const measureTextWidth = (
  text: string,
  style: { fontSize: number; fontWeight?: TextStyle["fontWeight"]; letterSpacing?: number }
): number => {
  const avgCharWidth = style.fontWeight === "bold" ? 0.62 : 0.56;
  const letterSpacing = style.letterSpacing ?? 0;
  return text.length * style.fontSize * avgCharWidth + text.length * letterSpacing;
};

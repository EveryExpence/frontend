import React from "react";
import { Animated, View } from "react-native";

interface PaginationDotsProps {
  pages: any[];
  pageIndex: number;
  animatedIndex: Animated.Value;
  tintColor: string;
}

export function PaginationDots({
  pages,
  pageIndex,
  animatedIndex,
  tintColor,
}: PaginationDotsProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 12,
      }}
    >
      {pages.map((_, i) => {
        const dotWidth = animatedIndex.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [8, 64, 8],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i}
            style={{
              width: dotWidth,
              height: 8,
              borderRadius: 8,
              backgroundColor:
                i === pageIndex ? tintColor : "#FFFFFF",
              marginHorizontal: 4,
            }}
          />
        );
      })}
    </View>
  );
}

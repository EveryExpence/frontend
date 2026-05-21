import React from "react";
import { Animated, View } from "react-native";

interface PaginationDotsProps {
  pages: any[];
  pageIndex: number;
  animatedIndex: Animated.Value;
}

export function PaginationDots({
  pages,
  pageIndex,
  animatedIndex,
}: PaginationDotsProps) {
  return (
    <View className="flex-row justify-center py-3">
      {pages.map((_, i) => {
        const dotWidth = animatedIndex.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [8, 64, 8],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={i}
            className={i === pageIndex ? "bg-theme-tint" : "bg-theme-textLight"}
            style={{
              width: dotWidth,
              height: 8,
              borderRadius: 8,
              marginHorizontal: 4,
            }}
          />
        );
      })}
    </View>
  );
}

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/context/themeContext";
import type { AppTheme } from "@/types/theme";

type BgConfig = {
  uri: string;
  overlayColor: string;
  duration: number;
  scaleDelta: number;
  panX: number;
  panY: number;
};

const BACKGROUNDS: Partial<Record<AppTheme, BgConfig>> = {
  pride: {
    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Vista_de_la_Marcha_del_orgullo_LGBT_CDMX_2019_-_53.jpg/1280px-Vista_de_la_Marcha_del_orgullo_LGBT_CDMX_2019_-_53.jpg",
    overlayColor: "rgba(26, 26, 46, 0.50)",
    duration: 20000,
    scaleDelta: 0.15,
    panX: 15,
    panY: 10,
  },

  cyberpunk: {
    uri: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=60",
    overlayColor: "rgba(13, 2, 33, 0.58)",
    duration: 18000,
    scaleDelta: 0.12,
    panX: 12,
    panY: -8,
  },

  gruvbox: {
    uri: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=900&q=60",
    overlayColor: "rgba(40, 40, 40, 0.62)",
    duration: 22000,
    scaleDelta: 0.12,
    panX: -10,
    panY: 8,
  },

  "cherry-blossom": {
    uri: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=900&q=60",
    overlayColor: "rgba(26, 26, 46, 0.52)",
    duration: 20000,
    scaleDelta: 0.14,
    panX: 12,
    panY: -10,
  },

  nord: {
    uri: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=60",
    overlayColor: "rgba(46, 52, 64, 0.52)",
    duration: 24000,
    scaleDelta: 0.10,
    panX: -8,
    panY: 6,
  },

  "one-dark": {
    uri: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=900&q=60",
    overlayColor: "rgba(40, 44, 52, 0.50)",
    duration: 20000,
    scaleDelta: 0.12,
    panX: 10,
    panY: -8,
  },

  catppuccin: {
    uri: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?auto=format&fit=crop&w=900&q=60",
    overlayColor: "rgba(30, 30, 46, 0.55)",
    duration: 22000,
    scaleDelta: 0.13,
    panX: -12,
    panY: 10,
  },
};

const KenBurnsBackground = ({ config }: { config: BgConfig }) => {
  const progress = useSharedValue(0);

  const sDelta = useSharedValue(config.scaleDelta);
  const pX = useSharedValue(config.panX);
  const pY = useSharedValue(config.panY);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: config.duration / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: config.duration / 2,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1.0 + progress.value * sDelta.value },
      { translateX: progress.value * pX.value },
      { translateY: progress.value * pY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageWrapper, animatedStyle]}>
        <Image
          source={config.uri}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={800}
        />
      </Animated.View>
      {/* Theme-tinted overlay for readability */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: config.overlayColor },
        ]}
      />
    </View>
  );
};


const AnimatedBackground = () => {
  const { theme } = useTheme();
  const config = BACKGROUNDS[theme];

  if (!config) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <KenBurnsBackground key={theme} config={config} />
    </View>
  );
};

export default AnimatedBackground;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  imageWrapper: {
    position: "absolute",
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
  },
});

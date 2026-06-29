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
  dark: {
    uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F013%2F630%2F281%2Flarge_2x%2Finteresting-gradient-design-blue-black-free-photo.jpg&f=1&nofb=1&ipt=945abd112d6fff9ef02f5358f4c8cae7b5f84f013175111beb7e6e8a92a67198",
    overlayColor: "rgba(0, 0, 0, 0.4)",
    duration: 22000,
    scaleDelta: 0.12,
    panX: 10,
    panY: 8,
  },
  light: {
    uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.magnific.com%2Fpremium-vector%2Fabstract-gradient-background-white-blue_884160-5573.jpg&f=1&nofb=1&ipt=ce6f6e756193d3ed5c62a0f15f8825b324db4b6097a53dd64c5a2f89ba1819c4",
    overlayColor: "rgba(255, 255, 255, 0.4)",
    duration: 22000,
    scaleDelta: 0.12,
    panX: -10,
    panY: -8,
  },
  pride: {
    uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fc4%2Fae%2F76%2Fc4ae761160957bce7c44e568a26eac1c.jpg%3Fnii%3Dt&f=1&nofb=1&ipt=4d9a5e3d2acccff80789f3ff3e64c743db68dfb52521020c4fce84abfc96d8e6",
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

  if (!config) { return null; }

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

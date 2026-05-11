import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type AppIconProps = React.ComponentProps<typeof MaterialCommunityIcons>;

export default function AppIcon(props: AppIconProps) {
  return <MaterialCommunityIcons {...props} />;
}

import React from 'react';
import { ActivityIndicator, Image, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../ui/theme/colors';

const logo = require('../../../assets/app-logo.png');

export function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const logoSize = Math.min(260, Math.round(Math.min(width, height) * 0.46));

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <Image source={logo} style={{ width: logoSize, height: logoSize }} resizeMode="contain" />
      </View>

      <View style={{ paddingBottom: Math.max(28, insets.bottom + 18), alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
}

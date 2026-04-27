import React from 'react';
import { ActivityIndicator, Image, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_BASE_URL } from '../../config';
import { colors } from '../../ui/theme/colors';

const logo = require('../../../assets/app-logo.png');

export function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  React.useEffect(() => {
    const base = API_BASE_URL.replace(/\/+$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    void fetch(`${base}/`, { method: 'GET', signal: controller.signal }).catch(() => {});

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const logoSize = Math.min(1500, Math.round(Math.min(width, height) * 2.00));

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

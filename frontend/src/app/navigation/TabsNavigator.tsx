import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from './types';
import { colors } from '../../ui/theme/colors';
import { ThemeToggle } from '../../ui/components/ThemeToggle';
import { useThemeStore } from '../../store/themeStore';
import { FeaturedScreen } from '../screens/tabs/FeaturedScreen';
import { SearchScreen } from '../screens/tabs/SearchScreen';
import { MyLearningScreen } from '../screens/tabs/MyLearningScreen';
import { WishlistScreen } from '../screens/tabs/WishlistScreen';
import { AccountScreen } from '../screens/tabs/AccountScreen';

type TabKey = 'Featured' | 'Search' | 'MyLearning' | 'Wishlist' | 'Account';

type Props = NativeStackScreenProps<RootStackParamList, 'Tabs'>;

export function TabsNavigator({ navigation }: Props) {
  const [tab, setTab] = useState<TabKey>('Featured');
  const insets = useSafeAreaInsets();
  useThemeStore((s) => s.mode);

  const title = useMemo(() => {
    if (tab === 'Featured') return 'Featured';
    if (tab === 'Search') return 'Search';
    if (tab === 'MyLearning') return 'My learning';
    if (tab === 'Wishlist') return 'Wishlist';
    return 'Account';
  }, [tab]);

  const content =
    tab === 'Featured' ? (
      <FeaturedScreen navigation={navigation} />
    ) : tab === 'Search' ? (
      <SearchScreen navigation={navigation} />
    ) : tab === 'MyLearning' ? (
      <MyLearningScreen navigation={navigation} />
    ) : tab === 'Wishlist' ? (
      <WishlistScreen navigation={navigation} />
    ) : (
      <AccountScreen navigation={navigation} />
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: Math.max(12, insets.top) + 6,
          paddingBottom: 10,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
        <ThemeToggle />
      </View>

      <View style={{ flex: 1 }}>{content}</View>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingVertical: 10,
          paddingBottom: Math.max(10, insets.bottom),
        }}
      >
        <TabButton label="Featured" icon={'\u2605'} active={tab === 'Featured'} onPress={() => setTab('Featured')} />
        <TabButton label="Search" icon={'\u2315'} active={tab === 'Search'} onPress={() => setTab('Search')} />
        <TabButton label="My learning" icon={'\u25B6'} active={tab === 'MyLearning'} onPress={() => setTab('MyLearning')} />
        <TabButton label="Wishlist" icon={'\u2661'} active={tab === 'Wishlist'} onPress={() => setTab('Wishlist')} />
        <TabButton label="Account" icon={'\u{1F464}'} active={tab === 'Account'} onPress={() => setTab('Account')} />
      </View>
    </View>
  );
}

function TabButton(props: { label: string; icon: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: props.active ? colors.primary : colors.mutedText, fontSize: 18, fontWeight: '900' }}>
        {props.icon}
      </Text>
      <Text style={{ color: props.active ? colors.primary : colors.mutedText, fontSize: 10, marginTop: 2 }}>
        {props.label}
      </Text>
    </Pressable>
  );
}

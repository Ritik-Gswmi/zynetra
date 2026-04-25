import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../../store/authStore';

export function WelcomeScreen(props: { navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'> }) {
  const insets = useSafeAreaInsets();
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const [pageWidth, setPageWidth] = useState(0);
  const [page, setPage] = useState(0);

  const images = useMemo(
    () => [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=70',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=70',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=70',
    ],
    [],
  );

  const copy = useMemo(
    () => ({
      title: 'Learn Anytime',
      subtitle: 'Take video courses, learn from the best,\nand go at your own pace.',
    }),
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ flex: 1, paddingTop: Math.max(18, insets.top), paddingHorizontal: 18 }}>
        <View
          style={{ flex: 1, justifyContent: 'center' }}
          onLayout={(e) => setPageWidth(Math.max(1, Math.round(e.nativeEvent.layout.width)))}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const w = pageWidth || e.nativeEvent.layoutMeasurement.width || 1;
              const next = Math.round(e.nativeEvent.contentOffset.x / w);
              if (next !== page) setPage(next);
            }}
          >
            {images.map((uri) => (
              <View key={uri} style={{ width: pageWidth || 1, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri }} style={{ width: 260, height: 260, borderRadius: 26, opacity: 0.92 }} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 18, justifyContent: 'center' }}>
            {images.map((_, i) => (
              <Dot key={i} active={i === page} />
            ))}
          </View>
        </View>

        <View style={{ paddingBottom: 18, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: '900', textAlign: 'center' }}>{copy.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 16, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
            {copy.subtitle}
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: 'black' }}>
        <View
          style={{
            backgroundColor: 'white',
            paddingTop: 14,
            paddingHorizontal: 22,
            paddingBottom: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <BottomAction
            label="Guest"
            onPress={async () => {
              await continueAsGuest();
              props.navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
            }}
          />
          <BottomAction label="Login" onPress={() => props.navigation.navigate('Login')} />
        </View>
        <View style={{ height: Math.max(18, insets.bottom + 18), backgroundColor: 'black' }} />
      </View>
    </View>
  );
}

function Dot(props: { active?: boolean }) {
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: props.active ? 'white' : 'rgba(255,255,255,0.35)',
      }}
    />
  );
}

function BottomAction(props: { label: string; onPress: () => void | Promise<void> }) {
  return (
    <Pressable onPress={props.onPress} style={{ paddingVertical: 10, paddingHorizontal: 10, flex: 1 }}>
      <Text
        style={{
          color: '#0F172A',
          fontSize: 24,
          fontWeight: '900',
          textAlign: 'center',
        }}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

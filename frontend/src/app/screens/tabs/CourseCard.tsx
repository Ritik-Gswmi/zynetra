import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../ui/theme/colors';
import { Card } from '../../../ui/components/Card';
import type { Course } from '../../../api/types';
import { useWishlistStore } from '../../../store/wishlistStore';
import { useThemeStore } from '../../../store/themeStore';

export function CourseCard(props: {
  course: Course;
  onPress: () => void;
  footer?: React.ReactNode;
}) {
  const wished = useWishlistStore((s) => s.has(props.course.id));
  const toggle = useWishlistStore((s) => s.toggle);
  useThemeStore((s) => s.mode);

  return (
    <Pressable onPress={props.onPress} style={({ pressed }) => [styles.wrap, pressed ? styles.pressed : null]}>
      <Card>
        <View style={styles.row}>
          {props.course.coverImageUrl ? (
            <Image source={{ uri: props.course.coverImageUrl }} style={[styles.imageBase, { backgroundColor: colors.surface }]} />
          ) : (
            <View style={[styles.fallbackBase, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.fallbackTextBase, { color: colors.mutedText }]}>{props.course.title.slice(0, 1)}</Text>
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={[styles.titleBase, { color: colors.text }]} numberOfLines={2}>
                {props.course.title}
              </Text>
              <Pressable onPress={() => toggle(props.course.id)} hitSlop={10} style={styles.wishButton}>
                <Text style={[styles.wishIconBase, { color: wished ? colors.primary : colors.mutedText }]}>
                  {wished ? '\u2665' : '\u2661'}
                </Text>
              </Pressable>
            </View>

            {props.course.instructorName ? (
              <Text style={[styles.bylineBase, { color: colors.mutedText }]}>By {props.course.instructorName}</Text>
            ) : null}

            <Text style={[styles.descriptionBase, { color: colors.mutedText }]} numberOfLines={3}>
              {props.course.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={[styles.pillBase, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={[styles.pillTextBase, { color: colors.mutedText }]}>{props.course.level}</Text>
              </View>
            </View>

            {props.footer ? <View style={styles.footer}>{props.footer}</View> : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  pressed: { opacity: 0.92 },
  row: { flexDirection: 'row', gap: 12 },
  imageBase: { width: 64, height: 64, borderRadius: 16 },
  fallbackBase: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackTextBase: { fontWeight: '700', fontSize: 18 },
  content: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' },
  titleBase: { fontSize: 16, fontWeight: '700', flex: 1, lineHeight: 22 },
  wishButton: { padding: 4, alignSelf: 'flex-start' },
  wishIconBase: { fontSize: 18, fontWeight: '700' },
  bylineBase: { marginTop: 2 },
  descriptionBase: { marginTop: 6, lineHeight: 20 },
  metaRow: { marginTop: 10, flexDirection: 'row', gap: 8, alignItems: 'center' },
  pillBase: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillTextBase: { fontWeight: '600' },
  footer: { marginTop: 10 },
});

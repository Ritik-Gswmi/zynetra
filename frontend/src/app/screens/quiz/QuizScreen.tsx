import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../navigation/types';
import { useLesson, useSubmitQuiz } from '../../../api/hooks';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { ErrorView, EmptyView } from '../../../ui/components/StateViews';
import { Card } from '../../../ui/components/Card';
import { colors } from '../../../ui/theme/colors';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { useThemeStore } from '../../../store/themeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export function QuizScreen({ route, navigation }: Props) {
  const { courseId, lessonId } = route.params;
  useThemeStore((s) => s.mode);
  const insets = useSafeAreaInsets();
  const lessonQ = useLesson(courseId, lessonId);
  const submitM = useSubmitQuiz();

  const quiz = lessonQ.data?.quiz ?? [];
  const [answers, setAnswers] = useState<number[]>(() => quiz.map(() => -1));
  const [score, setScore] = useState<number | null>(null);

  const disabled = useMemo(() => submitM.isPending || !quiz.length, [submitM.isPending, quiz.length]);

  if (lessonQ.isLoading) return <FullScreenLoading label="Loading quiz..." />;
  if (lessonQ.isError) return <Screen>{<ErrorView message={(lessonQ.error as Error).message} onRetry={lessonQ.refetch} />}</Screen>;
  if (!quiz.length) return <Screen>{<EmptyView title="No quiz for this lesson" />}</Screen>;

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{lessonQ.data?.title}</Text>
      <Text style={{ color: colors.mutedText, marginTop: 8 }}>Answer all questions, then submit.</Text>

      {quiz.map((q, qi) => (
        <Card key={q.id} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '900' }}>
            {qi + 1}. {q.question}
          </Text>
          <View style={{ marginTop: 10, gap: 8 }}>
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              return (
                <Pressable
                  key={opt}
                  onPress={() => {
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[qi] = oi;
                      return next;
                    });
                  }}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? 'rgba(124,92,255,0.15)' : colors.surface,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: selected ? '800' : '600' }}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}

      {score !== null ? (
        <Card style={{ marginTop: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>Score: {score}%</Text>
          <PrimaryButton label="Back to lesson" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
        </Card>
      ) : (
        <PrimaryButton
          label={submitM.isPending ? 'Submitting...' : 'Submit quiz'}
          disabled={disabled}
          onPress={async () => {
            if (answers.some((a) => a < 0)) {
              Alert.alert('Incomplete', 'Answer all questions, then submit');
              return;
            }
            try {
              const s = await submitM.mutateAsync({ courseId, lessonId, answers });
              setScore(s);
              void useAnalyticsStore.getState().track('quiz_submitted', { courseId, lessonId, score: s });
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Failed to submit quiz';
              if (/login required/i.test(msg)) {
                Alert.alert('Login required', 'Please login to submit quizzes and save your score.');
                navigation.navigate('Login');
                return;
              }
              Alert.alert('Failed', msg);
            }
          }}
          style={{ marginTop: 14 }}
        />
      )}

      <View style={{ height: Math.max(18, insets.bottom + 18) }} />
    </Screen>
  );
}

import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { View, Alert, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSubjectDetails } from '../hooks/use-subject-details';
import { useSubjectAbsence } from '../hooks/use-subject-absence';
import { useActionSheet } from '@expo/react-native-action-sheet';

export const SubjectDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subject } = useSubjectDetails(id);
  const {
    addAbsence,
    removeAbsence,
    resetAbsences,
    setAbsences,
    totalClasses,
    maxAbsences,
    absences,
    remainingAbsences,
  } = useSubjectAbsence(id);
  const { showActionSheetWithOptions } = useActionSheet();

  const handleResetAbsences = () => {
    showActionSheetWithOptions(
      {
        title: 'Redefinir Faltas',
        message: 'Tem certeza que deseja redefinir todas as faltas?',
        options: ['Redefinir', 'Cancelar'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          resetAbsences();
        }
      }
    );
  };

  const handleSetAbsences = () => {
    Alert.prompt(
      'Definir Faltas',
      'Digite o número de faltas:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Salvar',
          onPress: (value) => {
            const number = parseInt(value || '0', 10);
            if (!isNaN(number)) {
              setAbsences(number);
            }
          },
        },
      ],
      'plain-text',
      absences.toString()
    );
  };

  if (!subject) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text variant="callout" color="tertiary">
            Matéria não encontrada
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container scrollable className="px-4">
      <View className="py-4">
        <Text variant="title1" numberOfLines={2} className="mb-1">
          {subject.name}
        </Text>
        <Text variant="subhead" color="tertiary">
          {subject.code} • Turma {subject.classGroup}
        </Text>
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl bg-card">
        <View className="border-b border-border p-4">
          <Text variant="title3" className="mb-1">
            Frequência
          </Text>
          <Text variant="footnote" color="tertiary">
            Acompanhe sua frequência nesta disciplina
          </Text>
        </View>

        <View className="p-4">
          <View className="mb-6 flex-row items-center justify-center">
            <Pressable
              onPress={removeAbsence}
              disabled={absences === 0}
              className="bg-secondary/10 active:bg-secondary/20 h-12 w-12 items-center justify-center rounded-full disabled:opacity-30">
              <Text variant="title2">−</Text>
            </Pressable>

            <Pressable onPress={handleSetAbsences} className="mx-6 items-center active:opacity-70">
              <Text variant="largeTitle" className="mb-1">
                {absences}
              </Text>
              <Text variant="caption2" color="tertiary">
                FALTAS
              </Text>
            </Pressable>

            <Pressable
              onPress={addAbsence}
              className="bg-secondary/10 active:bg-secondary/20 h-12 w-12 items-center justify-center rounded-full">
              <Text variant="title2">+</Text>
            </Pressable>
          </View>

          <View className="bg-secondary/5 flex-row justify-between rounded-xl p-4">
            <View>
              <Text variant="callout">{totalClasses}</Text>
              <Text variant="caption2" color="tertiary">
                Total de Aulas
              </Text>
            </View>
            <View className="items-center">
              <Text variant="callout">{maxAbsences}</Text>
              <Text variant="caption2" color="tertiary">
                Máximo de Faltas
              </Text>
            </View>
            <View className="items-end">
              <Text variant="callout">{remainingAbsences}</Text>
              <Text variant="caption2" color="tertiary">
                Faltas Restantes
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleResetAbsences}
          disabled={absences === 0}
          className="active:bg-secondary/10 flex-row items-center justify-center border-t border-border p-4">
          <Text variant="body" color="tertiary" className={absences === 0 ? 'opacity-30' : ''}>
            Redefinir faltas
          </Text>
        </Pressable>
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl bg-card">
        <View className="border-b border-border p-4">
          <Text variant="title3" className="mb-1">
            {subject.professors.length > 1 ? 'Professores' : 'Professor'}
          </Text>
        </View>
        {subject.professors.map((professor, index) => (
          <View
            key={index}
            className={`p-4 ${
              index !== subject.professors.length - 1 ? 'border-b border-border' : ''
            }`}>
            <Text variant="body">{professor}</Text>
          </View>
        ))}
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl bg-card">
        <View className="border-b border-border p-4">
          <Text variant="title3" className="mb-1">
            Horários
          </Text>
        </View>
        {subject.schedule.map((time, index) => (
          <View
            key={index}
            className={`p-4 ${
              index !== subject.schedule.length - 1 ? 'border-b border-border' : ''
            }`}>
            <View className="mb-1 flex-row items-center justify-between">
              <Text variant="body">
                {time.startTime} - {time.endTime}
              </Text>
              <Text variant="subhead" color="tertiary">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][time.weekDay]}
              </Text>
            </View>
            <Text variant="footnote" color="tertiary">
              {time.room} • {time.center}
            </Text>
          </View>
        ))}
      </View>
    </Container>
  );
};

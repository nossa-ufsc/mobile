import React, { useState } from 'react';
import { View, Pressable, Image, Alert } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { DatePicker } from '@/ui/date-picker';
import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { EventCard } from './event-card';
import { Event } from '@/types';
import { uploadEventImage } from '../utils/upload-image';
import { supabase } from '@/utils/supabase';
import { cn } from '@/utils/cn';

interface NewEventSheetProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const NewEventSheet = ({ onClose, onSuccess }: NewEventSheetProps) => {
  const { colors } = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const { user, campus } = useEnvironmentStore();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64!,
      });
    }
  };

  const handlePreview = () => {
    if (!name || !location || !image) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Erro', 'A data de término deve ser posterior à data de início');
      return;
    }

    setIsPreviewMode(true);
  };

  const onSubmit = async () => {
    const imageUrl = await uploadEventImage(image!.base64);

    const eventData: Omit<Event, 'id' | 'created_at'> = {
      name,
      location,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      image_url: imageUrl,
      campus,
      created_by: {
        name: user!.name,
        enrollmentNumber: user!.enrollmentNumber,
      },
    };

    const { error } = await supabase.from('events').insert(eventData);

    if (error) throw error;

    onSuccess?.();
    onClose?.();
  };

  const handleSubmit = async () => {
    try {
      setIsPublishing(true);
      await onSubmit();
    } catch (error) {
      console.error('Error publishing event:', error);
      Alert.alert('Erro', 'Não foi possível criar o evento. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isPreviewMode) {
    const previewData: Event = {
      id: 'preview',
      created_at: new Date().toISOString(),
      name,
      location,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      image_url: image!.uri,
      campus,
      created_by: {
        name: user!.name,
        enrollmentNumber: user!.enrollmentNumber,
      },
    };

    return (
      <View className="flex-1 px-6 pt-2">
        <View className="mb-8">
          <Text variant="title1" color="primary" className="mb-2">
            Prévia do Evento
          </Text>
          <Text variant="footnote" color="secondary">
            Confira se as informações estão corretas antes de publicar. Seu nome será exibido como
            criador do evento.
          </Text>
        </View>
        <EventCard event={previewData} />
        <View style={{ paddingBottom: bottom + 16 }} className="mt-auto flex-row gap-2">
          <Button
            variant="secondary"
            onPress={() => setIsPreviewMode(false)}
            className="flex-1"
            disabled={isPublishing}>
            <Text className="font-medium">Editar</Text>
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            isLoading={isPublishing}
            className={cn('flex-1', isPublishing && 'opacity-70')}
            disabled={isPublishing}>
            <Text className="font-medium">Publicar</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 pt-2">
      <View className="mb-6">
        <Text className="text-2xl font-bold">Novo Evento</Text>
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Nome
          </Text>
          <BottomSheetTextInput
            placeholder="Digite o nome do evento"
            value={name}
            onChangeText={setName}
            style={{
              padding: 16,
              borderRadius: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.grey2,
              color: colors.foreground,
            }}
          />
        </View>

        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Local
          </Text>
          <BottomSheetTextInput
            placeholder="Digite o local do evento"
            value={location}
            onChangeText={setLocation}
            style={{
              padding: 16,
              borderRadius: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.grey2,
              color: colors.foreground,
            }}
          />
        </View>

        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Data de Início
          </Text>
          <DatePicker
            locale="pt-BR"
            mode="datetime"
            onChange={(_, date) => date && setStartDate(date)}
            value={startDate}
            minimumDate={new Date()}
            minuteInterval={5}
          />
        </View>

        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Data de Término
          </Text>
          <DatePicker
            locale="pt-BR"
            mode="datetime"
            onChange={(_, date) => date && setEndDate(date)}
            value={endDate}
            minimumDate={startDate}
            minuteInterval={5}
          />
        </View>

        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Imagem do Evento
          </Text>
          <Pressable onPress={handleImagePick} className="h-48 overflow-hidden rounded-xl">
            {image ? (
              <Image source={{ uri: image.uri }} className="h-full w-full" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={48} color={colors.grey} />
                <Text className="mt-2 text-gray-500">Toque para selecionar uma imagem</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <Button
        variant="primary"
        onPress={handlePreview}
        disabled={!name || !location || !image}
        style={{ marginBottom: bottom + 16 }}
        className="mt-auto">
        <Text className="font-medium text-white">Visualizar</Text>
      </Button>
    </View>
  );
};

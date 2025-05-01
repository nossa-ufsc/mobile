import { supabase } from '@/utils/supabase';
import { decode } from 'base64-arraybuffer';

export const uploadEventImage = async (base64Image: string) => {
  try {
    const fileName = `${Date.now()}.jpg`;
    const filePath = `events-images/${fileName}`;

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('events')
      .upload(filePath, decode(base64Image), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('events').getPublicUrl(uploadData.path);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

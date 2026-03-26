import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Shadows } from '../constants/theme';
import { IdeaCategory, CATEGORIES } from '../lib/types';
import VoiceInput from './VoiceInput';

interface QuickCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string | null,
    category: IdeaCategory | null,
    imageUri: string | null
  ) => void;
}

export default function QuickCaptureModal({ visible, onClose, onSubmit }: QuickCaptureModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IdeaCategory | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Give your idea a name to save it.');
      return;
    }
    onSubmit(title.trim(), description.trim() || null, category, imageUri);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(null);
    setImageUri(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleVoiceTranscription = (text: string) => {
    setDescription((prev) => (prev ? `${prev}\n${text}` : text));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textDim} />
          </Pressable>
          <Text style={styles.headerTitle}>Capture Idea</Text>
          <Pressable onPress={handleSubmit} style={styles.submitButton}>
            <Ionicons name="checkmark" size={20} color={Colors.bg} />
            <Text style={styles.submitText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What's the big idea?"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
            maxLength={120}
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add some details..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Voice + Image row */}
          <View style={styles.mediaRow}>
            <VoiceInput onTranscription={handleVoiceTranscription} />
            <Pressable onPress={pickImage} style={styles.imageButton}>
              <Ionicons name="image" size={20} color={Colors.accent} />
              <Text style={styles.imageButtonText}>Photo</Text>
            </Pressable>
          </View>

          {/* Image preview */}
          {imageUri && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Pressable
                onPress={() => setImageUri(null)}
                style={styles.removeImage}
              >
                <Ionicons name="close-circle" size={24} color={Colors.danger} />
              </Pressable>
            </View>
          )}

          {/* Category picker */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(category === cat ? null : cat)}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    ...Shadows.fab,
  },
  submitText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  label: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  titleInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 14,
    minHeight: 100,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  imageButtonText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  imagePreview: {
    marginTop: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 40,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.gold + '20',
    borderColor: Colors.gold,
  },
  categoryChipText: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Colors.gold,
  },
});

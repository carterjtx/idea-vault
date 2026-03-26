import React, { useState, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Colors } from '../constants/theme';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
}

export default function VoiceInput({ onTranscription }: VoiceInputProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      startPulse();
    } catch {
      // Microphone permission denied or error — fail silently
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    stopPulse();

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      // Note: In production, you'd send the audio file to a transcription service.
      // For now, we notify the user that voice was captured.
      onTranscription('[Voice note recorded — transcription requires a speech-to-text service]');
    } catch {
      // Handle error silently
    }

    setRecording(null);
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Pressable
        onPress={isRecording ? stopRecording : startRecording}
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
        ]}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={20}
          color={isRecording ? Colors.danger : Colors.gold}
        />
        <Text style={[styles.text, isRecording && styles.textRecording]}>
          {isRecording ? 'Stop' : 'Voice'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold + '15',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  buttonRecording: {
    backgroundColor: Colors.danger + '15',
    borderColor: Colors.danger + '30',
  },
  text: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  textRecording: {
    color: Colors.danger,
  },
});

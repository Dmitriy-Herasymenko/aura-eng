import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { AuraBackground } from '@/src/components/AuraBackground';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Word {
    id: number;
    wordEng: string;
    wordUA: string;
    transcription: string;
}

export default function DictionaryScreen() {
    const [savedWords, setSavedWords] = useState<Word[]>([]);
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const loadWords = async () => {
                try {
                    const jsonValue = await AsyncStorage.getItem('savedWords');
                    const words = jsonValue != null ? JSON.parse(jsonValue) : [];
                    if (isActive) setSavedWords(words);
                } catch (e) {
                    console.error("Error loading words:", e);
                }
            };

            loadWords();
            return () => { isActive = false; };
        }, [])
    );

    const removeWord = async (id: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const updatedWords = savedWords.filter(w => w.id !== id);
        setSavedWords(updatedWords);
        await AsyncStorage.setItem('savedWords', JSON.stringify(updatedWords));
    };

    return (
        <AuraBackground>

            <View style={[styles.container, { paddingTop: (insets.top || 60) + 10 }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Dictionary</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{savedWords.length}</Text>
                    </View>
                </View>

                <FlatList
                    data={savedWords}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-dislike-outline" size={60} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>Тут поки порожньо. Додай слова через серце у Vocabulary!</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <BlurView intensity={20} tint="light" style={styles.wordCard}>
                            <View style={styles.wordInfo}>
                                <Text style={styles.engWord}>{item.wordEng}</Text>
                                <Text style={[
                                    styles.transcription,
                                    { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }
                                ]}>
                                    {item.transcription}
                                </Text>
                                <Text style={styles.uaWord}>{item.wordUA}</Text>
                            </View>

                            <TouchableOpacity onPress={() => removeWord(item.id)} style={styles.deleteBtn}>
                                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                            </TouchableOpacity>
                        </BlurView>
                    )}
                />
            </View>
        </AuraBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    title: { color: '#F8FAF8', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
    countBadge: {
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10
    },
    countText: { color: '#38BDF8', fontWeight: 'bold' },
    listContent: { paddingBottom: 120 },
    wordCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        alignItems: 'center'
    },
    wordInfo: { flex: 1 },
    engWord: { color: '#F8FAF8', fontSize: 20, fontWeight: '800' },
    transcription: {
        color: '#38BDF8',
        fontSize: 14,
        marginTop: 2,
    },
    uaWord: { color: '#94A3B8', fontSize: 16, marginTop: 6, fontWeight: '500' },
    deleteBtn: { padding: 10 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#64748B', textAlign: 'center', marginTop: 15, paddingHorizontal: 40 },
});
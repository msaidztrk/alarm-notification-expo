import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';
import { NotificationService } from '@/services/NotificationService';

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];

export default function SettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  const { isDarkMode, setDarkMode, theme } = useTheme();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await setLanguage(languageCode);
      setIsLanguageModalVisible(false);

      Alert.alert(
        t('common.success'),
        `Language changed to ${languages.find(lang => lang.code === languageCode)?.nativeName}`,
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        'Failed to change language. Please try again.',
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('settings.deleteData') || 'Delete All Data',
      t('settings.deleteDataConfirm') || 'Are you sure you want to delete all alarms, notifications, and app data? This action cannot be undone.',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('common.delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Tüm bildirimleri iptal et
              await NotificationService.clearAllNotifications();

              // AsyncStorage'daki tüm verileri sil
              const keys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(keys);

              console.log('All data deleted successfully');

              Alert.alert(
                t('common.success') || 'Success',
                t('settings.deleteDataSuccess') || 'All data has been deleted. Please restart the app.',
                [{ text: t('common.ok') || 'OK' }]
              );
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert(
                t('common.error') || 'Error',
                t('settings.deleteDataError') || 'Failed to delete data. Please try again.',
                [{ text: t('common.ok') || 'OK' }]
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === language);
    return currentLang ? currentLang.nativeName : 'English';
  };

  const styles = getStyles(theme);

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        item.code === language && styles.selectedLanguageItem
      ]}
      onPress={() => handleLanguageChange(item.code)}
    >
      <View style={styles.languageItemContent}>
        <Text style={[
          styles.languageItemText,
          item.code === language && styles.selectedLanguageText
        ]}>
          {item.nativeName}
        </Text>
        {item.code === language && (
          <Ionicons
            name="checkmark"
            size={20}
            color="#007AFF"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* General Settings Section */}
        <Text style={styles.sectionTitle}>{t('settings.general') || 'General'}</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setIsLanguageModalVisible(true)}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#007AFF20' }]}>
                <Ionicons name="language" size={20} color="#007AFF" />
              </View>
              <Text style={styles.settingItemText}>{t('settings.language')}</Text>
            </View>
            <View style={styles.settingItemRight}>
              <Text style={styles.settingItemValue}>{getCurrentLanguageName()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={styles.separator} />

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#5856D620' }]}>
                <Ionicons name="moon" size={20} color="#5856D6" />
              </View>
              <Text style={styles.settingItemText}>{t('settings.darkMode')}</Text>
            </View>
            <View style={styles.settingItemRight}>
              <Switch
                value={isDarkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isDarkMode ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Danger Zone Section */}
        <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
          {t('settings.dangerZone') || 'Danger Zone'}
        </Text>
        <View style={[styles.section, styles.dangerSection]}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleDeleteAllData}
            disabled={isDeleting}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <View>
                <Text style={[styles.settingItemText, { color: '#EF4444' }]}>
                  {t('settings.deleteData') || 'Delete All Data'}
                </Text>
                <Text style={styles.settingItemSubtext}>
                  {t('settings.deleteDataDesc') || 'Remove all alarms and notifications'}
                </Text>
              </View>
            </View>
            <View style={styles.settingItemRight}>
              {isDeleting ? (
                <Text style={styles.deletingText}>...</Text>
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsLanguageModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <FlatList
            data={languages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            style={styles.languageList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  settingItemSubtext: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemValue: {
    fontSize: 15,
    color: theme.textSecondary,
    marginRight: 8,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 64,
  },
  deletingText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  modalPlaceholder: {
    width: 50,
  },
  languageList: {
    flex: 1,
    paddingTop: 20,
  },
  languageItem: {
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedLanguageItem: {
    backgroundColor: '#007AFF10',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  languageItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
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
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';

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
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setIsLanguageModalVisible(true)}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="language" size={24} color="#666" />
                            <Text style={styles.settingItemText}>{t('settings.language')}</Text>
            </View>
            <View style={styles.settingItemRight}>
              <Text style={styles.settingItemValue}>{getCurrentLanguageName()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="moon" size={24} color="#666" />
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
  section: {
    backgroundColor: theme.card,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginLeft: 12,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemValue: {
    fontSize: 16,
    color: theme.textSecondary,
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
    color: '#2c3e50',
  },
  modalPlaceholder: {
    width: 50,
  },
  languageList: {
    flex: 1,
    paddingTop: 20,
  },
  languageItem: {
    backgroundColor: '#fff',
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
    backgroundColor: '#f0f8ff',
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
    color: '#2c3e50',
  },
  selectedLanguageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
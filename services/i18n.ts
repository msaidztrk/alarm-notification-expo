import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      success: 'Success',
      error: 'Error'
    },
    tabs: {
      alarms: 'Alarms',
      add: 'Add Alarm',
      notifications: 'Notifications',
      settings: 'Settings'
    },
    alarms: {
      title: 'My Alarms',
      noAlarms: 'No alarms set',
      addFirstAlarm: 'Add your first alarm',
      timeWindow: 'Time Window',
      days: 'Days',
      name: 'Alarm Name',
      active: 'Active',
      inactive: 'Inactive'
    },
    addAlarm: {
      title: 'Add New Alarm',
      editTitle: 'Edit Alarm',
      alarmName: 'Alarm Name',
      alarmNamePlaceholder: 'e.g. Wake up',
      startTime: 'Start Time',
      endTime: 'End Time',
      activeHours: 'Active Hours',
      repeat: 'Repeat',
      daily: 'Every Day',
      once: 'One-Time',
      notificationInterval: 'Notification Frequency',
      every5Minutes: 'Every 5 minutes',
      every10Minutes: 'Every 10 minutes',
      every15Minutes: 'Every 15 minutes',
      every30Minutes: 'Every 30 minutes',
      every1Hour: 'Every 1 hour',
      selectDays: 'Select Days',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      alarmCreated: 'Alarm created successfully',
      alarmUpdated: 'Alarm updated successfully',
      fillAllFields: 'Please fill all fields',
      createTimeWindowAlarmSubtitle: 'Create a recurring alarm for your daily routine',
      enterAlarmNamePlaceholder: 'Morning workout, Work break, etc.',
      activeTimeWindow: 'Active Time Window',
      duration: 'Duration',
      alarmSettings: 'Alarm Settings',
      enableAlarm: 'Enable Alarm',
      enableAlarmSubtext: 'Activate notifications for this alarm',
      howItWorks: 'How it works',
      infoPoint1: 'Active daily during your selected time window',
      infoPoint2: 'Persistent notification until marked complete',
      infoPoint3: 'Automatically resets every day',
      infoActiveDaily: 'Active daily during your selected time window',
      infoPersistentNotification: 'Persistent notification until marked complete',
      infoAutoReset: 'Automatically resets every day',
      selectStartTime: 'Select Start Time',
      selectEndTime: 'Select End Time',
      creating: 'Creating...',
      createAlarm: 'Save Alarm',
      enterAlarmName: 'Please enter an alarm name',
      startEndTimeSame: 'Start time and end time cannot be the same',
      alarmCreatedSuccessfully: 'Time window alarm created successfully!',
      failedToCreateAlarm: 'Failed to create alarm. Please try again.'
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      clearAll: 'Clear All'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      selectLanguage: 'Select Language',
      darkMode: 'Dark Mode',
      appearance: 'Appearance'
    }
  },
  tr: {
    common: {
      ok: 'Tamam',
      cancel: 'İptal',
      close: 'Kapat',
      save: 'Kaydet',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      success: 'Başarılı',
      error: 'Hata'
    },
    tabs: {
      alarms: 'Alarmlar',
      add: 'Alarm Ekle',
      notifications: 'Bildirimler',
      settings: 'Ayarlar'
    },
    alarms: {
      title: 'Alarmlarım',
      noAlarms: 'Hiç alarm yok',
      addFirstAlarm: 'İlk alarmınızı ekleyin',
      timeWindow: 'Zaman Aralığı',
      days: 'Günler',
      name: 'Alarm Adı',
      active: 'Aktif',
      inactive: 'Pasif'
    },
    addAlarm: {
      title: 'Yeni Alarm Ekle',
      editTitle: 'Alarm Düzenle',
      alarmName: 'Alarm Adı',
      alarmNamePlaceholder: 'örn. Uyan',
      startTime: 'Başlangıç Saati',
      endTime: 'Bitiş Saati',
      activeHours: 'Aktif Saatler',
      repeat: 'Tekrar',
      daily: 'Her Gün',
      once: 'Tek Seferlik',
      notificationInterval: 'Bildirim Sıklığı',
      every5Minutes: 'Her 5 dakikada',
      every10Minutes: 'Her 10 dakikada',
      every15Minutes: 'Her 15 dakikada',
      every30Minutes: 'Her 30 dakikada',
      every1Hour: 'Her 1 saatte',
      selectDays: 'Günleri Seçin',
      monday: 'Pazartesi',
      tuesday: 'Salı',
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi',
      sunday: 'Pazar',
      alarmCreated: 'Alarm başarıyla oluşturuldu',
      alarmUpdated: 'Alarm başarıyla güncellendi',
      fillAllFields: 'Lütfen tüm alanları doldurun',
      createTimeWindowAlarmSubtitle: 'Günlük rutininiz için tekrarlanan alarm oluşturun',
      enterAlarmNamePlaceholder: 'Sabah egzersizi, İş molası, vb.',
      activeTimeWindow: 'Aktif Zaman Aralığı',
      duration: 'Süre',
      alarmSettings: 'Alarm Ayarları',
      enableAlarm: 'Alarmı Etkinleştir',
      enableAlarmSubtext: 'Bu alarm için bildirimleri etkinleştir',
      howItWorks: 'Nasıl çalışır',
      infoPoint1: 'Seçilen zaman aralığında günlük aktif',
      infoPoint2: 'Tamamlanana kadar kalıcı bildirim',
      infoPoint3: 'Her gün otomatik olarak sıfırlanır',
      infoActiveDaily: 'Seçilen zaman aralığında günlük aktif',
      infoPersistentNotification: 'Tamamlanana kadar kalıcı bildirim',
      infoAutoReset: 'Her gün otomatik olarak sıfırlanır',
      selectStartTime: 'Başlangıç Saatini Seçin',
      selectEndTime: 'Bitiş Saatini Seçin',
      creating: 'Oluşturuluyor...',
      createAlarm: 'Alarmı Kaydet',
      enterAlarmName: 'Lütfen bir alarm adı girin',
      startEndTimeSame: 'Başlangıç ve bitiş saati aynı olamaz',
      alarmCreatedSuccessfully: 'Zaman aralığı alarmı başarıyla oluşturuldu!',
      failedToCreateAlarm: 'Alarm oluşturulamadı. Lütfen tekrar deneyin.'
    },
    notifications: {
      title: 'Bildirimler',
      noNotifications: 'Bildirim yok',
      clearAll: 'Hepsini Temizle'
    },
    settings: {
      title: 'Ayarlar',
      language: 'Dil',
      selectLanguage: 'Dil Seçin',
      darkMode: 'Karanlık Mod',
      appearance: 'Görünüm'
    }
  }
};

const i18n = new I18n(translations);

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Initialize with saved preference or default to English
const initializeLocale = async () => {
  try {
    const savedLocale = await AsyncStorage.getItem('userLanguage');
    if (savedLocale && translations[savedLocale as keyof typeof translations]) {
      i18n.locale = savedLocale;
    } else {
      i18n.locale = 'en'; // Default to English
    }
  } catch (error) {
    console.error('Error initializing locale:', error);
    i18n.locale = 'en';
  }
};

// Save locale preference
const setLocale = async (locale: string) => {
  try {
    await AsyncStorage.setItem('userLanguage', locale);
    i18n.locale = locale;
  } catch (error) {
    console.error('Error saving locale:', error);
  }
};

export { i18n, initializeLocale, setLocale };
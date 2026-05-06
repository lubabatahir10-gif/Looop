import { Task } from "../types";

export const NOTIFICATION_TONES = [
  { id: 'none', name: 'Silent', url: '' },
  { id: 'chime', name: 'Classic Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
  { id: 'drop', name: 'Water Drop', url: 'https://assets.mixkit.co/active_storage/sfx/702/702-preview.mp3' },
  { id: 'sweet', name: 'Sweet Alert', url: 'https://assets.mixkit.co/active_storage/sfx/1115/1115-preview.mp3' },
  { id: 'bubble', name: 'Soft Bubble', url: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3' }
];

export class NotificationService {
  private static registration: ServiceWorkerRegistration | null = null;

  static async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (err) {
        console.error('SW registration failed:', err);
      }
    }
  }

  static async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return 'unsupported';
    }
    
    // Check current permission
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      // Fallback for older browsers
      return new Promise((resolve) => {
        Notification.requestPermission((p) => resolve(p));
      });
    }
  }

  static playTone(toneId: string) {
    const tone = NOTIFICATION_TONES.find(t => t.id === toneId);
    if (tone && tone.url) {
      const audio = new Audio(tone.url);
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }

  static async show(title: string, body: string, taskId?: string, toneId?: string) {
    if (toneId) this.playTone(toneId);

    // If app is visible, we'll return true so the UI can show an in-app popup
    if (document.visibilityState === 'visible') {
      return { type: 'in-app', title, body, taskId };
    }

    // Background browser notification
    if ('Notification' in window && Notification.permission === 'granted' && this.registration) {
      this.registration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        data: { taskId },
        actions: [
          { action: 'done', title: 'Done' },
          { action: 'onit', title: 'On it' },
          { action: 'later', title: 'Later' }
        ]
      } as any);
    }

    return { type: 'browser' };
  }
}

/**
 * loooop Service Worker
 * Handles background notifications and action buttons
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      data: {
        taskId: data.taskId,
        url: self.registration.scope
      },
      actions: [
        { action: 'done', title: 'Done' },
        { action: 'onit', title: 'On it' },
        { action: 'later', title: 'Later' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'loooop Reminder', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const taskId = notification.data.taskId;

  notification.close();

  // Inform the app about the action
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].postMessage({
          type: 'NOTIFICATION_ACTION',
          action: action,
          taskId: taskId
        });
        return clientList[0].focus();
      } else {
        // App is closed, we could potentially use Background Sync or just open the app
        return self.clients.openWindow('/');
      }
    })
  );
});

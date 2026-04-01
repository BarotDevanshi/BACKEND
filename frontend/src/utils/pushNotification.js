import API from '../services/api';

const VAPID_PUBLIC_KEY = 'BGyZ2bODOU_dTVNudCRrwLXzm02RWC9v4ky4vI-Ta2PdKP4EvPQ_auxfonBPPqKLd4aI3tcOlpYn8Xeu0uJsQLw';

// Converts a VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Register service worker and subscribe to push notifications
export async function subscribeUser(userId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[PUSH] Push notifications not supported in this browser.');
        return;
    }

    try {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('[PUSH] Notification permission denied.');
            return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        await navigator.serviceWorker.ready;

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Send subscription to backend
        await API.post('/notifications/subscribe', {
            subscription: subscription.toJSON(),
            userId,
        });

        console.log('[PUSH] ✅ User subscribed to push notifications successfully!');
        return true;
    } catch (err) {
        console.error('[PUSH] ❌ Failed to subscribe:', err);
        return false;
    }
}

// Trigger a context notification from the frontend (optional manual trigger)
export async function triggerNotification(userId, context = 'general') {
    try {
        await API.post('/notifications/notify-user', { userId, context });
    } catch (err) {
        console.error('[PUSH] Failed to trigger notification:', err);
    }
}
export interface EnvCheckResult {
  isInAppBrowser: boolean;
  inAppBrowserName?: string;
  isSecureContext: boolean;
  hasMediaRecorder: boolean;
  hasGetUserMedia: boolean;
  hasIndexedDB: boolean;
  hasAudioContext: boolean;
}

export function detectEnvironment(): EnvCheckResult {
  const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();

  // In-app browser detection
  let isInAppBrowser = false;
  let inAppBrowserName: string | undefined;

  if (ua.includes('fban') || ua.includes('fbav')) {
    isInAppBrowser = true;
    inAppBrowserName = 'Facebook';
  } else if (ua.includes('instagram')) {
    isInAppBrowser = true;
    inAppBrowserName = 'Instagram';
  } else if (ua.includes('whatsapp')) {
    isInAppBrowser = true;
    inAppBrowserName = 'WhatsApp';
  } else if (ua.includes('snapchat')) {
    isInAppBrowser = true;
    inAppBrowserName = 'Snapchat';
  } else if (ua.includes('wv') || (ua.includes('iphone') && !ua.includes('safari') && !ua.includes('crios'))) {
    isInAppBrowser = true;
    inAppBrowserName = 'In-App Webview';
  }

  const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasIndexedDB = typeof window.indexedDB !== 'undefined';
  const hasAudioContext = typeof window.AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext !== 'undefined';

  return {
    isInAppBrowser,
    inAppBrowserName,
    isSecureContext: isSecure,
    hasMediaRecorder,
    hasGetUserMedia,
    hasIndexedDB,
    hasAudioContext
  };
}


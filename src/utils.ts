export const getFlag = (countryName: string, code: string) => {
  const flagMap: Record<string, string> = {
    'uzbekistan': '🇺🇿',
    'bangladesh': '🇧🇩',
    'saudi arabia': '🇸🇦',
    'usa': '🇺🇸',
    'united states': '🇺🇸',
    'brazil': '🇧🇷',
    'indonesia': '🇮🇩',
    'russia': '🇷🇺',
    'india': '🇮🇳',
    'china': '🇨🇳',
    'uk': '🇬🇧',
    'united kingdom': '🇬🇧',
    'pakistan': '🇵🇰',
    'nigeria': '🇳🇬',
    'egypt': '🇪🇬',
    'vietnam': '🇻🇳',
    'turkey': '🇹🇷',
    'philippines': '🇵🇭',
    'thailand': '🇹🇭',
    'germany': '🇩🇪',
    'france': '🇫🇷',
    'italy': '🇮🇹',
    'spain': '🇪🇸',
    'ukraine': '🇺🇦',
    'poland': '🇵🇱',
    'argentina': '🇦🇷',
    'colombia': '🇨🇴',
    'mexico': '🇲🇽',
    'canada': '🇨🇦',
    'malaysia': '🇲🇾',
    'south africa': '🇿🇦',
    'kenya': '🇰🇪',
    'morocco': '🇲🇦',
    'kazakhstan': '🇰🇿',
    'myanmar': '🇲🇲',
    'nepal': '🇳🇵',
    'sri lanka': '🇱🇰',
    'cambodia': '🇰🇭',
    'senegal': '🇸🇳',
    'ethiopia': '🇪🇹',
    'ghana': '🇬🇭',
    'iran': '🇮🇷',
    'iraq': '🇮🇶',
    'syria': '🇸🇾',
    'algeria': '🇩🇿',
    'peru': '🇵🇪',
    'chile': '🇨🇱',
    'venezuela': '🇻🇪',
    'romania': '🇷🇴',
    'netherlands': '🇳🇱',
    'belgium': '🇧🇪',
    'sweden': '🇸🇪',
    'portugal': '🇵🇹',
    'australia': '🇦🇺',
    'japan': '🇯🇵',
    'south korea': '🇰🇷',
    'taiwan': '🇹🇼'
  };
  const nameKey = (countryName || '').toLowerCase().trim();
  const codeKey = (code || '').toLowerCase().trim();
  return flagMap[nameKey] || flagMap[codeKey] || '🌍';
};

export const requestNotificationPermission = () => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    try {
      Notification.requestPermission().catch(console.error);
    } catch(e) {
      // ignore
    }
  }
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch(e) {
      // ignore
    }
  }
};


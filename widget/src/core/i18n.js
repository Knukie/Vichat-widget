const PACKS = {
  en: {
    'placeholder.search': 'Ask Valki...',
    'placeholder.composer': 'Type your message...',
    'button.login': 'Login',
    'button.logout': 'Log out',
    'button.delete': 'Delete',
    'modal.delete.title': 'Delete all chat history?',
    'modal.delete.sub': 'This will remove your local chat history.',
    'modal.logout.title': 'Log out of Valki Talki?',
    'modal.logout.sub': 'You can log back in anytime.',
    'privacy.notice': 'Privacy notice',
    'errors.network': 'Network error. Please try again.',
    'errors.timeout': 'Request timed out. Please try again.',
    'errors.generic': 'Valki is having trouble right now.'
  },
  nl: {
    'placeholder.search': 'Vraag Valki...',
    'placeholder.composer': 'Typ je bericht...',
    'button.login': 'Inloggen',
    'button.logout': 'Uitloggen',
    'button.delete': 'Verwijderen',
    'modal.delete.title': 'Chatgeschiedenis verwijderen?',
    'modal.delete.sub': 'Dit verwijdert je lokale chatgeschiedenis.',
    'modal.logout.title': 'Uitloggen bij Valki Talki?',
    'modal.logout.sub': 'Je kunt later weer inloggen.',
    'privacy.notice': 'Privacybericht',
    'errors.network': 'Netwerkfout. Probeer het opnieuw.',
    'errors.timeout': 'Time-out. Probeer het opnieuw.',
    'errors.generic': 'Valki heeft nu problemen.'
  },
  de: {
    'placeholder.search': 'Frag Valki...',
    'placeholder.composer': 'Nachricht eingeben...',
    'button.login': 'Anmelden',
    'button.logout': 'Abmelden',
    'button.delete': 'Löschen',
    'modal.delete.title': 'Chatverlauf löschen?',
    'modal.delete.sub': 'Lokaler Chatverlauf wird entfernt.',
    'modal.logout.title': 'Bei Valki Talki abmelden?',
    'modal.logout.sub': 'Du kannst dich jederzeit wieder anmelden.',
    'privacy.notice': 'Datenschutzhinweis',
    'errors.network': 'Netzwerkfehler. Bitte erneut versuchen.',
    'errors.timeout': 'Zeitüberschreitung. Bitte erneut versuchen.',
    'errors.generic': 'Valki hat gerade Probleme.'
  },
  fr: {
    'placeholder.search': 'Demandez à Valki...',
    'placeholder.composer': 'Tapez votre message...',
    'button.login': 'Se connecter',
    'button.logout': 'Se déconnecter',
    'button.delete': 'Supprimer',
    'modal.delete.title': 'Supprimer l’historique ?',
    'modal.delete.sub': 'Cela supprime l’historique local.',
    'modal.logout.title': 'Se déconnecter de Valki Talki ?',
    'modal.logout.sub': 'Vous pourrez vous reconnecter.',
    'privacy.notice': 'Avis de confidentialité',
    'errors.network': 'Erreur réseau. Réessayez.',
    'errors.timeout': 'Délai dépassé. Réessayez.',
    'errors.generic': 'Valki rencontre un problème.'
  },
  es: {
    'placeholder.search': 'Pregunta a Valki...',
    'placeholder.composer': 'Escribe tu mensaje...',
    'button.login': 'Iniciar sesión',
    'button.logout': 'Cerrar sesión',
    'button.delete': 'Eliminar',
    'modal.delete.title': '¿Eliminar historial de chat?',
    'modal.delete.sub': 'Se eliminará el historial local.',
    'modal.logout.title': '¿Cerrar sesión de Valki Talki?',
    'modal.logout.sub': 'Puedes volver a iniciar sesión.',
    'privacy.notice': 'Aviso de privacidad',
    'errors.network': 'Error de red. Inténtalo de nuevo.',
    'errors.timeout': 'Tiempo agotado. Inténtalo de nuevo.',
    'errors.generic': 'Valki tiene problemas ahora.'
  },
  it: {
    'placeholder.search': 'Chiedi a Valki...',
    'placeholder.composer': 'Scrivi il messaggio...',
    'button.login': 'Accedi',
    'button.logout': 'Esci',
    'button.delete': 'Elimina',
    'modal.delete.title': 'Eliminare la cronologia chat?',
    'modal.delete.sub': 'Rimuove la cronologia locale.',
    'modal.logout.title': 'Disconnettersi da Valki Talki?',
    'modal.logout.sub': 'Puoi accedere di nuovo.',
    'privacy.notice': 'Informativa privacy',
    'errors.network': 'Errore di rete. Riprova.',
    'errors.timeout': 'Tempo scaduto. Riprova.',
    'errors.generic': 'Valki ha problemi ora.'
  },
  pt: {
    'placeholder.search': 'Pergunte à Valki...',
    'placeholder.composer': 'Digite sua mensagem...',
    'button.login': 'Entrar',
    'button.logout': 'Sair',
    'button.delete': 'Excluir',
    'modal.delete.title': 'Excluir histórico do chat?',
    'modal.delete.sub': 'Isso remove o histórico local.',
    'modal.logout.title': 'Sair do Valki Talki?',
    'modal.logout.sub': 'Você pode entrar novamente.',
    'privacy.notice': 'Aviso de privacidade',
    'errors.network': 'Erro de rede. Tente novamente.',
    'errors.timeout': 'Tempo esgotado. Tente novamente.',
    'errors.generic': 'Valki está com problemas.'
  },
  pl: {
    'placeholder.search': 'Zapytaj Valki...',
    'placeholder.composer': 'Wpisz wiadomość...',
    'button.login': 'Zaloguj się',
    'button.logout': 'Wyloguj się',
    'button.delete': 'Usuń',
    'modal.delete.title': 'Usunąć historię czatu?',
    'modal.delete.sub': 'Usuwa lokalną historię.',
    'modal.logout.title': 'Wylogować się z Valki Talki?',
    'modal.logout.sub': 'Możesz zalogować się ponownie.',
    'privacy.notice': 'Informacja o prywatności',
    'errors.network': 'Błąd sieci. Spróbuj ponownie.',
    'errors.timeout': 'Przekroczono limit czasu. Spróbuj ponownie.',
    'errors.generic': 'Valki ma teraz problem.'
  },
  tr: {
    'placeholder.search': "Valki'ye sor...",
    'placeholder.composer': 'Mesajınızı yazın...',
    'button.login': 'Giriş yap',
    'button.logout': 'Çıkış yap',
    'button.delete': 'Sil',
    'modal.delete.title': 'Sohbet geçmişi silinsin mi?',
    'modal.delete.sub': 'Yerel geçmiş kaldırılır.',
    'modal.logout.title': "Valki Talki'den çıkış?",
    'modal.logout.sub': 'Yeniden giriş yapabilirsiniz.',
    'privacy.notice': 'Gizlilik bildirimi',
    'errors.network': 'Ağ hatası. Tekrar deneyin.',
    'errors.timeout': 'Zaman aşımı. Tekrar deneyin.',
    'errors.generic': 'Valki şu anda sorun yaşıyor.'
  },
  ar: {
    'placeholder.search': 'اسأل فالكِ...',
    'placeholder.composer': 'اكتب رسالتك...',
    'button.login': 'تسجيل الدخول',
    'button.logout': 'تسجيل الخروج',
    'button.delete': 'حذف',
    'modal.delete.title': 'حذف سجل الدردشة؟',
    'modal.delete.sub': 'سيتم حذف السجل المحلي.',
    'modal.logout.title': 'تسجيل الخروج من فالكِ توكي؟',
    'modal.logout.sub': 'يمكنك تسجيل الدخول مجددًا.',
    'privacy.notice': 'إشعار الخصوصية',
    'errors.network': 'خطأ في الشبكة. حاول مرة أخرى.',
    'errors.timeout': 'انتهت المهلة. حاول مرة أخرى.',
    'errors.generic': 'فالكِ تواجه مشكلة الآن.'
  },
  ja: {
    'placeholder.search': 'Valki に質問...',
    'placeholder.composer': 'メッセージを入力...',
    'button.login': 'ログイン',
    'button.logout': 'ログアウト',
    'button.delete': '削除',
    'modal.delete.title': 'チャット履歴を削除しますか？',
    'modal.delete.sub': 'ローカル履歴が削除されます。',
    'modal.logout.title': 'Valki Talkiからログアウトしますか？',
    'modal.logout.sub': 'いつでも再ログインできます。',
    'privacy.notice': 'プライバシー通知',
    'errors.network': 'ネットワークエラー。再試行してください。',
    'errors.timeout': 'タイムアウトしました。再試行してください。',
    'errors.generic': '現在Valkiに問題があります。'
  },
  zh: {
    'placeholder.search': '问问 Valki...',
    'placeholder.composer': '输入你的消息...',
    'button.login': '登录',
    'button.logout': '退出登录',
    'button.delete': '删除',
    'modal.delete.title': '删除聊天记录？',
    'modal.delete.sub': '这将删除本地记录。',
    'modal.logout.title': '退出 Valki Talki？',
    'modal.logout.sub': '你可以随时重新登录。',
    'privacy.notice': '隐私提示',
    'errors.network': '网络错误。请重试。',
    'errors.timeout': '请求超时。请重试。',
    'errors.generic': 'Valki 当前有问题。'
  },
  ko: {
    'placeholder.search': 'Valki에게 물어보세요...',
    'placeholder.composer': '메시지를 입력하세요...',
    'button.login': '로그인',
    'button.logout': '로그아웃',
    'button.delete': '삭제',
    'modal.delete.title': '채팅 기록을 삭제할까요?',
    'modal.delete.sub': '로컬 기록이 삭제됩니다.',
    'modal.logout.title': 'Valki Talki에서 로그아웃할까요?',
    'modal.logout.sub': '언제든 다시 로그인할 수 있습니다.',
    'privacy.notice': '개인정보 안내',
    'errors.network': '네트워크 오류입니다. 다시 시도하세요.',
    'errors.timeout': '시간 초과입니다. 다시 시도하세요.',
    'errors.generic': '현재 Valki에 문제가 있습니다.'
  }
};

const SUPPORTED_LOCALES = Object.keys(PACKS);
const FALLBACK_LOCALE = 'en';

const normalizeLocale = (value) => String(value || '').trim().toLowerCase().replace('_', '-');

const matchLocale = (value) => {
  const normalized = normalizeLocale(value);
  if (!normalized) return '';
  if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
  const base = normalized.split('-')[0];
  if (SUPPORTED_LOCALES.includes(base)) return base;
  return '';
};

const resolveLocale = () => {
  if (typeof window !== 'undefined') {
    const forced = matchLocale(window.__VALKI_LOCALE__);
    if (forced) return forced;
  }
  if (typeof navigator !== 'undefined') {
    const languages = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const lang of languages) {
      const match = matchLocale(lang);
      if (match) return match;
    }
  }
  return FALLBACK_LOCALE;
};

const readOverrides = () => {
  if (typeof window === 'undefined') return {};
  const raw = window.__VALKI_I18N_OVERRIDES__;
  if (!raw || typeof raw !== 'object') return {};
  return Object.entries(raw).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const getI18n = () => {
  const locale = resolveLocale();
  const basePack = PACKS[locale] || PACKS[FALLBACK_LOCALE];
  const overrides = readOverrides();
  const t = (key) => {
    if (typeof overrides[key] === 'string') return overrides[key];
    if (typeof basePack[key] === 'string') return basePack[key];
    if (typeof PACKS[FALLBACK_LOCALE][key] === 'string') return PACKS[FALLBACK_LOCALE][key];
    return key;
  };
  return {
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    t
  };
};

export const getSupportedLocales = () => SUPPORTED_LOCALES.slice();

export async function fetchMe({ token, config }) {
  if (!token) return null;
  try {
    const res = await fetch(config.apiMe, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => null);
    if (data && data.loggedIn && data.user) return data.user;
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchMessages({ token, config }) {
  if (!token) return { ok: false, messages: [] };
  try {
    const res = await fetch(config.apiMessages, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return { ok: false, messages: [] };
    const data = await res.json().catch(() => null);
    if (!data || !Array.isArray(data.messages)) return { ok: true, messages: [] };
    return {
      ok: true,
      messages: data.messages.map((m) => ({
        role: m.role === 'assistant' ? 'bot' : 'user',
        text: String(m.content || '')
      }))
    };
  } catch {
    return { ok: false, messages: [] };
  }
}

export async function clearMessages({ token, config }) {
  if (!token) return false;
  try {
    const res = await fetch(config.apiClear, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return res.ok;
  } catch {
    return false;
  }
}

export async function importGuestMessages({ token, guestHistory, config }) {
  if (!token || !Array.isArray(guestHistory) || !guestHistory.length) return;
  const payload = {
    messages: guestHistory.slice(-80).map((m) => ({
      role: m.type === 'bot' ? 'assistant' : 'user',
      content: String(m.text || '')
    }))
  };

  try {
    await fetch(config.apiImportGuest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
  } catch {
    /* non-fatal */
  }
}

export async function askValki({ message, clientId, images, token, config }) {
  const payload = { message, clientId, images };
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(config.apiValki, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let errMsg = config.copy.genericError;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const json = await res.json().catch(() => null);
        if (json && typeof json.error === 'string') {
          errMsg = `ksshh… ${json.error}`;
        }
      }
      return { ok: false, message: errMsg };
    }

    const data = await res.json().catch(() => null);
    const reply =
      data && typeof data.reply === 'string' && data.reply.trim()
        ? String(data.reply)
        : config.copy.noResponse;

    return { ok: true, message: reply };
  } catch {
    return { ok: false, message: config.copy.genericError };
  }
}

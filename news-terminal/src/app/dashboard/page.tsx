"use client";

import { useCallback, useEffect, useState } from "react";

type Me = { id: number; email: string; plan_tier: string };
type KeyRow = {
  id: number;
  prefix: string;
  tier: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadKeys = useCallback(async () => {
    const res = await fetch("/api/keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys ?? []);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setMe(data.user);
        await loadKeys();
      }
      setChecked(true);
    })();
  }, [loadKeys]);

  const submitAuth = async () => {
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.detail ?? data.error ?? "hata");
      return;
    }
    setMe({ id: data.user.id, email: data.user.email, plan_tier: "free" });
    setPassword("");
    await loadKeys();
  };

  const createKey = async () => {
    setError(null);
    const res = await fetch("/api/keys", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.detail ?? data.error ?? "hata");
      return;
    }
    setNewKey(data.key);
    await loadKeys();
  };

  const revokeKey = async (id: number) => {
    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    await loadKeys();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setKeys([]);
    setNewKey(null);
  };

  if (!checked) return <div className="page"><div className="empty">Yükleniyor…</div></div>;

  return (
    <div className="page">
      <div className="header">
        <h1>
          API <span className="accent">Anahtarları</span>
        </h1>
        <div className="header-right">
          {me && (
            <span className="status">
              {me.email} · {me.plan_tier}
            </span>
          )}
          {me && (
            <button className="tab" onClick={logout}>
              çıkış
            </button>
          )}
          <a className="mode-link" href="/terminal">
            terminale dön →
          </a>
        </div>
      </div>

      {!me ? (
        <div className="auth-box">
          <div className="tabs">
            <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
              Giriş
            </button>
            <button
              className={`tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Kayıt
            </button>
          </div>
          <input
            type="email"
            placeholder="e-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="parola (en az 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAuth()}
          />
          <button className="primary" onClick={submitAuth}>
            {mode === "login" ? "Giriş yap" : "Hesap oluştur"}
          </button>
          {error && <div className="form-error">{error}</div>}
        </div>
      ) : (
        <>
          <div className="key-actions">
            <button className="primary" onClick={createKey}>
              + Yeni anahtar oluştur
            </button>
            <a className="mode-link" href="/docs">
              API dokümantasyonu →
            </a>
          </div>

          {newKey && (
            <div className="new-key-box">
              <div>
                Anahtarınız (yalnızca <strong>bir kez</strong> gösterilir, kopyalayın):
              </div>
              <code>{newKey}</code>
              <button className="tab" onClick={() => navigator.clipboard?.writeText(newKey)}>
                kopyala
              </button>
            </div>
          )}
          {error && <div className="form-error">{error}</div>}

          {keys.length === 0 && <div className="empty">Henüz anahtar yok.</div>}
          {keys.map((k) => (
            <div key={k.id} className={`card key-card ${k.revoked_at ? "revoked" : ""}`}>
              <div className="card-meta">
                <code>{k.prefix}…</code>
                <span className="badge genel">{k.tier}</span>
                <span>oluşturma: {new Date(k.created_at).toLocaleDateString("tr-TR")}</span>
                <span>
                  son kullanım:{" "}
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleString("tr-TR") : "—"}
                </span>
                {k.revoked_at ? (
                  <span className="badge">İPTAL</span>
                ) : (
                  <button className="revoke" onClick={() => revokeKey(k.id)}>
                    iptal et
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

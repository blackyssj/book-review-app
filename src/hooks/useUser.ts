import { useEffect, useState } from "react";

// src/hooks/useUser.ts
export function useUser() {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setUserId(data.userId))
      .catch(() => setUserId(null))
      .finally(() => setLoading(false));
  }, []);

  return { userId, loading };
}

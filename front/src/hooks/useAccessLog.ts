import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useAccessLog() {
  const location = useLocation();

  useEffect(() => {
    const visited: string[] = JSON.parse(sessionStorage.getItem("_pages") || "[]");

    if (!visited.includes(location.pathname)) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: location.pathname }),
      }).catch(() => {});

      visited.push(location.pathname);
      sessionStorage.setItem("_pages", JSON.stringify(visited));
    }
  }, [location.pathname]);
}

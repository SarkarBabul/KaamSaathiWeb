import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface WorkspaceBack {
  go: () => void;
  label: string;
}

// Mirrors the Angular header-bar's `location.back()` but never strands the
// user: on a workspace page, browser history is used when this SPA owns an
// earlier entry (react-router stamps `idx` into history.state), otherwise
// the workspace home is the parent. On the home page itself there is no
// deeper parent, so "back" leaves the workspace for the public site — the
// same place the Desktop Version was entered from — rather than looping.
export function useWorkspaceBack(homeRoute: string): WorkspaceBack {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === homeRoute;

  const go = useCallback(() => {
    if (onHome) {
      navigate("/");
      return;
    }
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      navigate(-1);
    } else {
      navigate(homeRoute);
    }
  }, [homeRoute, navigate, onHome]);

  return { go, label: onHome ? "Back to KaamSaathi website" : "Back" };
}

"use client";

import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Box, Button, Chip, Stack, Avatar } from "@mui/material";
import type { Session } from "@supabase/supabase-js";

interface TopBarProps {
  session: Session | null;
  loading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  incidentCount: number;
  mode: "light" | "dark";
  onToggleMode: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ session, loading, onLogin, onLogout, incidentCount, mode, onToggleMode }) => {
  const authorityLabel = session?.user?.email ?? "Authority";
  const [tickerText, setTickerText] = useState<string>("");

  useEffect(() => {
    const update = () => setTickerText(`${incidentCount} active | ${new Date().toLocaleTimeString()} | Latest alerts streaming`);
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [incidentCount]);

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: "rgba(15,23,42,0.65)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main", color: "black", fontWeight: 800 }}>C</Avatar>
          <Box>
            <Typography variant="caption" sx={{ letterSpacing: 2, textTransform: "uppercase", color: "rgba(226,232,240,0.8)" }}>
              Smart Command
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ display: "flex", gap: 0.5, alignItems: "baseline" }}>
              <Box component="span" sx={{ color: "#ffffff" }}>
                Chennai One
              </Box>
              <Box component="span" sx={{ color: "#06B6D4" }}>
                | Authority
              </Box>
            </Typography>
          </Box>
          <Chip label={`${incidentCount} active`} color="error" variant="outlined" size="small" sx={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.6)" }} />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button onClick={onToggleMode} color="inherit" variant="text" size="small">
            {mode === "dark" ? "Light mode" : "Dark mode"}
          </Button>
          {session ? (
            <>
              <Chip label={authorityLabel} color="secondary" variant="outlined" />
              <Button onClick={onLogout} color="inherit" disabled={loading}>
                Sign out
              </Button>
            </>
          ) : (
            <Button
              onClick={onLogin}
              variant="outlined"
              disabled={loading}
              sx={{
                borderColor: "#06B6D4",
                color: "#06B6D4",
                boxShadow: "0 0 24px rgba(6,182,212,0.35)",
                "&:hover": {
                  backgroundColor: "rgba(6,182,212,0.1)",
                  borderColor: "#06B6D4",
                },
              }}
            >
              Continue as Police
            </Button>
          )}
        </Stack>
      </Toolbar>
      <Box sx={{ px: 2, py: 0.5, borderTop: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(2,6,23,0.75)" }}>
        <Typography variant="caption" color="text.secondary" className="ticker" suppressHydrationWarning>
          <span>{tickerText}</span>
        </Typography>
      </Box>
    </AppBar>
  );
};

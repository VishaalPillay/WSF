"use client";

import React from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { Incident, LiveLocation } from "../types";

interface Props {
  incidents: Incident[];
  locations: LiveLocation[];
  loading: boolean;
}

export const StatsOverlay: React.FC<Props> = ({ incidents, locations, loading }) => {
  const active = incidents.filter((i) => i.status !== "resolved").length;
  const resolved = incidents.filter((i) => i.status === "resolved").length;
  const live = locations.length;

  const cards = [
    { label: "Active Alerts", value: loading ? "…" : active, color: "error" },
    { label: "Resolved", value: loading ? "…" : resolved, color: "secondary" },
    { label: "Live Streams", value: loading ? "…" : live, color: "primary" },
  ];

  return (
    <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        {cards.map((card) => (
          <Paper
            key={card.label}
            sx={{
              px: 2,
              py: 1.5,
              minWidth: 140,
              bgcolor: "rgba(15,27,45,0.72)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
            }}
            elevation={6}
          >
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.3 }}>
              {card.label}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {card.value}
              <Chip size="small" label="live" color={card.color as any} variant="outlined" />
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

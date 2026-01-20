"use client";

import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import type { Incident } from "../types";
import { AlertCard } from "./AlertCard";

interface Props {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  onSelect: (id: string | null) => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  selectedIncidentId: string | null;
  supabaseEnabled: boolean;
}

export const AlertsPanel: React.FC<Props> = ({
  incidents,
  loading,
  error,
  onSelect,
  onAcknowledge,
  onResolve,
  selectedIncidentId,
}) => {
  const sorted = React.useMemo(() => {
    const priority = { high: 3, medium: 2, low: 1 } as const;
    return [...incidents].sort((a, b) => (priority[b.severity as keyof typeof priority] ?? 0) - (priority[a.severity as keyof typeof priority] ?? 0));
  }, [incidents]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Users in Danger
      </Typography>
      <Divider sx={{ mb: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />
      {loading && <Typography variant="body2">Loading…</Typography>}
      {error && (
        <Typography variant="body2" color="error">
          Error: {error}
        </Typography>
      )}
      {!loading &&
        sorted.map((incident) => (
          <AlertCard
            key={incident.id}
            incident={incident}
            selected={selectedIncidentId === incident.id}
            onSelect={(id) => onSelect(id)}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
          />
        ))}
      {!loading && incidents.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No active alerts.
        </Typography>
      )}
    </Box>
  );
};

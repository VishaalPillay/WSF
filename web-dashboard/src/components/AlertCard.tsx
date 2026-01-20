"use client";

import React from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Paper,
  Tooltip,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CheckIcon from "@mui/icons-material/CheckCircle";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import type { Incident } from "../types";

interface Props {
  incident: Incident;
  selected: boolean;
  onSelect: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const progressForStatus = (status: Incident["status"]) => {
  if (status === "resolved") return 100;
  if (status === "acknowledged" || status === "monitoring") return 60;
  return 30;
};

export const AlertCard: React.FC<Props> = ({ incident, selected, onSelect, onAcknowledge, onResolve }) => {
  return (
    <Paper
      onClick={() => onSelect(incident.id)}
      sx={{
        p: 1.25,
        mb: 1,
        bgcolor: selected ? "rgba(142, 243, 197, 0.12)" : "rgba(255,255,255,0.04)",
        border: selected ? "1px solid rgba(142, 243, 197, 0.4)" : "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
      }}
      elevation={selected ? 6 : 1}
    >
      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {incident.display_name ?? "Unknown"} · {incident.severity.toUpperCase()}
          </Typography>
          <Chip
            size="small"
            label={incident.status}
            color={incident.status === "resolved" ? "default" : "error"}
            variant={incident.status === "resolved" ? "outlined" : "filled"}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary" noWrap>
          {incident.notes ?? "No notes"} · ID: {incident.user_id ?? "N/A"}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progressForStatus(incident.status)}
          sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.06)" }}
        />

        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            {new Date(incident.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Dispatch / Monitor">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge(incident.id);
                }}
              >
                <DirectionsRunIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Call">
              <IconButton size="small" color="secondary" onClick={(e) => e.stopPropagation()}>
                <CallIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark Safe">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(incident.id);
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

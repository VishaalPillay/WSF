"use client";

import React from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  Typography,
  Chip,
  Avatar,
  Paper,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import type { Incident } from "../types";

interface Props {
  incident: Incident | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  supabaseEnabled: boolean;
}

export const IncidentDrawer: React.FC<Props> = ({ incident, onClose, onAcknowledge, onResolve, supabaseEnabled }) => {
  const open = Boolean(incident);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 380, bgcolor: "rgba(12,18,32,0.9)", backdropFilter: "blur(12px)" } }}>
      {incident ? (
        <Box sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48, fontWeight: 800 }}>
              {incident.display_name?.[0]?.toUpperCase() ?? "S"}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ letterSpacing: 1, color: "text.secondary" }}>
                SOS CARD
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {incident.display_name ?? "Unknown user"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {incident.user_id ?? "User"} • {incident.severity.toUpperCase()} • {incident.status}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={incident.status}
              color={incident.status === "resolved" ? "default" : "error"}
              sx={{ ml: "auto", textTransform: "uppercase", letterSpacing: 0.5 }}
            />
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              bgcolor: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: "grid", gap: 0.25 }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
                  LAST KNOWN LOCATION
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)}
                </Typography>
              </Box>
              <Chip size="small" icon={<LocationOnIcon fontSize="small" />} label="Live" color="primary" variant="outlined" />
            </Stack>
          </Paper>

          <Typography variant="body2" color="text.secondary">
            {incident.notes ?? "No notes provided"}
          </Typography>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<LocalPoliceIcon />}
              onClick={() => incident && onAcknowledge(incident.id)}
              disabled={!supabaseEnabled}
              sx={{ fontWeight: 700 }}
            >
              Dispatch Patrol
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<PlayCircleFilledIcon />}
              onClick={() => incident && onResolve(incident.id)}
              disabled={!supabaseEnabled}
              sx={{ fontWeight: 700 }}
            >
              View Camera
            </Button>
          </Stack>

          <Button variant="text" onClick={onClose} sx={{ mt: "auto", color: "text.secondary" }}>
            Close
          </Button>
        </Box>
      ) : null}
    </Drawer>
  );
};

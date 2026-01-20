"use client";

import React from "react";
import { Dashboard } from "../../../src/components/Dashboard";
import { ThemeProvider } from "../../../src/components/ThemeProvider";

export default function Option2Page() {
    return (
        <ThemeProvider>
            <Dashboard />
        </ThemeProvider>
    );
}

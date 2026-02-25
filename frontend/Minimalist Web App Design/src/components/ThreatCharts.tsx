import * as React from "react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Activity, PieChart as PieIcon, Radio } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ScanHistoryEntry {
    id: string;
    title: string;
    timestamp: number;
    result: {
        score: number;
        anomaly_string: string;
        risk_level: string;
        malware_flag: boolean;
    };
}

interface ComponentScores {
    visual_score?: number;
    auditory_score?: number;
    metadata_keys?: number;
    temporal_check?: { motion_jitter: number };
}

interface Props {
    components?: ComponentScores;
}

// ─── Colors ──────────────────────────────────────────────────────────────────
const RISK_COLORS: Record<string, string> = {
    "Malware Payload Detected": "#ef4444",
    "Synthetic Texture Anomaly": "#f97316",
    "Unrecognized Visual Pattern": "#eab308",
    "Abnormal Audio Pattern": "#a855f7",
    "Suspicious Activity Detected": "#f59e0b",
    "Excessive Metadata Anomaly": "#6366f1",
    clean: "#22c55e",
};

const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#a855f7", "#22c55e", "#6366f1", "#f59e0b"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getHistory(): ScanHistoryEntry[] {
    try {
        const raw = localStorage.getItem("AegisAI_chats");
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return arr.filter((e: ScanHistoryEntry) => e.result?.score !== undefined);
    } catch {
        return [];
    }
}

// ─── Modality Radar Chart ────────────────────────────────────────────────────
export function ModalityBreakdownChart({ components }: Props) {
    if (!components) return null;

    const data = [
        { subject: "Visual", value: Math.round((components.visual_score ?? 0) * 100) },
        { subject: "Audio", value: Math.round((components.auditory_score ?? 0) * 100) },
        {
            subject: "Metadata",
            value: Math.max(0, 100 - Math.min(100, (components.metadata_keys ?? 0) * 2)),
        },
        {
            subject: "Temporal",
            value: Math.round((1 - (components.temporal_check?.motion_jitter ?? 0)) * 100),
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-500" />
                    Modality Breakdown
                </CardTitle>
                <CardDescription className="text-xs">Authenticity per detection signal (%)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={data}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ─── Threat History Line Chart ────────────────────────────────────────────────
export function ThreatHistoryChart() {
    const history = getHistory();

    if (history.length < 2) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        Threat History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-400 text-center py-6">
                        Run at least 2 scans to see history trend.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const data = history
        .slice(-20)
        .map((e, i) => ({
            scan: `#${i + 1}`,
            score: Math.round(e.result.score * 100),
            label: e.title?.slice(0, 12) ?? `Scan ${i + 1}`,
        }))
        .reverse();

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    Threat History
                </CardTitle>
                <CardDescription className="text-xs">Confidence score trend across last {data.length} scans</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="scan" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                        <Tooltip formatter={(v: number) => [`${v}%`, "Score"]} />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#22c55e" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ─── Threat Type Distribution Pie Chart ──────────────────────────────────────
export function ThreatDistributionChart() {
    const history = getHistory();

    if (history.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-purple-500" />
                        Threat Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-400 text-center py-6">
                        No scan history yet. Run a scan to see distribution.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const counts: Record<string, number> = {};
    history.forEach((e) => {
        const k = e.result?.anomaly_string ?? "unknown";
        counts[k] = (counts[k] ?? 0) + 1;
    });

    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    const colors = data.map(
        (d, i) => RISK_COLORS[d.name] ?? PIE_COLORS[i % PIE_COLORS.length]
    );

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-purple-500" />
                    Threat Distribution
                </CardTitle>
                <CardDescription className="text-xs">Breakdown of threat types across all scans</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {data.map((_, i) => (
                                <Cell key={i} fill={colors[i]} />
                            ))}
                        </Pie>
                        <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

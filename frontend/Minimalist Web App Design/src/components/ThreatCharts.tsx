import * as React from "react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Activity, PieChart as PieIcon, Radio, Zap, Target, AlertTriangle } from "lucide-react";

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

export interface ComponentScores {
    // Ensemble top-level
    malware_ml_score?: number;
    heuristic_score?: number;
    pattern_score?: number;
    threat_score?: number;
    // Heuristic sub-scores
    entropy_score?: number;
    string_suspicion?: number;
    obfuscation_score?: number;
    packed_probability?: number;
    // Legacy / supporting
    visual_score?: number;
    auditory_score?: number;
    metadata_keys?: number;
    signature_check?: { has_signature: boolean; matches: string[] };
    temporal_check?: { motion_jitter: number; is_video: boolean; frame_count: number };
}

export interface SimilarityReport {
    similarity_score: number;
    matched_cluster: string;
    matched_subfamily: string;
    confidence: string;
    is_known_threat: boolean;
    severity: string;
    mitre_tactic: string;
    top_matches: { family: string; subfamily: string; similarity: number; severity: string; mitre_tactic: string }[];
}

interface Props {
    components?: ComponentScores;
    similarityReport?: SimilarityReport;
}

// ─── Colors ──────────────────────────────────────────────────────────────────
const RISK_COLORS: Record<string, string> = {
    "Malware Payload Detected": "#ef4444",
    "Obfuscated Executable": "#dc2626",
    "Packed/Encrypted Payload": "#f97316",
    "Metadata Injection Anomaly": "#6366f1",
    "Abnormal Audio Pattern": "#a855f7",
    "Suspicious Activity Detected": "#f59e0b",
    clean: "#22c55e",
};

const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#a855f7", "#22c55e", "#6366f1", "#f59e0b", "#06b6d4"];

const SEV_COLORS: Record<string, string> = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#22c55e",
    none: "#6b7280",
    unknown: "#9ca3af",
};

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

function pct(v: number | undefined, invert = false): number {
    const val = Math.round((v ?? 0) * 100);
    return invert ? 100 - val : val;
}

// ─── 1. Threat Radar (5 signals) ─────────────────────────────────────────────
export function ThreatRadarChart({ components }: Props) {
    if (!components) return null;

    const hasMalware = components.malware_ml_score !== undefined
        || components.entropy_score !== undefined;

    const data = hasMalware ? [
        { subject: "ML Score", value: pct(components.malware_ml_score) },
        { subject: "Entropy", value: pct(components.entropy_score) },
        { subject: "Strings", value: pct(components.string_suspicion) },
        { subject: "Obfuscation", value: pct(components.obfuscation_score) },
        { subject: "Packing", value: pct(components.packed_probability) },
    ] : [
        { subject: "Pattern", value: pct(components.pattern_score) },
        { subject: "Heuristic", value: pct(components.heuristic_score) },
        { subject: "Metadata", value: Math.max(0, 100 - Math.min(100, (components.metadata_keys ?? 0) * 2)) },
        { subject: "Temporal", value: pct(components.temporal_check?.motion_jitter) },
        { subject: "Entropy", value: pct(components.entropy_score) },
    ];

    const maxVal = Math.max(...data.map(d => d.value));
    const strokeColor = maxVal >= 61 ? "#ef4444" : maxVal >= 31 ? "#f97316" : "#22c55e";

    return (
        <Card className="border-gray-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-500" />
                    Threat Signal Radar
                </CardTitle>
                <CardDescription className="text-xs">Multi-signal threat breakdown (%)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={data}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#6b7280" }} />
                        <Radar name="Threat" dataKey="value" stroke={strokeColor} fill={strokeColor} fillOpacity={0.25} />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ─── 2. Risk Heatmap (bar chart styled as heatmap) ───────────────────────────
export function RiskHeatmap({ components }: Props) {
    if (!components) return null;

    const signals = [
        { label: "ML Probability", value: components.malware_ml_score ?? 0 },
        { label: "Entropy", value: components.entropy_score ?? 0 },
        { label: "String Suspicion", value: components.string_suspicion ?? 0 },
        { label: "Obfuscation", value: components.obfuscation_score ?? 0 },
        { label: "Packing", value: components.packed_probability ?? 0 },
        { label: "Pattern", value: components.pattern_score ?? 0 },
    ];

    return (
        <Card className="border-gray-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    Risk Heatmap
                </CardTitle>
                <CardDescription className="text-xs">Signal intensity per detection layer</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mt-1">
                    {signals.map((s) => {
                        const pctVal = Math.round(s.value * 100);
                        const color = pctVal >= 61 ? "#ef4444"
                            : pctVal >= 31 ? "#f97316"
                                : "#22c55e";
                        return (
                            <div key={s.label} className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-32 shrink-0 truncate">{s.label}</span>
                                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${pctVal}%`,
                                            background: `linear-gradient(90deg, ${color}88, ${color})`,
                                            boxShadow: pctVal > 40 ? `0 0 6px ${color}88` : "none",
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-mono font-bold w-9 text-right" style={{ color }}>
                                    {pctVal}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── 3. Threat Similarity Panel ───────────────────────────────────────────────
export function SimilarityPanel({ similarityReport }: Props) {
    if (!similarityReport || similarityReport.matched_cluster === "N/A") {
        return (
            <Card className="border-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        Threat Similarity
                    </CardTitle>
                    <CardDescription className="text-xs">No PE file — similarity N/A</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-500 text-center py-4">
                        Upload a Windows executable (.exe, .dll) to enable threat family matching.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const simPct = Math.round(similarityReport.similarity_score * 100);
    const sevColor = SEV_COLORS[similarityReport.severity] ?? "#9ca3af";
    const barData = similarityReport.top_matches.slice(0, 5).map(m => ({
        name: m.family.length > 12 ? m.family.slice(0, 12) + "…" : m.family,
        sim: Math.round(m.similarity * 100),
    }));

    return (
        <Card className="border-gray-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Threat Similarity
                    {similarityReport.is_known_threat && (
                        <Badge className="text-xs py-0 px-1.5 bg-red-500/20 text-red-400 border-red-500/30">
                            Known Threat
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription className="text-xs">Cosine similarity vs malware family prototypes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Best Match */}
                <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <p className="text-sm font-bold text-white">{similarityReport.matched_cluster}</p>
                            <p className="text-xs text-gray-400">{similarityReport.matched_subfamily}</p>
                        </div>
                        <span className="text-2xl font-black" style={{ color: sevColor }}>{simPct}%</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Badge className="text-xs py-0 px-1.5" style={{ background: `${sevColor}22`, color: sevColor, border: `1px solid ${sevColor}44` }}>
                            {similarityReport.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0 px-1.5 text-gray-400">
                            {similarityReport.mitre_tactic}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0 px-1.5 text-gray-400">
                            confidence: {similarityReport.confidence}
                        </Badge>
                    </div>
                </div>

                {/* Top matches bar chart */}
                {barData.length > 0 && (
                    <ResponsiveContainer width="100%" height={130}>
                        <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} unit="%" />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} width={72} />
                            <Tooltip formatter={(v: number) => [`${v}%`, "Similarity"]} />
                            <Bar dataKey="sim" radius={[0, 3, 3, 0]}>
                                {barData.map((entry, i) => (
                                    <Cell key={i} fill={entry.sim >= 61 ? "#ef4444" : entry.sim >= 31 ? "#f97316" : "#22c55e"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

// ─── 4. Threat History Timeline ───────────────────────────────────────────────
export function ThreatHistoryChart() {
    const history = getHistory();

    if (history.length < 2) {
        return (
            <Card className="border-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        Threat Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-400 text-center py-6">
                        Run at least 2 scans to see timeline.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const data = history
        .slice(-20)
        .map((e, i) => ({
            scan: `#${i + 1}`,
            threat: Math.round(e.result.score * 100),
            label: e.title?.slice(0, 12) ?? `Scan ${i + 1}`,
        }))
        .reverse();

    return (
        <Card className="border-gray-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    Threat Timeline
                </CardTitle>
                <CardDescription className="text-xs">Threat score trend across last {data.length} scans</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="scan" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} unit="%" />
                        <Tooltip
                            formatter={(v: number) => [`${v}%`, "Threat Score"]}
                            contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "6px" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="threat"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={(props) => {
                                const { cx, cy, payload } = props;
                                const color = payload.threat >= 61 ? "#ef4444" : payload.threat >= 31 ? "#f97316" : "#22c55e";
                                return <circle key={payload.scan} cx={cx} cy={cy} r={4} fill={color} stroke={color} />;
                            }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ─── 5. Threat Distribution Pie ───────────────────────────────────────────────
export function ThreatDistributionChart() {
    const history = getHistory();

    if (history.length === 0) {
        return (
            <Card className="border-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-purple-500" />
                        Threat Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-400 text-center py-6">
                        No scan history yet.
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
    const colors = data.map((d, i) => RISK_COLORS[d.name] ?? PIE_COLORS[i % PIE_COLORS.length]);

    return (
        <Card className="border-gray-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-purple-500" />
                    Threat Distribution
                </CardTitle>
                <CardDescription className="text-xs">Breakdown across all scans</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            dataKey="value"
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                        </Pie>
                        <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                        <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "6px" }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ─── Legacy export for backward compat ────────────────────────────────────────
export const ModalityBreakdownChart = ThreatRadarChart;

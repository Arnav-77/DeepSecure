import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Lightbulb } from "lucide-react";

interface Props {
    score: number;
    riskLevel: string;
    anomalyString: string;
    explanation: string;
    recommendedActions: string[];
    malwareFlag: boolean;
}

// ─── Confidence Gauge (SVG circular) ─────────────────────────────────────────
function ConfidenceGauge({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    const color =
        pct >= 61 ? "#ef4444" : pct >= 31 ? "#f59e0b" : "#22c55e";

    return (
        <div className="flex flex-col items-center justify-center gap-1">
            <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Track */}
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#374151" strokeWidth="12" />
                {/* Progress */}
                <circle
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
                <text x="70" y="65" textAnchor="middle" fontSize="26" fontWeight="700" fill={color}>
                    {pct}%
                </text>
                <text x="70" y="84" textAnchor="middle" fontSize="11" fill="#9ca3af">
                    Threat Score
                </text>
            </svg>
        </div>
    );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: string }) {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
        Low: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        Medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        Moderate: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        High: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="w-3.5 h-3.5" /> },
    };
    const c = config[risk] ?? config["Medium"];
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${c.color}`}>
            {c.icon} {risk} Risk
        </span>
    );
}

// ─── Response Panel ───────────────────────────────────────────────────────────
export function ResponsePanel({ score, riskLevel, anomalyString, explanation, recommendedActions, malwareFlag }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Confidence Gauge */}
            <Card className="flex items-center justify-center py-4">
                <CardContent className="pt-0">
                    <ConfidenceGauge score={score} />
                    <div className="mt-2 flex justify-center">
                        <RiskBadge risk={riskLevel} />
                    </div>
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {anomalyString}
                    </p>
                </CardContent>
            </Card>

            {/* Explanation */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Why this verdict?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {explanation}
                    </p>
                </CardContent>
            </Card>

            {/* Recommended Actions */}
            <Card className={malwareFlag ? "border-red-400 dark:border-red-600" : ""}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <ShieldAlert className={`w-4 h-4 ${malwareFlag ? "text-red-500" : "text-blue-500"}`} />
                        Recommended Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {recommendedActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${malwareFlag ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                    }`}>
                                    {i + 1}
                                </span>
                                {action}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

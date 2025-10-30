import { Card } from "./ui/card";
import { Upload, Shield, Eye, AlertTriangle } from "lucide-react";

export function GuideSection() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Files for Analysis",
      description:
        "Start by uploading images, videos, audio files, or executables through the Authenticator tool. Simply drag and drop your file or click to browse. Our system supports multiple formats and analyzes files up to 100MB for comprehensive security scanning.",
    },
    {
      icon: Shield,
      title: "Multi-Modal Detection Methods",
      description:
        "DeepSecure uses advanced AI-powered detection including Visual CNN analysis (MobileNetV2) for synthetic textures, Auditory MFCC classifiers for audio deepfakes, Binary signature scanning for malware patterns, Metadata forensics (EXIF) for digital fingerprints, and Temporal video analysis for motion anomalies.",
    },
    {
      icon: Eye,
      title: "Understand Your Results",
      description:
        "Review your authenticity score (0-100%) and detailed component analysis. Scores below 40% indicate high risk. Check the anomaly string which flags specific threats like 'Malware Payload Detected' or 'Synthetic Texture Anomaly'. Examine individual component scores for visual, auditory, and malware detection results.",
    },
    {
      icon: AlertTriangle,
      title: "Take Action on Findings",
      description:
        "If malware is detected (red flag), immediately quarantine the file and scan your system. For suspicious authenticity scores, verify the source of the file through alternative channels. Use the detailed component breakdown to understand which detection method flagged the issue, helping you make informed security decisions.",
    },
  ];

  return (
    <Card className="p-8 dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-gray-900 dark:text-gray-100 mb-2">Getting Started with DeepSecure</h2>
        <p className="text-gray-600 dark:text-gray-400">
          A comprehensive guide to protect yourself from deepfake fraud and malware attacks
        </p>
      </div>

      <div className="space-y-6 flex-1 overflow-auto pr-2 scrollable-content">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

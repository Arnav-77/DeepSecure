import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export function ActivityPanel() {
  const updates = [
    {
      version: "v1.2.0",
      date: "30/10/2025",
      changes: [
        "Added AI Awareness section with comprehensive deepfake fraud education",
        "Implemented localStorage for previous chat history persistence",
        "Enhanced CORS support for seamless frontend-backend communication",
      ],
    },
    {
      version: "v1.1.0",
      date: "29/10/2025",
      changes: [
        "Added temporal video analysis with motion jitter detection",
        "Improved authenticity score display (0-100% format)",
        "Enhanced file upload UI with clickable arrow icon",
      ],
    },
    {
      version: "v1.0.0",
      date: "28/10/2025",
      changes: [
        "Initial release with multi-modal detection system",
        "Visual CNN analysis using MobileNetV2 for synthetic texture detection",
        "Auditory MFCC classifier for audio deepfake identification",
        "Binary signature scanning for malware payload detection",
        "Metadata forensics (EXIF) for digital fingerprint analysis",
      ],
    },
  ];

  return (
    <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-gray-900 dark:text-gray-100 mb-2">Recent Updates</h2>
        <p className="text-gray-600 dark:text-gray-400">Latest changes and improvements to the platform</p>
      </div>

      <div className="space-y-6 flex-1 overflow-auto pr-2 scrollable-content">
        {updates.map((update, index) => (
          <div key={index} className="pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950">
                {update.version}
              </Badge>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{update.date}</span>
            </div>
            <ul className="space-y-2">
              {update.changes.map((change, changeIndex) => (
                <li key={changeIndex} className="flex gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <span className="text-blue-500 dark:text-blue-400 mt-1.5">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

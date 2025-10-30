import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { addChatToStorage } from "./Sidebar";
import { 
  ChevronDown, 
  Shield, 
  Upload, 
  FileImage, 
  Video,
  FileAudio,
  File,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Info,
  Eye,
  Ear,
  Scan,
  FileCode,
  Film,
  HelpCircle
} from "lucide-react";

// API Configuration
const API_URL = "http://127.0.0.1:8000/detect";

interface DetectionResult {
  score: number;
  anomaly_string: string;
  malware_flag: boolean;
  components?: {
    visual_score?: number;
    auditory_score?: number;
    signature_check?: {
      has_signature: boolean;
      matches: string[];
    };
    metadata_keys?: number;
    temporal_check?: {
      motion_jitter: number;
      is_video: boolean;
      frame_count: number;
    };
  };
}

export function AuthenticatorView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadedFilename, setLoadedFilename] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for chat load events from Sidebar
  useEffect(() => {
    const handleLoadChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { chat } = customEvent.detail || {};
      
      // Add a small delay to ensure component is mounted
      setTimeout(() => {
        if (chat?.result) {
          console.log("Loading chat with result:", chat);
          // Restore the results from the previous chat
          setResult(chat.result);
          // Store the filename to display it
          setLoadedFilename(chat.filename || chat.title || null);
          setSelectedFile(null);
          setError(null);
        } else {
          console.log("Chat has no result:", chat);
        }
      }, 100);
    };

    window.addEventListener("loadChat", handleLoadChat as EventListener);
    return () => {
      window.removeEventListener("loadChat", handleLoadChat as EventListener);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setLoadedFilename(null);
      setResult(null);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLoadedFilename(null);
      setResult(null);
      setError(null);
    }
  };

  const handleArrowClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Analysis failed. Please ensure the API server is running on port 8000.");
      }

      const data = await response.json();
      setResult(data);
      
      // Create a chat entry for this file analysis with results
      // Use filename as chat title (max 50 chars)
      const chatTitle = selectedFile.name.length > 50 
        ? selectedFile.name.substring(0, 47) + "..." 
        : selectedFile.name;
      addChatToStorage(chatTitle, data, selectedFile.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze file");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setLoadedFilename(null);
    setResult(null);
    setError(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) return <Video className="w-8 h-8 text-blue-500" />;
    if (file.type.startsWith("audio/")) return <FileAudio className="w-8 h-8 text-purple-500" />;
    if (file.type.startsWith("image/")) return <FileImage className="w-8 h-8 text-green-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score < 0.3) return "text-red-500";
    if (score < 0.7) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreLabel = (score: number) => {
    if (score < 0.3) return "High Risk";
    if (score < 0.7) return "Moderate Risk";
    return "Low Risk";
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-gray-900 dark:text-gray-100 mb-2 text-2xl font-semibold">
          Content Authenticity & Malware Detection
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Upload images, videos, audio, or executables for comprehensive security analysis
        </p>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6 overflow-auto">
        {/* File Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              File Upload
            </CardTitle>
            <CardDescription>
              Select or drag & drop your file for analysis. Supports images, videos, audio, and executables.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
              className={`min-h-[400px] w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            }`}
          >
            {selectedFile ? (
                <div className="text-center p-4">
                  <div className="mb-4 flex items-center justify-center">
                    {getFileIcon(selectedFile)}
                </div>
                  <p className="text-gray-900 dark:text-gray-100 mb-2 font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || "Unknown type"}
                </p>
                <Button
                  variant="outline"
                    onClick={handleClear}
                  className="border-gray-200 dark:border-gray-700"
                >
                  Remove File
                </Button>
              </div>
            ) : loadedFilename && result ? (
              <div className="text-center p-4">
                <div className="mb-4 flex items-center justify-center">
                  <File className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-900 dark:text-gray-100 mb-2 font-medium">{loadedFilename}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Previous analysis results
                </p>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="border-gray-200 dark:border-gray-700"
                >
                  Clear Results
                </Button>
              </div>
            ) : (
                <div className="text-center px-8 py-12">
                  <div className="flex justify-center items-center mb-6">
                    <button
                      onClick={handleArrowClick}
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-2"
                      type="button"
                      aria-label="Upload file"
                    >
                      <Upload className="w-16 h-16 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*,.exe,.dll,.bat,.cmd,.ps1"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 mb-3 text-lg font-medium">
                    Drag & drop your file here
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-base">
                  Or{" "}
                    <button
                      onClick={handleArrowClick}
                      className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-medium bg-transparent border-0 p-0"
                      type="button"
                    >
                      browse files
                    </button>{" "}
                    from your computer
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded inline-block">
                    Max Size: 100MB • Formats: Images, Videos, Audio, Executables
                </p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
          <Button 
            variant="outline" 
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
            className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 mr-2" />
                      Analyze for Malware
                    </>
                  )}
          </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  <strong>Analyze for Malware:</strong> Scans the uploaded file using multiple detection methods:
                  Visual CNN analysis (MobileNetV2), Auditory MFCC classifier, Binary signature scanning,
                  Metadata forensics (EXIF), and Temporal frame analysis for videos. Returns a comprehensive
                  authenticity score and malware detection flag.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
          <Button 
                  variant="outline"
                  onClick={handleClear}
                  disabled={!selectedFile && !result}
                  className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
                  Clear
          </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  <strong>Clear:</strong> Removes the selected file and clears all analysis results.
                  This allows you to upload a new file for analysis.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <>
            {/* Main Malware Detection Alert */}
            <Alert className={result.malware_flag ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-green-500 bg-green-50 dark:bg-green-950/20"}>
              <div className="flex items-start gap-3">
                {result.malware_flag ? (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Malware Detection Status
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={result.malware_flag ? "destructive" : "default"}>
                        {result.malware_flag ? "MALWARE DETECTED" : "NO MALWARE DETECTED"}
                      </Badge>
                    </div>
                    <p className="text-sm mt-2">
                      <strong>Anomaly Type:</strong> {result.anomaly_string}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {result.malware_flag 
                        ? "⚠️ This file contains suspicious patterns or known malware signatures. Do not execute or open this file."
                        : "✓ No malware signatures detected. However, always exercise caution with files from untrusted sources."}
                    </p>
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* Authenticity Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Authenticity Score
                </CardTitle>
                <CardDescription className="max-w-prose">
                  Overall confidence score based on multi-modal analysis. 
                  Scores range from 0% (suspicious/high risk) to 100% (authentic/verified).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                      {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.score * 100} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>High Risk</span>
                    <span className={getScoreColor(result.score)}>{getScoreLabel(result.score)}</span>
                    <span>Authentic</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Component Analysis */}
            {result.components && (
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    <span className="font-medium">Detailed Component Analysis</span>
                  </div>
                  <Badge variant="outline">{Object.keys(result.components).length} components</Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  {/* Visual Score */}
                  {result.components.visual_score !== undefined && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" />
                          Visual Analysis (CNN)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  <strong>Visual Analysis:</strong> Uses MobileNetV2 CNN pre-trained on ImageNet
                                  to analyze visual patterns. Detects synthetic textures, anomalies, and manipulated
                                  content. Score ranges from 0% (unrecognized/suspicious) to 100% (highly confident
                                  in recognized pattern).
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">CNN Score</span>
                          <span className="font-bold">{(result.components.visual_score * 100).toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Auditory Score */}
                  {result.components.auditory_score !== undefined && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Ear className="w-4 h-4 text-purple-500" />
                          Auditory Analysis (MFCC)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  <strong>Auditory Analysis:</strong> Extracts Mel-Frequency Cepstral Coefficients (MFCC)
                                  from audio files and uses a scikit-learn classifier to detect audio manipulation,
                                  deepfakes, or synthetic audio. Score indicates probability of authentic audio (0% = fake,
                                  100% = authentic).
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">MFCC Classifier Score</span>
                          <span className="font-bold">{(result.components.auditory_score * 100).toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Malware Signature Check */}
                  {result.components.signature_check && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-red-500" />
                          Malware Signature Scanner
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  <strong>Binary Signature Scanning:</strong> Analyzes the first and last 100 bytes
                                  of the file for known malware signatures (e.g., MZ/PE headers indicating executables
                                  in non-executable files). This is a critical security check that detects embedded
                                  executable code or malware payloads.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Signature Detected</span>
                            <Badge variant={result.components.signature_check.has_signature ? "destructive" : "default"}>
                              {result.components.signature_check.has_signature ? "YES" : "NO"}
                            </Badge>
                          </div>
                          {result.components.signature_check.has_signature && result.components.signature_check.matches && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Matches:</strong> {result.components.signature_check.matches.join(", ")}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata Analysis */}
                  {result.components.metadata_keys !== undefined && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-green-500" />
                          Metadata Forensics (EXIF)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  <strong>Metadata Extraction:</strong> Analyzes EXIF data and file properties including
                                  creation date, camera/software information, GPS coordinates, and other digital fingerprints.
                                  Excessive metadata or anomalies can indicate file manipulation or suspicious origins.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">EXIF Keys Found</span>
                          <span className="font-bold">{result.components.metadata_keys}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Temporal Analysis */}
                  {result.components.temporal_check && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Film className="w-4 h-4 text-orange-500" />
                          Temporal Analysis (Video)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3 h-3 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  <strong>Temporal Motion Jitter:</strong> For video files, analyzes frame-to-frame
                                  differences using OpenCV. High jitter scores indicate unnatural motion patterns that
                                  might suggest deepfake or manipulated video content. Lower jitter suggests natural
                                  video recording.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Is Video File</span>
                            <Badge variant={result.components.temporal_check.is_video ? "default" : "outline"}>
                              {result.components.temporal_check.is_video ? "YES" : "NO"}
                            </Badge>
                          </div>
                          {result.components.temporal_check.is_video && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Frames Analyzed</span>
                                <span className="font-bold">{result.components.temporal_check.frame_count}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Motion Jitter Score</span>
                                <span className="font-bold">{result.components.temporal_check.motion_jitter.toFixed(3)}</span>
                              </div>
                            </>
                          )}
        </div>
                      </CardContent>
                    </Card>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Brain,
  Shield,
  AlertTriangle,
  Eye,
  Ear,
  Video,
  User,
  TrendingUp,
  Lock,
  Search,
  Settings,
  Users,
  CheckCircle2,
  XCircle,
  Info,
  HelpCircle,
  Film,
  Phone,
  CreditCard,
  Briefcase
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export function AIAwarenessView() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">AI Awareness</h1>
                <p className="text-blue-100 text-lg">The New Landscape of Deepfake Fraud</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">Core Danger</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            The erosion of trust in what you see and hear digitally. AI has lowered the barrier for criminals, 
            enabling them to launch highly personalized and convincing social engineering attacks.
          </AlertDescription>
        </Alert>
      </div>

      {/* Common Deepfake Fraud Scams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Common Deepfake Fraud Scams
          </CardTitle>
          <CardDescription>
            Deepfakes are used to exploit authority, urgency, and emotional vulnerability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CEO/CFO Impersonation */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-red-500" />
                CEO/CFO Impersonation
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Fraudsters use deepfake video or voice clones of senior executives to call employees 
                        in finance, demanding urgent transfers of large sums to a fraudulent account.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Description:</strong> Fraudsters use deepfake video or voice clones of senior executives 
                  to call employees in finance, demanding urgent transfers of large sums to a fraudulent account.
                </p>
                <div className="bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    <strong>Real-World Example:</strong> Corporate Wire Fraud - A finance worker was duped into paying 
                    out over $25 million after attending a video conference call with deepfakes impersonating the CFO 
                    and other colleagues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC/Identity Theft */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" />
                KYC/Identity Theft
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Criminals use synthetic videos or images to bypass liveness detection during online 
                        bank account opening (KYC) or customer service verification.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Description:</strong> Criminals use synthetic videos or images to bypass liveness detection 
                  during online bank account opening (KYC) or customer service verification, leading to new account fraud.
                </p>
                <div className="bg-purple-100 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 rounded-lg p-3">
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    <strong>Real-World Example:</strong> Synthetic Identity - Creating entirely fake digital identities 
                    that appear real to secure loans or bypass security systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grandparent/Emotional Scams */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-orange-500" />
                Grandparent/Emotional Scams
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Scammers use voice cloning to impersonate family members in distress to extort immediate payment.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Description:</strong> Scammers use voice cloning to call a victim, impersonating a family member 
                  (like a child or grandchild) in "distress" (e.g., being kidnapped or arrested) to extort immediate payment.
                </p>
                <div className="bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800 rounded-lg p-3">
                  <p className="text-sm text-orange-900 dark:text-orange-100">
                    <strong>Real-World Example:</strong> Emotional Manipulation - The victim authorizes a transfer due to 
                    the immediate, high-pressure emotional impact of the familiar voice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Scams */}
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Investment Scams
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Deepfake videos of famous billionaires are created to promote fake investment platforms, 
                        tricking victims into losing money.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Description:</strong> Deepfake videos of famous billionaires or business anchors (like Elon Musk) 
                  are created to promote fake, high-return investment platforms, tricking retirees into draining their savings.
                </p>
                <div className="bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>Real-World Example:</strong> Deepfake Endorsements - Victims lose hundreds of thousands of dollars, 
                    convinced by the realistic AI video that the opportunity is legitimate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* How to Spot Deepfakes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            🛡️ How to Spot Deepfakes (Warning Signs)
          </CardTitle>
          <CardDescription>
            While AI is making detection harder, be skeptical and look for these common flaws, especially in older or hastily made deepfakes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video/Image Signs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Video/Image Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Unnatural Blinking</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Too frequent, too infrequent, or sudden, inconsistent eye movements.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Facial Anomalies</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mismatched lighting or shadows on the face versus the background, distorted earlobes or teeth, 
                      or blurry edges where the face meets the hair/neck.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio/Voice Signs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ear className="w-5 h-5 text-purple-500" />
                Audio/Voice Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Monotone/Flatness</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The voice may sound robotic, have an unnatural or flat cadence, or lack the natural pauses 
                      and breathing sounds of human speech.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Spectral Artifacts</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Subtle digital buzzing or background noise that doesn't match the environment (due to the synthesis process).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context Signs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Context Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Mismatched Timing</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The lips may be slightly out of sync with the audio (lip-sync mismatch).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Unnatural Behavior</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The deepfake avoids profile shots or places a hand near the face, which can cause the forgery to break up.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Prevention and Mitigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-500" />
            🔒 Deepfake Prevention and Mitigation Strategies
          </CardTitle>
          <CardDescription>
            The defense against deepfake fraud must be multi-layered (like your DeepSecure project)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Proactive Verification Protocol */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Proactive Verification Protocol (The "Safety Net")
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Never assume a message is real, even if the person looks or sounds exactly like your contact.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Never assume a message is real, even if the person looks or sounds exactly like your contact. 
                Establish a protocol: If you receive an urgent request for money or sensitive data (especially outside 
                business hours), hang up and call them back on an officially stored number (not the number that just called you).
              </p>
            </CardContent>
          </Card>

          {/* Strengthen Digital Security */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Strengthen Digital Security
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Implement Multi-Factor Authentication (MFA) on all sensitive accounts to add an extra layer of security.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Implement Multi-Factor Authentication (MFA) on all sensitive accounts (banks, social media). 
                This ensures that even if a deepfake video can bypass facial recognition, the attacker still needs 
                a code from your physical device.
              </p>
            </CardContent>
          </Card>

          {/* Share with Caution */}
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Share with Caution
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Limit the amount of high-quality photos and videos you share publicly to reduce the data 
                        available for deepfake creation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Limit the amount of high-quality photos and videos you share publicly on social media. 
                Adjust privacy settings to reduce the data pool available for deepfake creation.
              </p>
            </CardContent>
          </Card>

          {/* Use Advanced Detection Tools */}
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-500" />
                Use Advanced Detection Tools
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Implement technical solutions like DeepSecure that leverage AI to scan files for synthetic 
                        artifacts and hidden malware payloads.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Implement technical solutions (like DeepSecure) that leverage AI to scan files for both synthetic 
                artifacts and hidden malware payloads before they can cause harm.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Final Message */}
      <Alert className="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20">
        <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <AlertTitle className="text-indigo-900 dark:text-indigo-100">Stay Protected</AlertTitle>
        <AlertDescription className="text-indigo-800 dark:text-indigo-200">
          The rise of deepfake technology has lowered the bar for sophisticated cybercrime, making robust awareness 
          and technology essential for every business and individual.
        </AlertDescription>
      </Alert>
    </div>
  );
}


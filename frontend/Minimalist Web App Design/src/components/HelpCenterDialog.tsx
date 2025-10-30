import { X, MoreVertical, ChevronLeft, Paperclip, Smile, FileImage, Mic, Send, Maximize2, Minimize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";
import { addChatToStorage } from "./Sidebar";

interface HelpCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpCenterDialog({ open, onOpenChange }: HelpCenterDialogProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [emojiPopoverOpen, setEmojiPopoverOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const emojis = ["😊", "👍", "❤️", "😂", "🎉", "🔥", "✨", "💯", "🙌", "👏", "🤔", "😎", "🚀", "💡", "⭐", "✅"];

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name).join(", ");
      toast.success(`File(s) attached: ${fileNames}`);
    }
  };

  const handleImageAttachment = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name).join(", ");
      toast.success(`Image(s) attached: ${fileNames}`);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setEmojiPopoverOpen(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success("Voice recording started");
    } else {
      toast.success("Voice recording stopped");
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Create chat title from first few words of message (max 50 chars)
    const title = message.trim().split(' ').slice(0, 6).join(' ') || "New Chat";
    const chatTitle = title.length > 50 ? title.substring(0, 47) + "..." : title;
    
    // Add chat to storage
    addChatToStorage(chatTitle);
    
    // Show success message
    toast.success("Message sent");
    
    // Clear message
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isExpanded ? 'max-w-7xl h-[90vh]' : 'max-w-2xl'} p-0 gap-0 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300`}>
        <DialogTitle className="sr-only">Help Center</DialogTitle>
        <DialogDescription className="sr-only">
          Chat with DeepSecure AI support team
        </DialogDescription>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 dark:text-gray-400"
              onClick={() => onOpenChange(false)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white rounded"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              
              <div>
                <h2 className="text-gray-900 dark:text-gray-100">DeepSecure AI</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Within an hour
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-600 dark:text-gray-400"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? (
                    <>
                      <Minimize2 className="w-4 h-4 mr-2" />
                      Collapse Window
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Expand Window
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 dark:text-gray-400"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 p-6 ${isExpanded ? 'min-h-[500px]' : 'min-h-[400px]'} max-h-[60vh] overflow-auto scrollable-content`}>
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white rounded"></div>
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-gray-100 mb-2">DeepSecure Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ask us anything, or share your feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <div className="flex items-center gap-2 px-3 py-2">
                <textarea
                  placeholder="Message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm"
                  rows={1}
                  style={{
                    minHeight: "24px",
                    maxHeight: "120px",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "24px";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </div>
              <div className="flex items-center gap-1 px-2 pb-2">
                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />

                {/* Attachment Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={handleFileAttachment}
                  type="button"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                {/* Emoji Button */}
                <Popover open={emojiPopoverOpen} onOpenChange={setEmojiPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      type="button"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="grid grid-cols-8 gap-1">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-xl"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Image Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={handleImageAttachment}
                  type="button"
                >
                  <FileImage className="w-4 h-4" />
                </Button>

                {/* Voice Recording Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 transition-colors ${
                    isRecording
                      ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={toggleRecording}
                  type="button"
                >
                  <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
                </Button>
              </div>
            </div>
            <Button
              className="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-10 w-10 p-0 rounded-full flex items-center justify-center"
              disabled={!message.trim()}
              onClick={handleSend}
              type="button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

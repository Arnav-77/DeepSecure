import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50"></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-violet-200 mb-8">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-gray-700">Introducing Minimal Design</span>
        </div>
        
        <h1 className="max-w-4xl mx-auto text-gray-900 mb-6">
          Build Beautiful Things with Minimal Effort
        </h1>
        
        <p className="max-w-2xl mx-auto text-gray-600 mb-12">
          Experience the perfect balance of simplicity and functionality. Our platform empowers you to create stunning experiences without the complexity.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 group"
          >
            Start Building
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
            <div className="text-gray-900 mb-1">10k+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
            <div className="text-gray-900 mb-1">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 col-span-2 md:col-span-1">
            <div className="text-gray-900 mb-1">4.9/5</div>
            <div className="text-gray-600">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}

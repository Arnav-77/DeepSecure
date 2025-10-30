import { Card } from "./ui/card";
import { Zap, Shield, Palette, Code, Layers, Sparkles } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance that delivers results in milliseconds, not seconds."
    },
    {
      icon: Shield,
      title: "Secure by Default",
      description: "Enterprise-grade security built into every layer of the platform."
    },
    {
      icon: Palette,
      title: "Beautiful Design",
      description: "Stunning interfaces that users love, crafted with attention to detail."
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Clean APIs and comprehensive documentation for seamless integration."
    },
    {
      icon: Layers,
      title: "Fully Modular",
      description: "Mix and match components to build exactly what you need."
    },
    {
      icon: Sparkles,
      title: "AI Powered",
      description: "Intelligent features that learn and adapt to your workflow."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you build faster and more efficiently than ever before.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-8 border-gray-200 hover:border-violet-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

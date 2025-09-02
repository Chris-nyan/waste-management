import { Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';

// A collection of testimonials to be cycled through
const testimonials = [
  {
    quote: "This platform transformed how we handle our recycling. Incredibly efficient and eco-friendly!",
    author: "A Happy Vendor"
  },
  {
    quote: "RecyGlo makes sustainability simple. Our community has never been cleaner.",
    author: "Community Manager"
  },
  {
    quote: "The best tool for connecting with responsible disposal services. A game-changer for my business.",
    author: "Local Restaurant Owner"
  }
];

// A more vibrant, eye-catching gradient background.
const GradientBackground = () => (
  <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600" />
);

const Template = ({ title, children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Effect to cycle through testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <>
      {/* We define the animations directly in the component for simplicity.
        This keyframe animation creates a subtle fade-in and slide-up effect.
      */}
      <style>
        {`
          @keyframes content-fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: content-fade-in-up 0.8s ease-out forwards;
          }
        `}
      </style>
      <div className="flex min-h-screen w-full font-poppins bg-background">
        {/* Left Panel - Branding (Vibrant Gradient Glass Theme) */}
        <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-12 text-center text-white overflow-hidden">
          <GradientBackground />

          {/* Content Overlay with entrance animation */}
          <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
              <div className="flex items-center space-x-3 mb-8 border border-white/30 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg">
                <Leaf className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold tracking-tight text-white">RecyGlo</h1>
              </div>

              <p className="text-xl mt-4 max-w-md leading-relaxed text-white/90">
                  Simple, smart, and sustainable waste management for a cleaner future.
              </p>

              {/* Animated Testimonial Section */}
              <div className="mt-16 p-6 border border-white/30 rounded-lg bg-white/10 backdrop-blur-xl w-full max-w-md shadow-lg h-40 flex flex-col justify-center items-center">
                {/* The key prop is crucial here. When it changes, React re-mounts the div, 
                  which re-triggers the entrance animation for the new testimonial.
                */}
                <div key={currentIndex} className="animate-fade-in-up">
                  <blockquote className="text-lg italic text-white/80">
                      "{currentTestimonial.quote}"
                  </blockquote>
                  <p className="mt-4 text-sm font-semibold text-white tracking-wider">- {currentTestimonial.author}</p>
                </div>
              </div>
          </div>

          <p className="absolute bottom-6 text-sm text-white/50 z-10">
              © {new Date().getFullYear()} RecyGlo Inc.
          </p>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-sm">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                <Leaf className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">RecyGlo</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-center text-foreground mb-6">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Template;


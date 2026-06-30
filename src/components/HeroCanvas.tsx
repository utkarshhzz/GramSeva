import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FRAME_COUNT = 102;
const FRAME_PREFIX = '/hero/video_000/video_';
const FRAME_SUFFIX = '.png';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `${FRAME_PREFIX}${paddedIndex}${FRAME_SUFFIX}`;
      
      img.onload = () => {
        loadedCount++;
        setLoaded(Math.round((loadedCount / FRAME_COUNT) * 100));
      };
      
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Draw frame on canvas when scroll updates
  useEffect(() => {
    return frameIndex.onChange((latest) => {
      if (!canvasRef.current || images.length === 0) return;
      
      const context = canvasRef.current.getContext('2d');
      if (!context) return;
      
      const currentFrame = Math.round(latest);
      const img = images[currentFrame];
      
      if (img && img.complete) {
        // Clear and draw maintaining aspect ratio to fill the screen
        const canvas = canvasRef.current;
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.width;
        const ih = img.height;
        
        const scale = Math.max(cw / iw, ch / ih);
        const x = (cw / 2) - (iw / 2) * scale;
        const y = (ch / 2) - (ih / 2) * scale;
        
        context.clearRect(0, 0, cw, ch);
        context.drawImage(img, x, y, iw * scale, ih * scale);
      }
    });
  }, [frameIndex, images]);

  // Initial draw and window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        // Force redraw of current frame
        if (images.length > 0 && images[0].complete) {
          const currentFrame = Math.round(frameIndex.get());
          const img = images[currentFrame] || images[0];
          const context = canvasRef.current.getContext('2d');
          
          if (context) {
            const cw = canvasRef.current.width;
            const ch = canvasRef.current.height;
            const iw = img.width;
            const ih = img.height;
            
            const scale = Math.max(cw / iw, ch / ih);
            const x = (cw / 2) - (iw / 2) * scale;
            const y = (ch / 2) - (ih / 2) * scale;
            
            context.clearRect(0, 0, cw, ch);
            context.drawImage(img, x, y, iw * scale, ih * scale);
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    return () => window.removeEventListener('resize', handleResize);
  }, [images, frameIndex]);

  // Text Animations based on scroll position
  const text1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0, 0.25], [0, -50]);

  const text2Opacity = useTransform(scrollYProgress, [0.3, 0.45, 0.6], [0, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.3, 0.45, 0.6], [50, 0, -50]);

  const text3Opacity = useTransform(scrollYProgress, [0.65, 0.8, 1], [0, 1, 1]);
  const text3Y = useTransform(scrollYProgress, [0.65, 0.8], [50, 0]);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-[#06060a]">
      {/* Sticky container that holds the canvas and text overlay */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Loading Indicator */}
        {loaded < 100 && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#06060a] transition-opacity duration-1000" style={{ opacity: loaded === 100 ? 0 : 1 }}>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${loaded}%` }} />
            </div>
            <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Initializing Experience... {loaded}%</p>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06060a]/80 via-transparent to-[#06060a]" />
        
        {/* Text 1: Initial Hook */}
        <motion.div 
          style={{ opacity: text1Opacity, y: text1Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8 backdrop-blur-md">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Powered by Google Gemini AI
          </div>
          <p className="text-lg md:text-2xl text-indigo-300/80 font-medium mb-6 tracking-wide">
            हर समस्या का समाधान, हर नागरिक की आवाज़
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-white drop-shadow-2xl">
            Your Community.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Voice.
            </span>
          </h1>
          <p className="mt-8 text-white/50 text-sm tracking-widest uppercase animate-pulse">Scroll to explore</p>
        </motion.div>

        {/* Text 2: The Problem/Solution */}
        <motion.div 
          style={{ opacity: text2Opacity, y: text2Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl max-w-4xl leading-tight">
            Report issues simply by speaking. <br/>
            <span className="text-white/50">Let AI handle the rest.</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl font-light">
            From broken pipes to unlit streets, GramSahay automatically drafts formal complaints and routes them to the right authorities in seconds.
          </p>
        </motion.div>

        {/* Text 3: Action */}
        <motion.div 
          style={{ opacity: text3Opacity, y: text3Y }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl">
            Be the Hero.
          </h2>
          <p className="text-xl text-white/60 max-w-2xl font-light mb-10">
            Join thousands of citizens making a real difference.
          </p>
          <div className="flex gap-4 pointer-events-auto">
             <Link
                to="/sign-up"
                className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-[1.05]"
              >
                Start Reporting
              </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

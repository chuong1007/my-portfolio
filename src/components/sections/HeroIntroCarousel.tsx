"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface Project {
  id: string;
  title: string;
  imageUrl?: string;
  cover_image?: string;
}

interface HeroIntroCarouselProps {
  projects: Project[];
  onComplete: () => void;
  isAdminPreview?: boolean;
  deviceMode?: "desktop" | "tablet" | "mobile";
  tiltDirection?: "inward" | "outward";
}

export function HeroIntroCarousel({ projects, onComplete, isAdminPreview = false, deviceMode = "desktop", tiltDirection = "inward" }: HeroIntroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "slide" | "finished" | "hidden">("enter");
  const [isShrunk, setIsShrunk] = useState(false);
  const [slideConfig, setSlideConfig] = useState<{ duration: number; ease: any }>({ duration: 0.32, ease: "linear" });
  
  const [isMobileDevice, setIsMobileDevice] = useState(deviceMode === "mobile");
  
  // Ref for the container to measure actual rendered width
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If it's explicitly passed as admin preview, just use it
    if (isAdminPreview && deviceMode) {
      setIsMobileDevice(deviceMode === "mobile");
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Use ResizeObserver to detect ACTUAL container width
    // This perfectly supports device simulator frames and real mobile devices
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setIsMobileDevice(entry.contentRect.width < 768);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [isAdminPreview, deviceMode]);


  const displayProjects = [...projects.slice(0, 8), ...projects.slice(0, 8)];
  const N = displayProjects.length;

  useEffect(() => {
    if (N === 0) {
      onComplete();
      return;
    }

        const shrinkTimeout = setTimeout(() => {
      setIsShrunk(true);
    }, 3000); // Shrink 1.5s earlier than 2800ms

    // Phase 1: Enter -> Immediately start sliding
    const enterTimeout = setTimeout(() => {
      setPhase("slide");
      
      let step = 0;
      const maxSteps = 8; // Only slide one original loop
      let currentTimeout: NodeJS.Timeout;

      const nextSlide = () => {
        if (step < maxSteps) {
          step++;
          setCurrentIndex(step % N);
          
          // Tính toán tốc độ trượt (chậm dần đều ở những bước cuối)
          let currentDelay = 320; 
          let currentEase = "linear";
          
          if (step === maxSteps - 2) {
             currentDelay = 450;
             currentEase = "linear";
          } else if (step === maxSteps - 1) {
             currentDelay = 650;
             currentEase = "easeOut";
          } else if (step === maxSteps) {
             currentDelay = 1000;
             currentEase = "easeOut";
          }
          
          setSlideConfig({ duration: currentDelay / 1000, ease: currentEase });

          if (step === maxSteps) {
            // Khi đã chạy tới bước cuối, chờ animation cuối hoàn thành rồi mới chuyển phase
            currentTimeout = setTimeout(() => {
              setPhase("finished");
              onComplete();
              setTimeout(() => {
                setPhase("hidden");
              }, 6450);
            }, currentDelay);
          } else {
            currentTimeout = setTimeout(nextSlide, currentDelay);
          }
        }
      };
      
      currentTimeout = setTimeout(nextSlide, 320);
      
      return () => clearTimeout(currentTimeout);
    }, 600); // Super tight start for the bottom pop-up to mostly finish, then immediately slide

    return () => clearTimeout(enterTimeout);
      clearTimeout(shrinkTimeout);
  }, [N]); // removed onComplete to prevent re-triggering

  if (N === 0) return null;

  return (
    <motion.div 
      ref={containerRef}
      className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none"
      
      initial={{ opacity: 1, filter: "blur(0px)" }}
      animate={{
        pointerEvents: phase === "hidden" ? "none" : "auto", 
        opacity: phase === "hidden" && !isAdminPreview ? 0 : (isShrunk && !isAdminPreview ? 0.15 : 1), 
        scale: isShrunk ? 0.8 : 1,
        filter: isShrunk && !isAdminPreview ? "blur(8px)" : "blur(0px)",
        y: isShrunk ? -40 : 0
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ maskImage: isMobileDevice ? "none" : "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)", WebkitMaskImage: isMobileDevice ? "none" : "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)" }}>
        <div className="w-full h-full flex items-center justify-center" style={{ perspective: 1200 }}>
          <div className="relative w-full max-w-7xl h-[500px] flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {displayProjects.map((project, index) => {
            // Circular offset logic for balanced sides
            let rawOffset = index - currentIndex;
            // Handle wrapping for infinite circular feel
            if (rawOffset > N / 2) rawOffset -= N;
            if (rawOffset < -N / 2) rawOffset += N;
            
            const offset = rawOffset;
            const isCenter = offset === 0;
            
            
            

            
            // Desktop/Tablet: Flat 2.5D Carousel (No rotation, strict gaps, exact aspect ratio)
            let x = 0;
            let z = 0; // Flat Z
            let ry = 0;
            let rz = 0;
            let scale = 1;
            
            const gap = 24; // 24px padding between cards
            
            if (offset === 0) {
              x = 0;
              z = 0;
              ry = 0;
              scale = 1.0; 
            } else {
              const sign = Math.sign(offset);
              const abs = Math.abs(offset);
              
              if (abs === 1) {
                x = sign * 280; 
                z = -100;
                ry = tiltDirection === 'outward' ? sign * 35 : -sign * 35; // Slant for perspective effect
                scale = 0.85;
              } else if (abs === 2) {
                x = sign * 480; 
                z = -200;
                ry = tiltDirection === 'outward' ? sign * 35 : -sign * 35;
                scale = 0.7;
              } else if (abs === 3) {
                x = sign * 640;
                z = -300;
                ry = tiltDirection === 'outward' ? sign * 35 : -sign * 35;
                scale = 0.55;
              } else {
                x = sign * 780;
                z = -400;
                ry = tiltDirection === 'outward' ? sign * 35 : -sign * 35;
                scale = 0.4;
              }
            }
            
            let opacity = Math.abs(offset) >= 4 ? 0 : 1; 
            let zIndex = 100 - Math.abs(offset);
            let cardOpacity = 1;
            let cardBlur = Math.abs(offset) >= 2 ? (Math.abs(offset) - 1) * 4 : 0;
            let y = 0;

            if (isMobileDevice) {
              let distance = (index - currentIndex + N) % N;
              
              if (distance === N - 1) {
                // FALLING CARD: Fall far down, tilt left
                y = 800; 
                z = 50;  
                scale = 0.4; 
                x = -200; // Trượt sang trái
                ry = 0;
                rz = -15; // Nghiêng nhẹ qua trái
                zIndex = 101; 
                cardOpacity = 1; 
                cardBlur = 0;
                opacity = 0; 
              } else {
                // STACKED CARDS BEHIND: Lộ ra nhiều hơn, nghiêng nhẹ, show 3 cards
                y = -distance * 75; 
                z = -distance * 50;
                scale = 1 - distance * 0.04; 
                x = 0;
                ry = 0;
                rz = distance * 4; // Nghiêng xuống bên phải 1 chút
                zIndex = 100 - distance;
                cardOpacity = distance > 2 ? 0 : (1 - distance * 0.15); 
                cardBlur = distance > 0 ? distance * 1.0 : 0; 
                opacity = distance > 2 ? 0 : 1; // Chỉ show 3 card (distance 0, 1, 2)
              }
            }

            // Pop up strictly from bottom (no horizontal movement on enter)
            return (
              <motion.div
                key={`${project.id}-${index}`}
                className={`absolute ${isMobileDevice ? "w-[220px]" : "w-[320px]"} aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-transparent dark:border-white/10 bg-[var(--bg-surface)]`}
                style={{ zIndex }}
                initial={{ 
                  opacity: 0, 
                  x, 
                  y: 500, 
                  z,
                  rotateY: ry,
                  rotateZ: rz,
                  rotateX: 45,
                  scale: scale * 0.8,
                  filter: "blur(0px)"
                }}
                animate={{
                  pointerEvents: phase === "hidden" ? "none" : "auto",
                  opacity,
                  x,
                  y: y,
                  z,
                  rotateY: ry,
                  rotateZ: rz,
                  rotateX: 0,
                  scale,
                  filter: `blur(${cardBlur}px)`
                }}
                transition={{
                  type: phase === "enter" ? "spring" : "tween",
                  stiffness: 200,
                  damping: 20,
                  delay: phase === "enter" ? Math.abs(offset) * 0.08 : 0, 
                  ease: phase === "slide" ? slideConfig.ease : undefined,
                  duration: phase === "slide" ? slideConfig.duration : undefined
                }}
              >
                {(project.cover_image || project.imageUrl) && (
                  <img
                    src={project.cover_image || project.imageUrl}
                    alt={project.title || "Project"}
                    className="w-full h-full object-cover"
                  />
                )}
                <motion.div 
                  className="absolute inset-0 bg-black"
                  animate={{
                    pointerEvents: phase === "hidden" ? "none" : "auto", 
                    opacity: isMobileDevice ? (1 - cardOpacity) : (Math.abs(offset) > 1 ? 0.6 : 0) 
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

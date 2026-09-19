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
  tiltDirection?: "inward" | "outward" | "inward-reverse-scale";
  gap?: number;
  perspectiveMultiplier?: number;
  dTheta?: number;
  w_card?: number;
  blurStrength?: number;
  dimStrength?: number;
  displayCount?: number;
  yOffsetMobile?: number;
  yOffsetTablet?: number;
  yOffsetDesktop?: number;
  skipAnimation?: boolean;
}

export function HeroIntroCarousel({ projects, onComplete, isAdminPreview = false, deviceMode = "desktop", tiltDirection = "inward", gap = 16, perspectiveMultiplier = 1.5, dTheta = 14, w_card = 260, blurStrength = 1, dimStrength = 1, displayCount = 7, yOffsetMobile = 48, yOffsetTablet = 112, yOffsetDesktop = 152, skipAnimation = false }: HeroIntroCarouselProps) {
  const isSkipMount = useRef(skipAnimation).current;
  const [currentIndex, setCurrentIndex] = useState(isSkipMount ? 8 : 0);
  const [phase, setPhase] = useState<"enter" | "slide" | "finished" | "hidden">(isSkipMount ? "finished" : "enter");
  const [isShrunk, setIsShrunk] = useState(isSkipMount);
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
      
      initial={isSkipMount ? false : { opacity: 1, filter: "blur(0px)" }}
      animate={{
        pointerEvents: phase === "hidden" ? "none" : "auto", 
        opacity: phase === "hidden" ? 0 : (isShrunk && !isAdminPreview ? 0.15 : 1), 
        scale: isShrunk && !isAdminPreview ? 0.8 : 1,
        filter: isShrunk && !isAdminPreview ? "blur(8px)" : "blur(0px)",
        y: isShrunk && !isAdminPreview ? -40 : 0
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ maskImage: isMobileDevice ? "none" : "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)", WebkitMaskImage: isMobileDevice ? "none" : "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)" }}>
        {/* Mathematical Cylinder Constants */}
        {(() => {
          const w_card_val = w_card;
          const g_card = gap;
          const thetaDeg = dTheta;
          const thetaRad = thetaDeg * (Math.PI / 180);
          const R = (w_card_val + g_card) / (2 * Math.tan(thetaRad / 2));
          const zSign = tiltDirection === 'inward-reverse-scale' ? -1 : 1;
          const ringZ = tiltDirection === 'inward' ? 0 : -zSign * R;
          const perspectiveValue = Math.round(R * perspectiveMultiplier);
          
          return (
            <div className="w-full h-full flex items-center justify-center" style={{ perspective: isMobileDevice ? 1200 : perspectiveValue, '--mt-mob': `${yOffsetMobile}px`, '--mt-tab': `${yOffsetTablet}px`, '--mt-desk': `${yOffsetDesktop}px` } as React.CSSProperties}>
              <motion.div 
                id="carousel-ring"
                className="relative w-full max-w-[100vw] h-[500px] flex items-center justify-center mt-[var(--mt-mob)] md:mt-[var(--mt-tab)] lg:mt-[var(--mt-desk)]" 
                style={{ transformStyle: "preserve-3d" }}
                initial={isSkipMount ? false : { z: isMobileDevice ? 0 : ringZ }}
                animate={{ z: isMobileDevice ? 0 : ringZ }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
            {displayProjects.map((project, index) => {
            // Circular offset logic for balanced sides
            let rawOffset = index - currentIndex;
            // Handle wrapping for infinite circular feel
            if (rawOffset > N / 2) rawOffset -= N;
            if (rawOffset < -N / 2) rawOffset += N;
            
            const offset = rawOffset;
            const isCenter = offset === 0;
            
            
            

            
            // Rule 6 variables repeated for map scope
            const w_card_val = w_card;
            const g_card = gap;
            const thetaDeg = dTheta;
            const thetaRad = thetaDeg * (Math.PI / 180);
            const R = (w_card_val + g_card) / (2 * Math.tan(thetaRad / 2));
            let x = 0, y = 0, z = 0, ry = 0, rz = 0, scale = 1;
            let opacity = 1;
            let zIndex = 100 - Math.abs(offset);
            let cardOpacity = 1;
            let cardBlur = 0;
            let cardBrightness = 1;
            
            if (isMobileDevice) {
              const distance = Math.abs(offset);
              if (offset < 0) {
                // Drop down with a tilt
                y = 500; z = 0; scale = 0.8; x = -50; ry = 0; rz = -25; zIndex = 101; cardOpacity = 1; cardBlur = 0; opacity = 0; 
              } else {
                y = distance * -30 + 20; z = -distance * 50; scale = 1 - distance * 0.04; x = 0; ry = 0; rz = distance * 4; zIndex = 100 - distance;
                cardOpacity = distance > 2 ? 0 : (1 - distance * 0.15); cardBlur = distance > 0 ? distance * 1.0 : 0; opacity = distance > 2 ? 0 : 1; 
              }
            } else {
              const absOffset = Math.abs(offset);
              
              if (tiltDirection === 'inward') {
                // Linear V-Shape (Hướng xen kẽ)
                x = offset * (w_card_val + g_card);
                z = -absOffset * (perspectiveMultiplier * 100);
                ry = -offset * thetaDeg; // Face inward
                
                if (absOffset <= 1) {
                  opacity = 1; cardBlur = 0; cardBrightness = 1;
                } else if (absOffset === 2) {
                  opacity = 1; cardBlur = 3 * blurStrength; cardBrightness = 1 - (0.25 * dimStrength);
                } else {
                  opacity = 0.85; cardBlur = 8 * blurStrength; cardBrightness = 1 - (0.5 * dimStrength);
                  if (absOffset > 3) opacity = 0;
                }
              } else {
                // Pure Cylinder (Hướng ra & Lớn dần ra ngoài)
                let zSign = tiltDirection === 'inward-reverse-scale' ? -1 : 1;
                // For cylinder, ry must match the position offset to stay on the correct side
                // outward (convex): ry = positive for right side (Faces Outward)
                // inward-reverse (concave): ry = negative for right side (Faces Inward)
                let rySign = tiltDirection === 'inward-reverse-scale' ? -1 : 1;
                
                ry = rySign * offset * thetaDeg;
                z = zSign * R;
                
                if (absOffset <= 1) {
                  opacity = 1; cardBlur = 0; cardBrightness = 1;
                } else if (absOffset === 2) {
                  opacity = 1; cardBlur = 3 * blurStrength; cardBrightness = 1 - (0.25 * dimStrength);
                } else {
                  opacity = 0.85; cardBlur = 8 * blurStrength; cardBrightness = 1 - (0.5 * dimStrength);
                  if (absOffset > 3) opacity = 0;
                }
              }
            }

            // Pop up strictly from bottom (no horizontal movement on enter)
            return (
              <motion.div
                key={`${project.id}-${index}`}
                data-offset={offset}
                className={`test-card-measure absolute ${isMobileDevice ? "w-[260px]" : ""} aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-transparent dark:border-white/10 bg-[var(--bg-surface)]`}
                style={{ zIndex, width: isMobileDevice ? undefined : `${w_card}px` }}
                transformTemplate={({ x, y, z, rotateY, rotateZ, scale }) => {
                  if (isMobileDevice) {
                    return `translateX(${x}) translateY(${y}) translateZ(${z}) scale(${scale}) rotateX(0deg) rotateY(${rotateY}) rotateZ(${rotateZ})`;
                  }
                  return `translateX(${x}) translateY(${y}) rotateY(${rotateY}) translateZ(${z}) scale(${scale}) rotateZ(${rotateZ})`;
                }}
                initial={{ 
                  opacity: 0, 
                  x, 
                  y: 500, 
                  z,
                  rotateY: ry,
                  rotateZ: rz,
                  rotateX: 0,
                  scale: scale * 0.8,
                  filter: "blur(0px) brightness(1)"
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
                  filter: `blur(${cardBlur}px) brightness(${cardBrightness})`
                }}
                transition={{
                  type: phase === "enter" ? "spring" : "tween",
                  stiffness: 200,
                  damping: 20,
                  delay: phase === "enter" ? (isMobileDevice ? 0 : Math.abs(offset) * 0.08) : 0, 
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
                    opacity: isMobileDevice ? (1 - cardOpacity) : 0 
                  }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            );
          })}
              </motion.div>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}

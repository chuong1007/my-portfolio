"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Hàm Easing cho animation mượt (easeInOutCubic)
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function SmoothScrollSnap() {
  const pathname = usePathname();
  const isSnappingRef = useRef(false);

  useEffect(() => {
    const isActivePage = pathname === "/" || pathname?.includes("/admin");
    if (!isActivePage) return;

    let scrollTimeout: NodeJS.Timeout;

    const snapToClosestSection = () => {
      if (isSnappingRef.current) return;

      const selectors = [".hero-container", "#about", "#projects", "#blog", "#contact"];
      const sections = selectors
        .map(sel => document.querySelector(sel))
        .filter(Boolean) as HTMLElement[];

      if (sections.length === 0) return;

      const scrollContainer = (lastScrollTarget instanceof Element && lastScrollTarget.classList.contains('custom-scrollbar')) ? lastScrollTarget : window;
      const isWindow = scrollContainer === window;
      const scrollY = isWindow ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;
      const isMobile = window.innerWidth <= 768;

      let closestSection: HTMLElement | null = null;
      let minDistance = Infinity;
      let targetScroll = 0;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        
        let containerOffset = 0;
        if (!isWindow) {
          const containerRect = (scrollContainer as HTMLElement).getBoundingClientRect();
          containerOffset = containerRect.top;
        }
        
        const headerEl = document.querySelector('header');
        const isHeaderHidden = headerEl ? headerEl.classList.contains('-translate-y-full') : false;
        const headerHeight = isHeaderHidden ? 0 : (isMobile ? 56 : 64);
        const minBreathingRoom = 24; 
        
        const computedStyle = window.getComputedStyle(section);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        
        const extraOffset = Math.max(0, minBreathingRoom - paddingTop);
        const idealTopOnScreen = headerHeight + extraOffset; 

        // Khoảng cách từ vị trí hiện tại của section top tới vị trí lý tưởng trên màn hình
        // Âm = section đang nằm cao hơn vị trí lý tưởng (bị cuộn qua)
        // Dương = section đang nằm thấp hơn vị trí lý tưởng (chưa cuộn tới)
        const distanceFromIdeal = (rect.top - containerOffset) - idealTopOnScreen;
        
        // VÙNG HÚT THÔNG MINH (SMART SNAP ZONE):
        // 1. Không hút giật ngược lên nếu người dùng đã cuộn qua section để đọc nội dung bên trong (distance < -200)
        // 2. Sẽ hút nếu section nằm ở nửa trên/giữa màn hình (distance < 65% chiều cao màn hình)
        if (distanceFromIdeal > -250 && distanceFromIdeal < window.innerHeight * 0.65) {
          const distance = Math.abs(distanceFromIdeal);
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = section;
            targetScroll = scrollY + distanceFromIdeal;
          }
        }
      });

      // Chỉ thực hiện animation nếu khoảng cách lớn hơn 10px (tránh giật tại chỗ)
      if (closestSection && minDistance > 10) {
        isSnappingRef.current = true;
        (window as any).__isSnapScrolling = true;
        
        const startScroll = isWindow ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;
        const distance = targetScroll - startScroll;
        const duration = 800; // 800ms - Rất êm và chậm rãi
        let startTime: number | null = null;
        let animationFrameId: number;
        let isCancelled = false;

        // ƯU TIÊN LỆNH SCROLL CỦA NGƯỜI DÙNG:
        // Nếu người dùng lăn chuột (wheel) hoặc chạm tay (touchstart) khi đang chạy animation,
        // Dừng animation ngay lập tức!
        const cancelAnimation = () => {
          isCancelled = true;
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          
          // Đợi 1 chút trước khi cho phép snap lại để tránh xung đột liên hoàn
          setTimeout(() => {
            isSnappingRef.current = false;
            (window as any).__isSnapScrolling = false;
          }, 100);

          const container = document.querySelector('.custom-scrollbar') || window;
          container.removeEventListener('wheel', cancelAnimation);
          container.removeEventListener('touchstart', cancelAnimation);
        };

        const container = document.querySelector('.custom-scrollbar') || window;
        container.addEventListener('wheel', cancelAnimation, { passive: true });
        container.addEventListener('touchstart', cancelAnimation, { passive: true });

        const animateScroll = (currentTime: number) => {
          if (isCancelled) return;
          if (!startTime) startTime = currentTime;
          
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          const easeProgress = easeInOutCubic(progress);
          if (isWindow) {
            window.scrollTo(0, startScroll + (distance * easeProgress));
          } else {
            (scrollContainer as HTMLElement).scrollTo(0, startScroll + (distance * easeProgress));
          }

          if (timeElapsed < duration) {
            animationFrameId = requestAnimationFrame(animateScroll);
          } else {
            setTimeout(() => {
              cancelAnimation(); // Dọn dẹp sự kiện
              isSnappingRef.current = false;
              (window as any).__isSnapScrolling = false;
            }, 50);
          }
        };

        animationFrameId = requestAnimationFrame(animateScroll);
      }
    };

    // Lắng nghe sự kiện scroll thông thường nhưng dùng debounce RẤT DÀI (600ms)
    // Để đảm bảo người dùng đã HOÀN TOÀN DỪNG CUỘN kể cả khi cuộn chậm
    let lastScrollTarget: EventTarget | null = null;
    const handleScroll = (e?: Event) => {
      if (e) lastScrollTarget = e.target;

      if (isSnappingRef.current) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(snapToClosestSection, 600);
    };

    // Cố gắng sử dụng scrollend nếu trình duyệt hỗ trợ (chính xác nhất)
    const handleScrollEnd = (e?: Event) => {
      if (e) lastScrollTarget = e.target;

      if (isSnappingRef.current) return;
      clearTimeout(scrollTimeout); // Hủy bỏ cái của scroll
      snapToClosestSection();
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("scrollend", handleScrollEnd, { capture: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true } as any);
      window.removeEventListener("scrollend", handleScrollEnd, { capture: true } as any);
      clearTimeout(scrollTimeout);
    };
  }, [pathname]);

  return null;
}

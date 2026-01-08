import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import stackdLogo from "@/assets/stackd-logo-new.png";

interface Logo3DSpinProps {
  className?: string;
  desktopSize?: number;
  mobileSize?: number;
  alt?: string;
}

const Logo3DSpin = ({
  className = "",
  desktopSize = 220,
  mobileSize = 160,
  alt = "stackd logo",
}: Logo3DSpinProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  const size = isMobile ? mobileSize : desktopSize;
  const perspective = isMobile ? 600 : 1000;

  // Static render for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ perspective: `${perspective}px` }}
      >
        <img
          src={stackdLogo}
          alt={alt}
          width={size}
          height={size}
          className="drop-shadow-2xl"
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />
      </div>
    );
  }

  // Animation configuration based on device
  const rotateYKeyframes = isMobile ? [0, 140, 280] : [0, 180, 360];
  const rotateXValue = isMobile ? 6 : 10;
  const floatKeyframes = isMobile ? [0, -3, 0] : [0, -8, 0];
  const duration = isMobile ? 8 : 6;
  const repeatDelay = isMobile ? 1.6 : 1;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ perspective: `${perspective}px` }}
    >
      <motion.img
        src={stackdLogo}
        alt={alt}
        width={size}
        height={size}
        className="drop-shadow-2xl"
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: rotateYKeyframes,
          rotateX: rotateXValue,
          y: floatKeyframes,
        }}
        transition={{
          rotateY: {
            duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay,
          },
          rotateX: {
            duration: duration * 0.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          },
          y: {
            duration: duration * 0.4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          },
        }}
        // Disable hover on touch devices
        {...(!isMobile && {
          whileHover: {
            scale: 1.05,
            rotateY: 20,
            transition: { duration: 0.3 },
          },
        })}
      />
    </div>
  );
};

export default Logo3DSpin;

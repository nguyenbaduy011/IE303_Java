"use client";

import { useEffect, useRef, useState } from "react";

const StarfieldBackground = () => {
  const starsRef = useRef<HTMLDivElement>(null);
  const stars2Ref = useRef<HTMLDivElement>(null);
  const stars3Ref = useRef<HTMLDivElement>(null);
  const [shadows, setShadows] = useState({
    small: "none",
    medium: "none",
    big: "none",
  });

  // Generate random box-shadow values for stars
  const generateBoxShadow = (
    count: number,
    maxWidth: number,
    maxHeight: number
  ) => {
    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * maxWidth);
      const y = Math.floor(Math.random() * maxHeight);
      shadows.push(`${x}px ${y}px #FFF`);
    }
    return shadows.join(", ");
  };

  useEffect(() => {
    const maxWidth = 2000;
    const maxHeight = 2000;

    const applyShadows = () => {
      setShadows({
        small: generateBoxShadow(700, maxWidth, maxHeight),
        medium: generateBoxShadow(200, maxWidth, maxHeight),
        big: generateBoxShadow(100, maxWidth, maxHeight),
      });
    };

    applyShadows();

    // Regenerate shadows on animation iteration
    const handleAnimationIteration = () => {
      applyShadows();
    };

    if (starsRef.current) {
      starsRef.current.addEventListener(
        "animationiteration",
        handleAnimationIteration
      );
    }
    if (stars2Ref.current) {
      stars2Ref.current.addEventListener(
        "animationiteration",
        handleAnimationIteration
      );
    }
    if (stars3Ref.current) {
      stars3Ref.current.addEventListener(
        "animationiteration",
        handleAnimationIteration
      );
    }

    const handleResize = () => {
      applyShadows();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (starsRef.current) {
        starsRef.current.removeEventListener(
          "animationiteration",
          handleAnimationIteration
        );
      }
      if (stars2Ref.current) {
        stars2Ref.current.removeEventListener(
          "animationiteration",
          handleAnimationIteration
        );
      }
      if (stars3Ref.current) {
        stars3Ref.current.removeEventListener(
          "animationiteration",
          handleAnimationIteration
        );
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (starsRef.current) {
      starsRef.current.style.boxShadow = shadows.small;
    }
    if (stars2Ref.current) {
      stars2Ref.current.style.boxShadow = shadows.medium;
    }
    if (stars3Ref.current) {
      stars3Ref.current.style.boxShadow = shadows.big;
    }
  }, [shadows]);

  return (
    <>
      <style jsx>{`
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }
        .stars,
        .stars2,
        .stars3 {
          position: absolute;
          background: transparent;
          animation: animStar linear infinite;
        }
        .stars::after,
        .stars2::after,
        .stars3::after {
          content: " ";
          position: absolute;
          top: 2000px;
          background: transparent;
        }
        .stars {
          width: 1px;
          height: 1px;
          animation-duration: 40s;
        }
        .stars::after {
          width: 1px;
          height: 1px;
          box-shadow: ${shadows.small};
        }
        .stars2 {
          width: 2px;
          height: 2px;
          animation-duration: 80s;
        }
        .stars2::after {
          width: 2px;
          height: 2px;
          box-shadow: ${shadows.medium};
        }
        .stars3 {
          width: 3px;
          height: 3px;
          animation-duration: 120s;
        }
        .stars3::after {
          width: 3px;
          height: 3px;
          box-shadow: ${shadows.big};
        }
      `}</style>
      <div
        className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at bottom, var(--primary-900) 0%, var(--primary-950) 100%)",
        }}
      >
        <div ref={starsRef} className="stars" />
        <div ref={stars2Ref} className="stars2" />
        <div ref={stars3Ref} className="stars3" />
      </div>
    </>
  );
};

export default StarfieldBackground;

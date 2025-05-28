"use client";

import { useEffect, useRef, useState } from "react";

interface StarfieldBackgroundProps {
  theme: "light" | "dark";
}

const StarfieldBackground = ({ theme }: StarfieldBackgroundProps) => {
  const starsRef = useRef<HTMLDivElement>(null);
  const stars2Ref = useRef<HTMLDivElement>(null);
  const stars3Ref = useRef<HTMLDivElement>(null);
  const [shadows, setShadows] = useState({
    small: "none",
    medium: "none",
    big: "none",
  });

  // Lưu trữ tọa độ cố định cho các dot
  const coordinatesRef = useRef({
    small: [] as { x: number; y: number }[],
    medium: [] as { x: number; y: number }[],
    big: [] as { x: number; y: number }[],
  });

  // Generate tọa độ cho stars
  const generateCoordinates = (
    count: number,
    maxWidth: number,
    maxHeight: number
  ) => {
    const coords = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * maxWidth);
      const y = Math.floor(Math.random() * maxHeight);
      coords.push({ x, y });
    }
    return coords;
  };

  // Tạo box-shadow từ tọa độ cố định và màu sắc theo theme
  const generateBoxShadow = (
    coords: { x: number; y: number }[],
    color: string,
    opacity: number = 1
  ) => {
    return coords
      .map(
        ({ x, y }) =>
          `${x}px ${y}px ${color}${Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")}`
      )
      .join(", ");
  };

  useEffect(() => {
    const maxWidth = 2000;
    const maxHeight = 2000;
    const isDarkMode = theme === "dark";

    // Chỉ tạo tọa độ một lần khi mount
    if (!coordinatesRef.current.small.length) {
      coordinatesRef.current.small = generateCoordinates(
        700,
        maxWidth,
        maxHeight
      );
      coordinatesRef.current.medium = generateCoordinates(
        200,
        maxWidth,
        maxHeight
      );
      coordinatesRef.current.big = generateCoordinates(
        100,
        maxWidth,
        maxHeight
      );
    }

    const applyShadows = () => {
      setShadows({
        small: generateBoxShadow(
          coordinatesRef.current.small,
          isDarkMode ? "#e0f0e8" : "#4b5e54",
          0.9
        ),
        medium: generateBoxShadow(
          coordinatesRef.current.medium,
          isDarkMode ? "#d4e8e0" : "#3a4b43",
          0.95
        ),
        big: generateBoxShadow(
          coordinatesRef.current.big,
          isDarkMode ? "#ffffff" : "#2a3b34",
          0.8
        ),
      });
    };

    applyShadows();

    // Regenerate shadows (chỉ màu sắc) on animation iteration
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
      // Tạo lại tọa độ khi resize để phù hợp với kích thước mới
      coordinatesRef.current.small = generateCoordinates(
        700,
        maxWidth,
        maxHeight
      );
      coordinatesRef.current.medium = generateCoordinates(
        200,
        maxWidth,
        maxHeight
      );
      coordinatesRef.current.big = generateCoordinates(
        100,
        maxWidth,
        maxHeight
      );
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
  }, [theme]);

  return (
    <>
      <style jsx>{`
        @keyframes animStar {
          0% {
            transform: translateY(0px);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-2000px);
            opacity: 0.8;
          }
        }
        .stars,
        .stars2,
        .stars3 {
          position: absolute;
          background: transparent;
          animation: animStar linear infinite;
          box-shadow: ${shadows.small};
        }
        .stars2 {
          box-shadow: ${shadows.medium};
        }
        .stars3 {
          box-shadow: ${shadows.big};
        }
        .stars {
          width: 1px;
          height: 1px;
          animation-duration: 40s;
        }
        .stars2 {
          width: 2px;
          height: 2px;
          animation-duration: 80s;
        }
        .stars3 {
          width: 3px;
          height: 3px;
          animation-duration: 120s;
        }
      `}</style>
      <div
        className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden"
        style={{
          background:
            theme === "dark"
              ? `radial-gradient(ellipse at bottom, #012d17 0%, #1a2b2a 100%), radial-gradient(ellipse at bottom, #125128 0%, #0c3c1e 100%)`
              : `radial-gradient(ellipse at bottom, #e6f3ef 0%, #b8d4cb 100%)`,
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

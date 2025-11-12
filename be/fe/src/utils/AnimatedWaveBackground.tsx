import React from "react";
import "./animated-wave-background.css";

const AnimatedWaveBackground = () => {
  return (
    <>
      {/* Animated Wave Background - Fixed positioning behind content */}
      <div className="wave-container">
        {/* Bottom wave */}
        <svg
          className="wave-bottom"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z"
            className="wave-path-1"
          />
          <path
            d="M0,80 C300,140 600,-20 1200,80 L1200,120 L0,120 Z"
            className="wave-path-2"
          />
          <path
            d="M0,100 C200,160 400,40 800,100 C1000,140 1100,80 1200,100 L1200,120 L0,120 Z"
            className="wave-path-3"
          />
        </svg>

        {/* Side wave */}
        <svg
          className="wave-side"
          viewBox="0 0 120 800"
          preserveAspectRatio="none"
        >
          <path
            d="M60,0 C0,150 120,350 60,400 C0,450 120,650 60,800 L120,800 L120,0 Z"
            className="wave-path-side-1"
          />
          <path
            d="M40,0 C-20,200 140,400 40,600 C0,700 80,750 40,800 L120,800 L120,0 Z"
            className="wave-path-side-2"
          />
        </svg>

        {/* Corner connector */}
        <div className="wave-corner"></div>
      </div>
    </>
  );
};

export default AnimatedWaveBackground;

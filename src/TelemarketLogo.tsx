import React from "react";

interface TelemarketLogoProps {
  className?: string;
  hideTextOnMobile?: boolean;
}

export const TelemarketLogo = ({
  className = "h-10",
  hideTextOnMobile = false,
}: TelemarketLogoProps) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon SVG */}
      <svg
        viewBox="0 0 60 60"
        className="h-full aspect-square flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(30, 30)">
          {/* Darker green shadow overlay for T */}
          <path d="M-15 -15 H15 V-5 H5 V15 H-5 V-5 H-15 Z" fill="#84D12F" />
          <path d="M-5 -5 H5 V15 H-5 Z" fill="#75bb29" />

          {/* Left Top Arc */}
          <path
            d="M-15 -13 C-35 -15 -45 5 -20 18 C-35 8 -30 -10 -20 -13 Z"
            fill="#84D12F"
          />

          {/* Right Bottom Arc */}
          <path
            d="M-20 18 C10 32 40 18 30 -5 C35 15 20 28 -20 18 Z"
            fill="#4B9A50"
          />
        </g>
      </svg>

      {/* Typography */}
      <div
        className={`flex-col justify-center ${
          hideTextOnMobile ? "hidden xs:flex" : "flex"
        }`}
      >
        <span className="text-slate-900 dark:text-inherit font-extrabold text-[15px] xs:text-[18px] md:text-[20px] tracking-wider leading-none">
          TELEMARKET
        </span>
        <span className="text-slate-500 dark:text-inherit/70 font-bold text-[7px] xs:text-[8px] md:text-[9px] tracking-[0.35em] leading-none mt-1">
          SHOP SMART
        </span>
      </div>
    </div>
  );
};

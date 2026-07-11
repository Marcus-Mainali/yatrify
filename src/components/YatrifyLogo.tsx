import React from "react";

interface YatrifyLogoProps {
  className?: string;
}

export default function YatrifyLogo({ className = "w-10 h-10" }: YatrifyLogoProps) {
  return (
    <img
      src="/src/assets/images/yatrify_logo_1782633469567.jpg"
      alt="Yatrify Logo"
      className={`${className} shrink-0 object-contain rounded-full`}
      referrerPolicy="no-referrer"
    />
  );
}

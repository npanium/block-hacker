import React from "react";
import { SkillStatus } from "@/app/types/SkillTree";

interface StatusIconProps {
  status: SkillStatus;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case "locked":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="7"
            stroke="#666"
            strokeWidth="2"
            fill="#333"
          />
          <path
            d="M5 8 L8 11 L11 5"
            stroke="#666"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      );
    case "available":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="7"
            stroke="#ff6b35"
            strokeWidth="2"
            fill="#ff6b3520"
          >
            <animate
              attributeName="r"
              values="6;8;6"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="8" cy="8" r="3" fill="#ff6b35" />
        </svg>
      );
    case "unlocked":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="7"
            stroke="#00ff88"
            strokeWidth="2"
            fill="#00ff8820"
          />
          <path
            d="M5 8 L7 10 L11 6"
            stroke="#00ff88"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
    default:
      return null;
  }
};

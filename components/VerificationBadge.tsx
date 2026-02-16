"use client";

import { CheckCircle2 } from "lucide-react";

interface VerificationBadgeProps {
  tier: 'free' | 'gold' | 'premium';
  size?: number;
}

export default function VerificationBadge({ tier, size = 16 }: VerificationBadgeProps) {
  const getStyle = () => {
    switch (tier) {
      case 'free':
        return {
          color: '#94a3b8',
          fill: 'transparent',
          stroke: '#94a3b8',
          strokeWidth: 2
        };
      case 'gold':
        return {
          color: '#d4af37',
          fill: '#d4af37',
          stroke: '#d4af37',
          strokeWidth: 1.5
        };
      case 'premium':
        return {
          color: '#e5e7eb',
          fill: '#e5e7eb',
          stroke: '#d4af37', // Gold border for premium
          strokeWidth: 1.5
        };
      default:
        return {
          color: '#94a3b8',
          fill: 'transparent',
          stroke: '#94a3b8',
          strokeWidth: 2
        };
    }
  };

  const style = getStyle();

  return (
    <CheckCircle2 
      size={size}
      style={style}
    />
  );
}
"use client";

import { Instagram, Linkedin } from "lucide-react";

interface SocialVerificationBadgesProps {
  instagramVerified?: boolean;
  linkedinVerified?: boolean;
  size?: number;
}

export default function SocialVerificationBadges({ 
  instagramVerified = false, 
  linkedinVerified = false,
  size = 16 
}: SocialVerificationBadgesProps) {
  if (!instagramVerified && !linkedinVerified) {
    return null; // Don't render if nothing to show
  }

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {instagramVerified && (
        <div 
          style={{
            width: size + 4,
            height: size + 4,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Instagram Verified"
        >
          <Instagram size={size - 4} style={{ color: 'white' }} />
        </div>
      )}
      
      {linkedinVerified && (
        <div 
          style={{
            width: size + 4,
            height: size + 4,
            borderRadius: '50%',
            background: '#0A66C2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="LinkedIn Verified"
        >
          <Linkedin size={size - 4} style={{ color: 'white' }} />
        </div>
      )}
    </div>
  );
}
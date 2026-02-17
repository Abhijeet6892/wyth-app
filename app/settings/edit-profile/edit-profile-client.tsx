"use client";

import { Suspense } from "react";
import EditProfileContent from "./edit-profile-content";
import { Loader2 } from "lucide-react";

function EditProfileLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)'
    }}>
      <Loader2 size={32} className="animate-spin" style={{ color: '#1e3a8a' }} />
    </div>
  );
}

export default function EditProfileWrapper() {
  return (
    <Suspense fallback={<EditProfileLoading />}>
      <EditProfileContent />
    </Suspense>
  );
}
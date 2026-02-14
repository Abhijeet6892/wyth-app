'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Camera, Loader2, CheckCircle2, X } from 'lucide-react'

interface AvatarUploadProps {
  url: string | null
  onUpload: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function AvatarUpload({ url, onUpload, size = 'md' }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(url)
  const [error, setError] = useState<string | null>(null)

  const sizes = {
    sm: { container: 80, icon: 18 },
    md: { container: 120, icon: 24 },
    lg: { container: 160, icon: 32 }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        setUploading(false)
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        setUploading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update preview immediately
      setPreview(data.publicUrl)
      
      // Update profile in database
      await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)
      
      // Call parent callback
      onUpload(data.publicUrl)

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '16px' 
    }}>
      
      {/* Avatar Container */}
      <div style={{
        position: 'relative',
        width: `${sizes[size].container}px`,
        height: `${sizes[size].container}px`
      }}>
        {/* Main Avatar Circle */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          border: '4px solid white',
          boxShadow: '0 8px 24px rgba(31, 41, 55, 0.12)',
          position: 'relative'
        }}>
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc'
            }}>
              <Camera size={sizes[size].icon} style={{ color: '#cbd5e1' }} />
            </div>
          )}
          
          {/* Loading Overlay */}
          {uploading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Loader2 
                size={sizes[size].icon} 
                style={{ color: '#1E3A8A', animation: 'spin 1s linear infinite' }} 
              />
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                Uploading...
              </span>
            </div>
          )}
        </div>

        {/* Upload Button Badge */}
        <label style={{
          position: 'absolute',
          bottom: size === 'lg' ? '8px' : '4px',
          right: size === 'lg' ? '8px' : '4px',
          width: size === 'lg' ? '44px' : '36px',
          height: size === 'lg' ? '44px' : '36px',
          borderRadius: '50%',
          background: uploading 
            ? 'rgba(30, 58, 138, 0.5)' 
            : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 58, 138, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.3)';
          }
        }}
        >
          <Camera size={size === 'lg' ? 20 : 16} style={{ color: 'white' }} />
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Status Message */}
      {error ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: '#fef2f2',
          borderRadius: '12px',
          border: '1px solid #fecaca'
        }}>
          <X size={14} style={{ color: '#ef4444' }} />
          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>
            {error}
          </span>
        </div>
      ) : preview && !uploading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: '#f0fdf4',
          borderRadius: '12px',
          border: '1px solid #bbf7d0'
        }}>
          <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
            Photo uploaded
          </span>
        </div>
      ) : (
        <p style={{
          fontSize: '12px',
          color: '#94a3b8',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {uploading ? 'Uploading...' : 'Tap camera to upload'}
        </p>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
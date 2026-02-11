'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'

interface AvatarUploadProps {
  url: string | null
  onUpload: (url: string) => void
}

export default function AvatarUpload({ url, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onUpload(data.publicUrl)

    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {url && (
        <img
          src={url}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border"
        />
      )}

      <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-xl">
        {uploading ? 'Uploading...' : 'Upload Photo'}
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
        />
      </label>
    </div>
  )
}

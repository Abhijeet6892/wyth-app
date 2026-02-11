'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Heart, Camera, Eye, Zap, ShieldCheck, LogOut, Trash2, ChevronRight } from 'lucide-react'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SettingsItem = ({ icon: Icon, label, value, onClick, href, color = "text-slate-900" }: any) => {
    const content = (
      <div onClick={onClick} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl mb-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl bg-slate-50 ${color}`}>
            <Icon size={18} />
          </div>
          <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {value && <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{value}</span>}
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
    )
    if (href) return <Link href={href}>{content}</Link>
    return content
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition"><ArrowLeft size={20} /></Link>
        <h1 className="text-lg font-bold text-slate-900">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-wider">Profile</h3>
            <SettingsItem icon={User} label="Personal Details" href="/settings/edit-profile" />
            <SettingsItem icon={Camera} label="Manage Photos" href="/settings/photos" />
            <SettingsItem icon={Heart} label="Partner Preferences" href="/settings/edit-profile" />
        </div>

        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-wider">Privacy & Membership</h3>
            <SettingsItem icon={Eye} label="Visibility Controls" href="/settings/privacy" />
            <SettingsItem icon={Zap} label="My Wallet" href="/wallet" color="text-amber-500" />
            <SettingsItem icon={ShieldCheck} label="WYTH Gold" value="Upgrade" color="text-indigo-600" />
        </div>

        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 px-1 tracking-wider">Account</h3>
            <SettingsItem icon={LogOut} label="Log Out" onClick={handleLogout} color="text-slate-500" />
            <SettingsItem icon={Trash2} label="Delete Account" onClick={() => alert('Feature coming soon')} color="text-rose-500" />
        </div>
      </div>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, User, Heart, Briefcase, Camera, 
  Eye, Receipt, LogOut, Trash2, ChevronRight, ShieldCheck, Zap, Instagram, Eye as ViewIcon
} from 'lucide-react'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
      if (!confirm("Are you sure? This will delete your profile, coins, and chats permanently.")) return
      if (!confirm("Final warning: This action cannot be undone.")) return

      setDeleting(true)
      const { error } = await supabase.rpc('delete_my_account')

      if (error) {
          alert("Error deleting account: " + error.message)
          setDeleting(false)
      } else {
          await supabase.auth.signOut()
          alert("Account deleted. Goodbye!")
          router.push('/login')
      }
  }

  // Helper Component for List Items
  const SettingsItem = ({ icon: Icon, label, value, onClick, href, color = "text-slate-900" }: any) => {
    const content = (
      <div 
        onClick={onClick}
        className="flex items-center justify-between p-4 bg-white border-b border-slate-50 last:border-none cursor-pointer hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-slate-100`}>
            <Icon size={18} className={color} />
          </div>
          <span className="text-sm font-medium text-slate-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {value && <span className="text-xs text-slate-400">{value}</span>}
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
    )

    if (href) return <Link href={href}>{content}</Link>
    return content
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 max-w-md mx-auto">
      
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* VIEW PROFILE SHORTCUT */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
             <SettingsItem icon={ViewIcon} label="View My Profile" href="/profile" color="text-indigo-600"/>
        </div>

        {/* SECTION 1: PROFILE */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">Profile</h3>
            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                <SettingsItem icon={User} label="Edit Personal Details" href="/settings/edit-profile" />
                
                {/* ✅ FIX: Points to the Photo Grid, NOT the Wizard */}
                <SettingsItem icon={Camera} label="Manage Photos" href="/settings/photos" />
                
                {/* Note: Partner Preferences currently lives inside the Edit Profile wizard */}
                <SettingsItem icon={Heart} label="Update Partner Preferences" href="/settings/edit-profile" />
            </div>
        </div>

        {/* SECTION 2: TRUST & PRIVACY */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">Trust & Privacy</h3>
            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                <SettingsItem icon={Briefcase} label="LinkedIn Verification" value="Verified" color="text-blue-600" />
                <SettingsItem icon={Instagram} label="Instagram Connection" color="text-pink-600" />
                
                {/* ✅ FIX: Points to the Privacy Toggle Page */}
                <SettingsItem icon={Eye} label="Visibility Controls" href="/settings/privacy" />
            </div>
        </div>

        {/* SECTION 3: SUBSCRIPTION */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">Membership</h3>
            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                <SettingsItem icon={Zap} label="My Wallet" href="/wallet" color="text-yellow-500" />
                <SettingsItem icon={ShieldCheck} label="WYTH Gold" value="Upgrade" color="text-amber-500" />
                <SettingsItem icon={Receipt} label="Billing History" />
            </div>
        </div>

        {/* SECTION 4: ACCOUNT */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">Account</h3>
            <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                <SettingsItem icon={LogOut} label="Log Out" onClick={handleLogout} color="text-slate-600" />
                <SettingsItem icon={Trash2} label={deleting ? "Deleting..." : "Delete Account"} onClick={handleDelete} color="text-red-500" />
            </div>
        </div>

        <div className="text-center pt-4">
            <p className="text-[10px] text-slate-400">WYTH v1.0.0 (MVP)</p>
        </div>

      </div>
    </div>
  )
}
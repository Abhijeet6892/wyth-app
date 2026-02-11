'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Loader2, Sparkles, User, Briefcase, 
  Shield, MapPin, Phone, Lock, Save, ChevronDown
} from 'lucide-react'
import AvatarUpload from '@/components/AvatarUpload'
import { generateBioAction, type BioTone } from '@/app/actions/generateBio'

// --- CONSTANTS ---
const KNOWN_CITIES = [
  "Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Chennai", "Pune", 
  "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh", "Lucknow", "Indore"
]

// --- TYPES ---
type ProfileSignals = {
  incomeSignal?: { min: number; max: number }
  religionSignal?: string
  familyTypeSignal?: string
}

type ProfileData = {
  full_name: string
  city: string
  city_display: string
  city_normalized: string
  city_category: 'known' | 'other' | ''
  phone: string
  gender: string
  intent: string
  avatar_url: string | null
  bio: string
  jobTitle: string
  company: string
  industry: string
  careerGhostMode: boolean
  diet: string
  drink: string
  smoke: string
  signals: ProfileSignals
}

export default function EditProfileDashboard() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // AI States
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiOptions, setShowAiOptions] = useState(false)
  
  // City Search
  const [cityQuery, setCityQuery] = useState('')
  const [showCityList, setShowCityList] = useState(false)
  const cityWrapperRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<ProfileData>({
    full_name: '',
    city: '',
    city_display: '',
    city_normalized: '',
    city_category: '',
    phone: '',
    gender: '',
    intent: '',
    avatar_url: null,
    bio: '',
    jobTitle: '',
    company: '',
    industry: '',
    careerGhostMode: true,
    diet: '',
    drink: '',
    smoke: '',
    signals: { incomeSignal: { min: 12, max: 20 } }
  })

  // 1. FETCH PROFILE
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Parse Career Data separately if needed, or assume it's joined.
        // For MVP speed, we assume profile contains the core fields or we fetch career_data:
        const { data: career } = await supabase.from('career_data').select('*').eq('user_id', user.id).single()
        
        setData(prev => ({
          ...prev,
          ...profile,
          bio: profile.bio || '',
          jobTitle: career?.role || '',
          company: career?.company_real_name || '',
          industry: career?.industry || '',
          careerGhostMode: career?.company_display_name === 'Private Firm'
        }))
        setCityQuery(profile.city_display || profile.city || '')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // City Filter Logic
  const filteredCities = KNOWN_CITIES.filter(c => 
    c.toLowerCase().includes(cityQuery.toLowerCase())
  )

  const selectCity = (city: string, type: 'known' | 'other') => {
    if (type === 'known') {
      setData(prev => ({
        ...prev,
        city,
        city_display: city,
        city_normalized: city.toLowerCase(),
        city_category: 'known'
      }))
      setCityQuery(city)
    } else {
      const clean = cityQuery.trim()
      setData(prev => ({
        ...prev,
        city: clean,
        city_display: `${clean} (Other)`,
        city_normalized: `${clean.toLowerCase()}_other`,
        city_category: 'other'
      }))
      setCityQuery(clean)
    }
    setShowCityList(false)
  }

  // AI Handler
  const handleAI = async (tone: BioTone) => {
    if (!data.bio || data.bio.length < 5) {
        alert("Write a rough draft first (at least a few words) so I can polish it!")
        return
    }
    setAiLoading(true)
    try {
        const polished = await generateBioAction(data.bio, tone)
        setData(prev => ({ ...prev, bio: polished }))
        setShowAiOptions(false)
    } catch (e) {
        alert("AI is busy. Try again.")
    } finally {
        setAiLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    // 1. Update Profile
    const { error: pError } = await supabase.from('profiles').update({
        full_name: data.full_name,
        bio: data.bio,
        city: data.city,
        city_display: data.city_display,
        avatar_url: data.avatar_url,
        // ... add other fields as needed
    }).eq('id', user.id)

    // 2. Update Career
    const { error: cError } = await supabase.from('career_data').upsert({
        user_id: user.id,
        role: data.jobTitle,
        company_real_name: data.company,
        company_display_name: data.careerGhostMode ? 'Private Firm' : data.company,
        industry: data.industry
    })

    setSaving(false)
    if (!pError && !cError) router.push('/profile')
    else alert("Error saving profile.")
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-30 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-slate-900">Edit Profile</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="text-slate-900 font-bold text-sm bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition">
          {saving ? <Loader2 size={16} className="animate-spin"/> : 'Save'}
        </button>
      </div>

      <div className="p-4 space-y-8 max-w-md mx-auto">
        
        {/* 1. PHOTO */}
        <div className="flex flex-col items-center">
            <AvatarUpload url={data.avatar_url} onUpload={(url) => setData(p => ({ ...p, avatar_url: url }))} />
            <p className="text-xs text-slate-400 mt-2">Tap to change</p>
        </div>

        {/* 2. BIO ENGINE (The AI Vibe Studio) */}
        <section className="space-y-3">
            <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">About You</label>
                <button 
                    onClick={() => setShowAiOptions(!showAiOptions)}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition"
                >
                    <Sparkles size={12}/> {showAiOptions ? 'Close AI' : 'AI Polish'}
                </button>
            </div>

            <div className="relative">
                <textarea 
                    value={data.bio}
                    onChange={(e) => setData(p => ({ ...p, bio: e.target.value }))}
                    placeholder="I enjoy hiking on weekends and coffee..."
                    className="w-full h-32 p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none leading-relaxed shadow-sm"
                />
                
                {/* AI Overlay Menu */}
                {showAiOptions && (
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-xl rounded-xl p-3 z-20 animate-in fade-in zoom-in-95 w-48">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase">
                            <Sparkles size={10} className="text-indigo-500"/> Choose Vibe
                        </div>
                        <div className="flex flex-col gap-1">
                            {['Chill', 'Witty', 'Romantic'].map((t) => (
                                <button 
                                    key={t}
                                    onClick={() => handleAI(t as BioTone)}
                                    disabled={aiLoading}
                                    className="text-left px-3 py-2 hover:bg-indigo-50 rounded-lg text-xs font-medium text-slate-700 transition flex justify-between items-center"
                                >
                                    {t}
                                    {aiLoading && <Loader2 size={10} className="animate-spin"/>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-400">
                Write a rough draft, then pick a vibe to polish it.
            </p>
        </section>

        {/* 3. BASIC DETAILS */}
        <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">The Basics</h3>
            
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <input 
                    value={data.full_name} 
                    onChange={e => setData(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full mt-1 p-3 bg-slate-50 rounded-xl border-none text-sm font-medium focus:ring-1 focus:ring-slate-300"
                />
            </div>

            <div ref={cityWrapperRef} className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase">City</label>
                <div className="relative mt-1">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                        value={cityQuery}
                        onChange={e => { setCityQuery(e.target.value); setShowCityList(true) }}
                        onFocus={() => setShowCityList(true)}
                        className="w-full pl-10 p-3 bg-slate-50 rounded-xl border-none text-sm font-medium focus:ring-1 focus:ring-slate-300"
                        placeholder="Search city..."
                    />
                </div>
                {showCityList && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto">
                        {filteredCities.map(city => (
                            <div key={city} onClick={() => selectCity(city, 'known')} className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-medium border-b border-slate-50 last:border-none">
                                {city}
                            </div>
                        ))}
                        {cityQuery && !KNOWN_CITIES.includes(cityQuery) && (
                            <div onClick={() => selectCity(cityQuery, 'other')} className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-blue-600">
                                Use "{cityQuery}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>

        {/* 4. CAREER & PRIVACY */}
        <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                Career <Shield size={14} className="text-blue-500"/>
            </h3>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-blue-700 uppercase mb-1">Ghost Mode</p>
                    <p className="text-[10px] text-blue-600/80">
                        {data.careerGhostMode ? "Company name is hidden from strangers." : "Company name is visible to everyone."}
                    </p>
                </div>
                <div 
                    onClick={() => setData(p => ({ ...p, careerGhostMode: !p.careerGhostMode }))}
                    className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.careerGhostMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.careerGhostMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Job Title</label>
                    <input 
                        value={data.jobTitle} 
                        onChange={e => setData(p => ({ ...p, jobTitle: e.target.value }))}
                        className="w-full mt-1 p-3 bg-slate-50 rounded-xl border-none text-sm font-medium"
                        placeholder="Product Manager"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Company</label>
                    <input 
                        value={data.company} 
                        onChange={e => setData(p => ({ ...p, company: e.target.value }))}
                        className="w-full mt-1 p-3 bg-slate-50 rounded-xl border-none text-sm font-medium"
                        placeholder="Google"
                    />
                </div>
            </div>
        </section>

      </div>
    </div>
  )
}
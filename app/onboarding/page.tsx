'use client'
import { useState, useEffect } from 'react'
// RELATIVE IMPORT for local dev
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, Heart, ShieldAlert, ArrowLeft, Gem, Camera } from 'lucide-react'
// Import the Uploader
import AvatarUpload from '../../components/AvatarUpload'

export default function Onboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 3 // Basics -> Photo -> Partner
  
  // --- STATE ---
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [intent, setIntent] = useState('dating_marriage')
  const [gender, setGender] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null) // NEW: Photo State

  // Preferences
  const [prefMinAge, setPrefMinAge] = useState('24')
  const [prefMaxAge, setPrefMaxAge] = useState('30')
  const [prefCity, setPrefCity] = useState('') 

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

  const validateInput = (text: string, fieldName: string) => {
      if (/\b\d{10}\b/.test(text.replace(/[\s-]/g, ''))) {
          alert(`Security Warning: Please do not include phone numbers in your ${fieldName}.`)
          return false
      }
      return true
  }

  const handleNext = () => {
      if (step === 1) {
          if (!fullName || !city || !gender) return alert("Please fill in all fields.")
          if (!validateInput(fullName, 'Name')) return
      }
      if (step === 2) {
          if (!avatarUrl) return alert("Please upload a profile photo to continue.")
      }
      setStep(prev => prev + 1)
  }

  const handleComplete = async () => {
    setLoading(true)

    const preferences = {
        min_age: parseInt(prefMinAge),
        max_age: parseInt(prefMaxAge),
        city: prefCity || 'Any'
    }

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: fullName,
            city: city,
            intent: intent,
            gender: gender,
            avatar_url: avatarUrl, // SAVE REAL PHOTO
            partner_preferences: preferences,
            slots_limit: 3,
            is_gold: false,
            wallet_balance: 0 
        })

    if (error) {
        alert("Error saving profile: " + error.message)
    } else {
        router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col justify-center max-w-md mx-auto">
      
      <div className="mb-8">
        <div className="flex gap-1 mb-4">
            {[...Array(TOTAL_STEPS)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i + 1 <= step ? 'bg-slate-900' : 'bg-slate-100'}`} />
            ))}
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            {step === 1 && "Welcome to WYTH"}
            {step === 2 && "First Impressions"}
            {step === 3 && "Your Ideal Partner"}
        </h1>
        <p className="text-slate-500">
            {step === 1 && "Let's set up your identity."}
            {step === 2 && "Upload a clear photo to get verified."}
            {step === 3 && "Help us find the right vibe for you."}
        </p>
      </div>

      {/* --- STEP 1: BASICS --- */}
      {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Arjun Kapoor" className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Current City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Gender</label>
                <div className="flex gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                        <button key={g} onClick={() => setGender(g)} className={`flex-1 py-3 rounded-xl font-medium transition ${gender === g ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}>{g}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Intent</label>
                <div className="space-y-3">
                    <button onClick={() => setIntent('exploring')} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left transition ${intent === 'exploring' ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}>
                        <div className="p-2 bg-white rounded-full shadow-sm">👀</div>
                        <div><div className="font-bold text-slate-900">Exploring Seriously</div><div className="text-xs text-slate-500">Intentional, but early stage</div></div>
                    </button>
                    <button onClick={() => setIntent('dating_marriage')} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left transition ${intent === 'dating_marriage' ? 'border-rose-500 bg-rose-50' : 'border-slate-100'}`}>
                        <div className="p-2 bg-white rounded-full shadow-sm text-rose-500"><Heart size={18} fill="currentColor" /></div>
                        <div><div className="font-bold text-slate-900">Dating for Marriage</div><div className="text-xs text-slate-500">Focused on finding a partner</div></div>
                    </button>
                    <button onClick={() => setIntent('ready_marriage')} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left transition ${intent === 'ready_marriage' ? 'border-amber-500 bg-amber-50' : 'border-slate-100'}`}>
                        <div className="p-2 bg-white rounded-full shadow-sm text-amber-500"><Gem size={18} /></div>
                        <div><div className="font-bold text-slate-900">Ready for Marriage</div><div className="text-xs text-slate-500">Timeline: 1-2 years</div></div>
                    </button>
                </div>
            </div>
          </div>
      )}

      {/* --- STEP 2: PHOTO UPLOAD (NEW) --- */}
      {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right flex flex-col items-center">
              <div className="w-full bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                  <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm"><Camera size={18}/></div>
                  <div>
                      <p className="text-sm font-bold text-blue-900">Photo Required</p>
                      <p className="text-xs text-blue-700 mt-1">Real photos get 3x more matches. No blurry pics or group shots please.</p>
                  </div>
              </div>

              {/* The Uploader Component */}
              <AvatarUpload 
                  url={avatarUrl} 
                  onUpload={(url) => setAvatarUrl(url)} 
              />
          </div>
      )}

      {/* --- STEP 3: PREFERENCES --- */}
      {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500">Min Age</label>
                    <input type="number" value={prefMinAge} onChange={e => setPrefMinAge(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-none text-center font-bold" />
                </div>
                <span className="text-slate-300">-</span>
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500">Max Age</label>
                    <input type="number" value={prefMaxAge} onChange={e => setPrefMaxAge(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-none text-center font-bold" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Preferred City (Optional)</label>
                <input value={prefCity} onChange={(e) => setPrefCity(e.target.value)} placeholder="Leave empty for Anywhere" className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 outline-none" />
                <p className="text-xs text-slate-400 mt-2 flex gap-1"><ShieldAlert size={12} /><span>We prioritize people near you by default.</span></p>
            </div>
          </div>
      )}

      {/* FOOTER */}
      <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold active:scale-95 transition"><ArrowLeft size={20} /></button>
          )}
          <button 
            onClick={step === TOTAL_STEPS ? handleComplete : handleNext}
            disabled={loading}
            className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>{step === TOTAL_STEPS ? "Finish" : "Next"} <ArrowRight size={20} /></>}
          </button>
      </div>

    </div>
  )
}

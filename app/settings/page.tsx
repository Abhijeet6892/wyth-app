'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ArrowRight, Loader2, Sparkles, 
  Briefcase, Heart, Coffee, MapPin, DollarSign, 
  Shield, CheckCircle, RefreshCcw, X 
} from 'lucide-react'

// --- TYPES ---
type ProfileData = {
  // Identity
  full_name: string
  city: string
  gender: string
  intent: string
  // Career
  jobTitle: string
  company: string
  industry: string
  careerGhostMode: boolean
  // Deep Data
  income: number
  diet: string
  drink: string
  smoke: string
  religion: string
  familyType: string
  // Bio (AI Powered)
  bio: string
}

// --- MAIN ENGINE COMPONENT ---
export default function EditProfileEngine() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 6

  // Global State for the Wizard
  const [data, setData] = useState<ProfileData>({
    full_name: '', city: '', gender: '', intent: '',
    jobTitle: '', company: '', industry: '', careerGhostMode: true,
    income: 12, diet: '', drink: '', smoke: '', religion: '', familyType: '',
    bio: ''
  })

  const [user, setUser] = useState<any>(null)

  // 1. FETCH EXISTING DATA
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      // Fetch Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      // Fetch Career
      const { data: career } = await supabase.from('career_data').select('*').eq('user_id', user.id).maybeSingle()

      if (profile) {
        const life = profile.lifestyle || {}
        const roots = profile.roots || {}
        
        setData(prev => ({
          ...prev,
          full_name: profile.full_name || '',
          city: profile.city || '',
          gender: profile.gender || '',
          intent: profile.intent || 'dating_marriage',
          income: profile.income_level ? parseInt(profile.income_level) : 12,
          diet: life.diet || '',
          drink: life.drink || '',
          smoke: life.smoke || '',
          religion: roots.religion || '',
          familyType: roots.familyType || '',
          bio: profile.bio || ''
        }))
      }

      if (career) {
        setData(prev => ({
          ...prev,
          jobTitle: career.role || '',
          industry: career.industry || '',
          company: career.company_real_name || '',
          careerGhostMode: career.company_display_name === "Top Tier Firm"
        }))
      }

      setLoading(false)
    }
    fetchData()
  }, [router])

  // 2. SAVE LOGIC
  const handleSave = async () => {
    setSaving(true)
    
    // Update Profiles Table
    const { error: pError } = await supabase.from('profiles').update({
      full_name: data.full_name,
      city: data.city,
      intent: data.intent,
      gender: data.gender,
      income_level: `${data.income}L`,
      lifestyle: { diet: data.diet, drink: data.drink, smoke: data.smoke },
      roots: { religion: data.religion, familyType: data.familyType }
    }).eq('id', user.id)

    // Update Career Table
    const { error: cError } = await supabase.from('career_data').upsert({
      user_id: user.id,
      role: data.jobTitle,
      industry: data.industry,
      company_real_name: data.company,
      company_display_name: data.careerGhostMode ? "Top Tier Firm" : data.company,
    })

    if (pError || cError) {
      alert("Failed to save changes.")
    } else {
      router.push('/settings') // Go back to settings menu
    }
    setSaving(false)
  }

  // --- NAVIGATION HELPERS ---
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep(s => Math.max(s - 1, 1))
  const update = (field: keyof ProfileData, value: any) => setData(prev => ({ ...prev, [field]: value }))

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-slate-300"/></div>

  // --- RENDER CURRENT STAGE ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6">
      <div className="w-full max-w-md bg-white min-h-[80vh] rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
        
        {/* SHELL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20">
            {step > 1 ? (
                <button onClick={back} className="p-2 -ml-2 hover:bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
            ) : (
                <Link href="/settings" className="p-2 -ml-2 hover:bg-slate-50 rounded-full"><X size={20}/></Link>
            )}
            <div className="flex gap-1">
                {[...Array(TOTAL_STEPS)].map((_, i) => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-slate-900' : 'bg-slate-100'}`} />
                ))}
            </div>
            <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* STAGE RENDERER */}
        <div className="flex-1 p-6 overflow-y-auto">
            {step === 1 && <StageIntent data={data} update={update} />}
            {step === 2 && <StageBasics data={data} update={update} />}
            {step === 3 && <StageCareer data={data} update={update} />}
            {step === 4 && <StageLifestyle data={data} update={update} />}
            {step === 5 && <StageDeepData data={data} update={update} />}
            {step === 6 && <StageAIBio data={data} update={update} />}
        </div>

        {/* SHELL FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-20">
            <button 
                onClick={step === TOTAL_STEPS ? handleSave : next}
                disabled={saving}
                className="w-full bg-slate-900 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
            >
                {saving ? <Loader2 className="animate-spin"/> : step === TOTAL_STEPS ? "Save & Update" : "Continue"}
                {!saving && step !== TOTAL_STEPS && <ArrowRight size={20} />}
            </button>
        </div>

      </div>
    </div>
  )
}

// --- SUB-COMPONENTS (STAGES) ---

function StageIntent({ data, update }: any) {
  const options = [
    { id: 'exploring', label: 'Exploring Seriously', desc: 'Intentional, but early stage' },
    { id: 'dating_marriage', label: 'Dating for Marriage', desc: 'Focused on finding a partner' },
    { id: 'ready_marriage', label: 'Ready for Marriage', desc: 'Timeline: 1-2 years' },
  ]
  return (
    <div className="animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Your Intent</h2>
      <p className="text-slate-500 mb-8">What brings you to WYTH right now?</p>
      <div className="space-y-3">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => update('intent', opt.id)}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${data.intent === opt.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
          >
            <div className="font-bold text-slate-900">{opt.label}</div>
            <div className="text-sm text-slate-500">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function StageBasics({ data, update }: any) {
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">The Basics</h2>
        <p className="text-slate-500">Update your core identity.</p>
      </div>
      <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
          <input value={data.full_name} onChange={e => update('full_name', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-none mt-2 font-medium" />
      </div>
      <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Current City</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={data.city} onChange={e => update('city', e.target.value)} className="w-full p-4 pl-12 rounded-xl bg-slate-50 border-none mt-2 font-medium" />
          </div>
      </div>
      <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Gender</label>
          <div className="flex gap-2 mt-2">
            {['Male', 'Female', 'Other'].map(g => (
                <button key={g} onClick={() => update('gender', g)} className={`flex-1 py-3 rounded-xl font-medium transition ${data.gender === g ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}>{g}</button>
            ))}
          </div>
      </div>
    </div>
  )
}

function StageCareer({ data, update }: any) {
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Career & Shield</h2>
        <p className="text-slate-500">Control how your work appears to strangers.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
          <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold"><Shield size={18}/> Social Shield</div>
              <div onClick={() => update('careerGhostMode', !data.careerGhostMode)} className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.careerGhostMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.careerGhostMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
          </div>
          <p className="text-xs text-blue-600/80 leading-relaxed">
              {data.careerGhostMode 
                ? "Active: Strangers will only see 'Top Tier Firm' until you connect." 
                : "Inactive: Your full company name is visible to everyone."}
          </p>
      </div>

      <input value={data.jobTitle} onChange={e => update('jobTitle', e.target.value)} placeholder="Job Title" className="w-full p-4 rounded-xl bg-slate-50 border-none" />
      <input value={data.company} onChange={e => update('company', e.target.value)} placeholder="Company Name" className="w-full p-4 rounded-xl bg-slate-50 border-none" />
      <input value={data.industry} onChange={e => update('industry', e.target.value)} placeholder="Industry" className="w-full p-4 rounded-xl bg-slate-50 border-none" />
    </div>
  )
}

function StageLifestyle({ data, update }: any) {
  const categories = [
      { id: 'diet', label: 'Diet', options: ['Veg', 'Non-Veg', 'Vegan', 'Eggetarian'] },
      { id: 'drink', label: 'Drink', options: ['Yes', 'No', 'Socially', 'Teetotaler'] },
      { id: 'smoke', label: 'Smoke', options: ['Yes', 'No', 'Never', 'Trying to quit'] },
  ]
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Lifestyle</h2>
        <p className="text-slate-500">Tap to select your habits.</p>
      </div>
      {categories.map(cat => (
          <div key={cat.id} className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase">{cat.label}</label>
              <div className="flex flex-wrap gap-2">
                  {cat.options.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => update(cat.id as any, opt)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${data[cat.id as keyof ProfileData] === opt ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600'}`}
                      >
                          {opt}
                      </button>
                  ))}
              </div>
          </div>
      ))}
    </div>
  )
}

function StageDeepData({ data, update }: any) {
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Deep Data</h2>
        <p className="text-slate-500">Sensitive info locked until connection.</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <label className="font-bold text-slate-900 flex items-center gap-2"><DollarSign size={18}/> Annual Income</label>
            <span className="text-xl font-bold text-slate-900">₹{data.income}L</span>
        </div>
        <input 
            type="range" min="5" max="100" value={data.income} 
            onChange={e => update('income', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />
        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>₹5L</span><span>₹1 Cr+</span></div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <label className="font-bold text-slate-900">Roots & Family</label>
        <select value={data.religion} onChange={e => update('religion', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none">
            <option value="">Religion...</option>
            <option value="Hindu">Hindu</option>
            <option value="Muslim">Muslim</option>
            <option value="Christian">Christian</option>
            <option value="Sikh">Sikh</option>
            <option value="Jain">Jain</option>
        </select>
        <div className="flex gap-2">
            {['Nuclear', 'Joint'].map(t => (
                <button key={t} onClick={() => update('familyType', t)} className={`flex-1 py-3 rounded-xl font-medium border ${data.familyType === t ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500'}`}>{t}</button>
            ))}
        </div>
      </div>
    </div>
  )
}

function StageAIBio({ data, update }: any) {
  const [isPolishing, setIsPolishing] = useState(false)
  const [showAiOptions, setShowAiOptions] = useState(false)

  const simulateAiPolish = () => {
    setIsPolishing(true)
    // Simulate API delay
    setTimeout(() => {
        setIsPolishing(false)
        setShowAiOptions(true)
    }, 1500)
  }

  const applyPolish = (tone: string) => {
      let polishedText = ""
      if (tone === 'Chill') polishedText = "Just a laid-back soul looking for good vibes and great coffee. ☕️✨"
      if (tone === 'Witty') polishedText = "Professional overthinker and part-time traveler. Swipe right if you can handle bad puns."
      if (tone === 'Romantic') polishedText = "Believer in old-school romance and building a life filled with laughter and love."
      
      update('bio', polishedText)
      setShowAiOptions(false)
  }

  return (
    <div className="animate-in slide-in-from-right duration-300 relative h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">About You</h2>
        <p className="text-slate-500">Describe yourself in a line or two.</p>
      </div>

      <div className="relative flex-1">
        <textarea 
            value={data.bio} 
            onChange={e => update('bio', e.target.value)}
            placeholder="I enjoy travelling, good food, and..." 
            className="w-full h-48 p-4 rounded-2xl bg-slate-50 border-none resize-none focus:ring-2 focus:ring-slate-900 outline-none text-lg leading-relaxed"
        />
        
        {/* AI FAB BUTTON */}
        <button 
            onClick={simulateAiPolish}
            disabled={isPolishing}
            className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
        >
            {isPolishing ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />}
            {isPolishing ? "Polishing..." : "AI Polish"}
        </button>
      </div>

      {/* AI OPTIONS MODAL (Mocked) */}
      {showAiOptions && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col justify-center gap-3 animate-in fade-in p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-900 flex gap-2"><Sparkles className="text-purple-600"/> Pick a vibe</h3>
                  <button onClick={() => setShowAiOptions(false)}><X size={20} className="text-slate-400"/></button>
              </div>
              
              {['Chill', 'Witty', 'Romantic'].map(tone => (
                  <button 
                    key={tone} 
                    onClick={() => applyPolish(tone)}
                    className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl text-left hover:border-purple-200 hover:bg-purple-50 transition"
                  >
                      <span className="text-xs font-bold text-purple-600 uppercase block mb-1">{tone}</span>
                      <span className="text-sm text-slate-600">
                          {tone === 'Chill' && "Just a laid-back soul looking for good vibes..."}
                          {tone === 'Witty' && "Professional overthinker and part-time..."}
                          {tone === 'Romantic' && "Believer in old-school romance and..."}
                      </span>
                  </button>
              ))}
          </div>
      )}
    </div>
  )
}
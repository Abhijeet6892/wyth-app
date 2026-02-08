'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Loader2, Sparkles, 
  Shield, MapPin, DollarSign, Lock, X, Camera, Heart, Gem, Zap, CheckCircle 
} from 'lucide-react'
import AvatarUpload from '../../components/AvatarUpload'
import { polishBioMock, type BioTone } from '../../lib/ai/profilePolisher'

// --- TYPES ---
type ProfileSignals = {
  incomeSignal?: { min: number; max: number }
  religionSignal?: string
  familyTypeSignal?: string
}

type ProfileData = {
  full_name: string
  city: string
  gender: string
  intent: 'exploring' | 'dating_marriage' | 'ready_marriage'
  avatar_url: string | null
  jobTitle: string
  company: string
  industry: string
  careerGhostMode: boolean
  diet: string
  drink: string
  smoke: string
  signals: ProfileSignals
  bio: string
}

export default function OnboardingEngine() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0) // 0-based index
  
  // Global State
  const [data, setData] = useState<ProfileData>({
    full_name: '', city: '', gender: '', intent: 'exploring', // Default safest option
    avatar_url: null,
    jobTitle: '', company: '', industry: '', careerGhostMode: true,
    diet: '', drink: '', smoke: '',
    signals: { incomeSignal: { min: 12, max: 20 }, religionSignal: '', familyTypeSignal: '' },
    bio: ''
  })

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

  // --- DYNAMIC PATH LOGIC (The Masterstroke) ---
  const getStepsForIntent = (intent: string) => {
    const common = ['intent', 'basics', 'photo']
    
    if (intent === 'exploring') {
        // Lightest path: Just Identity & Vibe
        return [...common, 'welcome']
    } 
    else if (intent === 'dating_marriage') {
        // Medium path: Add Lifestyle & Career
        return [...common, 'lifestyle', 'career', 'welcome']
    } 
    else {
        // 'ready_marriage' -> Full path: Add Deep Data & Bio
        return [...common, 'lifestyle', 'career', 'private', 'ai_bio', 'welcome']
    }
  }

  // Calculate steps based on current intent selection
  const steps = getStepsForIntent(data.intent)
  const currentStepName = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1

  // --- NAVIGATION & SAVING ---
  const handleNext = async () => {
      setLoading(true)
      try {
        // 1. Validate Current Step
        if (currentStepName === 'basics') {
            if (!data.full_name || !data.city || !data.gender) throw new Error("Please fill in your identity details.")
        }
        if (currentStepName === 'photo') {
            // Soft requirement: We can allow skipping if exploring, but for now let's keep it required
            if (!data.avatar_url) throw new Error("Please upload a photo to continue.")
        }

        // 2. Save Data (Incremental)
        if (user) {
            // Only update fields relevant to the current/passed steps
            const updates: any = {
                id: user.id,
                updated_at: new Date(),
                intent: data.intent, // Always save intent
                // Defaults
                slots_limit: 3, 
                is_gold: false, 
                wallet_balance: 0
            }

            // Map data to DB columns based on what we have collected so far
            if (currentStepIndex >= steps.indexOf('basics')) {
                updates.full_name = data.full_name
                updates.city = data.city
                updates.gender = data.gender
            }
            if (currentStepIndex >= steps.indexOf('photo')) updates.avatar_url = data.avatar_url
            if (currentStepIndex >= steps.indexOf('lifestyle')) updates.lifestyle = { diet: data.diet, drink: data.drink, smoke: data.smoke }
            if (currentStepIndex >= steps.indexOf('private')) updates.profile_signals = data.signals

            const { error: pError } = await supabase.from('profiles').upsert(updates)
            if (pError) throw pError

            // Separate Career Table update
            if (currentStepName === 'career') {
                 await supabase.from('career_data').upsert({
                    user_id: user.id,
                    role: data.jobTitle,
                    industry: data.industry,
                    company_real_name: data.company,
                    company_display_name: data.careerGhostMode ? "Top Tier Firm" : data.company,
                })
            }
        }

        // 3. Move Next or Finish
        if (isLastStep) {
            router.push('/')
        } else {
            setCurrentStepIndex(prev => prev + 1)
        }

      } catch (error: any) {
          alert(error.message)
      } finally {
          setLoading(false)
      }
  }

  const handleBack = () => setCurrentStepIndex(prev => Math.max(0, prev - 1))
  
  const update = (field: keyof ProfileData, value: any) => setData(prev => ({ ...prev, [field]: value }))
  const updateSignal = (field: keyof ProfileSignals, value: any) => setData(prev => ({ ...prev, signals: { ...prev.signals, [field]: value } }))

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6">
      <div className="w-full max-w-md bg-white min-h-[80vh] rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
        
        {/* HEADER */}
        {currentStepName !== 'welcome' && (
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                {currentStepIndex > 0 ? (
                    <button onClick={handleBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full"><ArrowLeft size={20}/></button>
                ) : <div className="w-8"></div>}
                
                <div className="flex gap-1">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i <= currentStepIndex ? 'bg-slate-900' : 'bg-slate-100'}`} />
                    ))}
                </div>
                <div className="w-8"></div>
            </div>
        )}

        {/* STAGE RENDERER */}
        <div className="flex-1 p-6 overflow-y-auto">
            {currentStepName === 'intent' && <StageIntent data={data} update={update} />}
            {currentStepName === 'basics' && <StageBasics data={data} update={update} />}
            {currentStepName === 'photo' && <StagePhotos data={data} update={update} />}
            {currentStepName === 'career' && <StageCareer data={data} update={update} />}
            {currentStepName === 'lifestyle' && <StageLifestyle data={data} update={update} />}
            {currentStepName === 'private' && <StagePrivateSignals data={data} updateSignal={updateSignal} />}
            {currentStepName === 'ai_bio' && <StageAIBio data={data} update={update} />}
            {currentStepName === 'welcome' && <StageWelcome data={data} />}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-20">
            <button 
                onClick={handleNext}
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin"/> : isLastStep ? "Enter WYTH" : "Continue"}
                {!loading && !isLastStep && <ArrowRight size={20} />}
            </button>
        </div>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS (Reusing previous logic) ---

function StageIntent({ data, update }: any) {
  const options = [
    { id: 'exploring', label: 'Exploring Seriously', desc: 'Intentional, but early stage.' },
    { id: 'dating_marriage', label: 'Dating for Marriage', desc: 'Looking to build something real.' },
    { id: 'ready_marriage', label: 'Ready for Marriage', desc: 'Clear intent. 1-2 year timeline.' },
  ]
  return (
    <div className="animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Welcome to WYTH</h2>
      <p className="text-slate-500 mb-8">Let's find your vibe. What are you looking for?</p>
      <div className="space-y-3">
        {options.map(opt => (
          <button key={opt.id} onClick={() => update('intent', opt.id)} className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${data.intent === opt.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
            <div className="font-bold text-slate-900">{opt.label}</div>
            <div className="text-sm text-slate-500">{opt.desc}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-center text-slate-400 mt-6">This helps us filter matches, not label you.</p>
    </div>
  )
}

function StageBasics({ data, update }: any) {
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">The Basics</h2><p className="text-slate-500">Identity check.</p></div>
      <div><label className="text-xs font-bold text-slate-400 uppercase">Full Name</label><input value={data.full_name} onChange={e => update('full_name', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-none mt-2 font-medium" placeholder="How you'd like to be known" /></div>
      <div><label className="text-xs font-bold text-slate-400 uppercase">Current City</label><div className="relative"><MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={data.city} onChange={e => update('city', e.target.value)} className="w-full p-4 pl-12 rounded-xl bg-slate-50 border-none mt-2 font-medium" placeholder="Where are you based?" /></div></div>
      <div><label className="text-xs font-bold text-slate-400 uppercase">Gender</label><div className="flex gap-2 mt-2">{['Male', 'Female', 'Other'].map(g => (<button key={g} onClick={() => update('gender', g)} className={`flex-1 py-3 rounded-xl font-medium transition ${data.gender === g ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}>{g}</button>))}</div></div>
    </div>
  )
}

function StagePhotos({ data, update }: any) {
    return (
      <div className="animate-in slide-in-from-right duration-300 space-y-6">
        <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">First Impressions</h2><p className="text-slate-500">Upload a clear photo to get verified.</p></div>
        <div className="flex justify-center py-8"><AvatarUpload url={data.avatar_url} onUpload={(url: string) => update('avatar_url', url)} /></div>
        <p className="text-xs text-center text-slate-400">Profiles with photos get 3x more responses.</p>
      </div>
    )
}

function StageCareer({ data, update }: any) {
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div className="mb-6"><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Career</h2><p className="text-slate-500">What do you do?</p></div>
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
          <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2 text-blue-700 font-bold"><Shield size={18}/> Social Shield</div><div onClick={() => update('careerGhostMode', !data.careerGhostMode)} className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.careerGhostMode ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.careerGhostMode ? 'translate-x-4' : 'translate-x-0'}`} /></div></div>
          <p className="text-xs text-blue-600/80 leading-relaxed">{data.careerGhostMode ? "Active: We hide your company name from strangers." : "Inactive: Full details visible."}</p>
      </div>
      <input value={data.jobTitle} onChange={e => update('jobTitle', e.target.value)} placeholder="Job Title" className="w-full p-4 rounded-xl bg-slate-50 border-none" />
      <input value={data.company} onChange={e => update('company', e.target.value)} placeholder="Company Name" className="w-full p-4 rounded-xl bg-slate-50 border-none" />
      <input value={data.industry} onChange={e => update('industry', e.target.value)} placeholder="Industry" className="w-full p-4 rounded-xl bg-slate-50 border-none" />
    </div>
  )
}

function StageLifestyle({ data, update }: any) {
  const categories = [{ id: 'diet', label: 'Diet', options: ['Veg', 'Non-Veg', 'Vegan'] }, { id: 'drink', label: 'Drink', options: ['Yes', 'No', 'Socially'] }, { id: 'smoke', label: 'Smoke', options: ['Yes', 'No', 'Never'] }]
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div className="mb-2"><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Lifestyle</h2></div>
      {categories.map(cat => (
          <div key={cat.id} className="space-y-3"><label className="text-xs font-bold text-slate-400 uppercase">{cat.label}</label><div className="flex flex-wrap gap-2">{cat.options.map(opt => (<button key={opt} onClick={() => update(cat.id as any, opt)} className={`px-4 py-2.5 rounded-full text-sm font-medium transition ${data[cat.id as keyof ProfileData] === opt ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600'}`}>{opt}</button>))}</div></div>
      ))}
    </div>
  )
}

function StagePrivateSignals({ data, updateSignal }: { data: ProfileData, updateSignal: any }) {
  const signals = data.signals || {}
  const incomeMin = signals.incomeSignal?.min || 10
  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-8">
      <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Private Preferences</h2><p className="text-slate-500 text-sm">Optional signals. <b>Private by default</b>.</p></div>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3 items-center mb-2"><div className="p-2 bg-white rounded-full text-slate-400"><Lock size={16}/></div><p className="text-xs text-slate-500">This data is <b>not</b> shown on your public profile.</p></div>
      <div className="space-y-4">
        <div className="flex justify-between items-center"><label className="font-bold text-slate-900 flex items-center gap-2"><DollarSign size={18}/> Comfort Range (Income)</label><span className="text-xl font-bold text-slate-900">₹{incomeMin}-{incomeMin + 8}L</span></div>
        <input type="range" min="5" max="100" value={incomeMin} onChange={e => { const val = parseInt(e.target.value); updateSignal('incomeSignal', { min: val, max: val + 8 }) }} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
      </div>
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <label className="font-bold text-slate-900">Cultural Background</label>
        <select value={signals.religionSignal || ''} onChange={e => updateSignal('religionSignal', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-none outline-none"><option value="">Prefer not to say</option><option value="Hindu">Hindu</option><option value="Muslim">Muslim</option><option value="Christian">Christian</option><option value="Sikh">Sikh</option></select>
        <label className="font-bold text-slate-900 block mt-4">Family Setup</label>
        <div className="flex gap-2">{['Nuclear', 'Joint', 'Flexible'].map(t => (<button key={t} onClick={() => updateSignal('familyTypeSignal', t)} className={`flex-1 py-3 rounded-xl font-medium border ${signals.familyTypeSignal === t ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500'}`}>{t}</button>))}</div>
      </div>
    </div>
  )
}

function StageAIBio({ data, update }: any) {
  const [isPolishing, setIsPolishing] = useState(false)
  const [showAiOptions, setShowAiOptions] = useState(false)
  
  const applyPolish = async (tone: BioTone) => {
      setIsPolishing(true)
      const polished = await polishBioMock(data.bio || "", tone)
      update('bio', polished)
      setIsPolishing(false)
      setShowAiOptions(false)
  }
  const tones = ['Chill', 'Witty', 'Romantic'] as const;
  return (
    <div className="animate-in slide-in-from-right duration-300 relative h-full flex flex-col">
      <div className="mb-4"><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">About You</h2><p className="text-slate-500">Describe yourself in a line or two.</p></div>
      <div className="relative flex-1">
        <textarea value={data.bio} onChange={e => update('bio', e.target.value)} placeholder="I enjoy travelling..." className="w-full h-48 p-4 rounded-2xl bg-slate-50 border-none resize-none focus:ring-2 focus:ring-slate-900 outline-none text-lg leading-relaxed"/>
        <button onClick={() => setShowAiOptions(true)} className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"><Sparkles size={16} /> AI Polish</button>
      </div>
      {showAiOptions && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col justify-center gap-3 animate-in fade-in p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-slate-900 flex gap-2"><Sparkles className="text-purple-600"/> Pick a vibe</h3><button onClick={() => setShowAiOptions(false)}><X size={20} className="text-slate-400"/></button></div>
              {tones.map(tone => (
                  <button key={tone} onClick={() => applyPolish(tone)} disabled={isPolishing} className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl text-left hover:border-purple-200 hover:bg-purple-50 transition">
                      {isPolishing && tone === 'Chill' ? <Loader2 className="animate-spin" size={16}/> : <><span className="text-xs font-bold text-purple-600 uppercase block mb-1">{tone}</span></>}
                  </button>
              ))}
          </div>
      )}
    </div>
  )
}

function StageWelcome({ data }: any) {
    return (
        <div className="animate-in slide-in-from-right duration-500 flex flex-col items-center text-center pt-8">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle size={48} className="text-green-500" />
            </div>
            
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">You're In, {data.full_name.split(' ')[0]}!</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your profile is set. Here is how WYTH works:</p>
            
            <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <div className="p-2 bg-white rounded-full"><Zap size={20} className="text-rose-600 fill-rose-600"/></div>
                    <div>
                        <p className="font-bold text-slate-900">3 Free Slots</p>
                        <p className="text-xs text-slate-500">Connect carefully. Slots are limited.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="p-2 bg-white rounded-full"><DollarSign size={20} className="text-amber-600"/></div>
                    <div>
                        <p className="font-bold text-slate-900">0 Coins Balance</p>
                        <p className="text-xs text-slate-500">Top up to send priority comments.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="p-2 bg-white rounded-full"><Shield size={20} className="text-blue-600"/></div>
                    <div>
                        <p className="font-bold text-slate-900">Social Shield Active</p>
                        <p className="text-xs text-slate-500">Your career & vibe are private.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
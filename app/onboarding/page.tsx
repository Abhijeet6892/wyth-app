'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, ArrowRight, Loader2, Sparkles, 
  Shield, MapPin, DollarSign, Lock, X, Phone, CheckCircle, Zap
} from 'lucide-react'
import AvatarUpload from '../../components/AvatarUpload'
import { polishBioMock, type BioTone } from '../../lib/ai/profilePolisher'

// --- CONSTANTS (EXPANDED GLOBAL LIST) ---
const KNOWN_CITIES = [
  // 🇮🇳 INDIA — Metros & Tier 1
  "Mumbai","Delhi NCR","New Delhi","Gurugram","Noida","Faridabad","Ghaziabad",
  "Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Surat","Vadodara",
  "Jaipur","Udaipur","Jodhpur","Ajmer",
  "Chandigarh","Mohali","Panchkula",
  "Lucknow","Kanpur","Agra","Varanasi","Prayagraj","Noida Extension",
  "Indore","Bhopal","Jabalpur","Gwalior",
  "Bhubaneswar","Cuttack",
  "Patna","Gaya","Muzaffarpur",
  "Ranchi","Jamshedpur","Dhanbad",
  "Raipur","Bilaspur",
  "Nagpur","Nashik","Aurangabad","Solapur","Kolhapur",
  "Thane","Navi Mumbai","Kalyan","Dombivli",
  "Amritsar","Ludhiana","Jalandhar","Patiala",
  "Dehradun","Haridwar","Roorkee",
  "Shimla","Solan",
  "Srinagar","Jammu",
  "Guwahati","Silchar","Dibrugarh",
  "Shillong",
  "Imphal",
  "Aizawl",
  "Kohima","Dimapur",
  "Agartala",
  "Gangtok",
  "Itanagar",
  "Panaji","Margao","Vasco da Gama",
  "Thiruvananthapuram","Kochi","Ernakulam","Thrissur","Kozhikode",
  "Coimbatore","Madurai","Trichy","Salem","Erode","Vellore","Tirunelveli",
  "Tirupati","Vijayawada","Guntur","Visakhapatnam","Rajahmundry","Kakinada",
  "Warangal","Nizamabad","Karimnagar",
  "Mangaluru","Udupi","Mysuru","Hubballi","Belagavi","Davangere","Shivamogga",
  "Hisar","Rohtak","Panipat","Sonipat","Karnal",
  "Rewari","Bhiwani",
  "Alwar","Bharatpur",
  "Siliguri","Asansol","Durgapur",
  "Howrah","Hooghly",
  "Kharagpur",
  "Port Blair",
  "Leh",
  "Kargil",

  // 🌍 INTERNATIONAL — Major Global Cities
  // 🇺🇸 USA
  "New York","San Francisco","San Jose","Los Angeles","San Diego",
  "Seattle","Redmond","Bellevue",
  "Chicago","Austin","Dallas","Houston",
  "Boston","Cambridge",
  "Washington DC","Arlington","Reston",
  "Atlanta","Miami","Orlando",
  "San Mateo","Mountain View","Sunnyvale","Palo Alto","Cupertino",
  "Fremont","Milpitas",
  "Newark","Jersey City","Edison","Princeton",
  "Raleigh","Durham","Chapel Hill",

  // 🇨🇦 Canada
  "Toronto","Mississauga","Brampton","Scarborough",
  "Vancouver","Burnaby","Surrey","Richmond",
  "Calgary","Edmonton",
  "Montreal","Laval",
  "Ottawa","Waterloo","Kitchener",

  // 🇬🇧 UK
  "London","Greater London","Canary Wharf",
  "Manchester","Birmingham","Leeds","Sheffield",
  "Reading","Slough","Wembley",
  "Milton Keynes","Oxford","Cambridge",
  "Leicester","Nottingham",

  // 🇦🇪 UAE
  "Dubai","Abu Dhabi","Sharjah","Ajman","Al Ain",
  "Ras Al Khaimah","Fujairah",

  // 🇦🇺 Australia
  "Sydney","Melbourne","Brisbane","Perth","Adelaide",
  "Canberra","Parramatta",

  // 🇳🇿 New Zealand
  "Auckland","Wellington","Christchurch",

  // 🇩🇪 Germany
  "Berlin","Munich","Frankfurt","Hamburg","Stuttgart","Dusseldorf",

  // 🇫🇷 France
  "Paris","La Defense","Lyon","Marseille","Nice",

  // 🇳🇱 Netherlands
  "Amsterdam","Rotterdam","The Hague","Utrecht",

  // 🇸🇬 Singapore
  "Singapore",

  // 🇯🇵 Japan
  "Tokyo","Yokohama","Osaka","Kyoto","Nagoya",

  // 🇨🇳 China / HK
  "Hong Kong","Shenzhen","Shanghai","Beijing","Guangzhou",

  // 🇮🇪 Ireland
  "Dublin","Cork","Galway",

  // 🇮🇹 Italy
  "Milan","Rome","Turin","Florence",

  // 🇪🇸 Spain
  "Barcelona","Madrid","Valencia",

  // 🇨🇭 Switzerland
  "Zurich","Geneva","Basel",

  // 🇸🇪 Sweden
  "Stockholm","Gothenburg",

  // 🇳🇴 Norway
  "Oslo",

  // 🇩🇰 Denmark
  "Copenhagen",

  // 🇧🇪 Belgium
  "Brussels",

  // 🇵🇹 Portugal
  "Lisbon","Porto",

  // 🇿🇦 South Africa
  "Johannesburg","Cape Town","Pretoria",

  // 🇶🇦 Qatar
  "Doha",

  // 🇸🇦 Saudi Arabia
  "Riyadh","Jeddah",

  // 🇲🇾 Malaysia
  "Kuala Lumpur","Petaling Jaya",

  // 🇮🇩 Indonesia
  "Jakarta","Bali",

  // 🇹🇭 Thailand
  "Bangkok",

  // 🇰🇷 South Korea
  "Seoul",

  // 🇧🇷 Brazil
  "Sao Paulo","Rio de Janeiro",

  // 🇲🇽 Mexico
  "Mexico City",

  // 🇷🇺 Russia
  "Moscow","Saint Petersburg"
]

// --- TYPES ---
type ProfileSignals = {
  incomeSignal?: { min: number; max: number }
  religionSignal?: string
  familyTypeSignal?: string
}

type ProfileData = {
  full_name: string
  phone: string
  gender: string
  intent: string
  avatar_url: string | null
  
  // City Strict Mode
  city_display: string
  city_normalized: string
  city_category: 'known' | 'other' | ''

  // Career
  jobTitle: string
  company: string
  industry: string
  careerGhostMode: boolean

  // Lifestyle
  diet: string
  drink: string
  smoke: string

  // Signals & Bio
  signals: ProfileSignals
  bio: string
}

export default function OnboardingEngine() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 8 

  // Global State
  const [data, setData] = useState<ProfileData>({
    full_name: '', phone: '', gender: '', intent: 'dating_for_marriage',
    avatar_url: null,
    // City defaults
    city_display: '', city_normalized: '', city_category: '',
    jobTitle: '', company: '', industry: '', careerGhostMode: true,
    diet: '', drink: '', smoke: '',
    signals: { incomeSignal: { min: 0, max: 50}, religionSignal: '', familyTypeSignal: '' },
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

  // --- SAVE LOGIC ---
  const saveAndNext = async () => {
    if (!user) return
    setLoading(true)

    try {
        // Validation Guards
        if (step === 2) {
            if (!data.full_name || !data.gender) throw new Error("Full Name and Gender are required")
            if (!data.city_display || !data.city_category) throw new Error("Please select a valid city.")
            if (!data.phone || data.phone.length < 10) throw new Error("Please enter a valid phone number with country code.")
        }
        if (step === 3 && !data.avatar_url) throw new Error("A photo is requiredto continue.")

        // Database Updates
        let error = null
        if ([1, 2, 3, 5, 6, 7].includes(step)) {
            const updates: any = {
                id: user.id,
                updated_at: new Date(),
                slots_limit: 3, is_gold: false, wallet_balance: 0 
            }

            if (step === 1) updates.intent = data.intent
            if (step === 2) {
                updates.full_name = data.full_name
                updates.phone = data.phone 
                updates.gender = data.gender
                // Strict City Saving
                updates.city = data.city_display 
                updates.city_display = data.city_display
                updates.city_normalized = data.city_normalized
                updates.city_category = data.city_category
            }
            if (step === 3) updates.avatar_url = data.avatar_url
            if (step === 5) updates.lifestyle = { diet: data.diet, drink: data.drink, smoke: data.smoke }
            if (step === 6) updates.profile_signals = data.signals
            if (step === 7) { /* bio saved later if needed */ }

            const { error: err } = await supabase.from('profiles').upsert(updates)
            error = err
        }

        if (step === 4) {
            const { error: err } = await supabase.from('career_data').upsert({
                user_id: user.id,
                role: data.jobTitle,
                industry: data.industry,
                company_real_name: data.company,
                company_display_name: data.careerGhostMode ? "Private Firm" : data.company,
            })
            error = err
        }

        if (error) throw error

        if (step < TOTAL_STEPS) setStep(s => s + 1)
        else router.push('/')

    } catch (error: any) {
        alert(error.message || "Error saving data.")
    } finally {
        setLoading(false)
    }
  }

  const back = () => setStep(s => Math.max(s - 1, 1))
  const update = (field: keyof ProfileData, value: any) => setData(prev => ({ ...prev, [field]: value }))
  
  const updateSignal = (field: keyof ProfileSignals, value: any) => {
    setData(prev => ({ ...prev, signals: { ...prev.signals, [field]: value } }))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6">
      <div className="w-full max-w-md bg-white min-h-[80vh] rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
        
        {/* HEADER */}
        {step < TOTAL_STEPS && (
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20">
                {step > 1 ? <button onClick={back} className="p-2 -ml-2 hover:bg-slate-50 rounded-full"><ArrowLeft size={20}/></button> : <div className="w-8"></div>}
                <div className="flex gap-1">{[...Array(TOTAL_STEPS)].map((_, i) => (<div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-slate-900' : 'bg-slate-100'}`} />))}</div>
                <div className="w-8"></div>
            </div>
        )}

        {/* STAGES */}
        <div className="flex-1 p-6 overflow-y-auto">
            {step === 1 && <StageIntent data={data} update={update} />}
            {step === 2 && <StageBasics data={data} update={update} />}
            {step === 3 && <StagePhotos data={data} update={update} />}
            {step === 4 && <StageCareer data={data} update={update} />}
            {step === 5 && <StageLifestyle data={data} update={update} />}
            {step === 6 && <StagePrivateSignals data={data} updateSignal={updateSignal} />}
            {step === 7 && <StageAIBio data={data} update={update} />}
            {step === 8 && <StageWelcome data={data} />}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-20">
            <button onClick={saveAndNext} disabled={loading} className="w-full bg-slate-900 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin"/> : step === TOTAL_STEPS ? "Enter WYTH" : "Save & Continue"}
                {!loading && step !== TOTAL_STEPS && <ArrowRight size={20} />}
            </button>
        </div>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function StageIntent({ data, update }: any) {
  const options = [{ id: 'exploring', label: 'Exploring Seriously', desc: 'Intentional, but early stage.' }, { id: 'dating_for_marriage', label: 'Dating for Marriage', desc: 'Looking to build something real.' }, { id: 'ready_for_marriage', label: 'Ready for Marriage', desc: 'Clear intent. 1-2 year timeline.' }]
  return (
    <div className="animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Welcome to WYTH</h2>
      <p className="text-slate-500 mb-8">Let's find your vibe. What are you looking for?</p>
      <div className="space-y-3">{options.map(opt => (<button key={opt.id} onClick={() => update('intent', opt.id)} className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${data.intent === opt.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}><div className="font-bold text-slate-900">{opt.label}</div><div className="text-sm text-slate-500">{opt.desc}</div></button>))}</div>
    </div>
  )
}

// --- UPDATED: STRICT CITY LOGIC (Dropdown Fixed) ---
function StageBasics({ data, update }: any) {
  // Initialize with existing data if present
  const [cityQuery, setCityQuery] = useState(data.city_display?.split(' (')[0] || '')
  const [showCityList, setShowCityList] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Filter Logic: If query matches known list
  const filteredCities = KNOWN_CITIES.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase()))

  const selectCity = (city: string, type: 'known' | 'other') => {
      if (type === 'known') {
          update('city_display', city)
          update('city_normalized', city.toLowerCase())
          update('city_category', 'known')
          setCityQuery(city)
      } else {
          // Other logic
          const cleanInput = cityQuery.trim()
          update('city_display', `${cleanInput} (Other)`)
          update('city_normalized', `${cleanInput.toLowerCase()}_other`)
          update('city_category', 'other')
          setCityQuery(cleanInput)
      }
      setShowCityList(false)
  }

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowCityList(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">The Basics</h2><p className="text-slate-500">Identity check.</p></div>
      
      <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
          <input value={data.full_name} onChange={e => update('full_name', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-none mt-2 font-medium" placeholder="e.g. Arjun Kapoor" />
      </div>
      
      <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
          <div className="relative">
             <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
             <input type="tel" value={data.phone} onChange={e => update('phone', e.target.value.replace(/[^\d+]/g, ''))} className="w-full p-4 pl-12 rounded-xl bg-slate-50 border-none mt-2 font-medium" placeholder="+91 9876543210" />
          </div>
      </div>

      {/* SEARCHABLE CITY SELECTOR (FIXED) */}
      <div ref={wrapperRef} className="relative">
          <label className="text-xs font-bold text-slate-400 uppercase">Current City</label>
          <div className="relative mt-2">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input 
                value={cityQuery} 
                onChange={e => { setCityQuery(e.target.value); setShowCityList(true); }}
                onFocus={() => setShowCityList(true)}
                className="w-full p-4 pl-12 rounded-xl bg-slate-50 border-none font-medium" 
                placeholder="Search city..." 
            />
          </div>
          
          {/* FIX: Removed '&& cityQuery' check. Now shows list on click. */}
          {showCityList && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                  {filteredCities.map(city => (
                      <div key={city} onClick={() => selectCity(city, 'known')} className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-medium border-b border-slate-50 last:border-none">
                          {city}
                      </div>
                  ))}
                  
                  {/* Show 'Other' if typed value is not an exact match */}
                  {cityQuery && !KNOWN_CITIES.includes(cityQuery) && (
                      <div onClick={() => selectCity(cityQuery, 'other')} className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-blue-600 border-t border-slate-100">
                          Use "{cityQuery}" (Other)
                      </div>
                  )}
              </div>
          )}
      </div>

      <div>
          <label className="text-xs font-bold text-slate-400 uppercase">Gender</label>
          <div className="flex gap-2 mt-2">{['Male', 'Female', 'Other'].map(g => (<button key={g} onClick={() => update('gender', g)} className={`flex-1 py-3 rounded-xl font-medium transition ${data.gender === g ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}>{g}</button>))}</div>
      </div>
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
        <div className="flex justify-between text-xs text-slate-400 font-bold"><span>₹5L</span><span>₹1 Cr+</span></div>
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
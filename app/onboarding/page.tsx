'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Loader2, Sparkles, 
  Shield, MapPin, DollarSign, Lock, X, Phone, CheckCircle, Zap
} from 'lucide-react'
import AvatarUpload from '../../components/AvatarUpload'
import { generateBioAction, type BioTone } from '../../app/actions/generateBio'

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
  city_display: string
  city_normalized: string
  city_category: 'known' | 'other' | ''
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
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 8 

  const [data, setData] = useState<ProfileData>({
    full_name: '', phone: '', gender: '', intent: 'dating_for_marriage',
    avatar_url: null,
    city_display: '', city_normalized: '', city_category: '',
    jobTitle: '', company: '', industry: '', careerGhostMode: true,
    diet: '', drink: '', smoke: '',
    signals: { incomeSignal: { min: 12, max: 20 }, religionSignal: '', familyTypeSignal: '' },
    bio: '',
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

  const saveAndNext = async () => {
    if (!user) return
    setLoading(true)

    try {
        // Validation Logic
        if (step === 2) {
            if (!data.full_name || !data.gender) throw new Error("Full Name and Gender are required")
            if (!data.city_display) throw new Error("Please select a valid city.")
            if (!data.phone || data.phone.length < 10) throw new Error("Please enter a valid phone number.")
        }
        if (step === 3 && !data.avatar_url) throw new Error("A photo is required to continue.")

        // Database Upsert Logic (Simplified for brevity - assumes same logic as before)
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
            updates.city = data.city_display 
            updates.city_display = data.city_display
            updates.city_normalized = data.city_normalized
            updates.city_category = data.city_category
        }
        if (step === 3) updates.avatar_url = data.avatar_url
        if (step === 5) updates.lifestyle = { diet: data.diet, drink: data.drink, smoke: data.smoke }
        if (step === 6) updates.profile_signals = data.signals
        if (step === 7) updates.bio = data.bio

        const { error } = await supabase.from('profiles').upsert(updates)
        if (error) throw error

        if (step === 4) {
            await supabase.from('career_data').upsert({
                user_id: user.id,
                role: data.jobTitle,
                industry: data.industry,
                company_real_name: data.company,
                company_display_name: data.careerGhostMode ? "Private Firm" : data.company,
            })
        }

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl h-[85vh] rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden flex flex-col relative"
      >
        
        {/* HEADER */}
        {step < TOTAL_STEPS && (
            <div className="px-6 py-6 flex items-center justify-between sticky top-0 z-20">
                {step > 1 ? (
                    <button onClick={back} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={20}/></button>
                ) : <div className="w-8"></div>}
                
                {/* Progress Bar */}
                <div className="flex gap-1.5">
                    {[...Array(TOTAL_STEPS)].map((_, i) => (
                        <motion.div 
                            key={i} 
                            animate={{ 
                                backgroundColor: i + 1 <= step ? '#0f172a' : '#e2e8f0',
                                width: i + 1 === step ? 24 : 6 
                            }}
                            className="h-1.5 rounded-full" 
                        />
                    ))}
                </div>
                <div className="w-8"></div>
            </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex-1 px-6 overflow-y-auto pb-24 scrollbar-hide">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {step === 1 && <StageIntent data={data} update={update} />}
                    {step === 2 && <StageBasics data={data} update={update} />}
                    {step === 3 && <StagePhotos data={data} update={update} />}
                    {step === 4 && <StageCareer data={data} update={update} />}
                    {step === 5 && <StageLifestyle data={data} update={update} />}
                    {step === 6 && <StagePrivateSignals data={data} updateSignal={updateSignal} />}
                    {step === 7 && <StageAIBio data={data} update={update} />}
                    {step === 8 && <StageWelcome data={data} />}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="p-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-10">
            <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={saveAndNext} 
                disabled={loading} 
                className="w-full bg-slate-900 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:shadow-2xl transition-all disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin"/> : step === TOTAL_STEPS ? "Enter WYTH" : "Continue"}
                {!loading && step !== TOTAL_STEPS && <ArrowRight size={20} />}
            </motion.button>
        </div>

      </motion.div>
    </div>
  )
}

// --- SUB-COMPONENTS (Refined Styles) ---

function StageIntent({ data, update }: any) {
  const options = [
      { id: 'exploring', label: 'Exploring Seriously', desc: 'Intentional, but early stage.' }, 
      { id: 'dating_for_marriage', label: 'Dating for Marriage', desc: 'Looking to build something real.' }, 
      { id: 'ready_for_marriage', label: 'Ready for Marriage', desc: 'Clear intent. 1-2 year timeline.' }
  ]
  return (
    <div className="pt-2">
      <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">Welcome to WYTH</h2>
      <p className="text-slate-500 mb-8 font-medium">Let's find your vibe. What are you looking for?</p>
      <div className="space-y-4">
          {options.map(opt => (
              <button 
                key={opt.id} 
                onClick={() => update('intent', opt.id)} 
                className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 ${data.intent === opt.id ? 'border-slate-900 bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-300 hover:bg-white'}`}
              >
                  <div className="font-bold text-slate-900 text-lg">{opt.label}</div>
                  <div className="text-sm text-slate-500 mt-1">{opt.desc}</div>
              </button>
          ))}
      </div>
    </div>
  )
}

function StageBasics({ data, update }: any) {
  const [cityQuery, setCityQuery] = useState(data.city_display?.split(' (')[0] || '')
  const [showCityList, setShowCityList] = useState(false)
  
  const selectCity = (city: string) => {
      update('city_display', city)
      setCityQuery(city)
      setShowCityList(false)
  }

  return (
    <div className="space-y-6 pt-2">
      <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">The Basics</h2><p className="text-slate-500">Identity check.</p></div>
      
      <div className="space-y-4">
          <input value={data.full_name} onChange={e => update('full_name', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 transition-all font-medium" placeholder="Full Name" />
          <input type="tel" value={data.phone} onChange={e => update('phone', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 transition-all font-medium" placeholder="Phone (+91...)" />
          
          <div className="relative">
             <input value={cityQuery} onChange={e => { setCityQuery(e.target.value); setShowCityList(true) }} className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 transition-all font-medium" placeholder="Current City" />
             {showCityList && (
                 <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-40 overflow-y-auto">
                     {KNOWN_CITIES.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase())).map(c => (
                         <div key={c} onClick={() => selectCity(c)} className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-medium">{c}</div>
                     ))}
                 </div>
             )}
          </div>

          <div className="flex gap-2">
              {['Male', 'Female'].map(g => (
                  <button key={g} onClick={() => update('gender', g)} className={`flex-1 py-4 rounded-xl font-bold transition-all ${data.gender === g ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}>{g}</button>
              ))}
          </div>
      </div>
    </div>
  )
}

function StagePhotos({ data, update }: any) {
    return (
      <div className="space-y-6 pt-2 text-center">
        <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">First Impressions</h2><p className="text-slate-500">Upload a clear photo to get verified.</p></div>
        <div className="py-10"><AvatarUpload url={data.avatar_url} onUpload={(url) => update('avatar_url', url)} /></div>
      </div>
    )
}

function StageCareer({ data, update }: any) {
  return (
    <div className="space-y-6 pt-2">
      <div className="mb-6"><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Career</h2><p className="text-slate-500">What do you do?</p></div>
      <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mb-6 flex justify-between items-center">
          <div><div className="flex items-center gap-2 text-blue-700 font-bold mb-1"><Shield size={16}/> Social Shield</div><p className="text-[10px] text-blue-600/80">{data.careerGhostMode ? "Company hidden from strangers." : "Full details visible."}</p></div>
          <div onClick={() => update('careerGhostMode', !data.careerGhostMode)} className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${data.careerGhostMode ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${data.careerGhostMode ? 'translate-x-5' : 'translate-x-0'}`} /></div>
      </div>
      <input value={data.jobTitle} onChange={e => update('jobTitle', e.target.value)} placeholder="Job Title" className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 transition-all font-medium" />
      <input value={data.company} onChange={e => update('company', e.target.value)} placeholder="Company Name" className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 transition-all font-medium" />
      <input value={data.industry} onChange={e => update('industry', e.target.value)} placeholder="Industry" className="w-full p-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 transition-all font-medium" />
    </div>
  )
}

function StageLifestyle({ data, update }: any) {
  const categories = [{ id: 'diet', label: 'Diet', options: ['Veg', 'Non-Veg', 'Vegan'] }, { id: 'drink', label: 'Drink', options: ['Yes', 'No', 'Socially'] }, { id: 'smoke', label: 'Smoke', options: ['Yes', 'No', 'Never'] }]
  return (
    <div className="space-y-8 pt-2">
      <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Lifestyle</h2></div>
      {categories.map(cat => (
          <div key={cat.id} className="space-y-3"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.label}</label><div className="flex flex-wrap gap-2">{cat.options.map(opt => (<button key={opt} onClick={() => update(cat.id as any, opt)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${data[cat.id as keyof ProfileData] === opt ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>{opt}</button>))}</div></div>
      ))}
    </div>
  )
}

function StagePrivateSignals({ data, updateSignal }: any) {
  return (
    <div className="space-y-8 pt-2">
      <div><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Private Preferences</h2><p className="text-slate-500 text-sm">Visible only to matches.</p></div>
      <div className="space-y-4">
        <div className="flex justify-between items-center"><label className="font-bold text-slate-900 flex items-center gap-2"><DollarSign size={18}/> Income Range</label><span className="text-xl font-bold text-slate-900">₹{data.signals.incomeSignal?.min}-{data.signals.incomeSignal?.max}L</span></div>
        <input type="range" min="5" max="100" value={data.signals.incomeSignal?.min || 10} onChange={e => { const val = parseInt(e.target.value); updateSignal('incomeSignal', { min: val, max: val + 8 }) }} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
      </div>
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <label className="font-bold text-slate-900">Religion</label>
        <select value={data.signals.religionSignal || ''} onChange={e => updateSignal('religionSignal', e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border-transparent outline-none font-medium"><option value="">Prefer not to say</option><option value="Hindu">Hindu</option><option value="Muslim">Muslim</option><option value="Christian">Christian</option><option value="Sikh">Sikh</option></select>
      </div>
    </div>
  )
}

function StageAIBio({ data, update }: any) {
  const [loading, setLoading] = useState(false)
  const handleAI = async (tone: BioTone) => {
      setLoading(true)
      const res = await generateBioAction(data.bio, tone)
      update('bio', res)
      setLoading(false)
  }
  return (
    <div className="pt-2 h-full flex flex-col">
      <div className="mb-4"><h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">About You</h2><p className="text-slate-500">Draft a few lines, let AI polish it.</p></div>
      <textarea value={data.bio} onChange={e => update('bio', e.target.value)} placeholder="I love travel..." className="w-full h-40 p-5 rounded-3xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 text-lg leading-relaxed resize-none mb-4" />
      <div className="flex gap-2">
          {['Chill', 'Witty', 'Romantic'].map(t => (
              <button key={t} onClick={() => handleAI(t as BioTone)} disabled={loading} className="flex-1 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition">{t}</button>
          ))}
      </div>
    </div>
  )
}

function StageWelcome({ data }: any) {
    return (
        <div className="flex flex-col items-center text-center pt-10">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce"><CheckCircle size={48} className="text-green-500" /></div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">You're Ready!</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your profile is set. Welcome to WYTH.</p>
        </div>
    )
}
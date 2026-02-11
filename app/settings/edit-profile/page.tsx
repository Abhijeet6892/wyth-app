'use client'
import { useState, useEffect, useRef } from 'react'

// RELATIVE IMPORTS
import { supabase } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { 
  ArrowLeft,
  Loader2,
  Sparkles,
  User,
  Briefcase,
  Coffee,
  Shield,
  MapPin,
  Phone,
  Lock
} from 'lucide-react'

import AvatarUpload from '../../../components/AvatarUpload'
import { generateBioAction, type BioTone } from '../../actions/generateBio'

// --- CONSTANTS ---
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

  const [aiLoading, setAiLoading] = useState(false)

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

  // FETCH PROFILE
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
        setData(prev => ({
          ...prev,
          ...profile,
          bio: profile.bio || ''
        }))
        setCityQuery(profile.city_display || profile.city || '')
      }

      setLoading(false)
    }
    fetchData()
  }, [])

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

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (cityWrapperRef.current && !cityWrapperRef.current.contains(e.target)) {
        setShowCityList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update(data).eq('id', user.id)
    setSaving(false)
    router.push('/profile')
  }

  const handleAI = async (tone: BioTone) => {
    setAiLoading(true)
    const polished = await generateBioAction(data.bio, tone)
    setData(prev => ({ ...prev, bio: polished }))
    setAiLoading(false)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b flex justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="p-2 rounded-full hover:bg-slate-50">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold">Edit Profile</h1>
        </div>
        <button onClick={handleSave} className="text-blue-600 font-bold">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* REST OF UI UNCHANGED */}
    </div>
  )
}

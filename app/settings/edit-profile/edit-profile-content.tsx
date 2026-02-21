"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Camera,
  Lock,
  Briefcase,
  MapPin,
  CheckCircle2,
  Home,
  Church,
  Languages,
  Utensils,
  Wine,
  Cigarette,
  Ruler,
  Navigation,
  ChevronDown,
  IndianRupee,
  XCircle,
  User,
  Calendar,
  Phone,
  Heart,
  Users,
  Globe2,
  Linkedin,
  Instagram,
  AlertTriangle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateBioAction, type BioTone } from "@/app/actions/generateBio";// Constants
const INCOME_BRACKETS = [
  "Student / < 5L", "5L - 10L", "10L - 15L", "15L - 20L", 
  "20L - 30L", "30L - 50L", "50L - 1Cr", "1Cr+"
];

const CITIES = [
  "Mumbai","Delhi NCR","Bangalore","Hyderabad","Chennai","Kolkata","Pune",
  "Gurugram","Noida","Ahmedabad","Jaipur","Chandigarh","Lucknow","Indore",
  "Patna","Bhopal","Kochi","Visakhapatnam","Surat","Vadodara","Ludhiana",
  "Agra","Nashik","Nagpur","Coimbatore","Thiruvananthapuram","Mysuru",
  "Guwahati","Bhubaneswar","Raipur","Ranchi","Dehradun","Shimla","Goa",
  "New York","London","Dubai","Singapore","Toronto","San Francisco","Berlin"
];

const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Jewish", "Other", "Spiritual", "Agnostic"];
const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Marathi", "Gujarati", "Bengali", "Kannada", "Malayalam", "Punjabi", "Urdu", "Other"];
const DIET_OPTIONS = ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"];
const DRINK_OPTIONS = ["Yes", "No", "Occasionally"];
const SMOKE_OPTIONS = ["Yes", "No", "Occasionally"];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type SectionType = 'basic' | 'career' | 'photos' | 'background' | 'culture' | 'lifestyle' | 'preferences' | 'social';

// Allowed sections for validation
const ALLOWED_SECTIONS: SectionType[] = ['basic', 'career', 'photos', 'background', 'culture', 'lifestyle', 'preferences', 'social'];

export default function EditProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedTone, setSelectedTone] = useState<BioTone>('Grounded');
  const [activeSection, setActiveSection] = useState<SectionType>('basic');
  const [sectionFromUrl, setSectionFromUrl] = useState<SectionType | null>(null);
  const [user, setUser] = useState<any>(null);

  // Search states
  const [citySearch, setCitySearch] = useState("");
  const [hometownSearch, setHometownSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showHometownDropdown, setShowHometownDropdown] = useState(false);

  // INTENT CHANGE STATES
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [missingIntentFields, setMissingIntentFields] = useState<string[]>([]);
  const [missingIntentSections, setMissingIntentSections] = useState<SectionType[]>([]);

  // Form State - Complete Profile
  const [formData, setFormData] = useState({
    // Basic
    full_name: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    city: "",
    
    // Career
    job_title: "",
    company: "",
    income_tier: "",
    ghost_mode: false,
    
    // Bio & Intent
    bio: "",
    intent: "",
    
    // Photos
    photo_face: "",
    photo_body: "",
    photo_hobby: "",
    photo_general: "",
    
    // Background
    hometown: "",
    family_type: "",
    values: "",
    horoscope: "",
    family_income: "",
    
    // Culture
    religion: "",
    mother_tongue: "",
    about_family: "",
    
    // Lifestyle
    diet: "",
    drink: "",
    smoke: "",
    
    // Preferences
    age_min: 24,
    age_max: 35,
    height_min: 152,
    height_max: 183,
    location_preference: "",
    open_to_relocate: false,
    
    // Social
    linkedin_url: "",
    instagram_handle: "",
  });

  // ===== INTENT CHANGE LOGIC =====
  const getMissingFieldsForIntent = (newIntent: string): { fields: string[]; sections: SectionType[] } => {
    const current = formData.intent || 'exploring';
    
    // If changing to the same intent, no missing fields
    if (current === newIntent) return { fields: [], sections: [] };

    // Exploring → Dating: Need Religion + Mother Tongue
    if (current === 'exploring' && newIntent === 'dating') {
      const missing = [];
      const sections: SectionType[] = [];
      if (!formData.religion) { missing.push('Religion'); sections.push('culture'); }
      if (!formData.mother_tongue) { missing.push('Mother Tongue'); sections.push('culture'); }
      return { fields: missing, sections: [...new Set(sections)] };
    }

    // Exploring → Marriage: Need Roots (6), Values (6.5), Culture (7)
    if (current === 'exploring' && newIntent === 'ready_marriage') {
      const missing = [];
      const sections: SectionType[] = [];
      if (!formData.hometown) { missing.push('Hometown'); sections.push('background'); }
      if (!formData.family_type) { missing.push('Family Type'); sections.push('background'); }
      if (!formData.values) { missing.push('Values'); sections.push('background'); }
      if (!formData.religion) { missing.push('Religion'); sections.push('culture'); }
      if (!formData.mother_tongue) { missing.push('Mother Tongue'); sections.push('culture'); }
      if (!formData.about_family) { missing.push('About Family'); sections.push('culture'); }
      return { fields: missing, sections: [...new Set(sections)] };
    }

    // Dating → Marriage: Need Roots (6), Values (6.5), About Family (7)
    if (current === 'dating' && newIntent === 'ready_marriage') {
      const missing = [];
      const sections: SectionType[] = [];
      if (!formData.hometown) { missing.push('Hometown'); sections.push('background'); }
      if (!formData.family_type) { missing.push('Family Type'); sections.push('background'); }
      if (!formData.values) { missing.push('Values'); sections.push('background'); }
      if (!formData.about_family) { missing.push('About Family'); sections.push('culture'); }
      return { fields: missing, sections: [...new Set(sections)] };
    }

    // Downgrading intents
    return { fields: [], sections: [] };
  };

  const handleIntentChange = (newIntent: string) => {
    // Check for missing fields
    const { fields, sections } = getMissingFieldsForIntent(newIntent);

    if (fields.length > 0) {
      // Show modal with missing fields
      setPendingIntent(newIntent);
      setMissingIntentFields(fields);
      setMissingIntentSections(sections);
      setShowIntentModal(true);
    } else {
      // No missing fields, update directly
      setFormData({...formData, intent: newIntent});
    }
  };

  const handleIntentConfirm = () => {
    if (!pendingIntent) return;

    // Update intent in form data
    setFormData({...formData, intent: pendingIntent});
    
    // Navigate to first missing section
    if (missingIntentSections.length > 0) {
      setActiveSection(missingIntentSections[0]);
    }
    
    // Close modal
    setShowIntentModal(false);
    setPendingIntent(null);
  };

  // ===== EXISTING LOGIC =====

  // READ QUERY PARAMETER ON MOUNT
  useEffect(() => {
    if (!searchParams) return;
    
    const sectionParam = searchParams.get('section') as SectionType | null;
    
    // Validate section against allowed list
    if (sectionParam && ALLOWED_SECTIONS.includes(sectionParam)) {
      setSectionFromUrl(sectionParam);
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      
      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          gender: data.gender || "",
          date_of_birth: data.date_of_birth || "",
          phone: data.phone || "",
          city: data.city || "",
          job_title: data.job_title || "",
          company: data.company || "",
          income_tier: data.income_tier || "",
          ghost_mode: data.ghost_mode || false,
          bio: data.bio || "",
          intent: data.intent || "",
          photo_face: data.avatar_url || "",
          photo_body: data.photo_body_url || "",
          photo_hobby: data.photo_hobby_url || "",
          photo_general: data.photo_general_url || "",
          hometown: data.hometown || "",
          family_type: data.family_type || "",
          values: data.values || "",
          horoscope: data.values || "",
          family_income: data.values || "",
          religion: data.religion || "",
          mother_tongue: data.mother_tongue || "",
          about_family: data.about_family || "",
          diet: data.diet || "",
          drink: data.drink || "",
          smoke: data.smoke || "",
          age_min: data.age_min || 24,
          age_max: data.age_max || 35,
          height_min: data.height_min || 152,
          height_max: data.height_max || 183,
          location_preference: data.location_preference || "",
          open_to_relocate: data.open_to_relocate || false,
          linkedin_url: data.linkedin_url || "",
          instagram_handle: data.instagram_handle || "",
        });
        
        setCitySearch(data.city || "");
        setHometownSearch(data.hometown || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  // Photo Upload Handler
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    field: 'photo_face' | 'photo_body' | 'photo_hobby' | 'photo_general'
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    if (!user) {
      setUploadError("Please log in to upload photos");
      return;
    }
    
    const file = event.target.files[0];
    
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size must be less than 5MB");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setUploadError("Please upload an image file");
      return;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${field}-${Date.now()}.${fileExt}`;
    
    setUploadingPhoto(true);
    setUploadError("");
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, [field]: publicUrl }));
    } catch (error: any) {
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = (id: string) => {
    document.getElementById(id)?.click();
  };

  const handleCitySelect = (city: string) => {
    setFormData({...formData, city});
    setCitySearch(city);
    setShowCityDropdown(false);
  };

  const handleHometownSelect = (city: string) => {
    setFormData({...formData, hometown: city});
    setHometownSearch(city);
    setShowHometownDropdown(false);
  };

  const handleGenerateBio = async () => {
    if (!formData.bio || formData.bio.length < 5) {
      alert("Please write a short rough draft first, then let AI polish it!");
      return;
    }
  
    setGeneratingBio(true);
    try {
      // ✅ ONLY CHANGE: Pass intent instead of selectedTone
      const result = await generateBioAction(formData.bio, formData.intent);
      
      // ✅ ONLY CHANGE: Handle the object return
      if (result?.success && result.bio) {
        setFormData(prev => ({ ...prev, bio: result.bio }));
      }
    } catch (error) {
      alert("AI is taking a break. Please try again.");
    }
    setGeneratingBio(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        phone: formData.phone,
        city: formData.city,
        job_title: formData.job_title,
        company: formData.company,
        income_tier: formData.income_tier,
        ghost_mode: formData.ghost_mode,
        bio: formData.bio,
        intent: formData.intent,
        avatar_url: formData.photo_face,
        photo_body_url: formData.photo_body,
        photo_hobby_url: formData.photo_hobby,
        hometown: formData.hometown,
        family_type: formData.family_type,
        values: formData.values,
        horoscope: formData.horoscope, // ✅ ADDED THIS LINE
        family_income: formData.family_income, // ✅ ADDED THIS LINE
        religion: formData.religion,
        mother_tongue: formData.mother_tongue,
        about_family: formData.about_family,
        diet: formData.diet,
        drink: formData.drink,
        smoke: formData.smoke,
        age_min: formData.age_min,
        age_max: formData.age_max,
        height_min: formData.height_min,
        height_max: formData.height_max,
        location_preference: formData.location_preference,
        open_to_relocate: formData.open_to_relocate,
        linkedin_url: formData.linkedin_url,
        instagram_handle: formData.instagram_handle,
      })
      .eq("id", user.id);

    if (!error) {
      setTimeout(() => {
        setSaving(false);
        router.push("/profile");
      }, 500);
    } else {
      alert("Error saving profile: " + error.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)'
      }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#1e3a8a' }} />
      </div>
    );
  }

  const sections: { id: SectionType; label: string; icon: any }[] = [
    { id: 'basic', label: 'Basic', icon: User },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'background', label: 'Background', icon: Home },
    { id: 'culture', label: 'Culture', icon: Church },
    { id: 'lifestyle', label: 'Lifestyle', icon: Utensils },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'social', label: 'Social', icon: Globe2 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
      paddingBottom: '120px',
      position: 'relative'
    }}>
      {/* Background Orbs */}
      <div style={{ 
        position: 'fixed', 
        top: '-10%', 
        left: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.15) 0%, transparent 70%)', 
        filter: 'blur(60px)', 
        pointerEvents: 'none',
        zIndex: 1
      }} />
      <div style={{ 
        position: 'fixed', 
        bottom: '-10%', 
        right: '-10%', 
        width: '50%', 
        height: '50%', 
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', 
        filter: 'blur(60px)', 
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/profile" style={{ padding: '8px', marginLeft: '-8px', color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a' }}>
          Edit Profile
        </h1>
        <div style={{ width: '32px' }}></div>
      </div>

      {/* Section Tabs */}
      <div style={{
        position: 'sticky',
        top: '70px',
        zIndex: 30,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        overflowX: 'auto',
        padding: '12px 20px',
        display: 'flex',
        gap: '8px',
        scrollbarWidth: 'none',
      }}>
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                background: activeSection === section.id ? '#1e3a8a' : 'white',
                color: activeSection === section.id ? 'white' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: activeSection === section.id ? '0 4px 12px rgba(30, 58, 138, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                fontFamily: 'inherit'
              }}
            >
              <Icon size={14} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 20px' }}>
        <AnimatePresence mode="wait">
          {/* CAREER SECTION WITH INTENT SELECTOR */}
          {activeSection === 'career' && (
            <motion.div
              key="career"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <GlassCard>
                <SectionTitle>Career & Income</SectionTitle>
                
                <InputField
                  label="Job Title *"
                  icon={<Briefcase size={16} style={{ color: '#1e3a8a' }} />}
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  placeholder="Product Manager"
                />

                <InputField
                  label="Company *"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="e.g. Google"
                />

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <IndianRupee size={14}/> Annual Income *
                    </label>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1e3a8a',
                      background: '#e0e7ff',
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>
                      {formData.income_tier || 'Select'}
                    </span>
                  </div>
                  
                  <select
                    value={formData.income_tier}
                    onChange={(e) => setFormData({...formData, income_tier: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(30, 58, 138, 0.2)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select income range</option>
                    {INCOME_BRACKETS.map(bracket => (
                      <option key={bracket} value={bracket}>{bracket}</option>
                    ))}
                  </select>
                  
                  <p style={{ 
                    fontSize: '11px', 
                    color: '#94a3b8', 
                    textAlign: 'center',
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <Lock size={10}/> Hidden until you connect
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '15px', marginBottom: '4px' }}>
                      Ghost Mode
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Hide specific details from public profile
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={formData.ghost_mode}
                      onChange={e => setFormData({...formData, ghost_mode: e.target.checked})}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: formData.ghost_mode ? '#1e3a8a' : '#cbd5e1',
                      transition: '0.3s',
                      borderRadius: '28px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '20px',
                        width: '20px',
                        left: formData.ghost_mode ? '28px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.3s',
                        borderRadius: '50%'
                      }}/>
                    </span>
                  </label>
                </div>
              </GlassCard>

              {/* Bio Section */}
              <GlassCard style={{ background: 'linear-gradient(135deg, rgba(224, 231, 255, 0.5) 0%, rgba(255, 255, 255, 0.75) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <SectionTitle>Your Vibe (Bio)</SectionTitle>
                  <button 
                    onClick={handleGenerateBio}
                    disabled={generatingBio || !formData.bio}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'white',
                      border: '1.5px solid rgba(30, 58, 138, 0.1)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(30, 58, 138, 0.05)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                      fontWeight: '700',
                      fontFamily: 'inherit'
                    }}
                  >
                    {generatingBio ? (
                      <Loader2 size={14} style={{ color: '#1e3a8a', animation: 'spin 1s linear infinite' }}/>
                    ) : (
                      <Sparkles size={14} style={{ color: '#f59e0b' }}/>
                    )}
                    <span style={{ color: '#1e3a8a', textTransform: 'uppercase' }}>
                      {generatingBio ? "Polishing..." : "Rewrite"}
                    </span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {(['Grounded', 'Thoughtful', 'Warm'] as BioTone[]).map(tone => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '14px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        boxSizing: 'border-box',
                        background: selectedTone === tone ? '#e0e7ff' : 'white',
                        color: selectedTone === tone ? '#1e3a8a' : '#94a3b8',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      {tone}
                    </button>
                  ))}
                </div>

                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  style={{
                    width: '100%',
                    height: '120px',
                    background: 'white',
                    padding: '16px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(30, 58, 138, 0.1)',
                    fontSize: '15px',
                    resize: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  placeholder="I like coffee, hiking on weekends..."
                />
              </GlassCard>

              {/* HARDCODED INTENT SELECTOR */}
              <GlassCard>
                <SectionTitle>Your Current Intent</SectionTitle>
                <div style={{ 
                  background: 'rgba(226, 232, 240, 0.3)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #2563eb'
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5'
                  }}>
                    💡 Changing your intent may require you to provide additional information about yourself. Don't worry, we'll guide you through it!
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {[
                    { value: 'exploring', label: 'Exploring', emoji: '🌍' },
                    { value: 'dating', label: 'Dating', emoji: '💕' },
                    { value: 'ready_marriage', label: 'Marriage', emoji: '💍' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleIntentChange(option.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: formData.intent === option.value ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                        background: formData.intent === option.value ? '#1e3a8a' : 'white',
                        color: formData.intent === option.value ? 'white' : '#64748b',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* OTHER SECTIONS (Basic, Photos, Background, Culture, Lifestyle, Preferences, Social) */}
          {activeSection === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <GlassCard>
                <SectionTitle>Basic Information</SectionTitle>
                
                <div style={{ marginTop: '16px' }}>
  <label style={{
    fontSize: '12px', fontWeight: '600', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'
  }}>
    <User size={16} style={{ color: '#1e3a8a' }} />
    Full Name *
  </label>
  <input
    type="text"
    value={formData.full_name}
    onChange={(e) => {
      const val = e.target.value;
      if (/^[a-zA-Z\s]*$/.test(val)) {
        setFormData({ ...formData, full_name: val });
      }
    }}
    placeholder="e.g. Abhijeet Bhattacharya"
    style={{
      width: '100%', padding: '14px 16px', borderRadius: '12px',
      border: '1.5px solid rgba(30, 58, 138, 0.2)', backgroundColor: 'white',
      fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
    }}
  />
  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
    Only letters and spaces allowed
  </p>
</div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'block',
                  }}>Gender *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        onClick={() => setFormData({...formData, gender: g})}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: formData.gender === g ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                          background: formData.gender === g ? '#1e3a8a' : 'white',
                          color: formData.gender === g ? 'white' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                <label style={{
                  fontSize: '12px', fontWeight: '600', color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                <Calendar size={16} style={{ color: '#1e3a8a' }} />
                Date of Birth *
              </label>
              <input
              type="date"
              value={formData.date_of_birth}
              disabled
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px',
                border: '1.5px solid rgba(226, 232, 240, 0.8)',
                backgroundColor: 'rgba(241, 245, 249, 0.8)', fontSize: '15px',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                color: '#94a3b8', cursor: 'not-allowed'
              }}
            />
<div style={{
  display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px',
  padding: '6px 10px', background: 'rgba(245, 158, 11, 0.08)',
  border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px',
  width: 'fit-content'
}}>
  <Lock size={11} style={{ color: '#d97706' }} />
  <span style={{ fontSize: '11px', color: '#92400e', fontWeight: '500' }}>
    Date of birth cannot be changed after registration
  </span>
</div>
</div>

<div style={{ marginTop: '16px' }}>
  <label style={{
    fontSize: '12px', fontWeight: '600', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'
  }}>
    <Phone size={16} style={{ color: '#1e3a8a' }} />
    Phone Number
  </label>
  <input
    type="text"
    value={formData.phone}
    disabled
    style={{
      width: '100%', padding: '14px 16px', borderRadius: '12px',
      border: '1.5px solid rgba(226, 232, 240, 0.8)',
      backgroundColor: 'rgba(241, 245, 249, 0.8)', fontSize: '15px',
      outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
      color: '#94a3b8', cursor: 'not-allowed'
    }}
  />
  <div style={{
    display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px',
    padding: '6px 10px', background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px',
    width: 'fit-content'
  }}>
    <Lock size={11} style={{ color: '#d97706' }} />
    <span style={{ fontSize: '11px', color: '#92400e', fontWeight: '500' }}>
      Phone changes require OTP verification — coming soon
    </span>
  </div>
</div>
                <div style={{ marginTop: '16px', position: 'relative' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'block'
                  }}>Current City *</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ 
                      position: 'absolute', 
                      left: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }}/>
                    <input 
                      value={citySearch}
                      onFocus={() => setShowCityDropdown(true)}
                      onChange={e => {
                        setCitySearch(e.target.value);
                        setFormData({...formData, city: e.target.value});
                        setShowCityDropdown(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 42px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(30, 58, 138, 0.2)',
                        backgroundColor: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                      placeholder=" Search your City"
                    />
                    {showCityDropdown && citySearch.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 4,
                        right: 4,
                        marginTop: '4px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(30, 58, 138, 0.15)',
                        border: '1px solid rgba(30, 58, 138, 0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 50
                      }}>
                        {CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map(city => (
                          <div 
                            key={city} 
                            onClick={() => handleCitySelect(city)}
                            style={{
                              padding: '12px 0px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#1e3a8a',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* PHOTOS SECTION */}
          {activeSection === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <GlassCard>
  <SectionTitle>Profile Photos</SectionTitle>

  {uploadError && (
    <div style={{
      padding: '12px 16px',
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <XCircle size={16} style={{ color: '#dc2626' }} />
      <span style={{ fontSize: '13px', color: '#991b1b' }}>{uploadError}</span>
    </div>
  )}

  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '16px'
  }}>
    <input type="file" id="upload-face" hidden accept="image/*"
      onChange={(e) => handleUpload(e, 'photo_face')} disabled={uploadingPhoto} />
    <PhotoUploadBox label="Face Close-up *" subtitle="No sunglasses"
      photoUrl={formData.photo_face} uploading={uploadingPhoto}
      onClick={() => !uploadingPhoto && triggerFileInput('upload-face')} />

    <input type="file" id="upload-body" hidden accept="image/*"
      onChange={(e) => handleUpload(e, 'photo_body')} disabled={uploadingPhoto} />
    <PhotoUploadBox label="Full Body *" subtitle="Full presence"
      photoUrl={formData.photo_body} uploading={uploadingPhoto}
      onClick={() => !uploadingPhoto && triggerFileInput('upload-body')} />

    <input type="file" id="upload-hobby" hidden accept="image/*"
      onChange={(e) => handleUpload(e, 'photo_hobby')} disabled={uploadingPhoto} />
    <PhotoUploadBox label="Hobby/Lifestyle" subtitle="Optional"
      photoUrl={formData.photo_hobby} uploading={uploadingPhoto}
      onClick={() => !uploadingPhoto && triggerFileInput('upload-hobby')} />

    <input type="file" id="upload-general" hidden accept="image/*"
      onChange={(e) => handleUpload(e, 'photo_general')} disabled={uploadingPhoto} />
    <PhotoUploadBox label="General" subtitle="Any vibe photo"
      photoUrl={formData.photo_general} uploading={uploadingPhoto}
      onClick={() => !uploadingPhoto && triggerFileInput('upload-general')} />
  </div>

  <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '16px' }}>
    Max 5MB per photo • JPG, PNG, WEBP
  </p>
</GlassCard>
            </motion.div>
          )}

          {/* BACKGROUND SECTION */}
{activeSection === 'background' && (
  <motion.div
    key="background"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
  >
    <GlassCard>
      <SectionTitle>Your Roots</SectionTitle>
      
      {/* Hometown */}
      <div style={{ marginTop: '16px', position: 'relative' }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          display: 'block'
        }}>Hometown *</label>
        <div style={{ position: 'relative' }}>
          <Home size={18} style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#64748b'
          }}/>
          <input 
            value={hometownSearch}
            onFocus={() => setShowHometownDropdown(true)}
            onChange={e => {
              setHometownSearch(e.target.value);
              setFormData({...formData, hometown: e.target.value});
              setShowHometownDropdown(true);
            }}
            style={{
              width: '100%',
              padding: '14px 42px 14px 42px',
              borderRadius: '12px',
              border: '1.5px solid rgba(30, 58, 138, 0.2)',
              backgroundColor: 'white',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            placeholder="Where are your roots?"
          />
          {showHometownDropdown && hometownSearch.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(30, 58, 138, 0.15)',
              border: '1px solid rgba(30, 58, 138, 0.1)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 50
            }}>
              {CITIES.filter(c => c.toLowerCase().includes(hometownSearch.toLowerCase())).map(city => (
                <div 
                  key={city} 
                  onClick={() => handleHometownSelect(city)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#1e3a8a'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Family Type */}
      <div style={{ marginTop: '16px' }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          display: 'block'
        }}>Family Type *</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Nuclear', 'Joint'].map(ft => (
            <button
              key={ft}
              onClick={() => setFormData({...formData, family_type: ft})}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: formData.family_type === ft ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                background: formData.family_type === ft ? '#1e3a8a' : 'white',
                color: formData.family_type === ft ? 'white' : '#64748b',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* Values */}
      <div style={{ marginTop: '16px' }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          display: 'block'
        }}>Values *</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Liberal', 'Moderate', 'Traditional'].map(v => (
            <button
              key={v}
              onClick={() => setFormData({...formData, values: v})}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: formData.values === v ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                background: formData.values === v ? '#1e3a8a' : 'white',
                color: formData.values === v ? 'white' : '#64748b',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Horoscope / Birth Sign - ADD HERE */}
      <div style={{ marginTop: '16px' }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          display: 'block'
        }}>
          Horoscope / Birth Sign
        </label>
        <select
          value={formData.horoscope || ''}
          onChange={(e) => setFormData({...formData, horoscope: e.target.value})}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1.5px solid rgba(226, 232, 240, 0.5)',
            background: 'rgba(248, 250, 252, 0.8)',
            fontSize: '15px',
            color: formData.horoscope ? '#1e3a8a' : '#94a3b8',
            outline: 'none',
            fontFamily: 'inherit',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '20px',
            paddingRight: '40px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select your horoscope sign</option>
          <option value="Aries">Aries (Mar 21 - Apr 19)</option>
          <option value="Taurus">Taurus (Apr 20 - May 20)</option>
          <option value="Gemini">Gemini (May 21 - Jun 20)</option>
          <option value="Cancer">Cancer (Jun 21 - Jul 22)</option>
          <option value="Leo">Leo (Jul 23 - Aug 22)</option>
          <option value="Virgo">Virgo (Aug 23 - Sep 22)</option>
          <option value="Libra">Libra (Sep 23 - Oct 22)</option>
          <option value="Scorpio">Scorpio (Oct 23 - Nov 21)</option>
          <option value="Sagittarius">Sagittarius (Nov 22 - Dec 21)</option>
          <option value="Capricorn">Capricorn (Dec 22 - Jan 19)</option>
          <option value="Aquarius">Aquarius (Jan 20 - Feb 18)</option>
          <option value="Pisces">Pisces (Feb 19 - Mar 20)</option>
        </select>
      </div>

      {/* Family Income - ADD HERE */}
      <div style={{ marginTop: '16px' }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
          display: 'block'
        }}>
          Family Income (Annual)
        </label>
        <select
          value={formData.family_income || ''}
          onChange={(e) => setFormData({...formData, family_income: e.target.value})}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1.5px solid rgba(226, 232, 240, 0.5)',
            background: 'rgba(248, 250, 252, 0.8)',
            fontSize: '15px',
            color: formData.family_income ? '#1e3a8a' : '#94a3b8',
            outline: 'none',
            fontFamily: 'inherit',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '20px',
            paddingRight: '40px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select income range</option>
          <option value="Below 5 Lakh">Below ₹5 Lakh</option>
          <option value="5-10 Lakh">₹5 - 10 Lakh</option>
          <option value="10-20 Lakh">₹10 - 20 Lakh</option>
          <option value="20-50 Lakh">₹20 - 50 Lakh</option>
          <option value="50 Lakh - 1 Crore">₹50 Lakh - ₹1 Crore</option>
          <option value="Above 1 Crore">Above ₹1 Crore</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>

    </GlassCard>
  </motion.div>
)}

          {/* CULTURE SECTION */}
          {activeSection === 'culture' && (
            <motion.div
              key="culture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <GlassCard>
                <SectionTitle>Cultural Background</SectionTitle>
                
                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Church size={14} /> Religion *
                  </label>
                  <select
                    value={formData.religion}
                    onChange={e => setFormData({...formData, religion: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(30, 58, 138, 0.2)',
                      backgroundColor: 'white',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select religion</option>
                    {RELIGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Languages size={14} /> Mother Tongue *
                  </label>
                  <select
                    value={formData.mother_tongue}
                    onChange={e => setFormData({...formData, mother_tongue: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(30, 58, 138, 0.2)',
                      backgroundColor: 'white',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select language</option>
                    {LANGUAGES.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'block'
                  }}>About Family (Optional)</label>
                  <textarea 
                    value={formData.about_family}
                    onChange={e => setFormData({...formData, about_family: e.target.value})}
                    style={{
                      width: '100%',
                      height: '100px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(30, 58, 138, 0.2)',
                      backgroundColor: 'white',
                      fontSize: '15px',
                      resize: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                    placeholder="E.g. I have a younger brother & a elder sister who is Happily Married"
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* LIFESTYLE SECTION */}
          {activeSection === 'lifestyle' && (
            <motion.div
              key="lifestyle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <GlassCard>
                <SectionTitle>Lifestyle Choices</SectionTitle>
                
                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Utensils size={14} /> Diet *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {DIET_OPTIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setFormData({...formData, diet: d})}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: formData.diet === d ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                          background: formData.diet === d ? '#1e3a8a' : 'white',
                          color: formData.diet === d ? 'white' : '#64748b',
                          cursor: 'pointer',
                          fontFamily: 'inherit'
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Wine size={14} /> Drink *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {DRINK_OPTIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setFormData({...formData, drink: d})}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: formData.drink === d ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                          background: formData.drink === d ? '#1e3a8a' : 'white',
                          color: formData.drink === d ? 'white' : '#64748b',
                          cursor: 'pointer',
                          fontFamily: 'inherit'
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Cigarette size={14} /> Smoke *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {SMOKE_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData({...formData, smoke: s})}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: formData.smoke === s ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                          background: formData.smoke === s ? '#1e3a8a' : 'white',
                          color: formData.smoke === s ? 'white' : '#64748b',
                          cursor: 'pointer',
                          fontFamily: 'inherit'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* PREFERENCES SECTION */}
          {activeSection === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <GlassCard>
                <SectionTitle>Partner Preferences</SectionTitle>
                
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase'
                    }}>Age Range *</label>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1e3a8a'
                    }}>
                      {formData.age_min} - {formData.age_max} years
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={formData.age_min}
                      onChange={e => setFormData({...formData, age_min: parseInt(e.target.value)})}
                      style={{
                        flex: 1,
                        height: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>to</span>
                    <input 
                      type="range" 
                      min="18" 
                      max="60" 
                      value={formData.age_max}
                      onChange={e => setFormData({...formData, age_max: parseInt(e.target.value)})}
                      style={{
                        flex: 1,
                        height: '8px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Ruler size={14} /> Height Range *
                    </label>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1e3a8a'
                    }}>
                      {Math.floor(formData.height_min / 30.48)}'{Math.round((formData.height_min % 30.48) / 2.54)}" - {Math.floor(formData.height_max / 30.48)}'{Math.round((formData.height_max % 30.48) / 2.54)}"
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="range" 
                      min="137" 
                      max="213" 
                      value={formData.height_min}
                      onChange={e => setFormData({...formData, height_min: parseInt(e.target.value)})}
                      style={{
                        flex: 1,
                        height: '8px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#64748b' }}>to</span>
                    <input 
                      type="range" 
                      min="137" 
                      max="213" 
                      value={formData.height_max}
                      onChange={e => setFormData({...formData, height_max: parseInt(e.target.value)})}
                      style={{
                        flex: 1,
                        height: '8px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
  <label style={{
    fontSize: '12px', fontWeight: '600', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'
  }}>
    <Navigation size={16} style={{ color: '#1e3a8a' }} />
    Location Preference *
  </label>
  <div style={{ position: 'relative' }}>
    <MapPin size={18} style={{
      position: 'absolute', left: '14px', top: '50%',
      transform: 'translateY(-50%)', color: '#64748b', zIndex: 1
    }}/>
    <input
      value={formData.location_preference}
      onChange={(e) => setFormData({...formData, location_preference: e.target.value})}
      style={{
        width: '100%', padding: '14px 16px 14px 42px', borderRadius: '12px',
        border: '1.5px solid rgba(30, 58, 138, 0.2)', backgroundColor: 'white',
        fontSize: '15px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
      }}
      placeholder="Search city or type Anywhere..."
      list="edit-location-cities"
    />
    <datalist id="edit-location-cities">
      <option value="Anywhere" />
      {CITIES.map(c => <option key={c} value={c} />)}
    </datalist>
  </div>
</div>

                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '15px', marginBottom: '4px' }}>
                      Open to Relocate?
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Crucial for serious relationships
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={formData.open_to_relocate}
                      onChange={e => setFormData({...formData, open_to_relocate: e.target.checked})}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: formData.open_to_relocate ? '#1e3a8a' : '#cbd5e1',
                      transition: '0.3s',
                      borderRadius: '28px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '20px',
                        width: '20px',
                        left: formData.open_to_relocate ? '28px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.3s',
                        borderRadius: '50%'
                      }}/>
                    </span>
                  </label>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* SOCIAL SECTION */}
          {activeSection === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <GlassCard>
                <SectionTitle>Social Profiles</SectionTitle>
                
                <InputField
                  label="LinkedIn Profile"
                  icon={<Linkedin size={16} style={{ color: '#0077b5' }} />}
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                  placeholder="https://linkedin.com/in/your-name"
                />

                <InputField
                  label="Instagram Handle"
                  icon={<Instagram size={16} style={{ color: '#E4405F' }} />}
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                  placeholder="@yourhandle"
                />

                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
                  Optional • Helps build 'Trust' & 'Authenticity' • Only Visible to Gold & Premium Members
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INTENT CHANGE MODAL */}
      <AnimatePresence>
        {showIntentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIntentModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '32px',
                  maxWidth: '420px',
                  width: '100%',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  position: 'relative'
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowIntentModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(248, 250, 252, 0.5)',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    borderRadius: '12px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} style={{ color: '#64748b' }} />
                </button>

                {/* Info Icon */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <AlertTriangle size={32} style={{ color: '#2563eb' }} />
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e3a8a',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  Complete Your Profile
                </h2>

                {/* Description */}
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  To change your intent to <strong>{pendingIntent === 'dating' ? 'Dating' : 'Marriage'}</strong>, you'll need to provide some additional information.
                </p>

                {/* Missing Fields Box */}
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e3a8a',
                    marginBottom: '12px'
                  }}>
                    ✨ Missing Information:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {missingIntentFields.map((field, idx) => (
                      <div key={idx} style={{
                        fontSize: '13px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#2563eb' }}>•</span>
                        {field}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info message */}
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  textAlign: 'center',
                  marginBottom: '24px',
                  fontStyle: 'italic'
                }}>
                  We'll guide you to fill in these details on the next page.
                </p>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px' 
                }}>
                  <button
                    onClick={() => setShowIntentModal(false)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(226, 232, 240, 0.5)',
                      background: 'white',
                      color: '#64748b',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleIntentConfirm}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Proceed
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          style={{
            position: 'relative',
            bottom: '10px',
            left: '0px',
            right: '20px',
            zIndex: 50,
            maxWidth: '640px',
            margin: '0 auto'
          }}
        >
          <button 
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              height: '56px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              borderRadius: '16px',
              border: 'none',
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
              boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'transform 0.2s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                Save Changes
              </>
            )}
          </button>
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Helper Components
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1)',
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: '12px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '16px'
    }}>
      {children}
    </h3>
  );
}

function InputField({ 
  label, 
  icon, 
  type = 'text',
  value, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  icon?: React.ReactNode;
  type?: string;
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder?: string;
}) {
  return (
    <div style={{ marginTop: '16px' }}>
      <label style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {icon}
        {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1.5px solid rgba(30, 58, 138, 0.2)',
          backgroundColor: 'white',
          fontSize: '15px',
          outline: 'none',
          fontFamily: 'inherit',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}

function PhotoUploadBox({
  label,
  subtitle,
  photoUrl,
  uploading,
  onClick
}: {
  label: string;
  subtitle: string;
  photoUrl: string;
  uploading: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: photoUrl 
          ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${photoUrl}) center/cover no-repeat` 
          : 'white',
        border: photoUrl ? '2px solid #10b981' : '2px dashed rgba(30, 58, 138, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        cursor: uploading ? 'not-allowed' : 'pointer',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
      }}
    >
      {uploading ? (
        <Loader2 size={32} style={{ color: '#1e3a8a' }} className="animate-spin" />
      ) : photoUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          <span style={{ fontWeight: '600', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {label} Uploaded • Click to change
          </span>
        </div>
      ) : (
        <>
          <Camera size={32} style={{ color: '#1e3a8a', marginBottom: '12px' }}/>
          <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '15px', marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {subtitle}
          </div>
        </>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateBioAction, type BioTone } from "@/app/actions/generateBio";

// Constants
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
const SMOKE_OPTIONS = ["Yes", "No", "Never"];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type SectionType = 'basic' | 'career' | 'photos' | 'background' | 'culture' | 'lifestyle' | 'preferences' | 'social';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedTone, setSelectedTone] = useState<BioTone>('Grounded');
  const [activeSection, setActiveSection] = useState<SectionType>('basic');
  const [user, setUser] = useState<any>(null);

  // Search states
  const [citySearch, setCitySearch] = useState("");
  const [hometownSearch, setHometownSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showHometownDropdown, setShowHometownDropdown] = useState(false);

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
    
    // Background
    hometown: "",
    family_type: "",
    values: "",
    
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
          hometown: data.hometown || "",
          family_type: data.family_type || "",
          values: data.values || "",
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
    field: 'photo_face' | 'photo_body' | 'photo_hobby'
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
      const polished = await generateBioAction(formData.bio, selectedTone);
      if (polished) setFormData(prev => ({ ...prev, bio: polished }));
    } catch (error) {
      alert("AI is taking a break. Please try again.");
    }
    setGeneratingBio(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (!user) return;

    const incomeTierIndex = INCOME_BRACKETS.indexOf(formData.income_tier);

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
                boxShadow: activeSection === section.id ? '0 4px 12px rgba(30, 58, 138, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
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
          {/* BASIC SECTION */}
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
                
                <InputField
                  label="Full Name *"
                  icon={<User size={16} style={{ color: '#1e3a8a' }} />}
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="e.g. Aditi Rao"
                />

                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'block'
                  }}>Gender *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        onClick={() => setFormData({...formData, gender: g})}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '12px',
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

                <InputField
                  label="Date of Birth *"
                  icon={<Calendar size={16} style={{ color: '#1e3a8a' }} />}
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />

                <InputField
                  label="Phone Number"
                  icon={<Phone size={16} style={{ color: '#1e3a8a' }} />}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                />

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
                        fontFamily: 'inherit'
                      }}
                      placeholder="Search City..."
                    />
                    {showCityDropdown && citySearch.length > 0 && (
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
                        {CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map(city => (
                          <div 
                            key={city} 
                            onClick={() => handleCitySelect(city)}
                            style={{
                              padding: '12px 16px',
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

          {/* CAREER SECTION */}
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
                      border: '1px solid rgba(30, 58, 138, 0.1)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(30, 58, 138, 0.05)',
                      cursor: 'pointer',
                      fontSize: '12px',
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
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
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
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(30, 58, 138, 0.1)',
                    fontSize: '15px',
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  placeholder="I like coffee, hiking on weekends..."
                />
              </GlassCard>

              {/* Intent */}
              <GlassCard>
                <SectionTitle>Current Intent</SectionTitle>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {[
                    { value: 'exploring', label: 'Exploring' },
                    { value: 'dating', label: 'Dating' },
                    { value: 'ready_marriage', label: 'Marriage' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({...formData, intent: option.value})}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: formData.intent === option.value ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                        background: formData.intent === option.value ? '#1e3a8a' : 'white',
                        color: formData.intent === option.value ? 'white' : '#64748b',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {/* Face Photo */}
                  <input 
                    type="file" 
                    id="upload-face" 
                    hidden 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'photo_face')}
                    disabled={uploadingPhoto}
                  />
                  <PhotoUploadBox
                    label="Face Close-up *"
                    subtitle="Clear lighting, no sunglasses"
                    photoUrl={formData.photo_face}
                    uploading={uploadingPhoto}
                    onClick={() => !uploadingPhoto && triggerFileInput('upload-face')}
                  />

                  {/* Body Photo */}
                  <input 
                    type="file" 
                    id="upload-body" 
                    hidden 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'photo_body')}
                    disabled={uploadingPhoto}
                  />
                  <PhotoUploadBox
                    label="Full Body *"
                    subtitle="Show your physical presence"
                    photoUrl={formData.photo_body}
                    uploading={uploadingPhoto}
                    onClick={() => !uploadingPhoto && triggerFileInput('upload-body')}
                  />

                  {/* Hobby Photo */}
                  <input 
                    type="file" 
                    id="upload-hobby" 
                    hidden 
                    accept="image/*"
                    onChange={(e) => handleUpload(e, 'photo_hobby')}
                    disabled={uploadingPhoto}
                  />
                  <PhotoUploadBox
                    label="Lifestyle/Hobby"
                    subtitle="Optional, but encouraged"
                    photoUrl={formData.photo_hobby}
                    uploading={uploadingPhoto}
                    onClick={() => !uploadingPhoto && triggerFileInput('upload-hobby')}
                  />
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
                        padding: '14px 16px 14px 42px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(30, 58, 138, 0.2)',
                        backgroundColor: 'white',
                        fontSize: '15px',
                        outline: 'none',
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
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                    placeholder="e.g., 1 elder brother, 2 sisters..."
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

                <InputField
                  label="Location Preference *"
                  icon={<Navigation size={16} style={{ color: '#1e3a8a' }} />}
                  value={formData.location_preference}
                  onChange={(e) => setFormData({...formData, location_preference: e.target.value})}
                  placeholder='e.g., "Mumbai" or "Anywhere"'
                />

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
                  placeholder="https://linkedin.com/in/yourname"
                />

                <InputField
                  label="Instagram Handle"
                  icon={<Instagram size={16} style={{ color: '#E4405F' }} />}
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                  placeholder="@yourhandle"
                />

                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
                  Optional • Helps build trust and authenticity
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '20px',
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
          fontFamily: 'inherit'
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
          ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${photoUrl}) center/cover` 
          : 'white',
        border: photoUrl ? '2px solid #10b981' : '2px dashed rgba(30, 58, 138, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        cursor: uploading ? 'not-allowed' : 'pointer',
        minHeight: '120px',
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
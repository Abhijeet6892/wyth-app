"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Heart, Briefcase, MapPin, 
  Sparkles, Camera, Loader2, IndianRupee, 
  ChevronDown, Lock, Home, Users, Compass,
  Church, Languages, Utensils, Wine, Cigarette,
  Ruler, Navigation, ArrowLeft, CheckCircle2, XCircle, Shield,
  BellRing,
  BellRingIcon
} from "lucide-react";

// CONNECT THE AI BRAIN
import { generateBioAction } from "@/app/actions/generateBio";

// Define BioTone locally so your UI buttons still work
type BioTone = "Grounded" | "Thoughtful" | "Warm";

// --- CONSTANTS ---
const INCOME_BRACKETS = [
  "Student / < 5L", "5L - 10L", "10L - 15L", "15L - 20L", 
  "20L - 30L", "30L - 50L", "50L - 1Cr", "1Cr+"
];

const COUNTRY_CODES = [
  { country: "India", code: "+91" }, { country: "USA", code: "+1" },
  { country: "UK", code: "+44" }, { country: "UAE", code: "+971" },
  { country: "Canada", code: "+1" }, { country: "Australia", code: "+61" },
  { country: "Singapore", code: "+65" }, { country: "Germany", code: "+49" },
];

const CITIES = [
  "Mumbai","Delhi NCR", "Gorakhpur","Bangalore","Hyderabad","Chennai","Kolkata","Pune",
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

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// --- INTENT-BASED FLOW CONFIGURATION ---
type Intent = 'exploring' | 'dating' | 'ready_marriage';

const ONBOARDING_FLOWS: Record<Intent, number[]> = {
  exploring: [1, 2, 3, 4, 4.5, 5, 8, 9, 10],       // 9 screens
  dating: [1, 2, 3, 4, 4.5, 5, 7, 8, 9, 10],       // 10 screens  
  ready_marriage: [1, 2, 3, 4, 4.5, 5, 6, 6.5, 7, 8, 9, 10] // 12 screens
};

// Map intent selection to internal key
const INTENT_MAP: Record<string, Intent> = {
  'exploring': 'exploring',
  'dating': 'dating',
  'ready_marriage': 'ready_marriage'
};

// Field validation rules per intent
const REQUIRED_FIELDS: Record<Intent, { [key: number]: string[] }> = {
  exploring: {
    1: ['intent'],
    2: ['full_name', 'phone_number', 'city', 'gender', 'date_of_birth'],
    3: ['job_title', 'company'],
    4: ['bio'],
    4.5: [], // Social handles optional
    5: ['photo_face', 'photo_body'],
    8: ['diet', 'drink', 'smoke'],
    9: ['location_preference'],
  },
  dating: {
    1: ['intent'],
    2: ['full_name', 'phone_number', 'city', 'gender', 'date_of_birth'],
    3: ['job_title', 'company'],
    4: ['bio'],
    4.5: [], // Social handles optional
    5: ['photo_face', 'photo_body'],
    7: ['religion', 'mother_tongue'], // About family optional
    8: ['diet', 'drink', 'smoke'],
    9: ['location_preference'],
  },
  ready_marriage: {
    1: ['intent'],
    2: ['full_name', 'phone_number', 'city', 'gender', 'date_of_birth'],
    3: ['job_title', 'company'],
    4: ['bio'],
    4.5: [], // Social handles optional
    5: ['photo_face', 'photo_body'],
    6: ['hometown', 'family_type', 'values'],
    6.5: ['political_views'],
    7: ['religion', 'mother_tongue', 'about_family'],
    8: ['diet', 'drink', 'smoke'],
    9: ['location_preference'],
  }
};

export default function Onboarding() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true); // NEW: Add this line
  const [step, setStep] = useState(1);
  const [navigationStack, setNavigationStack] = useState<number[]>([1]);
  const [selectedIntent, setSelectedIntent] = useState<Intent>('exploring');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1
    intent: "",
    // Step 2
    full_name: "",
    gender: "",
    city: "",
    phone_code: "+91",
    phone_number: "",
    date_of_birth: "",
    // Step 3
    job_title: "",
    company: "",
    income_tier: 2,
    ghost_mode: false,
    // Step 4
    bio: "",
    // Step 4.5 (NEW - was at step 9)
    linkedin_handle: "",
    instagram_handle: "",
    // Step 5
    photo_face: "",
    photo_body: "",
    photo_hobby: "",
    // Step 6 (NEW - Roots)
    hometown: "",
    family_type: "",
    values: "",
    // Step 6.5 (NEW - Values)
    political_views: "",
    // Step 7 (Culture)
    religion: "",
    mother_tongue: "",
    about_family: "",
    // Step 8 (Lifestyle)
    diet: "",
    drink: "",
    smoke: "",
    // Step 9 (Preferences)
    age_min: 24,
    age_max: 35,
    height_min: 152,
    height_max: 183,
    location_preference: "",
    open_to_relocate: false,
  });

  // AI & UI State
  const [generatingBio, setGeneratingBio] = useState(false);
  const [bioTone, setBioTone] = useState<BioTone>('Grounded');
  const [citySearch, setCitySearch] = useState("");
  const [hometownSearch, setHometownSearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showHometownDropdown, setShowHometownDropdown] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState("");
  

  // Load User
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  // Save progress to database
  const saveProgress = async (currentStep: number) => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({
          onboarding_step: currentStep,
          intent: selectedIntent
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Resume from saved progress on mount
  useEffect(() => {
    const resumeProgress = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_step, intent, onboarding_complete')
        .eq('id', user.id)
        .single();
      
      if (profile && !profile.onboarding_complete) {
        if (profile.onboarding_step) {
          setStep(profile.onboarding_step);
          // Rebuild navigation stack
          const intent = (profile.intent || 'exploring') as Intent;
          setSelectedIntent(intent);
          const flow = ONBOARDING_FLOWS[intent];
          const visitedSteps = flow.filter(s => s <= profile.onboarding_step);
          setNavigationStack(visitedSteps);
        }
        if (profile.intent) {
          setSelectedIntent(profile.intent as Intent);
        }
      }
    };
    
    resumeProgress();
  }, [user]);

  // Processing screen messages
  const processingMessages = [
    "Verifying Credentials...",
    "Analyzing Vibe...",
    "Curating Matches..."
  ];

  useEffect(() => {
    if (step === 10) {
      const interval = setInterval(() => {
        setProcessingStep(prev => {
          if (prev < 2) return prev + 1;
          return prev;
        });
      }, 1000);
      
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [step, router]);

  // --- PHOTO UPLOAD HANDLERS ---
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
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size must be less than 5MB");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError("Please upload an image file");
      return;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${field}-${Date.now()}.${fileExt}`;
    
    setUploadingPhoto(true);
    setUploadError("");
    
    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);
      
      // Update State with URL
      setFormData(prev => ({ ...prev, [field]: publicUrl }));
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || "Upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = (id: string) => {
    document.getElementById(id)?.click();
  };

  // --- OTHER HANDLERS ---
  // --- INTENT-BASED NAVIGATION HELPERS ---

  // Get next step based on current intent
  const getNextStep = (currentStep: number, intent: Intent): number => {
    const flow = ONBOARDING_FLOWS[intent];
    const currentIndex = flow.indexOf(currentStep);
    
    if (currentIndex === -1 || currentIndex === flow.length - 1) {
      return currentStep; // Stay on current if not found or at end
    }
    
    return flow[currentIndex + 1];
  };

  // Check if current step should be shown for this intent
  const shouldShowStep = (stepNum: number, intent: Intent): boolean => {
    return ONBOARDING_FLOWS[intent].includes(stepNum);
  };

  // Validate current step based on intent
  const validateCurrentStep = (): boolean => {
    const requiredFields = REQUIRED_FIELDS[selectedIntent][step] || [];
    
    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return false;
      }
    }
    
    return true;
  };

  // Calculate progress percentage (instead of "Step X of Y")
  const getProgressPercentage = (): number => {
    const flow = ONBOARDING_FLOWS[selectedIntent];
    const currentIndex = flow.indexOf(step);
    return ((currentIndex + 1) / flow.length) * 100;
  };


  const handleNext = () => {
    // Validate current step
    if (!validateCurrentStep()) {
      alert('Please complete all required fields');
      return;
    }
    
    // Get next step based on intent
    const nextStep = getNextStep(step, selectedIntent);
    
    if (nextStep === step) {
      // Already at last step, do nothing
      return;
    }
    
    // Add to navigation stack
    setNavigationStack(prev => [...prev, nextStep]);
    setStep(nextStep);
    
    // Save progress
    saveProgress(nextStep);
  };
  const handleBack = () => {
    if (navigationStack.length <= 1) {
      // Already at first step
      return;
    }
    
    // Remove current step from stack
    const newStack = [...navigationStack];
    newStack.pop();
    
    // Get previous step
    const previousStep = newStack[newStack.length - 1];
    
    setNavigationStack(newStack);
    setStep(previousStep);
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

  const handleAiBio = async () => {
    // 1. Validation: Ensure there is some text to work with
    if (!formData.bio || formData.bio.length < 5) {
      alert("Please write a rough draft first (at least 5 characters).");
      return;
    }
    
    // 2. Validation: Ensure Intent is selected (Critical for new Gem)
    if (!formData.intent) {
        alert("Please select an Intent (Exploring, Dating, or Marriage) first.");
        return;
    }

    setGeneratingBio(true);
    try {
      // 3. Call the NEW Action
      // We pass 'formData.intent' instead of 'bioTone' because the new Gem is Intent-Based
      const result = await generateBioAction(formData.bio, formData.intent);
      
      // 4. Handle the Object Response ({ success: true, bio: "..." })
      if (result.success && result.bio) {
        setFormData(prev => ({ ...prev, bio: result.bio }));
      } else {
        throw new Error(result.error || "Failed to generate bio");
      }
      
    } catch (e: any) {
      console.error("AI Error:", e);
      alert(e.message || "AI service error. Try again or skip this step.");
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: formData.full_name,
      city: formData.city,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      job_title: formData.job_title,
      company: formData.company,
      income_tier: INCOME_BRACKETS[formData.income_tier],
      ghost_mode: formData.ghost_mode,
      intent: formData.intent,
      bio: formData.bio,
      phone: `${formData.phone_code} ${formData.phone_number}`,
      linkedin_handle: formData.linkedin_handle,
      instagram_handle: formData.instagram_handle,
      // Photo URLs
      avatar_url: formData.photo_face,
      photo_body_url: formData.photo_body,
      photo_hobby_url: formData.photo_hobby,
      // Background
      hometown: formData.hometown,
      family_type: formData.family_type,
      values: formData.values,
      religion: formData.religion,
      mother_tongue: formData.mother_tongue,
      about_family: formData.about_family,
      // Lifestyle
      diet: formData.diet,
      drink: formData.drink,
      smoke: formData.smoke,
      // Preferences
      age_min: formData.age_min,
      age_max: formData.age_max,
      height_min: formData.height_min,
      height_max: formData.height_max,
      location_preference: formData.location_preference,
      open_to_relocate: formData.open_to_relocate,
      onboarding_complete: true
    });

    if (error) {
      console.error(error);
      alert("Failed to save profile. " + error.message);
      setLoading(false);
    } else {
      handleNext(); // Move to processing screen
    }
  };

  // Validation helpers
  const isStep1Valid = formData.intent !== "";
  const isStep2Valid = formData.full_name && formData.phone_number && formData.city && formData.gender && formData.date_of_birth;
  const isStep3Valid = formData.job_title && formData.company;
  const isStep4Valid = formData.bio && formData.bio.length >= 5;
  const isStep5Valid = formData.photo_face && formData.photo_body; // Mandatory photos
  const isStep6Valid = formData.hometown && formData.family_type && formData.values;
  const isStep7Valid = formData.religion && formData.mother_tongue;
  const isStep8Valid = formData.diet && formData.drink && formData.smoke;
  const isStep9Valid = formData.location_preference !== "";

  // === STYLES ===
  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh',
    width: '100%',
    background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const glassCardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '460px',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(31, 41, 55, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
    boxSizing: 'border-box'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1.5px solid rgba(30, 58, 138, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#1e3a8a',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    borderRadius: '12px',
    border: 'none',
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    display: 'block'
  };

  // NEW: Splash screen check
  if (showSplash) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #fef3c7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            padding: '60px 40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center' as const,
            boxShadow: '0 20px 60px rgba(31, 41, 55, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.6)'
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '32px' }}>
            {/* Logo */}
  <div style={{ 
    width: '100%', 
    maxWidth: 'min(200px, 60vw)', 
    margin: '0 auto 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 340 100" 
      width="100%" 
      height="auto" 
      preserveAspectRatio="xMidYMid meet" 
      aria-label="WYTH Logo" 
      style={{ 
        maxHeight: 'clamp(40px, 10vw, 50px)',
        display: 'block'
      }}
    >
      <defs>
        <linearGradient id="weldShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#2E4F9E', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1E3A8A', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <style>{`
        .brand-blue { fill: #1E3A8A; }
        .anchor-letter { opacity: 0; animation: riseUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .letter-y { opacity: 0; animation: riseUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards; }
        .letter-t { opacity: 0; transform: translateX(20px) translateY(10px); animation: slideConnect 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards; }
        .fusion-joint { opacity: 0; fill: url(#weldShine); animation: weldFlash 1s ease-out 1.2s forwards; }
        @keyframes riseUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideConnect { 0% { opacity: 0; transform: translateX(25px) translateY(15px); } 20% { opacity: 1; } 100% { opacity: 1; transform: translateX(0) translateY(0); } }
        @keyframes weldFlash { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
      <g>
        <path className="brand-blue anchor-letter" d="M10,30 Q10,28 12,28 L22,28 Q24,28 24.5,30 L34,68 L43.5,30 Q44,28 46,28 L54,28 Q56,28 56.5,30 L66,68 L75.5,30 Q76,28 78,28 L88,28 Q90,28 90,30 L80,78 Q79,82 75,82 L65,82 Q61,82 60,78 L50,42 L40,78 Q39,82 35,82 L25,82 Q21,82 20,78 Z" />
        <path className="brand-blue letter-y" d="M105,30 Q105,28 107,28 L118,28 Q120,28 121,30 L134,55 L149,30 Q150,28 152,28 L166,28 Q168,28 168,30 L148,62 L148,78 Q148,82 144,82 L132,82 Q128,82 128,78 L128,62 Z" />
        <path className="brand-blue letter-t" d="M163,28 L210,28 Q212,28 212,30 L212,40 Q212,42 210,42 L196,42 L196,78 Q196,82 192,82 L180,82 Q176,82 176,78 L176,42 L163,42 Q161,42 161,40 L161,30 Q161,28 163,28 Z" />
        <path className="brand-blue anchor-letter" style={{ animationDelay: '0.2s' }} d="M225,30 Q225,28 227,28 L239,28 Q241,28 241,30 L241,48 L274,48 L274,30 Q274,28 276,28 L288,28 Q290,28 290,30 L290,78 Q290,82 286,82 L274,82 Q270,82 270,78 L270,60 L241,60 L241,78 Q241,82 237,82 L225,82 Q221,82 221,78 Z" />
        <rect className="fusion-joint" x="160" y="28" width="10" height="14" rx="2" />
      </g>
    </svg>
  </div>
</div>

          {/* Tagline */}
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e3a8a',
            marginBottom: '10px',
            lineHeight: '1.3'
          }}>
            Follow for VIBE | Connect for LIFE
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#64748b',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Bridging the GAP between 'Casual Dating' & 'Traditional Matrimony'.
          </p>

          {/* 2x2 Grid Layout - Saves Vertical Space */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px', 
            marginBottom: '32px',
            marginTop: '24px'
          }}>
            {[
              { icon: '🎯', title: '5 Meaningful Slots', sub: 'Quality > Quantity' },
              { icon: '🤝', title: 'Community Vouched', sub: 'Real trust' },
              { icon: '✨', title: 'AI Storyteller', sub: 'Perfect bios' },
              { icon: '🔒', title: 'Designed to Last', sub: 'Serious intent' }
            ].map((benefit, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.6)', // Glassy background
                backdropFilter: 'blur(10px)',
                borderRadius: '20px', // Softer corners
                padding: '16px',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.8)', // Premium border
                boxShadow: '0 4px 10px rgba(30, 58, 138, 0.03)', // Subtle lift
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{benefit.icon}</div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#1e3a8a',
                  lineHeight: '1.2',
                  marginBottom: '4px'
                }}>
                  {benefit.title}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {benefit.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Get Started Button */}
          <button
            onClick={() => setShowSplash(false)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '18px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Get Started
          </button>

          {/* Login Link */}
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1e3a8a',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Login
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  // If showSplash is false, continue with existing onboarding flow
  return (
    <div style={containerStyle}>
      
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

      {/* Progress Bar */}
      {step < 10 && (
        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(30, 58, 138, 0.1)', zIndex: 50 }}>
          <motion.div 
            style={{ height: '100%', background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        <AnimatePresence mode="wait">
            
          {/* STEP 1: INTENT */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ 
                  fontSize: 'clamp(18px, 5vw, 22px)', 
                  fontWeight: '700', 
                  color: '#1e3a8a', 
                  marginBottom: '16px' 
                }}>
                  Welcome to
                </h1>
                
                {/* WYTH Logo - Fully Responsive */}
                <div style={{ 
                  width: '100%', 
                  maxWidth: 'min(200px, 60vw)', 
                  margin: '0 auto 16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 340 100" 
                    width="100%" 
                    height="auto" 
                    preserveAspectRatio="xMidYMid meet" 
                    aria-label="WYTH Logo" 
                    style={{ 
                      maxHeight: 'clamp(40px, 10vw, 50px)',
                      display: 'block'
                    }}
                  >
                    <defs>
                      <linearGradient id="weldShine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#2E4F9E', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#1E3A8A', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <style>{`
                      .brand-blue { fill: #1E3A8A; }
                      .anchor-letter { opacity: 0; animation: riseUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                      .letter-y { opacity: 0; animation: riseUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards; }
                      .letter-t { opacity: 0; transform: translateX(20px) translateY(10px); animation: slideConnect 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards; }
                      .fusion-joint { opacity: 0; fill: url(#weldShine); animation: weldFlash 1s ease-out 1.2s forwards; }
                      @keyframes riseUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                      @keyframes slideConnect { 0% { opacity: 0; transform: translateX(25px) translateY(15px); } 20% { opacity: 1; } 100% { opacity: 1; transform: translateX(0) translateY(0); } }
                      @keyframes weldFlash { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
                    `}</style>
                    <g>
                      <path className="brand-blue anchor-letter" d="M10,30 Q10,28 12,28 L22,28 Q24,28 24.5,30 L34,68 L43.5,30 Q44,28 46,28 L54,28 Q56,28 56.5,30 L66,68 L75.5,30 Q76,28 78,28 L88,28 Q90,28 90,30 L80,78 Q79,82 75,82 L65,82 Q61,82 60,78 L50,42 L40,78 Q39,82 35,82 L25,82 Q21,82 20,78 Z" />
                      <path className="brand-blue letter-y" d="M105,30 Q105,28 107,28 L118,28 Q120,28 121,30 L134,55 L149,30 Q150,28 152,28 L166,28 Q168,28 168,30 L148,62 L148,78 Q148,82 144,82 L132,82 Q128,82 128,78 L128,62 Z" />
                      <path className="brand-blue letter-t" d="M163,28 L210,28 Q212,28 212,30 L212,40 Q212,42 210,42 L196,42 L196,78 Q196,82 192,82 L180,82 Q176,82 176,78 L176,42 L163,42 Q161,42 161,40 L161,30 Q161,28 163,28 Z" />
                      <path className="brand-blue anchor-letter" style={{ animationDelay: '0.2s' }} d="M225,30 Q225,28 227,28 L239,28 Q241,28 241,30 L241,48 L274,48 L274,30 Q274,28 276,28 L288,28 Q290,28 290,30 L290,78 Q290,82 286,82 L274,82 Q270,82 270,78 L270,60 L241,60 L241,78 Q241,82 237,82 L225,82 Q221,82 221,78 Z" />
                      <rect className="fusion-joint" x="160" y="28" width="10" height="14" rx="2" />
                    </g>
                  </svg>
                </div>
                
                <p style={{ color: '#64748b', fontSize: '15px' }}>
                  What is your primary intention?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button 
                  onClick={() => { 
                    setFormData(p => ({...p, intent: 'exploring'})); 
                    setSelectedIntent('exploring'); // NEW
                    handleNext(); 
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid rgba(30, 58, 138, 0.15)',
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(30, 58, 138, 0.05)',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1e3a8a';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.05)';
                  }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#e0e7ff', 
                    color: '#1e3a8a',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <Compass size={24} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', marginBottom: '4px' }}>
                    Exploring
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Meeting new people without pressure.
                  </p>
                </button>

                <button 
                  onClick={() => { 
                    setFormData(p => ({...p, intent: 'dating'})); 
                    setSelectedIntent('dating'); // NEW
                    handleNext(); 
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid rgba(30, 58, 138, 0.15)',
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(30, 58, 138, 0.05)',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1e3a8a';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.05)';
                  }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#dbeafe', 
                    color: '#2563eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <Heart size={24} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', marginBottom: '4px' }}>
                    Dating with Intent
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Open to something serious.
                  </p>
                </button>

                <button 
                  onClick={() => { 
                    setFormData(p => ({...p, intent: 'ready_marriage'})); 
                    setSelectedIntent('ready_marriage'); // NEW
                    handleNext(); 
                  }}
                  style={{
                    background: 'white',
                    border: '2px solid rgba(30, 58, 138, 0.15)',
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(30, 58, 138, 0.05)',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1e3a8a';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.05)';
                  }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#fef3c7', 
                    color: '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <BellRingIcon size={24} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a', marginBottom: '4px' }}>
                    Ready for Marriage
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    Looking for my life partner deeply and intentionally.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: IDENTITY */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  First, the basics.
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Your identity helps us verify you.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name */}
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. Aditi Rao"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', width: '120px' }}>
                      <select 
                        value={formData.phone_code}
                        onChange={e => setFormData({...formData, phone_code: e.target.value})}
                        style={{
                          ...inputStyle,
                          appearance: 'none',
                          paddingRight: '32px',
                          cursor: 'pointer'
                        }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.country} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        pointerEvents: 'none'
                      }}/>
                    </div>
                    <input 
                      type="tel"
                      maxLength={10}
                      value={formData.phone_number}
                      onChange={e => setFormData({...formData, phone_number: e.target.value.replace(/\D/g, '')})}
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="98765 43210"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.5)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* City */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Current City *</label>
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
                      style={{ ...inputStyle, paddingLeft: '42px' }}
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

                {/* Gender */}
                <div>
                  <label style={labelStyle}>Gender *</label>
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
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label style={labelStyle}>Date of Birth *</label>
                  <input 
                    type="date"
                    value={formData.date_of_birth}
                    onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep2Valid}
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                    opacity: !isStep2Valid ? 0.5 : 1,
                    cursor: !isStep2Valid ? 'not-allowed' : 'pointer'
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CAREER & INCOME */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  What do you do?
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Career & Income are key private signals.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Job Title */}
                <div>
                  <label style={labelStyle}>Job Title *</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={18} style={{ 
                      position: 'absolute', 
                      left: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }}/>
                    <input 
                      value={formData.job_title}
                      onChange={e => setFormData({...formData, job_title: e.target.value})}
                      style={{ ...inputStyle, paddingLeft: '42px' }}
                      placeholder="Product Manager"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.5)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label style={labelStyle}>Company *</label>
                  <input 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    style={inputStyle}
                    placeholder="e.g. Google"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Income Slider */}
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                      {INCOME_BRACKETS[formData.income_tier]}
                    </span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="0" 
                    max={INCOME_BRACKETS.length - 1} 
                    step="1"
                    value={formData.income_tier}
                    onChange={e => setFormData({...formData, income_tier: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      height: '8px',
                      background: '#e0e7ff',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      accentColor: '#1e3a8a'
                    }}
                  />
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

                {/* Ghost Mode */}
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '15px', marginBottom: '4px' }}>
                      Ghost Mode
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Hide specific details from your public profile
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
                        content: '""',
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
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep3Valid}
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                    opacity: !isStep3Valid ? 0.5 : 1,
                    cursor: !isStep3Valid ? 'not-allowed' : 'pointer'
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: AI BIO STUDIO */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Your Vibe <Sparkles size={24} style={{ color: '#f59e0b' }}/>
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  AI can help you re-write your intro.But can make mistakes.Just drop a rough draft.
                </p>
              </div>

              {/* STUDIO CONTAINER */}
              <div style={{
                background: 'linear-gradient(135deg, #e0e7ff 0%, white 100%)',
                padding: '4px',
                borderRadius: '16px',
                border: '1px solid rgba(30, 58, 138, 0.1)',
                marginBottom: '20px'
              }}>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  style={{
                    width: '100%',
                    height: '140px',
                    background: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    outline: 'none',
                    border: 'none',
                    color: '#1e3a8a',
                    resize: 'none',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  placeholder="About You, Your Hobbies, Partner Preferences, Family, Likes & Dislikes..."
                />
                
                {/* CONTROLS */}
                <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Tone Selector */}
                  <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '8px' }}>
                  {(['Grounded', 'Thoughtful', 'Warm'] as BioTone[]).map(t => (
                      <button 
                        key={t}
                        onClick={() => setBioTone(t)}
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: bioTone === t ? '#e0e7ff' : 'transparent',
                          color: bioTone === t ? '#1e3a8a' : '#94a3b8',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  
                  {/* MAGIC BUTTON */}
                  <button 
                    onClick={handleAiBio}
                    disabled={generatingBio}
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
                      transition: 'all 0.2s',
                      fontFamily: 'inherit'
                    }}
                  >
                    {generatingBio ? (
                      <Loader2 size={14} style={{ color: '#1e3a8a', animation: 'spin 1s linear infinite' }}/>
                    ) : (
                      <Sparkles size={14} style={{ color: '#f59e0b' }}/>
                    )}
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase' }}>
                      {generatingBio ? "Polishing..." : "Rewrite"}
                    </span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep4Valid}
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                    opacity: !isStep4Valid ? 0.5 : 1,
                    cursor: !isStep4Valid ? 'not-allowed' : 'pointer'
                  }}
                >
                  Looks Good
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4.5: CONNECT YOUR SOCIALS (SEPARATE) */}
          {step === 4.5 && (
            <motion.div
              key="step-4-5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '32px',
                padding: '40px 32px',
                boxShadow: '0 20px 60px rgba(31, 41, 55, 0.1)',
                maxWidth: '480px',
                width: '100%'
              }}
            >
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#1e3a8a', 
                marginBottom: '12px',
                fontFamily: 'Georgia, serif'
              }}>
                Connect Your Socials
              </h2>
              
              <p style={{ 
                fontSize: '15px', 
                color: '#64748b', 
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Optional: These links are asked for verification & affects your trust score on Wyth .
              </p>

              {/* Privacy Disclaimer */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <Shield size={20} style={{ color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{
                      fontSize: '13px',
                      color: '#1e3a8a',
                      fontWeight: '600',
                      marginBottom: '6px'
                    }}>
                      Your Privacy Matters
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#64748b',
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      These handles remain <strong>completely private</strong> and anonymous. 
                      They'll only be visible to Gold and Premium members who connect with you. 
                      We use them for verification only.
                    </p>
                  </div>
                </div>
              </div>

              {/* LinkedIn Input */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase' as const,
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: '#0A66C2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                  </svg>
                </div>
                LinkedIn Username
              </label>
              
              <input
                type="text"
                placeholder="https://www.linkedin.com/in/your-handle (Refer My Profile)"
                value={formData.linkedin_handle}
                onChange={(e) => setFormData({...formData, linkedin_handle: e.target.value})}
                style={{
                  width: '100%',
                  background: 'rgba(248, 250, 252, 0.8)',
                  border: '1.5px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#1e3a8a',
                  outline: 'none',
                  marginBottom: '20px',
                  fontFamily: 'inherit'
                }}
              />

              {/* Instagram Input */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase' as const,
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                Instagram Handle
              </label>
              
              <input
                type="text"
                placeholder="@yourhandle"
                value={formData.instagram_handle}
                onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                style={{
                  width: '100%',
                  background: 'rgba(248, 250, 252, 0.8)',
                  border: '1.5px solid rgba(226, 232, 240, 0.5)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#1e3a8a',
                  outline: 'none',
                  marginBottom: '8px',
                  fontFamily: 'inherit'
                }}
              />

              {/* Lock Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '12px',
                marginTop: '16px',
                marginBottom: '24px'
              }}>
                <Lock size={16} style={{ color: '#d97706' }} />
                <p style={{
                  fontSize: '13px',
                  color: '#92400e',
                  margin: 0
                }}>
                  Locked until someone connects with you
                </p>
              </div>

              {/* Save & Continue Button */}
              <button
                onClick={async () => {
                  // Save social handles to database
                  if (user) {
                    const { error } = await supabase
                      .from('profiles')
                      .update({
                        linkedin_handle: formData.linkedin_handle || null,
                        instagram_handle: formData.instagram_handle || null,
                        linkedin_verified: false, // Will verify later
                        instagram_verified: false // Will verify later
                      })
                      .eq('id', user.id);
                    
                    if (error) {
                      console.error('Error saving social handles:', error);
                    }
                  }
                  handleNext();
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                }}
              >
                Save & Continue
              </button>

              {/* Skip Button */}
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  padding: '12px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Skip for now
              </button>

              {/* Back Button */}
              {step > 1 && (
                <button
                  onClick={handleBack}
                  style={{
                    position: 'absolute' as const,
                    top: '24px',
                    left: '24px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    borderRadius: '12px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ArrowLeft size={20} style={{ color: '#64748b' }} />
                </button>
              )}
            </motion.div>
          )}

          {/* STEP 5: PHOTO UPLOAD (FUNCTIONAL VERSION) */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  Show your authentic self
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Upload clear photos to verify your vibe
                </p>
              </div>

              {/* Error Message */}
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
                  <XCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#991b1b' }}>{uploadError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                
                {/* 1. FACE PHOTO */}
                <input 
                  type="file" 
                  id="upload-face" 
                  hidden 
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'photo_face')}
                  disabled={uploadingPhoto}
                />
                <div 
                  onClick={() => !uploadingPhoto && triggerFileInput('upload-face')}
                  style={{
                    background: formData.photo_face 
                      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${formData.photo_face}) center/cover` 
                      : 'white',
                    border: formData.photo_face ? '2px solid #10b981' : '2px dashed rgba(30, 58, 138, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingPhoto) {
                      e.currentTarget.style.borderColor = formData.photo_face ? '#10b981' : '#1e3a8a';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = formData.photo_face ? '#10b981' : 'rgba(30, 58, 138, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {uploadingPhoto ? (
                    <Loader2 size={32} style={{ color: '#1e3a8a', animation: 'spin 1s linear infinite' }}/>
                  ) : formData.photo_face ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                      <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      <span style={{ fontWeight: '600', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        Face Photo Uploaded • Click to change
                      </span>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} style={{ color: '#1e3a8a', marginBottom: '12px' }}/>
                      <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '15px', marginBottom: '4px' }}>
                        Face Close-up *
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Clear lighting, no sunglasses
                      </div>
                    </>
                  )}
                </div>

                {/* 2. BODY PHOTO */}
                <input 
                  type="file" 
                  id="upload-body" 
                  hidden 
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'photo_body')}
                  disabled={uploadingPhoto}
                />
                <div 
                  onClick={() => !uploadingPhoto && triggerFileInput('upload-body')}
                  style={{
                    background: formData.photo_body 
                      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${formData.photo_body}) center/cover` 
                      : 'white',
                    border: formData.photo_body ? '2px solid #10b981' : '2px dashed rgba(30, 58, 138, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingPhoto) {
                      e.currentTarget.style.borderColor = formData.photo_body ? '#10b981' : '#1e3a8a';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = formData.photo_body ? '#10b981' : 'rgba(30, 58, 138, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {uploadingPhoto ? (
                    <Loader2 size={32} style={{ color: '#1e3a8a', animation: 'spin 1s linear infinite' }}/>
                  ) : formData.photo_body ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                      <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      <span style={{ fontWeight: '600', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        Body Photo Uploaded • Click to change
                      </span>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} style={{ color: '#1e3a8a', marginBottom: '12px' }}/>
                      <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '15px', marginBottom: '4px' }}>
                        Full Body *
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Show your physical presence
                      </div>
                    </>
                  )}
                </div>

                {/* 3. LIFESTYLE PHOTO */}
                <input 
                  type="file" 
                  id="upload-hobby" 
                  hidden 
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'photo_hobby')}
                  disabled={uploadingPhoto}
                />
                <div 
                  onClick={() => !uploadingPhoto && triggerFileInput('upload-hobby')}
                  style={{
                    background: formData.photo_hobby 
                      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${formData.photo_hobby}) center/cover` 
                      : 'white',
                    border: formData.photo_hobby ? '2px solid #10b981' : '2px dashed rgba(30, 58, 138, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploadingPhoto) {
                      e.currentTarget.style.borderColor = formData.photo_hobby ? '#10b981' : '#1e3a8a';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = formData.photo_hobby ? '#10b981' : 'rgba(30, 58, 138, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {uploadingPhoto ? (
                    <Loader2 size={32} style={{ color: '#1e3a8a', animation: 'spin 1s linear infinite' }}/>
                  ) : formData.photo_hobby ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                      <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                      <span style={{ fontWeight: '600', fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        Lifestyle Photo Uploaded • Click to change
                      </span>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} style={{ color: '#1e3a8a', marginBottom: '12px' }}/>
                      <div style={{ fontWeight: '600', color: '#1e3a8a', fontSize: '15px', marginBottom: '4px' }}>
                        Lifestyle/Hobby
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Optional, but encouraged
                      </div>
                    </>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginBottom: '20px' }}>
                Max 5MB per photo • JPG, PNG, WEBP supported
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleBack}
                  disabled={uploadingPhoto}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                    opacity: uploadingPhoto ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !uploadingPhoto && (e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)')}
                  onMouseLeave={(e) => !uploadingPhoto && (e.currentTarget.style.background = 'transparent')}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!isStep5Valid || uploadingPhoto}
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                    opacity: (!isStep5Valid || uploadingPhoto) ? 0.5 : 1,
                    cursor: (!isStep5Valid || uploadingPhoto) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploadingPhoto ? 'Uploading...' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: ROOTS (Marriage only) */}
          {step === 6 && shouldShowStep(6, selectedIntent) && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  Your Roots
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Where you're from and what you value.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Hometown */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}>Hometown *</label>
                  <div style={{ position: 'relative' }}>
                    <Home size={18} style={{ 
                      position: 'absolute', 
                      left: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#64748b'
                    }}/>
                    <input 
                      value={formData.hometown}
                      onChange={e => setFormData({...formData, hometown: e.target.value})}
                      style={{ ...inputStyle, paddingLeft: '42px' }}
                      placeholder="Where are your roots?"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.5)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Family Type */}
                <div>
                  <label style={labelStyle}>Family Type *</label>
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
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {ft}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Values */}
                <div>
                  <label style={labelStyle}>Values *</label>
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
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6.5: VALUES/POLITICAL (Marriage only) */}
          {step === 6.5 && shouldShowStep(6.5, selectedIntent) && (
            <motion.div 
              key="step6-5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  Your Values
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  What matters to you politically and culturally.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Political Views */}
                <div>
                  <label style={labelStyle}>Political Views *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Liberal', 'Progressive', 'Moderate', 'Conservative', 'Apolitical'].map(view => (
                      <button
                        key={view}
                        onClick={() => setFormData({...formData, political_views: view})}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          border: formData.political_views === view ? '2px solid #1e3a8a' : '2px solid rgba(30, 58, 138, 0.2)',
                          background: formData.political_views === view ? '#1e3a8a' : 'white',
                          color: formData.political_views === view ? 'white' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Open to Relocate (already in Step 9, might duplicate) */}
                {/* You can decide if this stays in Step 9 or moves here */}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: CULTURE (Dating & Marriage) */}
          {step === 7 && shouldShowStep(7, selectedIntent) && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  Cultural Background
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Share your cultural identity.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Religion */}
                <div>
                  <label style={labelStyle}>Religion *</label>
                  <div style={{ position: 'relative' }}>
                    <Church size={18} style={{ 
                      position: 'absolute', 
                      left: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      zIndex: 1
                    }}/>
                    <select 
                      value={formData.religion}
                      onChange={e => setFormData({...formData, religion: e.target.value})}
                      style={{
                        ...inputStyle,
                        paddingLeft: '42px',
                        appearance: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Select religion</option>
                      {RELIGIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ 
                      position: 'absolute', 
                      right: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      pointerEvents: 'none'
                    }}/>
                  </div>
                </div>

                {/* Mother Tongue */}
                <div>
                  <label style={labelStyle}>Mother Tongue *</label>
                  <div style={{ position: 'relative' }}>
                    <Languages size={18} style={{ 
                      position: 'absolute', 
                      left: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      zIndex: 1
                    }}/>
                    <select 
                      value={formData.mother_tongue}
                      onChange={e => setFormData({...formData, mother_tongue: e.target.value})}
                      style={{
                        ...inputStyle,
                        paddingLeft: '42px',
                        appearance: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Select language</option>
                      {LANGUAGES.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ 
                      position: 'absolute', 
                      right: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      pointerEvents: 'none'
                    }}/>
                  </div>
                </div>

                {/* About Family */}
                <div>
                  <label style={labelStyle}>
                    About Family {selectedIntent === 'ready_marriage' ? '*' : '(Optional)'}
                  </label>
                  <textarea 
                    value={formData.about_family}
                    onChange={e => setFormData({...formData, about_family: e.target.value})}
                    style={{
                      ...inputStyle,
                      height: '100px',
                      resize: 'none'
                    }}
                    placeholder="e.g., 1 elder brother, 2 sisters..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep7Valid}
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                    opacity: !isStep7Valid ? 0.5 : 1,
                    cursor: !isStep7Valid ? 'not-allowed' : 'pointer'
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 8: LIFESTYLE */}
          {step === 8 && (
            <motion.div 
              key="step8"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  Lifestyle Choices
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  These matter for compatibility.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Diet */}
                <div>
                  <label style={labelStyle}>
                    <Utensils size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                    Diet *
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
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drink */}
                <div>
                  <label style={labelStyle}>
                    <Wine size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                    Drink *
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
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoke */}
                <div>
                  <label style={labelStyle}>
                    <Cigarette size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                    Smoke *
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
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={!isStep8Valid}
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                    opacity: !isStep8Valid ? 0.5 : 1,
                    cursor: !isStep8Valid ? 'not-allowed' : 'pointer'
                  }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 9: PARTNER PREFERENCES */}
          {step === 9 && (
            <motion.div 
              key="step9"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              style={glassCardStyle}
            >
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>
                  Partner Preferences
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Help us find your ideal match.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Age Range */}
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Age Range *</label>
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
                        background: '#e0e7ff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        accentColor: '#1e3a8a'
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
                        background: '#e0e7ff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        accentColor: '#1e3a8a'
                      }}
                    />
                  </div>
                </div>

                {/* Height Range */}
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      <Ruler size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                      Height Range *
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
                        background: '#e0e7ff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        accentColor: '#1e3a8a'
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
                        background: '#e0e7ff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        accentColor: '#1e3a8a'
                      }}
                    />
                  </div>
                </div>

                {/* Location Preference */}
                <div>
                  <label style={labelStyle}>
                    <Navigation size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                    Location Preference *
                  </label>
                  <input 
                    value={formData.location_preference}
                    onChange={e => setFormData({...formData, location_preference: e.target.value})}
                    style={inputStyle}
                    placeholder='e.g., "Mumbai" or "Anywhere"'
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Open to Relocate */}
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
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
                        content: '""',
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
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={handleBack}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#64748b',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ArrowLeft size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                  Back
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={loading || !isStep9Valid}
                  style={{
                    ...buttonPrimaryStyle,
                    flex: 1,
                    opacity: (!isStep9Valid || loading) ? 0.5 : 1,
                    cursor: (!isStep9Valid || loading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }}/>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight size={18}/>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 10: PROCESSING SCREEN */}
          {step === 10 && (
            <motion.div 
              key="step10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                ...glassCardStyle,
                textAlign: 'center',
                padding: '60px 32px'
              }}
            >
              {/* Pulsing WYTH Logo */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ marginBottom: '32px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 100" width="240" height="auto" style={{ margin: '0 auto' }}>
                  <g>
                    <path fill="#1E3A8A" d="M10,30 Q10,28 12,28 L22,28 Q24,28 24.5,30 L34,68 L43.5,30 Q44,28 46,28 L54,28 Q56,28 56.5,30 L66,68 L75.5,30 Q76,28 78,28 L88,28 Q90,28 90,30 L80,78 Q79,82 75,82 L65,82 Q61,82 60,78 L50,42 L40,78 Q39,82 35,82 L25,82 Q21,82 20,78 Z" />
                    <path fill="#1E3A8A" d="M105,30 Q105,28 107,28 L118,28 Q120,28 121,30 L134,55 L149,30 Q150,28 152,28 L166,28 Q168,28 168,30 L148,62 L148,78 Q148,82 144,82 L132,82 Q128,82 128,78 L128,62 Z" />
                    <path fill="#1E3A8A" d="M163,28 L210,28 Q212,28 212,30 L212,40 Q212,42 210,42 L196,42 L196,78 Q196,82 192,82 L180,82 Q176,82 176,78 L176,42 L163,42 Q161,42 161,40 L161,30 Q161,28 163,28 Z" />
                    <path fill="#1E3A8A" d="M225,30 Q225,28 227,28 L239,28 Q241,28 241,30 L241,48 L274,48 L274,30 Q274,28 276,28 L288,28 Q290,28 290,30 L290,78 Q290,82 286,82 L274,82 Q270,82 270,78 L270,60 L241,60 L241,78 Q241,82 237,82 L225,82 Q221,82 221,78 Z" />
                  </g>
                </svg>
              </motion.div>

              <h2 style={{ 
                fontSize: '26px', 
                fontWeight: '700', 
                color: '#1e3a8a', 
                marginBottom: '12px' 
              }}>
                Building Your Life Portfolio...
              </h2>

              <motion.p
                key={processingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ 
                  fontSize: '16px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}
              >
                {processingMessages[processingStep]}
              </motion.p>

              {/* Loading dots */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px',
                marginTop: '24px'
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#1e3a8a'
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Inline CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
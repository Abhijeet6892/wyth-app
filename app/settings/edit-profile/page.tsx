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
  Globe,
  Briefcase,
  MapPin,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// IMPORT YOUR EXISTING SERVER ACTION
// Ensure the path matches where you saved generateBio.ts. 
// Standard Next.js structure suggests: '@/app/actions/generateBio'
import { generateBioAction, type BioTone } from "@/app/actions/generateBio";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  
  // New State for Tone Selection
  const [selectedTone, setSelectedTone] = useState<BioTone>('Witty');

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    job_title: "",
    company: "",
    city: "",
    bio: "",
    intent: "dating_marriage",
    income_tier: "Hidden",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          job_title: data.job_title || "",
          company: data.company || "",
          city: data.city || "",
          bio: data.bio || "",
          intent: data.intent || "dating_marriage",
          income_tier: data.income_tier || "Hidden",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  // --- CONNECTED TO YOUR EXISTING GENERATEBIO.TS ---
  const handleGenerateBio = async () => {
    // 1. Validation based on your Server Action's rule (< 5 chars)
    if (!formData.bio || formData.bio.length < 5) {
        alert("Please write a short rough draft first (e.g., 'I like coffee and hiking'), then let AI polish it!");
        return;
    }

    setGeneratingBio(true);
    
    try {
        // 2. Call your existing Server Action
        const polishedBio = await generateBioAction(formData.bio, selectedTone);
        
        if (polishedBio) {
            setFormData((prev) => ({ ...prev, bio: polishedBio }));
        }
    } catch (error) {
        console.error(error);
        alert("AI is taking a break. Please try again.");
    }
    
    setGeneratingBio(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        job_title: formData.job_title,
        company: formData.company,
        city: formData.city,
        bio: formData.bio,
        intent: formData.intent,
      })
      .eq("id", user.id);

    if (!error) {
      setTimeout(() => {
        setSaving(false);
        router.push("/profile");
      }, 500);
    } else {
      alert("Error saving profile");
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="animate-spin text-brand-blue" />
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-bg pb-32">
      {/* 1. HEADER */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4 flex justify-between items-center">
        <Link
          href="/profile"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display font-bold text-slate-900">Edit Identity</h1>
        <div className="w-8"></div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 2. PHOTO UPLOAD */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer">
             <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.full_name}`}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-opacity"
                  alt="Avatar"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-slate-600" size={24}/>
                </div>
             </div>
             <div className="absolute bottom-0 right-0 bg-brand-blue text-white p-2 rounded-full border-2 border-white shadow-md">
                <Camera size={14} />
             </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">Tap to change avatar</p>
        </div>

        {/* 3. THE "BASICS" CARD */}
        <section className="bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">The Basics</h3>
          
          <InputGroup label="Full Name">
             <input 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-transparent outline-none text-slate-900 font-bold placeholder:text-slate-300"
                placeholder="Your Name"
             />
          </InputGroup>

          <InputGroup label="Current City" icon={<MapPin size={14} className="text-amber-500"/>}>
             <input 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-300"
                placeholder="e.g. Mumbai"
             />
          </InputGroup>
        </section>

        {/* 4. THE "WORK" CARD */}
        <section className="bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Career</h3>
          
          <div className="grid grid-cols-1 gap-4">
             <InputGroup label="Job Title" icon={<Briefcase size={14} className="text-blue-500"/>}>
                <input 
                    value={formData.job_title}
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                    className="w-full bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-300"
                    placeholder="e.g. Product Manager"
                />
             </InputGroup>
             
             <InputGroup label="Company">
                <input 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-300"
                    placeholder="e.g. Google"
                />
             </InputGroup>
          </div>
        </section>

        {/* 5. THE AI BIO STUDIO (UPDATED) */}
        <section className="bg-gradient-to-br from-indigo-50 to-white rounded-[1.5rem] border border-indigo-100 p-5 shadow-sm relative overflow-hidden">
           <div className="flex flex-col gap-3 mb-3">
              <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Your Vibe (Bio)</h3>
                  {/* Magic Button */}
                  <button 
                    onClick={handleGenerateBio}
                    disabled={generatingBio || !formData.bio}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-100 rounded-full shadow-sm active:scale-95 transition-transform disabled:opacity-50"
                  >
                     {generatingBio ? <Loader2 size={12} className="animate-spin text-indigo-600"/> : <Sparkles size={12} className="text-amber-500 fill-amber-500"/>}
                     <span className="text-[10px] font-bold text-indigo-600 uppercase">
                        {generatingBio ? "Polishing..." : "Rewrite with AI"}
                     </span>
                  </button>
              </div>

              {/* Tone Selector */}
              <div className="flex gap-2 p-1 bg-white/60 rounded-lg w-fit">
                  {(['Chill', 'Witty', 'Romantic'] as BioTone[]).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${selectedTone === tone ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {tone}
                      </button>
                  ))}
              </div>
           </div>
           
           <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-white/50 border border-indigo-100/50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed focus:bg-white focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 min-h-[100px] resize-none"
              placeholder="Write a rough draft (e.g. 'I like coffee & coding'), then click Rewrite!"
           />
           <p className="text-[10px] text-slate-400 mt-2 text-right">
              {formData.bio.length}/150 Characters
           </p>
        </section>

        {/* 6. INTENT SELECTOR */}
        <section className="bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm space-y-3">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Intent</h3>
           
           <div className="flex gap-2">
              <IntentOption 
                 label="Dating" 
                 selected={formData.intent === 'dating'} 
                 onClick={() => setFormData({...formData, intent: 'dating'})}
              />
              <IntentOption 
                 label="Marriage" 
                 selected={formData.intent === 'ready_marriage'} 
                 onClick={() => setFormData({...formData, intent: 'ready_marriage'})}
              />
           </div>
        </section>

        {/* 7. PRIVATE SIGNALS (Locked) */}
        <section className="bg-slate-50 rounded-[1.5rem] border border-slate-200 p-5 space-y-4 opacity-70 cursor-not-allowed">
            <div className="flex items-center gap-2 mb-2">
                <Lock size={14} className="text-slate-400"/>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Private Signals</h3>
            </div>
            
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Income Range</p>
                    <p className="text-sm font-bold text-slate-900">₹20L - 30L</p>
                </div>
                <div className="p-2 bg-slate-100 rounded-full">
                    <Globe size={14} className="text-slate-400"/>
                </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
                To edit Private Signals, verify via Desktop.
            </p>
        </section>
      </div>

      {/* 8. FLOATING SAVE DOCK */}
      <AnimatePresence>
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-6 left-0 right-0 px-6 z-50"
        >
            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full h-14 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
                {saving ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        <CheckCircle2 size={20} className="text-emerald-400"/> Save Changes
                    </>
                )}
            </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

function InputGroup({ label, icon, children }: { label: string, icon?: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 focus-within:bg-white focus-within:border-brand-blue/30 focus-within:ring-2 focus-within:ring-brand-blue/10 transition-all group">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-brand-blue transition-colors">{label}</span>
            </div>
            {children}
        </div>
    )
}

function IntentOption({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${selected ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
        >
            {label}
        </button>
    )
}
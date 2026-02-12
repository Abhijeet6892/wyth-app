"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Edit3,
  MapPin,
  Briefcase,
  Heart,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  Users,
  Star,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

export default function MyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // FIXED: Explicitly typed as Variants to satisfy TypeScript
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 24 } 
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(prof);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
        <Loader2 className="animate-spin text-brand-blue" />
      </div>
    );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-brand-bg pb-44 relative"
    >
      {/* 1. HERO IDENTITY SECTION */}
      <motion.div variants={item} className="pt-12 pb-6 px-4 flex flex-col items-center text-center relative">
        {/* Settings Top Right */}
        <Link
          href="/settings"
          className="absolute top-4 right-4 p-2.5 bg-white text-slate-400 rounded-full hover:text-brand-blue shadow-sm border border-slate-100 transition-colors"
        >
          <Settings size={20} />
        </Link>

        {/* Avatar with Gold Halo Logic */}
        <div className="relative mb-4 group cursor-pointer">
          {profile?.is_gold && (
            <div className="absolute inset-0 bg-brand-gold/40 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700 animate-pulse"></div>
          )}
          <div className={`w-28 h-28 rounded-full p-[4px] bg-white relative z-10 shadow-xl ${profile?.is_gold ? 'ring-2 ring-brand-gold ring-offset-2' : ''}`}>
             <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                <img
                src={
                    profile.brand_id
                    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.brand_id}`
                    : profile.avatar_url || "/placeholder-avatar.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
                />
             </div>
          </div>
          {/* Edit Badge */}
          <Link href="/settings/edit-profile" className="absolute bottom-1 right-1 bg-slate-900 text-white p-2 rounded-full border-2 border-white shadow-lg z-20 hover:bg-brand-blue transition-colors">
            <Edit3 size={14} />
          </Link>
        </div>

        {/* Name & Headline */}
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-1 flex items-center justify-center gap-2">
          {profile?.full_name}
          {profile?.is_gold && <Star size={18} className="fill-brand-gold text-brand-gold" />}
        </h1>
        <p className="text-sm text-slate-500 font-medium mb-3 flex items-center gap-1.5 justify-center">
          {profile?.age ? `${profile.age} • ` : ""} {profile?.city || "Location Not Set"}
        </p>

        {/* Brand ID Pill (Monospace) */}
        {profile?.brand_id && (
          <div className="px-3 py-1 bg-slate-100/80 rounded-md border border-slate-200/60 inline-flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             <code className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              ID: {profile.brand_id}
            </code>
          </div>
        )}
      </motion.div>

      {/* 2. INTENT & TRUST STRIP */}
      <motion.div variants={item} className="px-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {/* Intent Pill */}
          <div className="flex-shrink-0 px-4 py-2 bg-brand-blue/5 border border-brand-blue/10 rounded-full flex items-center gap-2">
            <Heart size={14} className="text-brand-blue fill-brand-blue" />
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">
              {profile?.intent?.replace(/_/g, " ") || "Intent Not Set"}
            </span>
          </div>
          
          {/* Career Pill */}
          <div className="flex-shrink-0 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
            <Briefcase size={14} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
              {profile?.job_title ? "Career Verified" : "Add Career"}
            </span>
          </div>

          {/* Gold Pill */}
          {profile?.is_gold ? (
              <div className="flex-shrink-0 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full flex items-center gap-2">
                <Star size={14} className="text-amber-600 fill-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Gold Member
                </span>
            </div>
          ) : (
             <Link href="/wallet" className="flex-shrink-0 px-4 py-2 bg-slate-50 border border-slate-200 border-dashed rounded-full flex items-center gap-2 hover:bg-slate-100 transition">
                <Star size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Get Gold
                </span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* 3. LIFE PORTFOLIO GRID */}
      <motion.div variants={item} className="px-4 grid grid-cols-2 gap-3 mb-6">
        
        {/* A. Career Card */}
        <div className="bg-white p-5 rounded-[1.25rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-36 relative group hover:border-brand-blue/20 transition-colors">
           <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-2">
              <Briefcase size={20}/>
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Career</p>
              <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                 {profile?.job_title || "Add Role"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{profile?.company || "Add Company"}</p>
           </div>
        </div>

        {/* B. Roots Card */}
        <div className="bg-white p-5 rounded-[1.25rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-36 relative group hover:border-amber-500/20 transition-colors">
           <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <MapPin size={20}/>
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roots</p>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                 {profile?.city || "Add City"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Native Place</p>
           </div>
        </div>

        {/* C. Lifestyle Card */}
        <div className="bg-white p-5 rounded-[1.25rem] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-36 relative group hover:border-emerald-500/20 transition-colors">
           <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Zap size={20}/>
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lifestyle</p>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                 Add Habits
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Diet & Vibe</p>
           </div>
        </div>

        {/* D. Income Card (Blurred Logic) */}
        <div className="bg-slate-50 p-5 rounded-[1.25rem] border border-slate-200/60 flex flex-col justify-between h-36 relative overflow-hidden">
           {/* The Blur Layer */}
           <div className="absolute inset-0 backdrop-blur-[4px] bg-white/40 z-10 flex items-center justify-center">
              <div className="bg-white/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-100">
                 <Lock size={12} className="text-slate-400"/>
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Private</span>
              </div>
           </div>
           
           {/* Underlying Content (Visually blurred) */}
           <div className="w-10 h-10 rounded-xl bg-slate-200 mb-2"></div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Income</p>
              <p className="text-sm font-bold text-slate-300">₹20L - 30L</p>
           </div>
        </div>
      </motion.div>

      {/* 4. PRIVATE SIGNALS */}
      <motion.div variants={item} className="px-4 mb-6">
         <div className="bg-white rounded-[1.5rem] border border-slate-100 p-1 shadow-sm overflow-hidden">
            <div className="bg-brand-blue/5 rounded-[1.25rem] p-5 border border-brand-blue/10 flex items-center justify-between group cursor-pointer">
                <div>
                   <h3 className="text-sm font-bold text-brand-blue flex items-center gap-2 mb-1">
                      <Lock size={14} className="text-brand-blue"/> Private Signals
                   </h3>
                   <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                      Horoscope • Family Net Worth • Government ID
                   </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-300 group-hover:text-brand-blue transition-colors">
                   <ChevronRight size={16}/>
                </div>
            </div>
         </div>
      </motion.div>

      {/* 5. SOCIAL PROOF */}
      <motion.div variants={item} className="px-4 mb-8">
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
            
            <div className="relative z-10 flex justify-between items-end">
               <div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                     <span className="text-4xl font-display font-bold">{profile?.vouches_count || 0}</span>
                     <span className="text-sm font-medium text-slate-400">Vouches</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-[180px] leading-relaxed">
                     Your connections have vouched for your character & authenticity.
                  </p>
               </div>
               
               <button className="h-10 px-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition active:scale-95">
                  <Users size={14}/> View
               </button>
            </div>
         </div>
      </motion.div>

      {/* 6. ACTION DOCK */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-30">
         <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-[2rem] p-2 flex gap-2">
            
            <Link href={`/profile/${profile?.full_name}`} className="flex-1">
                <button className="w-full h-12 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition active:scale-95 border border-slate-100">
                   <Eye size={16}/> Preview
                </button>
            </Link>

            <Link href="/settings/edit-profile" className="flex-1">
                <button className="w-full h-12 rounded-2xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 hover:bg-blue-900 transition active:scale-95">
                   <Edit3 size={16}/> Edit Profile
                </button>
            </Link>

         </div>
      </div>

    </motion.div>
  );
}
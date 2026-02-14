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
  Camera,
  Award,
  CheckCircle2,
  Home,
  IndianRupee,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import AvatarUpload from "@/components/AvatarUpload";

export default function MyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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

      setUser(user);

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

  const handleAvatarUpload = (url: string) => {
    setProfile((prev: any) => ({ ...prev, avatar_url: url }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)'
      }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#1e3a8a' }} />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E0E7FF 0%, #DBEAFE 25%, #FFFFFF 50%, #E0F2FE 75%, #DBEAFE 100%)',
        paddingBottom: '180px',
        position: 'relative'
      }}
    >
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

      {/* Header with Settings */}
      <motion.div variants={item} style={{ 
        paddingTop: '48px', 
        paddingBottom: '24px', 
        paddingLeft: '16px', 
        paddingRight: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Settings Button */}
        <Link
          href="/settings"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            color: '#64748b',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 4px 12px rgba(31, 41, 55, 0.1)',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1e3a8a';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Settings size={20} />
        </Link>

        {/* Avatar with Gold Halo */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          {profile?.is_gold && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(212, 175, 55, 0.4)',
              filter: 'blur(32px)',
              borderRadius: '50%',
              transform: 'scale(1.1)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          )}
          
          <div style={{
            position: 'relative',
            zIndex: 10,
            padding: profile?.is_gold ? '4px' : '0',
            background: profile?.is_gold ? 'linear-gradient(135deg, #D4AF37 0%, #F4E5A1 100%)' : 'transparent',
            borderRadius: '50%'
          }}>
            <AvatarUpload 
              url={profile?.avatar_url} 
              onUpload={handleAvatarUpload}
              size="lg"
            />
          </div>
        </div>

        {/* Name & Details */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1e3a8a',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {profile?.full_name}
          {profile?.is_gold && <Star size={20} style={{ color: '#D4AF37', fill: '#D4AF37' }} />}
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          fontWeight: '500',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: 'center'
        }}>
          {profile?.age && `${profile.age} • `}
          <MapPin size={14} />
          {profile?.city || "Location Not Set"}
        </p>

        {/* Brand ID Pill */}
        {profile?.brand_id && (
          <div style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981'
            }} />
            <code style={{
              fontSize: '11px',
              color: '#64748b',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              ID: {profile.brand_id}
            </code>
          </div>
        )}
      </motion.div>

      {/* Intent & Trust Pills */}
      <motion.div variants={item} style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {/* Intent Pill */}
          <div style={{
            flexShrink: 0,
            padding: '10px 16px',
            background: 'rgba(30, 58, 138, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(30, 58, 138, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Heart size={14} style={{ color: '#1e3a8a', fill: '#1e3a8a' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#1e3a8a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {profile?.intent?.replace(/_/g, " ") || "Intent Not Set"}
            </span>
          </div>
          
          {/* Career Pill */}
          <div style={{
            flexShrink: 0,
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Briefcase size={14} style={{ color: '#10b981' }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#10b981',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {profile?.job_title ? "Career Verified" : "Add Career"}
            </span>
          </div>

          {/* Gold Pill */}
          {profile?.is_gold ? (
            <div style={{
              flexShrink: 0,
              padding: '10px 16px',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Gold Member
              </span>
            </div>
          ) : (
            <Link href="/wallet" style={{
              flexShrink: 0,
              padding: '10px 16px',
              background: 'rgba(148, 163, 184, 0.05)',
              border: '1px dashed rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)'}
            >
              <Star size={14} style={{ color: '#94a3b8' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Get Gold
              </span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Life Portfolio Grid */}
      <motion.div variants={item} style={{ 
        paddingLeft: '16px', 
        paddingRight: '16px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px', 
        marginBottom: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Career Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '144px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <p style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Career
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1e3a8a',
              lineHeight: '1.3',
              marginBottom: '4px'
            }}>
              {profile?.job_title || "Add Role"}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {profile?.company || "Add Company"}
            </p>
          </div>
        </div>

        {/* Roots Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '144px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <Home size={20} />
          </div>
          <div>
            <p style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Roots
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1e3a8a',
              lineHeight: '1.3',
              marginBottom: '4px'
            }}>
              {profile?.hometown || profile?.city || "Add Location"}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Native Place
            </p>
          </div>
        </div>

        {/* Lifestyle Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '144px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <Zap size={20} />
          </div>
          <div>
            <p style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Lifestyle
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1e3a8a',
              lineHeight: '1.3',
              marginBottom: '4px'
            }}>
              {profile?.diet || "Not specified"}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {profile?.drink ? `${profile.drink} Drinker` : "Add preferences"}
            </p>
          </div>
        </div>

        {/* Income Card (Blurred) */}
        <div style={{
          background: 'rgba(241, 245, 249, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(226, 232, 240, 0.6)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '144px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Blur Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(4px)',
            background: 'rgba(255, 255, 255, 0.4)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 16px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(226, 232, 240, 0.5)'
            }}>
              <Lock size={12} style={{ color: '#94a3b8' }} />
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase'
              }}>
                Private
              </span>
            </div>
          </div>
          
          {/* Underlying Content */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#cbd5e1',
            marginBottom: '8px'
          }} />
          <div>
            <p style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#cbd5e1',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Income
            </p>
            <p style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#cbd5e1'
            }}>
              ₹{profile?.income_tier || "20L - 30L"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Private Signals Card */}
      <motion.div variants={item} style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '24px',
          padding: '4px',
          boxShadow: '0 4px 16px rgba(31, 41, 55, 0.08)'
        }}>
          <div style={{
            background: 'rgba(30, 58, 138, 0.05)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(30, 58, 138, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 58, 138, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 58, 138, 0.05)'}
          >
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <Lock size={14} /> Private Signals
              </h3>
              <p style={{
                fontSize: '11px',
                color: '#64748b',
                fontWeight: '500',
                lineHeight: '1.5',
                maxWidth: '200px'
              }}>
                Horoscope • Family Net Worth • Government ID
              </p>
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(226, 232, 240, 0.5)',
              color: '#cbd5e1',
              transition: 'all 0.2s'
            }}>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Social Proof Card */}
      <motion.div variants={item} style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(30, 41, 59, 0.2)'
        }}>
          {/* Background Texture */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '128px',
            height: '128px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(48px)',
            transform: 'translate(40px, -40px)'
          }} />
          
          <div style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '36px',
                  fontWeight: '700'
                }}>
                  {profile?.vouches_count || 0}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#94a3b8'
                }}>
                  Vouches
                </span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#94a3b8',
                maxWidth: '180px',
                lineHeight: '1.5'
              }}>
                Your connections have vouched for your character & authenticity.
              </p>
            </div>
            
            <button style={{
              height: '40px',
              padding: '0 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '700',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <Users size={14} /> View
            </button>
          </div>
        </div>
      </motion.div>

      {/* Action Dock */}
      <div style={{
        position: 'fixed',
        bottom: '96px',
        left: '0',
        right: '0',
        paddingLeft: '24px',
        paddingRight: '24px',
        zIndex: 30
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.05)',
          borderRadius: '24px',
          padding: '8px',
          display: 'flex',
          gap: '8px'
        }}>
          <Link href={`/profile/${profile?.full_name}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              height: '48px',
              borderRadius: '16px',
              background: 'rgba(241, 245, 249, 0.8)',
              color: '#64748b',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(226, 232, 240, 0.8)';
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <Eye size={16} /> Preview
            </button>
          </Link>

          <Link href="/settings/edit-profile" style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: 'white',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)';
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
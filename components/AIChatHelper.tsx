/**
 * WYTH AI CHAT HELPER - Premium UI Component
 * 
 * Add to: Chat interface
 * 
 * Features:
 * - 3 modes: Start Connection, Deepen Connection, End Connection
 * - WYTH mature tone (dignified, respectful, intentional)
 * - Context-aware suggestions
 * - One-tap message insertion
 */

import { useState } from "react";
import { 
  generateChatHelp,
  type ChatMode,
  type ChatTone 
} from "@/app/actions/generateChatHelp";
import { Sparkles, Loader2, MessageCircle, X, Heart, UserMinus, AlertCircle } from "lucide-react";

interface AIChatHelperProps {
  matchProfile: {
    name: string;
    bio?: string;
    profession?: string;
    city?: string;
    interests?: string[];
  };
  onMessageSelect: (message: string) => void;
  onClose?: () => void;
}

export function AIChatHelper({ matchProfile, onMessageSelect, onClose }: AIChatHelperProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode>("start_connection");
  const [selectedTone, setSelectedTone] = useState<ChatTone>("Grounded");
  const [suggestions, setSuggestions] = useState<{ primary: string; alternatives: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modes = [
    { 
      value: "start_connection" as ChatMode, 
      icon: MessageCircle,
      label: "Start Connection", 
      description: "Open thoughtfully",
      color: "#1e3a8a"
    },
    { 
      value: "deepen_connection" as ChatMode,
      icon: Heart,
      label: "Deepen Connection", 
      description: "Go intentional",
      color: "#6366f1"
    },
    { 
      value: "end_connection" as ChatMode,
      icon: UserMinus,
      label: "End Gracefully", 
      description: "Close with dignity",
      color: "#64748b"
    },
  ];

  const tones = [
    { value: "Grounded" as ChatTone, label: "🏔️ Grounded", description: "Calm, steady" },
    { value: "Thoughtful" as ChatTone, label: "💭 Thoughtful", description: "Reflective depth" },
    { value: "Warm" as ChatTone, label: "🤝 Warm", description: "Kind, genuine" },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setSuggestions(null);
    setError(null);

    try {
      const result = await generateChatHelp(
        selectedMode,
        matchProfile,
        selectedTone
      );

      if (result && result.primary) {
        setSuggestions(result);
      } else {
        setError("Failed to generate suggestions. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate message");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (message: string) => {
    onMessageSelect(message);
    if (onClose) onClose();
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px 24px 0 0',
      padding: '24px',
      border: '1px solid rgba(226, 232, 240, 0.5)',
      borderBottom: 'none',
      boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.08)',
      maxHeight: '85vh',
      overflowY: 'auto'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} style={{ color: '#1e3a8a' }} />
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
            WYTH Message Helper
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <p style={{
        fontSize: '13px',
        color: '#64748b',
        marginBottom: '20px',
        lineHeight: '1.5'
      }}>
        Generate respectful, mature messages for {matchProfile.name}. Choose the stage of your conversation:
      </p>

      {/* Mode Selection */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Conversation Stage
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.value;
            return (
              <button
                key={mode.value}
                onClick={() => setSelectedMode(mode.value)}
                style={{
                  padding: '14px 16px',
                  background: isSelected 
                    ? `linear-gradient(135deg, ${mode.color}15 0%, ${mode.color}08 100%)` 
                    : 'white',
                  color: isSelected ? mode.color : '#64748b',
                  border: isSelected ? `1.5px solid ${mode.color}40` : '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: isSelected ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                <Icon size={18} />
                <div style={{ flex: 1 }}>
                  <div>{mode.label}</div>
                  <div style={{ 
                    fontSize: '11px', 
                    opacity: 0.7, 
                    marginTop: '2px',
                    fontWeight: '400'
                  }}>
                    {mode.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone Selection */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Your Tone
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tones.map((tone) => (
            <button
              key={tone.value}
              onClick={() => setSelectedTone(tone.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: selectedTone === tone.value 
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' 
                  : 'white',
                color: selectedTone === tone.value ? 'white' : '#64748b',
                border: selectedTone === tone.value ? 'none' : '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                if (selectedTone !== tone.value) {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTone !== tone.value) {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              <div>{tone.label}</div>
              <div style={{ 
                fontSize: '9px', 
                opacity: 0.8, 
                marginTop: '2px' 
              }}>
                {tone.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          background: '#fef2f2',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid #fecaca'
        }}>
          <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
            {error}
          </span>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: '100%',
          background: loading 
            ? 'rgba(30, 58, 138, 0.5)' 
            : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '700',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.2s',
          marginBottom: '24px',
          fontFamily: 'inherit',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(30, 58, 138, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 58, 138, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.3)';
          }
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Generating WYTH-style messages...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Messages
          </>
        )}
      </button>

      {/* Suggestions */}
      {suggestions && (
        <div>
          <p style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#1e3a8a',
            marginBottom: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Tap to use:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Primary suggestion */}
            <div
              onClick={() => handleSelect(suggestions.primary)}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
                border: '1.5px solid rgba(30, 58, 138, 0.25)',
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1e3a8a';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.25)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#1e3a8a',
                color: 'white',
                fontSize: '9px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Recommended
              </div>
              <p style={{
                fontSize: '14px',
                color: '#1e293b',
                margin: 0,
                lineHeight: '1.6',
                paddingRight: '100px',
                whiteSpace: 'pre-wrap'
              }}>
                {suggestions.primary}
              </p>
            </div>

            {/* Alternative suggestions */}
            {suggestions.alternatives.map((alt, index) => (
              <div
                key={index}
                onClick={() => handleSelect(alt)}
                style={{
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <p style={{
                  fontSize: '14px',
                  color: '#475569',
                  margin: 0,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {alt}
                </p>
              </div>
            ))}
          </div>

          {/* Try Again Button */}
          <button
            onClick={() => {
              setSuggestions(null);
              setError(null);
            }}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#64748b',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              marginTop: '14px',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            Generate Different Messages
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
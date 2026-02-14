/**
 * WYTH AI BIO GENERATOR - Premium UI Component
 * 
 * Add to: app/settings/editprofile/page.tsx
 * 
 * Features:
 * - Accepts keywords (e.g., "engineer mumbai hiking family marriage")
 * - Generates 3 WYTH-toned variations (Grounded, Thoughtful, Warm)
 * - Professional, mature aesthetic
 * - One-click bio selection
 */

import { useState } from "react";
import { generateBioAction } from "@/app/actions/generateBio";
import { Sparkles, Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface AIBioGeneratorProps {
  onBioGenerated: (bio: string) => void;
  currentBio?: string;
}

export function AIBioGenerator({ onBioGenerated, currentBio }: AIBioGeneratorProps) {
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedBios, setGeneratedBios] = useState<{
    grounded?: string;
    thoughtful?: string;
    warm?: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!keywords.trim() || keywords.trim().length < 10) {
      setError("Please enter at least a few keywords about yourself");
      return;
    }

    setGenerating(true);
    setShowResults(false);
    setError(null);

    try {
      // Generate all 3 tones
      const [grounded, thoughtful, warm] = await Promise.all([
        generateBioAction(keywords, "Grounded"),
        generateBioAction(keywords, "Thoughtful"),
        generateBioAction(keywords, "Warm"),
      ]);

      if (grounded && thoughtful && warm) {
        setGeneratedBios({ grounded, thoughtful, warm });
        setShowResults(true);
      } else {
        setError("Failed to generate bios. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate bio");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = (tone: keyof typeof generatedBios) => {
    const bio = generatedBios[tone];
    if (bio) {
      onBioGenerated(bio);
      setShowResults(false);
      setKeywords("");
      setError(null);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(30, 58, 138, 0.15)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Sparkles size={20} style={{ color: '#1e3a8a' }} />
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
          AI Bio Writer
        </h3>
      </div>

      <p style={{
        fontSize: '13px',
        color: '#64748b',
        marginBottom: '16px',
        lineHeight: '1.5'
      }}>
        Enter keywords about yourself. Our AI will craft a mature, thoughtful bio that reflects WYTH's premium tone.
      </p>

      {/* Examples */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px',
        fontSize: '12px',
        color: '#475569',
        border: '1px solid rgba(226, 232, 240, 0.5)'
      }}>
        <p style={{ margin: 0, marginBottom: '6px', fontWeight: '600', color: '#1e3a8a' }}>
          Examples:
        </p>
        <p style={{ margin: 0, fontStyle: 'italic', color: '#64748b', fontSize: '11px' }}>
          "engineer mumbai hiking family ready for marriage"
        </p>
        <p style={{ margin: 0, fontStyle: 'italic', color: '#64748b', fontSize: '11px' }}>
          "doctor chennai classical music family-oriented settling down"
        </p>
        <p style={{ margin: 0, fontStyle: 'italic', color: '#64748b', fontSize: '11px' }}>
          "consultant delhi reading travel parents younger sister committed relationship"
        </p>
      </div>

      {/* Input */}
      <textarea
        value={keywords}
        onChange={(e) => {
          setKeywords(e.target.value);
          setError(null);
        }}
        placeholder="Enter keywords: profession, city, hobbies, family, relationship goals..."
        disabled={generating}
        style={{
          width: '100%',
          background: 'white',
          border: error ? '1.5px solid #ef4444' : '1.5px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '12px',
          padding: '14px',
          fontSize: '14px',
          color: '#1e3a8a',
          outline: 'none',
          resize: 'none',
          minHeight: '90px',
          fontFamily: 'inherit',
          marginBottom: '12px',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.4)';
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
        }}
      />

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          background: '#fef2f2',
          borderRadius: '10px',
          marginBottom: '12px',
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
        disabled={generating || !keywords.trim() || keywords.trim().length < 10}
        style={{
          width: '100%',
          background: generating || !keywords.trim() || keywords.trim().length < 10
            ? 'rgba(30, 58, 138, 0.4)' 
            : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          padding: '14px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '700',
          border: 'none',
          cursor: generating || !keywords.trim() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
          boxShadow: generating || !keywords.trim() ? 'none' : '0 4px 12px rgba(30, 58, 138, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (!generating && keywords.trim() && keywords.trim().length >= 10) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 58, 138, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!generating && keywords.trim()) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.3)';
          }
        }}
      >
        {generating ? (
          <>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Generating WYTH-style bio...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Bio (3 styles)
          </>
        )}
      </button>

      {/* Results */}
      {showResults && Object.keys(generatedBios).length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#1e3a8a',
            marginBottom: '14px'
          }}>
            Pick your style:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Grounded */}
            {generatedBios.grounded && (
              <div
                onClick={() => handleSelect("grounded")}
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1.5px solid rgba(30, 58, 138, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1e3a8a';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 138, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#1e3a8a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  🏔️ Grounded — Calm, steady confidence
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {generatedBios.grounded}
                </p>
              </div>
            )}

            {/* Thoughtful */}
            {generatedBios.thoughtful && (
              <div
                onClick={() => handleSelect("thoughtful")}
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1.5px solid rgba(99, 102, 241, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#6366f1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  💭 Thoughtful — Reflective depth
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {generatedBios.thoughtful}
                </p>
              </div>
            )}

            {/* Warm */}
            {generatedBios.warm && (
              <div
                onClick={() => handleSelect("warm")}
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1.5px solid rgba(251, 146, 60, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fb923c';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 146, 60, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#ea580c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  🤝 Warm — Kind, emotionally available
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#1e293b',
                  margin: 0,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {generatedBios.warm}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowResults(false);
              setGeneratedBios({});
            }}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#64748b',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
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
            <RefreshCw size={14} />
            Try different keywords
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
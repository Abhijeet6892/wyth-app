'use client'
import { useState, useEffect } from 'react'
// FIXED: Relative import path
import { supabase } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, Shield, Ghost } from 'lucide-react'

export default function PrivacySettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ghostMode, setGhostMode] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('ghost_mode')
        .eq('id', user.id)
        .single()
      
      if (data) setGhostMode(data.ghost_mode || false)
      setLoading(false)
    }
    fetchData()
  }, [router])

  const toggleGhostMode = async () => {
    if (!user) return

    const newValue = !ghostMode
    setGhostMode(newValue) // Optimistic update

    const { error } = await supabase
        .from('profiles')
        .update({ ghost_mode: newValue })
        .eq('id', user.id)

    if (error) {
        alert("Error updating privacy settings")
        setGhostMode(!newValue) // Rollback
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-50"/>

  return (
    <div className="min-h-screen bg-slate-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-slate-100 flex items-center gap-3">
        <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-slate-50 text-slate-600">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Visibility Controls</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Main Toggle */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className={`p-3 rounded-full ${ghostMode ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {ghostMode ? <Ghost size={24} /> : <Eye size={24} />}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Ghost Mode</h2>
                        <p className={`text-sm font-medium ${ghostMode ? 'text-indigo-600' : 'text-slate-500'}`}>
                            {ghostMode ? "Active (You are invisible)" : "Inactive (You are visible)"}
                        </p>
                    </div>
                </div>
                
                {/* Toggle Switch */}
                <div 
                    onClick={toggleGhostMode}
                    className={`w-14 h-8 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-300 ${ghostMode ? 'bg-indigo-900' : 'bg-slate-300'}`}
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${ghostMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
                When Ghost Mode is on, your profile is <b>hidden</b> from the Discovery Feed. 
                Existing connections can still see you and chat with you.
            </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <Shield className="text-blue-600 shrink-0" size={20} />
                <div>
                    <h3 className="text-sm font-bold text-blue-800">Social Shield Active</h3>
                    <p className="text-xs text-blue-600 mt-1">
                        Your career and social details are always blurred for strangers, regardless of Ghost Mode.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}
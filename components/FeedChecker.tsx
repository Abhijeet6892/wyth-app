'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function FeedChecker() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const fetchFeed = async () => {
      // 1. Diagnostic Check
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        setErrorMsg("API Keys are missing! Check your .env.local file.")
        setLoading(false)
        return
      }

      setDebugInfo(`Connecting to: ${url.substring(0, 15)}...`)

      // 2. Set a timeout to warn if it takes too long
      const timer = setTimeout(() => {
        if (loading) setErrorMsg("Connection timed out. Database might be paused or unreachable.")
      }, 8000) // 8 seconds timeout

      console.log("Attempting to fetch from Supabase...")
      
      // 3. Fetch posts
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (full_name, is_gold, career_verified)
        `)
      
      clearTimeout(timer)
      
      if (error) {
        console.error('Error fetching posts:', error)
        setErrorMsg(error.message)
      } else {
        console.log("Data received:", postsData)
        setPosts(postsData || [])
      }
      setLoading(false)
    }

    fetchFeed()
  }, [])

  if (loading) return (
    <div className="p-10 text-slate-500 animate-pulse">
      <h2 className="text-xl font-bold">Loading Database...</h2>
      <p className="text-sm mt-2">{debugInfo}</p>
    </div>
  )
  
  if (errorMsg) return (
    <div className="p-10 text-red-500">
      <h2 className="font-bold text-xl mb-2">Connection Error ⚠️</h2>
      <p>Something went wrong:</p>
      <pre className="bg-red-50 p-4 mt-2 rounded text-sm font-mono border border-red-200">{errorMsg}</pre>
    </div>
  )

  return (
    <div className="p-6 font-sans max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
        Database Connected Successfully
      </h1>
      
      {posts.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800">
          <strong>Connected, but table is empty.</strong>
          <p className="text-sm mt-1">Did you run the "Seed Data" script in Supabase SQL Editor?</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-4 flex justify-between">
            <span>Loaded {posts.length} posts</span>
            <span className="text-green-600 font-bold">Live Data</span>
          </p>
          {posts.map(post => (
            <div key={post.id} className="border border-slate-200 p-4 rounded-xl shadow-sm bg-white hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-1">
                    {post.profiles?.full_name || 'Unknown User'} 
                    {post.profiles?.is_gold && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">GOLD</span>}
                </h3>
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{post.type}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{post.caption || post.achievement_title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
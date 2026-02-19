"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 🔥 Detect login session change (for email magic link)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // ✅ Email Magic Link Login
  const handleEmailLogin = async () => {
    if (!email) return alert("Enter email first")

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Check your email for login link!")
    }

    setLoading(false)
  }

  // ✅ Google OAuth Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) alert(error.message)
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Client Task Dashboard Login</h2>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "10px",
          width: "250px",
          marginBottom: "10px",
        }}
      />

      <br />

      <button onClick={handleEmailLogin} disabled={loading}>
        {loading ? "Sending..." : "Login with Email"}
      </button>

      <br /><br />

      <button onClick={handleGoogleLogin}>
        Login with Google
      </button>
    </div>
  )
}

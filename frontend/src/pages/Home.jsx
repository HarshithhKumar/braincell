import { signInWithPopup } from 'firebase/auth'
import { useState } from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';
import logOut from '../features/logOut'

function Home({ onUserChange, onStartGuestSession, sessionError, onRetrySession }) {
    const [authError,setAuthError]=useState("")
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const token = await result.user.getIdToken()
            const { data } = await api.post("/api/auth/login", { token })
            onUserChange(data)
            setAuthError("")
        } catch (error) {
            console.error("Google sign-in failed",error)
            setAuthError(error.response?.data?.message || "Google sign-in failed. Please try again.")
        }
    }

    const handleLogout = async () => {
        try {
            await logOut()
            await onStartGuestSession()
            await auth.signOut()
        } catch (error) {
            console.error("Sign-out failed",error)
            setAuthError(error.response?.data?.message || "Could not switch to guest mode.")
        }
    }

    return (
        <div className='h-dvh flex bg-[#09090d] text-white overflow-hidden'>
            <SideBar onLogin={handleLogin} onLogout={handleLogout} />
            <main className='relative flex flex-1 min-w-0 overflow-hidden bg-[radial-gradient(ellipse_at_55%_0%,rgba(108,53,128,0.18),transparent_58%),linear-gradient(145deg,#121018,#0a090e_65%)]'>
                {sessionError && (
                    <div role="alert" className='absolute top-3 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-amber-300/20 bg-[#1a1720] px-4 py-2 text-sm text-amber-100 shadow-xl'>
                        {sessionError}
                        <button className='ml-3 text-violet-300 underline underline-offset-2' onClick={onRetrySession}>Retry</button>
                    </div>
                )}
                {authError && (
                    <div role="alert" className='absolute top-3 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-rose-300/20 bg-[#1a1720] px-4 py-2 text-sm text-rose-100 shadow-xl'>
                        {authError}
                        <button className='ml-3 text-violet-300 underline underline-offset-2' onClick={()=>setAuthError("")}>Dismiss</button>
                    </div>
                )}
                <ChatArea />
                <Artifact />
            </main>
        </div>
    )
}

export default Home

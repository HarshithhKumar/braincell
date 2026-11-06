import { useCallback, useEffect, useRef, useState } from 'react'
import Home from './pages/Home'
import getCurrentUser from './features/getCurrentUser'
import { createGuestSession } from './features/createGuestSession'
import { useDispatch } from 'react-redux'
import { setUserdata } from './redux/userSlice'
import { setConversations, setSelectedConversation } from './redux/conversationSlice'
import { setArtifacts, setDraftPrompt, setMessages } from './redux/messageSlice'

function App() {
const dispatch=useDispatch()
const [sessionError,setSessionError]=useState("")
const sessionInitialization=useRef(null)

const updateUser=useCallback((user)=>{
  dispatch(setUserdata(user))
  dispatch(setConversations([]))
  dispatch(setSelectedConversation(null))
  dispatch(setMessages([]))
  dispatch(setArtifacts([]))
  dispatch(setDraftPrompt(""))
  setSessionError("")
},[dispatch])

const startGuestSession=useCallback(async()=>{
  const guest=await createGuestSession()
  updateUser(guest)
  setSessionError("")
},[updateUser])

useEffect(()=>{
  let mounted=true
  if(!sessionInitialization.current){
    sessionInitialization.current=(async()=>{
      const currentUser=await getCurrentUser()
      return currentUser || await createGuestSession()
    })()
  }
  sessionInitialization.current.then((user)=>{
      if(mounted) updateUser(user)
    }).catch((error)=>{
      console.error("session initialization failed",error)
      if(mounted) setSessionError("Could not start a session. Check your connection and try again.")
    })
  return ()=>{mounted=false}
},[dispatch,updateUser])

  return (
   <Home
     onUserChange={updateUser}
     onStartGuestSession={startGuestSession}
     sessionError={sessionError}
     onRetrySession={startGuestSession}
   />
  )
}

export default App

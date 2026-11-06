import { useEffect, useState } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { setArtifacts, setMessages } from '../redux/messageSlice'

function ChatArea() {
  const {selectedConversation}=useSelector(state=>state.conversation)
  const dispatch=useDispatch()
  const [loadError,setLoadError]=useState("")
  useEffect(()=>{
    let active=true
    const loadMessages=async () => {
      if(!selectedConversation) return
      if(selectedConversation.title==="New Chat"){
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        return
      }
      try {
        const data=await getMessages(selectedConversation._id)
        if(!active) return
        dispatch(setMessages(data))
        const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
        setLoadError("")
      } catch(error) {
        console.error("Could not load conversation messages",error)
        if(active) setLoadError("Could not load messages for this conversation.")
      }
    }
    loadMessages()
    return ()=>{active=false}
  },[selectedConversation,dispatch])
  return (
    <div className='flex-1 flex flex-col min-w-0'>
      <Nav/>
      {loadError && <p role="alert" className='px-6 pt-3 text-center text-xs text-rose-300'>{loadError}</p>}
      <MessageList/>
      <ChatInput/>
    </div>
  )
}

export default ChatArea

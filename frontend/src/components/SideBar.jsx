import { useEffect, useState } from 'react'
import { Coins, LogIn, LogOut, Menu, MessageSquare, PanelLeftIcon, PanelRight, PenSquare, Plus, User, X, Sparkles } from "lucide-react"
import { getConversations } from '../features/getConversations'
import { useDispatch, useSelector } from 'react-redux'
import { setConversations, setSelectedConversation } from '../redux/conversationSlice'

import { setArtifacts, setDraftPrompt, setMessages } from '../redux/messageSlice'
import BillingDrawer from './BillingDrawer'
function SideBar({ onLogin, onLogout }) {
    const [collapsed, setCollapsed] = useState(false)
    const dispatch = useDispatch()
    const [imageError, setImageError] = useState(false)
    const { conversations, selectedConversation } = useSelector(state => state.conversation)
    const { userData } = useSelector(state => state.user)
    const userId = userData?.userId || userData?._id
    const [conversationError,setConversationError]=useState("")
    const [showBilling,setShowBilling]=useState(false)
    const [mobileOpen,setMobileOpen]=useState(false)
    useEffect(() => {
        if(!userId) return
        let active=true
        const getConv = async () => {
            try {
                const data = await getConversations()
                if(active) {
                    dispatch(setConversations(data))
                    setConversationError("")
                }
            } catch(error) {
                console.error("Could not load conversations",error)
                if(active) setConversationError("Could not load conversation history.")
            }
        }
        getConv()
        return ()=>{active=false}
    }, [dispatch, userId])

    const startNewChat = () => {
        dispatch(setSelectedConversation(null))
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        dispatch(setDraftPrompt(""))
        setMobileOpen(false)
    }

    const selectConversation = (conversation) => {
        dispatch(setSelectedConversation(conversation))
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        dispatch(setDraftPrompt(""))
        setMobileOpen(false)
    }



    if (collapsed) {
        return (
            <div className='hidden lg:flex flex-col items-center w-[56px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-4 gap-1 shrink-0'>
                <button className='flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-1'
                    onClick={() => setCollapsed(false)}
                >
                    <PanelRight />
                </button>

                <button
                    className='flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer '
                    onClick={startNewChat}
                >
                    <Plus size={17} />
                </button>

                <div className='flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-5'>
                    {conversations.map((conv) => {
                        const isActive = selectedConversation?._id == conv?._id
                        return (
                            <div
                                onClick={() => selectConversation(conv)}
                                className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150
                ${isActive ? "bg-indigo-500/10 border-indigo-500/[0.18]"
                                        : "bg-transparent border-transparent"}`}>
                                <div className={`flex items-center justify-center shrink-0 w-[20px] h-[20px] rounded-lg transition-colors duration-150
                ${isActive ? "bg-indigo-500/15 text-indigo-400" : "bg-white/[0.05] text-slate-500"}`}>
                                    <MessageSquare size={13} />
                                </div>
                               

                            </div>
                        )
                    })}

                </div>

<div className='"relative shrink-0'>
                                {
                                    (userData?.avatar && !imageError)
                                        ?
                                        <img
                                            className='w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25'
                                            src={userData?.avatar}
                                            alt={"image"}
                                            onError={() => setImageError(true)} />
                                        :
                                        <div className='w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center'>
                                            <User size={15} className="text-slate-400" />
                                        </div>

                                }

                            </div>
                

            </div>
        )
    }


    return (
        <>
         
       <button className='lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer' onClick={()=>setMobileOpen(true)}>
            <Menu size={14}/>
         </button>

         {mobileOpen && <div onClick={()=>setMobileOpen(false)} className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'/>}
  


        <div className={` fixed lg:static inset-y-0 left-0 z-50
        w-[270px] h-screen shrink-0
        bg-[#0d0f14] border-r border-white/[0.06]
        transition-transform duration-250
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
`}
      >

            

            <div className='flex flex-col h-full'>
                <div className='flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]'>
                    <div className='hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer'
                        onClick={() => setCollapsed(true)}
                    >
                        <PanelLeftIcon />
                    </div>

                    <button  onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
>
                        <X/>
                    </button>
                    <span className='flex flex-1 items-center gap-2 text-[16px] font-semibold tracking-tight text-slate-100'>
                        <span className='flex h-7 w-7 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-300/10 text-violet-200'><Sparkles size={14} /></span>
                        Braincell
                    </span>
                    <span className='text-[10px] font-medium text-violet-200 bg-violet-300/[0.08] border border-violet-300/15 px-2 py-0.5 rounded-full tracking-wide'>{userData?.isGuest ? "GUEST" : userData?.plan || "FREE"}</span>
                    <button className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer'
                        onClick={startNewChat}>
                        <PenSquare size={14} />
                    </button>
                </div>

                <div className='px-4 pt-4 pb-1'>
                    <button className='w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-[10px] border-none cursor-pointer hover:opacity-90 transition-opacity duration-150'
                        onClick={startNewChat}
                    >
                        <Plus size={15} />
                        New Chat
                    </button>
                </div>

                {conversations.length == 0
                    ?
                    <div className='px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600'>
                        No Recent Conversations
                    </div>
                    :
                    (
                        <div className='px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600'>
                            Recents
                        </div>
                    )}
                {conversationError && <p role="alert" className='mx-4 mt-2 text-xs text-rose-300'>{conversationError}</p>}


                <div className='flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    {conversations?.map((conv) => {
                        const isActive = selectedConversation?._id == conv?._id
                        return (
                            <div
                                onClick={() => selectConversation(conv)}
                                className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150
                ${isActive ? "bg-indigo-500/10 border-indigo-500/[0.18]"
                                        : "bg-transparent border-transparent"}`}>
                                <div className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg transition-colors duration-150
                ${isActive ? "bg-indigo-500/15 text-indigo-400" : "bg-white/[0.05] text-slate-500"}`}>
                                    <MessageSquare size={13} />
                                </div>
                                <span className={`text-[13px] font-medium truncate ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                                    {conv?.title || "New Chat"}
                                </span>

                            </div>
                        )
                    })}

                </div>

                <div className='mx-2.5 h-px bg-white/[0.08]' />
                <div className='px-3.5 py-3.5'>
                    {userData ? (
                        <div className='flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5'>
                            <div className='relative shrink-0'>
                                {
                                    (userData?.avatar && !imageError)
                                        ?
                                        <img
                                            className='w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25'
                                            src={userData?.avatar}
                                            alt={userData?.name || "Profile"}
                                            onError={() => setImageError(true)} />
                                        :
                                        <div className='w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center'>
                                            <User size={15} className="text-slate-400" />
                                        </div>

                                }

                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-[13.5px] font-semibold text-slate-100 truncate'>{userData?.name || "Guest"}</p>
                                <p className='text-[11px] text-slate-500 mt-px'>{userData?.isGuest ? "Guest session" : `${userData?.plan || "Free"} plan`}</p>
                            </div>
                            <div className='flex gap-1'>
                                {userData?.isGuest ? (
                                    <button
                                        aria-label="Sign in with Google"
                                        title="Sign in with Google"
                                        onClick={onLogin}
                                        className='flex h-8 items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-400/10 px-2.5 text-xs font-medium text-violet-200 transition hover:bg-violet-400/15'
                                    >
                                        <LogIn size={14} />
                                        Sign in
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            aria-label="Billing and credits"
                                            onClick={()=>setShowBilling(true)}
                                            className='flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-amber-400 cursor-pointer hover:bg-white/[0.08] transition-all duration-150'
                                        >
                                            <Coins size={16} />
                                        </button>
                                        <button
                                            aria-label="Sign out"
                                            onClick={onLogout}
                                            className='flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-500 cursor-pointer hover:bg-white/[0.08] hover:text-slate-200 transition-all duration-150'
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>)
                        :
                        <button onClick={onLogin} className='w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/[0.05] border border-white/[0.08] rounded-xl py-[11px] cursor-pointer hover:bg-white/[0.08] transition-colors duration-150'>
                            <LogIn size={15} /> Sign in with Google
                        </button>}
                </div>
            </div>

        </div>

        
           {!userData?.isGuest && <BillingDrawer
           open={showBilling}
           onClose={()=>setShowBilling(false)}
           />}

        </>
    )




}

export default SideBar

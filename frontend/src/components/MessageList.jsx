import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import LoadingAnimation from './LoadingAnimation'
import { Sparkles } from 'lucide-react'
import { setDraftPrompt } from '../redux/messageSlice'

function MessageList() {
    const {selectedConversation}=useSelector(state=>state.conversation)
    const {messages,isLoading}=useSelector(state=>state.message)
    const {userData}=useSelector(state=>state.user)
    const dispatch=useDispatch()
    const bottemRef=useRef(null)
   
   useEffect(()=>{
       requestAnimationFrame(()=>{
        bottemRef?.current?.scrollIntoView({
          behavior:"smooth",
          block:"end"
        })
       })
   },[messages?.length,isLoading])


  return (
    <div className='flex-1 overflow-y-auto px-4 py-6 sm:px-7 lg:px-10 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      
      {messages.length==0 || !selectedConversation ?(
        <div className="flex min-h-full flex-col items-center justify-center gap-7 py-12 text-center">
           <div className='flex flex-col items-center gap-2'>
               <div aria-hidden="true" className='relative mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia-200/30 bg-[radial-gradient(circle_at_34%_22%,#f0c3ff_0%,#9f4ad3_24%,#441b74_58%,#120c1c_78%)] shadow-[0_0_38px_rgba(181,94,219,.28),inset_-9px_-10px_20px_rgba(9,4,19,.7)]'>
                 <div className='absolute left-3 top-2 h-3 w-5 rotate-[-25deg] rounded-full bg-white/40 blur-[5px]' />
                 <Sparkles size={20} className='text-white/90' />
               </div>
               <span className='text-[11px] font-medium uppercase tracking-[0.24em] text-violet-300/80'>Your creative workspace</span>
               <h1 className='mt-1 text-2xl font-medium tracking-tight text-slate-100 sm:text-[30px]'>Ready to create something new?</h1>
               <p className='max-w-[360px] text-[13px] leading-relaxed text-slate-400'>Ask a question, explore an idea, or make something with Braincell.</p>
               {userData?.isGuest && <span className='mt-1 text-[11px] text-slate-500'>Guest access · up to 30 AI requests per day</span>}
           </div>
           <div className='grid w-full max-w-[760px] grid-cols-1 gap-2 sm:grid-cols-3'>
            {[
              ["Build a landing page", "Create a clean landing page for a boutique coffee brand."],
              ["Explain a concept", "Explain how Redis works with a simple real-world example."],
              ["Explore an idea", "Help me brainstorm a useful weekend project using AI."]
            ].map(([label,prompt])=>(
              <button
                key={label}
                onClick={()=>dispatch(setDraftPrompt(prompt))}
                className='group rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-violet-300/[0.06]'
              >
                <span className='block text-xs font-medium text-slate-200 group-hover:text-white'>{label}</span>
                <span className='mt-1 block text-[11px] leading-relaxed text-slate-500'>{prompt}</span>
              </button>
            ))}
           </div>
        </div>
      ):
      <div className='space-y-5'>

        {messages?.map((msg,i)=>(
            <div key={msg?._id || `${msg?.role}-${i}`}>
               <MessageBubble role={msg?.role} content={msg?.content} images={msg.images || []} /> 
            </div>
        ))}

        {isLoading && <LoadingAnimation/>}

        
      </div>
      }
      <div ref={bottemRef}/>
    </div>
  )
}

export default MessageList

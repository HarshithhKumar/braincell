import { MessageSquare, Sparkles } from 'lucide-react'
import { useSelector } from 'react-redux'

function Nav() {
const {selectedConversation}=useSelector(state=>state.conversation)
const {messages}=useSelector(state=>state.message)
  return (
<>
    <div className='flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.07] px-5 sm:px-8'>
      <div className='flex h-8 w-8 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.08]'>
        {selectedConversation ? <MessageSquare size={14} className="text-violet-200"/> : <Sparkles size={15} className="text-violet-200"/>}
      </div>
      <div className='min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight text-slate-200'>
        {selectedConversation?.title || "Braincell"}
      </div>
      {selectedConversation && <div className='rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-slate-400'>
        {messages?.length || 0} messages
      </div>
      }
    </div>
  </>
  )
}

export default Nav

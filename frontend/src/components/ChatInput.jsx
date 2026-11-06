import { Code2, FileText, Globe, ImageIcon, MessageSquare, Mic, MicOff, Paperclip, Presentation, Send, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setDraftPrompt, setIsLoading, setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import { useRef } from 'react'


function ChatInput() {
  const [value, setValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("Auto")
  const { selectedConversation } = useSelector(state => state.conversation)
  const { isLoading, draftPrompt } = useSelector(state => state.message)
  const [selectedFile, setSelectedFile] = useState(null)
  const [listening, setListening] = useState(false)
  const [sendError, setSendError] = useState("")
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)
  const textareaRef = useRef(null)
  const dispatch = useDispatch()
  const prompt = (draftPrompt || value).trim()

  useEffect(() => {
    if (draftPrompt) {
      textareaRef.current?.focus()
    }
  }, [draftPrompt, dispatch])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = ""

      for (let index = event.resultIndex; index < event.results.length; index++) {

        transcript += event.results[index][0].transcript
      }
      setValue(transcript)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      setSendError("Voice input is not supported in this browser.")
      return
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setListening(true)
      } catch(error) {
        console.error("Could not start voice input",error)
        setSendError("Could not start voice input.")
      }
    }

  }








  const handleSendMessage = async () => {
    const prompt = (draftPrompt || value).trim()
    if (!prompt || isLoading) return

    setSendError("")
    dispatch(setIsLoading(true))
    try {
      let conversation = selectedConversation
      if (!conversation) {
        dispatch(setMessages([]))
        conversation = await createConversation()
        dispatch(setSelectedConversation(conversation))
        dispatch(addConversation(conversation))
      }

      if (conversation.title === "New Chat") {
        await updateConversation({ id: conversation._id, title: prompt })
        dispatch(setConvTitle({ conversationId: conversation._id, title: prompt.slice(0, 40) }))
      }

      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("conversationId", conversation._id)
      formData.append("agent", selectedAgent.toLowerCase())
      if (selectedFile) formData.append("file", selectedFile)

      dispatch(addMessage({ role: "user", content: prompt, images: [] }))
      setValue("")
      dispatch(setDraftPrompt(""))
      const data = await sendMessage(formData)
      if (!data?.answer) throw new Error("The assistant returned an empty response.")
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ""
      dispatch(setArtifacts(data.artifacts || []))
      dispatch(addMessage({ role: "assistant", content: data.answer, images: data.images || [] }))
    } catch (error) {
      console.error("message send failed", error)
      setSendError(error.response?.data?.message || error.message || "Unable to send your message.")
    } finally {
      dispatch(setIsLoading(false))
    }
  }

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto"
    },

    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat"
    },

    {
      id: "coding",
      icon: Code2,
      label: "Coding"
    },

    {
      id: "pdf",
      icon: FileText,
      label: "PDF"
    },

    {
      id: "ppt",
      icon: Presentation,
      label: "PPT"
    },

    {
      id: "vision",
      icon: ImageIcon,
      label: "Vision"
    },

    {
      id: "search",
      icon: Globe,
      label: "Search"
    }

  ]

  return (
    <div className='w-full overflow-hidden px-4 md:px-8 pb-5 pt-3 bg-transparent'>
      <div className='mx-auto flex max-w-[860px] flex-col gap-2 rounded-2xl border border-violet-300/20 bg-[#17131b]/95 px-4 pt-3.5 pb-3 shadow-[0_12px_55px_rgba(0,0,0,0.2)] transition-colors focus-within:border-violet-300/35'>

        <div className='flex w-full gap-2 pr-2 flex-wrap'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
            flex-shrink-0
            cursor-pointer
            inline-flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-full
            text-xs
            font-medium
            border
            transition-all

            ${isActive
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
                  }
          `}>

                <Icon size={14}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-500"
                  } />

                {agent.label}

              </button>
            )

          })}
        </div>

        {
          selectedFile && <div className='my-3'>

            <div className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2'>
              {
                selectedFile?.type === "application/pdf" ? <FileText size={16}

                  className="text-red-400"
                /> : selectedFile.type.startsWith("image/") && <img src={URL.createObjectURL(selectedFile)} className="h-10 w-10 rounded-xl object-cover mt-3"
                />
              }

              <div>
                <p className='text-xs text-white'>
                  {selectedFile?.name}
                </p>
                <p className='text-[10px] text-slate-500'>
                  {Math.ceil(selectedFile.size)}KB
                </p>

              </div>
              <button className='ml-2' onClick={() => { setSelectedFile(null); fileRef.current.value = "" }}><X size={14} className='text-slate-500 hover:text-white' /></button>
            </div>


          </div>
        }


        <textarea
          placeholder='Ask Anything...'
          ref={textareaRef}
          onChange={(e) => {
            setValue(e.target.value)
            if (draftPrompt) dispatch(setDraftPrompt(""))
          }}
          value={draftPrompt || value}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          aria-label="Message Braincell"
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-100 placeholder:text-slate-500 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={2}
        />
        {sendError && <p role="alert" className='text-xs text-rose-300'>{sendError}</p>}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>

            <input type="file" accept='.pdf,image/*' hidden ref={fileRef} onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                setSelectedFile(file)
              }
            }} />

            <button aria-label="Attach PDF or image" className='flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.07] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer' onClick={() => fileRef.current.click()}>
              <Paperclip size={16} />
            </button>
            <button
              onClick={toggleMic}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              className={`flex items-center justify-center w-8 h-8 rounded-lg  transition-all duration-150 cursor-pointer ${listening ?"bg-red-500 text-white":"text-slate-400 hover:bg-white/[0.05]" }`}>
             {listening?<Mic size={16} />:<MicOff size={16}/>} 
            </button>
          </div>
          <button
            disabled={!prompt || isLoading}
            onClick={handleSendMessage}
            aria-label="Send message"
            className={`flex items-center justify-center w-9 h-9 rounded-xl border-none cursor-pointer transition-all duration-150 ${prompt && !isLoading ? "bg-violet-500 hover:bg-violet-400 text-white shadow-[0_4px_18px_rgba(166,99,215,.3)]" : "bg-white/[0.05] text-slate-600 cursor-not-allowed"}`}>
          <Send size={15} />
        </button>
      </div>
      <p className='pt-1 text-center text-[10px] text-slate-600'>Braincell can make mistakes. Check important information.</p>
    </div>
    </div >
  )
}

export default ChatInput

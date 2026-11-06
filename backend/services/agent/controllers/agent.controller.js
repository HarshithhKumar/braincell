import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"
export const agent=async (req,res,next) => {
    try {
        const {prompt,conversationId,agent}=req.body
        const file=req.file
        const userId=req.headers["x-user-id"]
        if(typeof prompt!=="string" || !prompt.trim() || typeof conversationId!=="string" || !conversationId){
            return res.status(400).json({message:"A prompt and conversation are required."})
        }
        const chatServiceHeaders={"x-user-id":userId}
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"user",content:prompt
        },{headers:chatServiceHeaders})
        const result=await graph.invoke({
            prompt,conversationId,agent,userId,file
        })
       await addMessage(conversationId,"user",prompt)
        await addMessage(conversationId,"assistant",result.aiResponse)
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"assistant",content:result?.aiResponse,images:result?.images,artifacts:result?.artifacts
        },{headers:chatServiceHeaders})
        return res.status(200).json({
            answer:result?.aiResponse,
            images:result?.images,
            artifacts:result?.artifacts
        })
       
    } catch (error) {
       next(error)
    }
}
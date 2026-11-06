import redis from "../../shared/redis/redis.js"

const protect=async (req,res,next) => {
    try {
        const sessionId=req.cookies?.session
        if(!sessionId){
            return res.status(401).json({message:"unauthorized"})
        }
        const session=await redis.get(`session-${sessionId}`)
        if(!session){
            return res.status(401).json({message:"session expired"})
        }
        req.user=JSON.parse(session)
        next()
       
    } catch (error) {
        console.error("session validation error", error)
        return res.status(500).json({message:"Unable to validate session"})
    }
}

export const requireRegisteredUser=(req,res,next)=>{
    if(req.user?.isGuest || !req.user?.userId){
        return res.status(403).json({message:"Sign in to access this feature."})
    }
    return next()
}

export default protect
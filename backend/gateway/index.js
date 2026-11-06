import express from "express"
import dotenv from "dotenv"
import http from "node:http"
import https from "node:https"
import proxy from "express-http-proxy"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect, { requireRegisteredUser } from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"
import redis from "../shared/redis/redis.js"
const port =process.env.PORT

const app=express()
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
app.use(morgan("dev"))
app.use(cookieParser())
const forwardGuestSession=(req,res)=>{
    let target
    try {
        target=new URL("/guest",process.env.AUTH_SERVICE)
    } catch(error) {
        console.error("invalid auth service URL",error)
        return res.status(500).json({message:"Authentication service is unavailable."})
    }

    const transport=target.protocol==="https:"?https:http
    const headers={...req.headers,host:target.host,"x-guest-client-ip":req.ip}
    for(const header of ["connection","keep-alive","proxy-authenticate","proxy-authorization","te","trailer","transfer-encoding","upgrade"]){
        delete headers[header]
    }

    const upstream=transport.request({
        protocol:target.protocol,
        hostname:target.hostname,
        port:target.port || (target.protocol==="https:"?443:80),
        method:"POST",
        path:`${target.pathname}${target.search}`,
        headers
    },(upstreamRes)=>{
        res.statusCode=upstreamRes.statusCode || 502
        for(const [name,value] of Object.entries(upstreamRes.headers)){
            if(value!==undefined && !["connection","keep-alive","transfer-encoding","upgrade"].includes(name.toLowerCase())){
                res.setHeader(name,value)
            }
        }
        upstreamRes.pipe(res)
    })

    upstream.setTimeout(10000,()=>{
        upstream.destroy(new Error("Authentication service timed out"))
    })
    upstream.on("error",(error)=>{
        console.error("guest session upstream request failed",error)
        if(!res.headersSent){
            res.status(502).json({message:"Authentication service is unavailable."})
        }else if(!res.destroyed){
            res.destroy(error)
        }
    })
    req.on("aborted",()=>upstream.destroy())
    res.on("close",()=>{
        if(!res.writableFinished) upstream.destroy()
    })
    req.pipe(upstream)
}

app.get("/api/auth/logout",async (req,res)=>{
    try {
        const sessionId=req.cookies?.session
        if(sessionId) await redis.del(`session-${sessionId}`)
        res.clearCookie("session",{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict"
        })
        return res.status(200).json({message:"logout successfully"})
    } catch(error) {
        console.error("logout error",error)
        return res.status(500).json({message:"Unable to sign out."})
    }
})
const authProxy=proxy(process.env.AUTH_SERVICE,{
    parseReqBody:false,
})

app.post("/api/auth/guest",forwardGuestSession)
app.use("/api/auth",(req,res,next)=>{
    if(req.method!=="POST" || req.path!=="/login"){
        return res.status(404).json({message:"Not found"})
    }
    return next()
},authProxy)
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE))
app.use("/api/agent",protect,async (req,res,next)=>{
    if(!req.user.isGuest) return next()

    try {
        const day=new Date().toISOString().slice(0,10)
        const key=`guest-usage:${req.user.userId}:${day}`
        const count=await redis.eval(
            "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count",
            1,
            key,
            24*60*60
        )
        if(count>30){
            return res.status(429).json({
                message:"You have reached the daily guest message limit. Sign in to continue."
            })
        }
        return next()
    } catch(error) {
        console.error("guest usage limit error",error)
        return res.status(500).json({message:"Unable to verify guest usage limit"})
    }
},proxyWithHeader(process.env.AGENT_SERVICE))
app.use("/api/billing",protect,requireRegisteredUser,proxyWithHeader(process.env.BILLING_SERVICE))
app.get("/api/me",protect,getCurrentUser)
app.get("/",(req,res)=>{
    res.json({message:"hello from gateway v5"})
})

app.listen(port,()=>{
    console.log(`gateway started at ${port}`)
})

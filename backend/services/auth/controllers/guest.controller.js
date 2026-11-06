import { createHash, randomUUID } from "crypto"
import redis from "../../../shared/redis/redis.js"

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60
const GUEST_BOOTSTRAP_LIMIT = 120

export const createGuestSession = async (req, res) => {
    try {
        const ipHash = createHash("sha256")
            .update(req.headers["x-guest-client-ip"] || req.socket.remoteAddress || "unknown")
            .digest("hex")
        const day = new Date().toISOString().slice(0, 10)
        const key = `guest-bootstrap:${ipHash}:${day}`
        const count = await redis.eval(
            "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count",
            1,
            key,
            24 * 60 * 60
        )

        if (count > GUEST_BOOTSTRAP_LIMIT) {
            return res.status(429).json({
                message: "Guest sessions are temporarily limited for this network. Please try again later or sign in."
            })
        }

        const sessionId = randomUUID()
        const userId = `guest:${randomUUID()}`
        const guestUser = {
            userId,
            name: "Guest",
            plan: "guest",
            isGuest: true
        }

        await redis.set(
            `session-${sessionId}`,
            JSON.stringify(guestUser),
            "EX",
            SESSION_TTL_SECONDS
        )

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: SESSION_TTL_SECONDS * 1000
        })

        return res.status(200).json(guestUser)
    } catch (error) {
        console.error("create guest session error", error)
        return res.status(500).json({ message: "Unable to start a guest session." })
    }
}

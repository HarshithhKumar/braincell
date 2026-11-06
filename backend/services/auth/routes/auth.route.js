import express from "express"
import { deductCredits, login, logOut, updateUserPayment } from "../controllers/auth.controller.js"
import { createGuestSession } from "../controllers/guest.controller.js"

const router=express.Router()

router.post("/login",login)
router.post("/guest",createGuestSession)
router.get("/logout",logOut)
router.post("/update-plan",updateUserPayment)
router.post("/deduct-credits",deductCredits)
export default router
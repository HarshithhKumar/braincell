import { AnimatePresence, motion } from "motion/react"
import { Crown, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { createOrder } from '../features/createOrder'
import { verifyPayment } from '../features/verifyPayment'
import getCurrentUser from '../features/getCurrentUser'
import { setUserdata } from '../redux/userSlice'
function BillingDrawer({ open, onClose }) {

    const { userData } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [billingError,setBillingError]=useState("")

    const handleUpgrade = async (plan) => {
        setBillingError("")
        try {
            const data = await createOrder(plan)
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data?.order?.amount,
                currency: data?.order?.currency,
                name: "Braincell",
                description: `${data?.plan?.name} Plan`,
                order_id: data?.order?.id,
                handler: async (response) => {
                    try {
                        await verifyPayment(response)
                        const updatedUser = await getCurrentUser()
                        if(updatedUser) dispatch(setUserdata(updatedUser))
                    } catch (error) {
                        console.error("Payment verification failed",error)
                        setBillingError(error.response?.data?.message || "Payment verification failed. Please contact support if you were charged.")
                    }
                },
                theme: {
                    color: "#4F46E5"
                }
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error) {
            console.error("Could not start checkout",error)
            setBillingError(error.response?.data?.message || error.message || "Could not start checkout.")
        }
    }
    return (
        <AnimatePresence>
            {open && <> <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: .5 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black z-40"
            />
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: .25 }}
                    className="fixed right-0 top-0 z-50 h-dvh w-[min(100vw,380px)] bg-[#100e14] border-l border-white/10 shadow-2xl flex flex-col"

                >

                    <div className='flex items-center justify-between p-5 border-b border-white/10'>
                        <div>
                            <div className='text-white text-lg font-semibold'>
                                Billing
                            </div>
                            <div className='text-slate-400 text-sm'>
                                Plans & Credits
                            </div>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                        >
                            <X size={18} className="text-slate-300" />
                        </button>
                    </div>

                    {billingError && <p role="alert" className='mx-5 mt-4 rounded-lg border border-rose-300/15 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-200'>{billingError}</p>}

                    <div className='p-5'>
                        <div className='rounded-xl bg-white/[0.04] border border-white/10 p-4'>
                            <div className='flex justify-between items-center'>
                                <div>
                                    <p className='text-slate-400 text-sm'>
                                        Current Plan
                                    </p>
                                    <h3 className='text-white text-xl font-bold'>
                                        {userData?.plan || "free"}
                                    </h3>
                                </div>
                                <Crown className='text-yellow-400' />
                            </div>

                            <div className='mt-5'>
                                <div className='flex justify-between text-xs text-slate-400 mb-2'>
                                    <span>Credits</span>
                                    <span>{userData?.credits || 0}/{userData?.totalCredits || 100}</span>
                                </div>

                                <div className='h-2 rounded-full bg-white/10 overflow-hidden'>
                                    <div className="h-full bg-indigo-500 transition-all duration-500"
                                        style={{
                                            width: `${(
                                                (userData?.credits || 0) /
                                                (userData?.totalCredits || 1)
                                            ) * 100
                                                }%`
                                        }}
                                    />
                                </div>


                            </div>



                        </div>
                    </div>

                    <div className='px-5 flex-1 overflow-auto space-y-4'>

                        <div className='rounded-xl border border-white/10 p-4'>
                            <h3 className='text-white font-semibold'>Starter Plan</h3>
                            <p className='text-indigo-400 text-2xl font-bold mt-2'>₹199</p>
                            <p className='text-slate-400 text-sm mt-1'>500 Credits</p>
                            <button className='mt-4 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2 text-white' onClick={() => handleUpgrade("starter")}>Upgrade</button>
                        </div>
                        <div className='rounded-xl border border-white/10 p-4'>
                            <h3 className='text-white font-semibold'>Pro Plan</h3>
                            <p className='text-indigo-400 text-2xl font-bold mt-2'>₹499</p>
                            <p className='text-slate-400 text-sm mt-1'>1000 Credits</p>
                            <button className='mt-4 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2 text-white' onClick={() => handleUpgrade("pro")}>Upgrade</button>
                        </div>
                    </div>








                </motion.div>
            </>
            }

        </AnimatePresence>
    )
}

export default BillingDrawer

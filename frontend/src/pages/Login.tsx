import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
    ArrowLeft, Eye, EyeOff, RotateCcw, MessageCircle,
    Zap, Shield, Bot, Sparkles, CheckCircle2,
    Mail, Lock, KeyRound, Fingerprint, ArrowRight,
    Users, Clock, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/use-auth"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

// Stats for the hero side
const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: MessageCircle, value: "1M+", label: "Messages Sent" },
    { icon: Star, value: "4.9", label: "User Rating" },
]

export default function Login() {
    const navigate = useNavigate()
    const { login, loginWithOtp, user } = useAuth()

    const [pwEmail, setPwEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [pwLoading, setPwLoading] = useState(false)

    const [otpEmail, setOtpEmail] = useState("")
    const [otpCode, setOtpCode] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [otpCountdown, setOtpCountdown] = useState(0)
    const [otpLoading, setOtpLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<"password" | "otp">("password")
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (user) navigate("/user/conversations", { replace: true })
    }, [user, navigate])

    useEffect(() => {
        if (otpCountdown > 0) {
            countdownRef.current = setInterval(() => {
                setOtpCountdown((c) => {
                    if (c <= 1) {
                        clearInterval(countdownRef.current!)
                        return 0
                    }
                    return c - 1
                })
            }, 1000)
        }
        return () => clearInterval(countdownRef.current!)
    }, [otpCountdown])

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pwEmail || !password) {
            toast.error("Please fill in all fields.")
            return
        }
        setPwLoading(true)
        try {
            await login(pwEmail.trim(), password)
            toast.success("Welcome back! 🎉")
            navigate("/user/conversations", { replace: true })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Login failed. Try again.")
        } finally {
            setPwLoading(false)
        }
    }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otpEmail) {
            toast.error("Please enter your email address.")
            return
        }
        setOtpLoading(true)
        try {
            await authApi.sendOtp(otpEmail.trim())
            setOtpSent(true)
            setOtpCountdown(60)
            toast.success("OTP sent! Check your inbox 📧")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send OTP.")
        } finally {
            setOtpLoading(false)
        }
    }

    const handleOtpLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otpCode.length !== 6) {
            toast.error("Please enter the complete 6-digit OTP.")
            return
        }
        setOtpLoading(true)
        try {
            await loginWithOtp(otpEmail.trim(), otpCode)
            toast.success("Logged in successfully! 🎉")
            navigate("/user/conversations", { replace: true })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Invalid OTP. Try again.")
        } finally {
            setOtpLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (otpCountdown > 0) return
        setOtpCode("")
        setOtpLoading(true)
        try {
            await authApi.sendOtp(otpEmail.trim())
            setOtpCountdown(60)
            toast.success("OTP resent! Check your inbox 📧")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to resend OTP.")
        } finally {
            setOtpLoading(false)
        }
    }

    return (
        <div className="h-full overflow-hidden flex flex-col lg:flex-row bg-background">
            {/* Left Panel - Hero/Brand Section */}
            <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 flex-col justify-between overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                            <MessageCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">ChatnovaAI</h1>
                            <p className="text-white/70 text-sm">Next-Gen Communication</p>
                        </div>
                    </div>

                    <div className="mt-16 space-y-6">
                        <h2 className="text-5xl font-bold text-white leading-tight">
                            Connect with the<br />
                            <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-2xl inline-block">World Instantly</span>
                        </h2>
                        <p className="text-white/80 text-lg max-w-md leading-relaxed">
                            Experience real-time messaging with AI-powered features and end-to-end encryption.
                        </p>

                        {/* Feature pills */}
                        <div className="flex flex-wrap gap-3 mt-6">
                            {[
                                { icon: Zap, label: "Lightning Fast" },
                                { icon: Shield, label: "Secure" },
                                { icon: Bot, label: "AI Powered" }
                            ].map((item, i) => {
                                const Icon = item.icon
                                return (
                                    <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-white" />
                                        <span className="text-white/90 text-sm font-medium">{item.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex justify-between border-t border-white/20 pt-8">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon
                        return (
                            <div key={i} className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Icon className="w-5 h-5 text-white/60" />
                                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                                </div>
                                <p className="text-white/60 text-sm mt-1">{stat.label}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 lg:w-1/2 h-full overflow-y-auto flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background to-secondary/20">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex flex-col items-center text-center">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
                            <h1 className="text-2xl font-bold">ChatnovaAI</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
                    </div>

                    {/* Welcome card */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/40 shadow-2xl p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Welcome Back
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Choose your preferred way to sign in
                            </p>
                        </div>

                        <Tabs
                            defaultValue="password"
                            value={activeTab}
                            onValueChange={(v) => setActiveTab(v as "password" | "otp")}
                            className="w-full"
                        >
                            <TabsList className="w-full grid grid-cols-2 mb-6 p-1 bg-secondary/30 rounded-2xl">
                                <TabsTrigger
                                    value="password"
                                    className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Password
                                </TabsTrigger>
                                <TabsTrigger
                                    value="otp"
                                    className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200"
                                >
                                    <Fingerprint className="w-4 h-4 mr-2" />
                                    OTP
                                </TabsTrigger>
                            </TabsList>

                            {/* Password Tab */}
                            <TabsContent value="password" className="mt-0">
                                <form onSubmit={handlePasswordLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pw-email" className="text-sm font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="pw-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                value={pwEmail}
                                                onChange={(e) => setPwEmail(e.target.value)}
                                                disabled={pwLoading}
                                                className="pl-10 h-12 rounded-xl border-2 focus:border-primary/50 transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="pw-password" className="text-sm font-medium">
                                                Password
                                            </Label>
                                            <Link
                                                to="/forgot-password"
                                                className="text-xs text-primary hover:text-primary/80 transition-colors hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="pw-password"
                                                type={showPass ? "text" : "password"}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={pwLoading}
                                                className="pl-10 pr-10 h-12 rounded-xl border-2 focus:border-primary/50 transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowPass((v) => !v)}
                                                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02] text-base"
                                        disabled={pwLoading}
                                    >
                                        {pwLoading ? (
                                            <>
                                                <Spinner className="w-4 h-4 mr-2" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* OTP Tab */}
                            <TabsContent value="otp" className="mt-0">
                                <div className="space-y-4">
                                    {!otpSent ? (
                                        <form onSubmit={handleSendOtp} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="otp-email" className="text-sm font-medium">
                                                    Email Address
                                                </Label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        id="otp-email"
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        autoComplete="email"
                                                        value={otpEmail}
                                                        onChange={(e) => setOtpEmail(e.target.value)}
                                                        disabled={otpLoading}
                                                        className="pl-10 h-12 rounded-xl border-2 focus:border-primary/50 transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                                <KeyRound className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    We'll send a one-time password to your email.
                                                    Valid for <span className="font-medium text-foreground">5 minutes</span>.
                                                </p>
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02] text-base"
                                                disabled={otpLoading}
                                            >
                                                {otpLoading ? (
                                                    <>
                                                        <Spinner className="w-4 h-4 mr-2" />
                                                        Sending OTP...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        Send OTP
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleOtpLogin} className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-medium">Enter OTP</Label>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {otpEmail}
                                                    </span>
                                                </div>
                                                <div className="flex justify-center py-2">
                                                    <InputOTP
                                                        maxLength={6}
                                                        value={otpCode}
                                                        onChange={setOtpCode}
                                                        disabled={otpLoading}
                                                    >
                                                        <InputOTPGroup className="gap-2">
                                                            {[...Array(6)].map((_, i) => (
                                                                <InputOTPSlot
                                                                    key={i}
                                                                    index={i}
                                                                    className="w-12 h-14 text-lg font-semibold border-2 rounded-xl transition-all duration-200 data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20"
                                                                />
                                                            ))}
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                                {otpCode.length === 6 && (
                                                    <div className="flex items-center justify-center gap-1 text-xs text-green-500 animate-in fade-in">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        OTP complete
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02] text-base"
                                                disabled={otpLoading || otpCode.length !== 6}
                                            >
                                                {otpLoading ? (
                                                    <>
                                                        <Spinner className="w-4 h-4 mr-2" />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Fingerprint className="w-4 h-4 mr-2" />
                                                        Verify & Login
                                                    </>
                                                )}
                                            </Button>
                                            <div className="flex items-center justify-between text-xs pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => { setOtpSent(false); setOtpCode("") }}
                                                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 hover:underline"
                                                >
                                                    <ArrowLeft className="w-3 h-3" />
                                                    Change email
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleResendOtp}
                                                    disabled={otpCountdown > 0 || otpLoading}
                                                    className="flex items-center gap-1.5 hover:opacity-80 disabled:opacity-40 transition-opacity text-primary font-medium"
                                                >
                                                    <RotateCcw className={`w-3 h-3 ${otpCountdown > 0 ? 'animate-spin' : ''}`} />
                                                    {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend OTP"}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border/40"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-card/50 backdrop-blur-sm text-xs text-muted-foreground">New here?</span>
                            </div>
                        </div>

                        {/* Sign up link */}
                        <Link to="/signup">
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl border-2 hover:bg-secondary/50 transition-all duration-200 hover:scale-[1.02] text-base"
                            >
                                Create New Account
                            </Button>
                        </Link>
                    </div>

                    {/* Back to home */}
                    <div className="text-center">
                        <Link to="/">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors group">
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, ArrowLeft, MessageCircle, Zap, Shield, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

// Feature cards shown on the side panel for large screens
const features = [
    {
        title: "Lightning fast",
        desc: "Messages delivered instantly via WebSocket connections.",
        icon: Zap,
    },
    {
        title: "Private & secure",
        desc: "Your conversations stay between you and the people you trust.",
        icon: Shield,
    },
    {
        title: "Personal AI",
        desc: "Chat with your own AI assistant, powered by Gemini.",
        icon: Bot,
    },
    {
        title: "Passwordless",
        desc: "Sign in instantly with a one-time code sent to your inbox.",
        icon: MessageCircle,
    },
]

export default function SignUp() {
    const navigate = useNavigate()
    const { register, user } = useAuth()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate("/user/conversations", { replace: true })
    }, [user, navigate])

    const validate = () => {
        if (!name.trim()) return "Please enter your name."
        if (!email.trim()) return "Please enter your email address."
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address."
        if (password.length < 6) return "Password must be at least 6 characters."
        if (password !== confirmPassword) return "Passwords do not match."
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const validationError = validate()
        if (validationError) {
            toast.error(validationError)
            return
        }
        setLoading(true)
        try {
            await register(name.trim(), email.trim().toLowerCase(), password)
            navigate("/user/conversations", { replace: true })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Registration failed. Try again.")
        } finally {
            setLoading(false)
        }
    }

    const passwordStrength = () => {
        if (!password) return null
        if (password.length < 6) return { level: 1, label: "Weak", color: "bg-destructive" }
        if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
            return { level: 2, label: "Fair", color: "bg-amber-400" }
        return { level: 3, label: "Strong", color: "bg-green-500" }
    }
    const strength = passwordStrength()

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* ── Left Side Marketing Panel (Hidden on Mobile) ─────── */}
            <div className="hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-zinc-50 relative">
                {/* Background Gradient Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-zinc-950 to-zinc-950 opacity-80" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
                        <MessageCircle className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">ChatnovaAI</span>
                </div>

                <div className="relative z-10 mb-12 mt-auto max-w-lg">
                    <h1 className="mb-8 text-4xl font-semibold tracking-tight text-white leading-tight">
                        Chat with anyone, anywhere, <span className="text-primary">instantly.</span>
                    </h1>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <div key={feature.title} className="flex flex-col gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                        <Icon className="h-5 w-5 text-zinc-200" />
                                    </div>
                                    <h3 className="text-sm font-medium text-zinc-100">{feature.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-sm text-zinc-500">
                    <p>© {new Date().getFullYear()} ChatnovaAI Inc.</p>
                </div>
            </div>

            {/* ── Right Side Form Panel ────────────────────────────── */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
                {/* Mobile specific back button positioned at top left */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Brand Header */}
                    <div className="flex flex-col items-center gap-4 lg:hidden mb-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                            <MessageCircle className="h-7 w-7 text-primary" strokeWidth={1.8} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">ChatnovaAI</h1>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                            Create an account
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Fill in your details below to get started
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Jane Doe"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="h-11 pr-10"
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

                            {/* Strength bar */}
                            {strength && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : "bg-muted"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground flex justify-between">
                                        <span>Password strength:</span>
                                        <span className={`font-medium ${strength.level === 3 ? "text-green-500" : "text-foreground"}`}>
                                            {strength.label}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    className={`h-11 pr-10 ${confirmPassword && confirmPassword !== password
                                        ? "border-destructive focus-visible:ring-destructive/20"
                                        : ""
                                        }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== password && (
                                <p className="text-xs font-medium text-destructive mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base bg-primary hover:bg-primary/90 mt-2"
                            disabled={loading}
                        >
                            {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                            {loading ? "Creating account…" : "Create account"}
                        </Button>
                    </form>

                    {/* Footer links */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                                Sign in here
                            </Link>
                        </p>

                        <div className="hidden lg:block">
                            <Link to="/">
                                <Button variant="link" size="sm" className="text-muted-foreground">
                                    <ArrowLeft className="w-3 h-3 mr-2" />
                                    Back to home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
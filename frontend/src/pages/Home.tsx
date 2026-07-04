import { Button } from "@/components/ui/button"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react"

const Home = () => {
    const { user } = useAuth()

    if (user) return <Navigate to="/user/conversations" replace />

    return (
        <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="flex-1 flex flex-col space-y-12 items-center justify-center relative z-10">
                {/* Logo/Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-full border border-primary/20 shadow-2xl">
                        <MessageSquare className="w-16 h-16 text-primary" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Title with gradient */}
                <div className="text-center space-y-4">
                    <h1 className="font-bold text-6xl lg:text-8xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
                        ChatnovaAI
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary/60" />
                        <p className="text-xl text-muted-foreground font-light tracking-wide">
                            Next-Gen AI Chat Experience
                        </p>
                        <Sparkles className="w-5 h-5 text-primary/60" />
                    </div>
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary/80">
                        ✨ AI-Powered
                    </span>
                    <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary/80">
                        🚀 Real-time
                    </span>
                    <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary/80">
                        🔒 Secure
                    </span>
                </div>

                {/* Action buttons with hover effects */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link to="/signup">
                        <Button
                            size={"lg"}
                            className="group p-6 lg:p-7 text-base lg:text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                        >
                            Get Started
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button
                            className="p-6 lg:p-7 text-base lg:text-xl bg-background hover:bg-secondary border-2 border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-primary/10 transition-all duration-300"
                            variant={"outline"}
                            size={"lg"}
                        >
                            Sign In
                        </Button>
                    </Link>
                </div>

                {/* Trust indicator */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Join 10,000+ users</span>
                </div>
            </div>

            {/* Footer with gradient */}
            <div className="p-4 border-t border-primary/5 bg-gradient-to-r from-transparent via-primary/5 to-transparent relative z-10">
                <p className="text-center text-sm lg:text-base text-muted-foreground/70">
                    © 2026 ChatnovaAI. Crafted with ❤️ by{" "}
                    <a
                        href="https://porfolio-akshay.netlify.app/"
                        target="_blank"
                        className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline underline-offset-2"
                    >
                        Akshay Singh
                    </a>
                </p>
            </div>

            {/* Add this CSS for gradient animation */}
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    )
}

export default Home
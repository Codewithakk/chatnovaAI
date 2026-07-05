import { useState, useRef, useEffect } from "react"
import {
    Camera,
    Pencil,
    Check,
    X,
    Eye,
    EyeOff,
    Loader2,
    Trash2,
    Sun,
    Moon,
    Monitor,
    User as UserIcon,
    Mail,
    Shield,
    Bell,
    Palette,
    Key,
    LogOut,
    AlertTriangle,
    Info,
    CheckCircle,
    Settings2,
    Languages,
    Clock,
    Globe
} from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { userApi } from "@/lib/api"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

/* ─── localStorage keys ─────────────────────────────────────────────────── */
export const LS_NOTIF_BANNERS = "notif-banners-enabled"
export const LS_NOTIF_SOUND = "notif-sound-enabled"
export const LS_LAST_ACTIVE = "last-active-timestamp"

const getStoredBool = (key: string, fallback = true): boolean => {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === "true"
}

/* ─── Password Strength Indicator ──────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
    const getStrength = (pwd: string): { score: number; label: string; color: string } => {
        if (!pwd) return { score: 0, label: "Empty", color: "bg-gray-200" }

        let score = 0
        if (pwd.length >= 6) score++
        if (pwd.length >= 10) score++
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
        if (/\d/.test(pwd)) score++
        if (/[^a-zA-Z0-9]/.test(pwd)) score++

        const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
        const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]
        return { score: Math.min(score, 4), label: labels[Math.min(score, 4)], color: colors[Math.min(score, 4)] }
    }

    const strength = getStrength(password)
    const percentage = ((strength.score + 1) / 5) * 100

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Password Strength</span>
                <span className={cn(
                    "text-xs font-medium",
                    strength.score <= 1 && "text-red-500",
                    strength.score === 2 && "text-orange-500",
                    strength.score === 3 && "text-blue-500",
                    strength.score >= 4 && "text-green-500"
                )}>
                    {strength.label}
                </span>
            </div>
            <Progress value={percentage} className="h-1.5" indicatorClassName={strength.color} />
        </div>
    )
}

/* ─── inline-editable field with enhanced UI ────────────────────────────── */
function EditableField({
    label,
    value,
    onSave,
    multiline = false,
    icon = null,
    placeholder = "Not set",
}: {
    label: string
    value: string
    onSave: (v: string) => Promise<void>
    multiline?: boolean
    icon?: React.ReactNode
    placeholder?: string
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (draft.trim() === value) { setEditing(false); return }
        setSaving(true)
        try {
            await onSave(draft.trim())
            setEditing(false)
            toast.success(`${label} updated successfully`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to update ${label}`)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => { setDraft(value); setEditing(false) }

    return (
        <div className="space-y-1.5 group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-muted-foreground">{icon}</span>}
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {label}
                    </Label>
                </div>
                {!editing && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => { setDraft(value); setEditing(true) }}
                                    className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                                >
                                    <Pencil className="size-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit {label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {editing ? (
                <div className="flex gap-2 items-start">
                    {multiline ? (
                        <textarea
                            autoFocus
                            rows={3}
                            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={placeholder}
                        />
                    ) : (
                        <Input
                            autoFocus
                            className="flex-1 transition-all focus-visible:ring-2"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel() }}
                            placeholder={placeholder}
                        />
                    )}
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={saving}
                            className="h-9 w-9"
                        >
                            <X className="size-4" />
                        </Button>
                        <Button
                            size="icon"
                            onClick={handleSave}
                            disabled={saving}
                            className="h-9 w-9"
                        >
                            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className={cn(
                    "text-sm leading-relaxed",
                    value ? "text-foreground" : "text-muted-foreground italic"
                )}>
                    {value || placeholder}
                </p>
            )}
        </div>
    )
}

/* ─── password field with show/hide and strength ────────────────────── */
function PasswordInput({
    id,
    label,
    value,
    onChange,
    placeholder,
    showStrength = false,
}: {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    showStrength?: boolean
}) {
    const [show, setShow] = useState(false)
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pr-10 transition-all focus-visible:ring-2"
                />
                <button
                    type="button"
                    onClick={() => setShow((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
            {showStrength && value && <PasswordStrength password={value} />}
        </div>
    )
}

/* ─── main component ─────────────────────────────────────────────────────────── */
const UserProfile = () => {
    const { user, setUser, logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [avatarUploading, setAvatarUploading] = useState(false)

    // password-change form
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [pwSaving, setPwSaving] = useState(false)

    // notification preferences
    const [bannersEnabled, setBannersEnabled] = useState(() => getStoredBool(LS_NOTIF_BANNERS))
    const [soundEnabled, setSoundEnabled] = useState(() => getStoredBool(LS_NOTIF_SOUND))
    const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(
        () => user?.emailNotificationsEnabled ?? true
    )
    const [emailNotifsLoading, setEmailNotifsLoading] = useState(false)

    // delete account dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [deleting, setDeleting] = useState(false)

    // active tab
    const [activeTab, setActiveTab] = useState("profile")

    // Track last active
    useEffect(() => {
        localStorage.setItem(LS_LAST_ACTIVE, new Date().toISOString())
    }, [])

    if (!user) return null

    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?"

    const hasCustomPhoto = user.profilePic && !user.profilePic.includes("ui-avatars.com")

    /* ── profile-pic remove ─────────────────────────────────────────────── */
    const handleRemoveAvatar = async () => {
        const defaultUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&bold=true`
        setAvatarUploading(true)
        try {
            await userApi.updateProfile({ profilePic: defaultUrl })
            setUser({ ...user, profilePic: defaultUrl })
            toast.success("Profile photo removed")
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to remove photo")
        } finally {
            setAvatarUploading(false)
        }
    }

    /* ── profile-pic upload ─────────────────────────────────────────────── */
    const handleAvatarChange = async (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return }
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be less than 5MB"); return }
        setAvatarUploading(true)
        try {
            const { url, fields } = await userApi.getPresignedUrl(file.name, file.type) as { url: string; fields: Record<string, string> }

            const form = new FormData()
            Object.entries(fields).forEach(([k, v]) => form.append(k, v))
            form.append("file", file)

            const upload = await fetch(url, { method: "POST", body: form })
            if (!upload.ok) throw new Error("Upload failed")

            const xml = await upload.text()
            const loc = xml.match(/<Location>(.*?)<\/Location>/)?.[1]
            if (!loc) throw new Error("Could not parse upload location")

            const imageUrl = decodeURIComponent(loc)

            await userApi.updateProfile({ profilePic: imageUrl })
            setUser({ ...user, profilePic: imageUrl })
            toast.success("Profile photo updated")
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Upload failed")
        } finally {
            setAvatarUploading(false)
        }
    }

    /* ── name / about save ──────────────────────────────────────────────── */
    const handleSaveName = async (name: string) => {
        await userApi.updateProfile({ name })
        setUser({ ...user, name })
    }

    const handleSaveAbout = async (about: string) => {
        await userApi.updateProfile({ about })
        setUser({ ...user, about })
    }

    /* ── password change ────────────────────────────────────────────────── */
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all password fields")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match")
            return
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }
        setPwSaving(true)
        try {
            await userApi.updateProfile({ oldpassword: oldPassword, newpassword: newPassword })
            toast.success("Password changed successfully")
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to change password")
        } finally {
            setPwSaving(false)
        }
    }

    /* ── notification toggles ───────────────────────────────────────────── */
    const toggleBanners = (val: boolean) => {
        setBannersEnabled(val)
        localStorage.setItem(LS_NOTIF_BANNERS, String(val))
        toast.success(val ? "Banner notifications enabled" : "Banner notifications disabled")
    }

    const toggleSound = (val: boolean) => {
        setSoundEnabled(val)
        localStorage.setItem(LS_NOTIF_SOUND, String(val))
        toast.success(val ? "Sound notifications enabled" : "Sound notifications disabled")
    }

    const toggleEmailNotifs = async (val: boolean) => {
        setEmailNotifsEnabled(val)
        setEmailNotifsLoading(true)
        try {
            await userApi.updateProfile({ emailNotificationsEnabled: val })
            setUser({ ...user, emailNotificationsEnabled: val })
            toast.success(val ? "Email notifications enabled" : "Email notifications disabled")
        } catch (err) {
            setEmailNotifsEnabled(!val)
            toast.error(err instanceof Error ? err.message : "Failed to update email notifications")
        } finally {
            setEmailNotifsLoading(false)
        }
    }

    /* ── logout ─────────────────────────────────────────────────────────── */
    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    /* ── delete account ─────────────────────────────────────────────────── */
    const handleDeleteAccount = async () => {
        setDeleting(true)
        try {
            await userApi.deleteAccount()
            toast.success("Account deleted successfully")
            logout()
            navigate("/login")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete account")
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    return (
        <TooltipProvider>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-primary/5">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* ── Header ───────────────────────────────────────────── */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Account Settings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your profile, security, and preferences
                        </p>
                    </div>

                    {/* ── Tabs ──────────────────────────────────────────────── */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                            <TabsTrigger value="profile" className="gap-2">
                                <UserIcon className="size-4" />
                                <span className="hidden sm:inline">Profile</span>
                            </TabsTrigger>
                            <TabsTrigger value="security" className="gap-2">
                                <Shield className="size-4" />
                                <span className="hidden sm:inline">Security</span>
                            </TabsTrigger>
                            <TabsTrigger value="preferences" className="gap-2">
                                <Settings2 className="size-4" />
                                <span className="hidden sm:inline">Preferences</span>
                            </TabsTrigger>
                            <TabsTrigger value="account" className="gap-2">
                                <AlertTriangle className="size-4" />
                                <span className="hidden sm:inline">Account</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* ── PROFILE TAB ────────────────────────────────── */}
                        <TabsContent value="profile" className="space-y-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="size-5 text-primary" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>
                                        Your public profile information visible to other users
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <Avatar className="size-28 border-4 border-background shadow-xl">
                                                <AvatarImage src={user.profilePic} alt={user.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-3xl font-semibold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                {avatarUploading
                                                    ? <Loader2 className="size-6 text-white animate-spin" />
                                                    : (
                                                        <div className="flex gap-3">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        disabled={avatarUploading}
                                                                        className="p-2 hover:scale-110 transition-transform bg-white/10 rounded-full backdrop-blur-sm"
                                                                    >
                                                                        <Camera className="size-5 text-white" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Upload photo</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            {hasCustomPhoto && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            onClick={handleRemoveAvatar}
                                                                            disabled={avatarUploading}
                                                                            className="p-2 hover:scale-110 transition-transform bg-white/10 rounded-full backdrop-blur-sm"
                                                                        >
                                                                            <Trash2 className="size-5 text-white" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Remove photo</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    )
                                                }
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); e.target.value = "" }}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">
                                                Hover to upload or remove photo • Max 5MB
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Editable Fields */}
                                    <EditableField
                                        label="Display Name"
                                        value={user.name}
                                        onSave={handleSaveName}
                                        icon={<UserIcon className="size-4" />}
                                        placeholder="Enter your name"
                                    />
                                    <EditableField
                                        label="About"
                                        value={user.about ?? ""}
                                        onSave={handleSaveAbout}
                                        multiline
                                        icon={<Info className="size-4" />}
                                        placeholder="Tell others about yourself"
                                    />
                                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                        <Mail className="size-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{user.email}</p>
                                            <p className="text-xs text-muted-foreground">Email address (cannot be changed)</p>
                                        </div>
                                        {user.isEmailVerified && (
                                            <Badge variant="default" className="gap-1">
                                                <CheckCircle className="size-3" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── SECURITY TAB ───────────────────────────────── */}
                        <TabsContent value="security" className="space-y-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="size-5 text-primary" />
                                        Security
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your password and security settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <PasswordInput
                                            id="old-pw"
                                            label="Current Password"
                                            value={oldPassword}
                                            onChange={setOldPassword}
                                            placeholder="Enter your current password"
                                        />
                                        <PasswordInput
                                            id="new-pw"
                                            label="New Password"
                                            value={newPassword}
                                            onChange={setNewPassword}
                                            placeholder="Enter a new password"
                                            showStrength
                                        />
                                        <PasswordInput
                                            id="confirm-pw"
                                            label="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={setConfirmPassword}
                                            placeholder="Confirm your new password"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={pwSaving}
                                            className="w-full gap-2"
                                        >
                                            {pwSaving ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Updating password...
                                                </>
                                            ) : (
                                                <>
                                                    <Key className="size-4" />
                                                    Change Password
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── PREFERENCES TAB ────────────────────────────── */}
                        <TabsContent value="preferences" className="space-y-4">
                            {/* Theme */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="size-5 text-primary" />
                                        Appearance
                                    </CardTitle>
                                    <CardDescription>
                                        Choose your preferred color theme
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3">
                                        {([
                                            { value: "light", label: "Light", Icon: Sun, desc: "Bright and clean" },
                                            { value: "dark", label: "Dark", Icon: Moon, desc: "Easy on the eyes" },
                                            { value: "system", label: "System", Icon: Monitor, desc: "Follows your device" },
                                        ] as const).map(({ value, label, Icon, desc }) => (
                                            <button
                                                key={value}
                                                onClick={() => setTheme(value)}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all duration-200",
                                                    theme === value
                                                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/50"
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "size-6 transition-transform",
                                                    theme === value && "scale-110"
                                                )} />
                                                <span className="font-semibold">{label}</span>
                                                <span className="text-[10px] text-muted-foreground">{desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notifications */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="size-5 text-primary" />
                                        Notifications
                                    </CardTitle>
                                    <CardDescription>
                                        Control how you receive notifications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="notif-banners" className="text-sm font-medium">
                                                Notification Banners
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Show toast notifications for new messages
                                            </p>
                                        </div>
                                        <Switch
                                            id="notif-banners"
                                            checked={bannersEnabled}
                                            onCheckedChange={toggleBanners}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="notif-sound" className="text-sm font-medium">
                                                Notification Sound
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Play a sound when a new message arrives
                                            </p>
                                        </div>
                                        <Switch
                                            id="notif-sound"
                                            checked={soundEnabled}
                                            onCheckedChange={toggleSound}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="notif-email" className="text-sm font-medium">
                                                Email Notifications
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Receive emails for messages while offline
                                            </p>
                                        </div>
                                        <Switch
                                            id="notif-email"
                                            checked={emailNotifsEnabled}
                                            disabled={emailNotifsLoading}
                                            onCheckedChange={toggleEmailNotifs}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── ACCOUNT TAB ────────────────────────────────── */}
                        <TabsContent value="account" className="space-y-4">
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="size-5" />
                                        Account Actions
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your session or delete your account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-center gap-2 h-11"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="size-4" />
                                        Log Out
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="w-full justify-center gap-2 h-11"
                                        onClick={() => { setDeleteConfirmText(""); setDeleteDialogOpen(true) }}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete My Account
                                    </Button>
                                    <div className="flex items-start gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                                        <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium text-destructive">Warning</p>
                                            <p className="text-xs text-muted-foreground">
                                                Deleting your account is permanent. Your profile will be anonymised, but messages remain visible to other participants.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* ── Delete Account confirmation dialog ─────────────────────── */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="size-5" />
                            Delete Account?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>
                                    This action <strong>cannot be undone</strong>. Your profile will be anonymised —
                                    your name, email, and bio will be cleared, but your messages and conversations
                                    will remain visible to other participants.
                                </p>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Type <strong>DELETE</strong> below to confirm:</p>
                                    <Input
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="DELETE"
                                        className="font-mono"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleteConfirmText !== "DELETE" || deleting}
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="size-4 mr-2" />
                                    Delete Account
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    )
}

export default UserProfile
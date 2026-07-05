import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    Search,
    MessageCircle,
    Bot,
    SquarePen,
    ChevronDown,
    Trash2,
    ShieldX,
    Pin,
    PinOff,
    MoreVertical,
    Check,
    X,
    Loader2,
    Users,
    UserPlus,
    Filter,
    Inbox,
    Wifi,
    WifiOff,
    Clock,
    Star,
    StarOff
} from "lucide-react"
import { useConversations, type Conversation } from "@/hooks/use-conversations"
import { useAuth } from "@/hooks/use-auth"
import { useChat } from "@/hooks/use-chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { userApi, messageApi, conversationApi } from "@/lib/api"
import { toast } from "sonner"
import socket from "@/lib/socket"
import type { User } from "@/hooks/use-auth"
import { Button } from "../ui/button"
import NewChatDialog from "./NewChatDialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { Badge } from "@/components/ui/badge"

/* ─── helpers ──────────────────────────────────────────────────────────── */

function getOtherMember(conv: Conversation, myId: string): User | undefined {
    return conv.members.find((m) => m._id !== myId)
}

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return "now"
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d`
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function initials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

function getStatusColor(user: User | undefined): string {
    if (!user) return "bg-gray-300"
    if (user.isBot) return "bg-blue-500"
    if (user.isOnline) return "bg-green-500"
    return "bg-gray-400"
}

function getStatusLabel(user: User | undefined): string {
    if (!user) return "Offline"
    if (user.isBot) return "AI Assistant"
    if (user.isOnline) return "Online"
    return "Offline"
}

/* ─── skeleton row ─────────────────────────────────────────────────────── */
function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
            <Skeleton className="size-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-3 w-8" />
        </div>
    )
}

/* ─── single conversation row ──────────────────────────────────────────── */
interface RowProps {
    conv: Conversation
    myId: string
    isActive: boolean
    isTyping: boolean
    onClick: () => void
    openDropdownId: string | null
    setOpenDropdownId: (id: string | null) => void
    onToggleBlock: (userId: string, userName: string, isBlocked: boolean) => Promise<void>
    onClearChat: (convId: string) => Promise<void>
    onTogglePin: (convId: string) => Promise<void>
    blockedUsers: Set<string>
}

function ConversationRow({
    conv,
    myId,
    isActive,
    isTyping,
    onClick,
    openDropdownId,
    setOpenDropdownId,
    onToggleBlock,
    onClearChat,
    onTogglePin,
    blockedUsers
}: RowProps) {
    const other = getOtherMember(conv, myId)
    const unread = conv.unreadCounts.find((u) => u.userId === myId)?.count ?? 0
    const name = other?.name ?? "Unknown"
    const preview = isTyping
        ? "typing…"
        : conv.latestmessage || "Start a conversation"
    const dropdownOpen = openDropdownId === conv._id
    const isBlocked = other ? blockedUsers.has(other._id) : false
    const isPinned = conv.isPinned
    const statusColor = getStatusColor(other)
    const statusLabel = getStatusLabel(other)

    return (
        <TooltipProvider>
            <div className="relative group">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={onClick}
                    onKeyDown={(e) => e.key === "Enter" && onClick()}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer",
                        isActive
                            ? "bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/20"
                            : "hover:bg-muted/50",
                        isPinned && !isActive && "bg-muted/20"
                    )}
                >
                    {/* avatar with status indicator */}
                    <div className="relative shrink-0">
                        <Avatar className="size-11 ring-2 ring-background">
                            <AvatarImage src={other?.profilePic} alt={name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold">
                                {other?.isBot ? <Bot className="size-5" /> : initials(name)}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online/Bot status dot with tooltip */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className={cn(
                                        "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ring-background transition-colors duration-300",
                                        statusColor
                                    )}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{statusLabel}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Pin indicator on avatar */}
                        {isPinned && (
                            <span className="absolute -top-1 -right-1">
                                <Pin className="size-3.5 text-primary fill-primary" />
                            </span>
                        )}
                    </div>

                    {/* text content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="truncate text-sm font-semibold leading-tight">
                                    {name}
                                </span>
                                {other?.isBot && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        AI
                                    </Badge>
                                )}
                                {isBlocked && (
                                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">
                                        Blocked
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] text-muted-foreground">
                                    {relativeTime(conv.updatedAt)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-0.5">
                            <p
                                className={cn(
                                    "truncate text-xs transition-colors",
                                    isTyping
                                        ? "text-blue-500 italic flex items-center gap-1"
                                        : unread > 0
                                            ? "text-foreground font-medium"
                                            : "text-muted-foreground"
                                )}
                            >
                                {isTyping ? (
                                    <>
                                        <span className="inline-flex gap-0.5">
                                            <span className="animate-bounce">•</span>
                                            <span className="animate-bounce delay-100">•</span>
                                            <span className="animate-bounce delay-200">•</span>
                                        </span>
                                        typing…
                                    </>
                                ) : (
                                    preview
                                )}
                            </p>
                            {unread > 0 && !isTyping && (
                                <Badge variant="default" className="shrink-0 bg-primary hover:bg-primary text-[10px] font-bold px-2 min-w-5 h-5 rounded-full flex items-center justify-center">
                                    {unread > 99 ? "99+" : unread}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Dropdown menu - visible on hover or active */}
                    {!other?.isBot && (
                        <div className={cn(
                            "shrink-0 transition-all duration-200",
                            dropdownOpen || isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                            <DropdownMenu
                                open={dropdownOpen}
                                onOpenChange={(open) => setOpenDropdownId(open ? conv._id : null)}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 rounded-full hover:bg-muted"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="size-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                        Conversation Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(conv._id) }}>
                                        {isPinned ? (
                                            <>
                                                <PinOff className="size-4" />
                                                <span>Unpin</span>
                                            </>
                                        ) : (
                                            <>
                                                <Pin className="size-4" />
                                                <span>Pin</span>
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); onToggleBlock(other!._id, other!.name, isBlocked) }}
                                        className={isBlocked ? "text-green-600" : "text-destructive"}
                                    >
                                        <ShieldX className="size-4" />
                                        {isBlocked ? "Unblock user" : "Block user"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => { e.stopPropagation(); onClearChat(conv._id) }}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                        Clear chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}

/* ─── main component ───────────────────────────────────────────────────── */
export default function ConversationsList() {
    const { conversationsList, setConversationsList, fetchConversations, isLoading } =
        useConversations()
    const { user } = useAuth()
    const { typingConversations } = useChat()
    const navigate = useNavigate()
    const { id: activeId } = useParams<{ id: string }>()

    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "unread" | "online">("all")
    const [newChatOpen, setNewChatOpen] = useState(false)
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(
        () => new Set((user?.blockedUsers ?? []).map(String))
    )
    const [clearChatDialog, setClearChatDialog] = useState<{ open: boolean; convId: string | null }>({
        open: false,
        convId: null,
    })
    const [isLoadingAction, setIsLoadingAction] = useState(false)

    // toggle block/unblock a user from the conversations list
    const handleToggleBlock = async (userId: string, userName: string, isBlocked: boolean) => {
        setIsLoadingAction(true)
        try {
            if (isBlocked) {
                await userApi.unblockUser(userId)
                setBlockedUsers((prev) => { const s = new Set(prev); s.delete(userId); return s })
                toast.success(`${userName} has been unblocked`, {
                    icon: <Check className="size-4 text-green-500" />,
                })
            } else {
                await userApi.blockUser(userId)
                setBlockedUsers((prev) => new Set(prev).add(userId))
                toast.success(`${userName} has been blocked`, {
                    icon: <ShieldX className="size-4 text-red-500" />,
                })
            }
            setOpenDropdownId(null)
        } catch (error) {
            toast.error(isBlocked ? "Failed to unblock user" : "Failed to block user")
        } finally {
            setIsLoadingAction(false)
        }
    }

    // clear chat from the conversations list
    const handleClearChat = async (convId: string) => {
        if (!convId) return
        setIsLoadingAction(true)
        try {
            await messageApi.clearChat(convId)
            setOpenDropdownId(null)
            setClearChatDialog({ open: false, convId: null })
            toast.success("Chat cleared successfully", {
                icon: <Trash2 className="size-4" />,
            })
            // Update the conversation list to reflect the cleared chat
            setConversationsList((prev) =>
                prev.map((c) =>
                    c._id === convId ? { ...c, latestmessage: null, updatedAt: new Date().toISOString() } : c
                )
            )
        } catch (error) {
            toast.error("Failed to clear chat")
        } finally {
            setIsLoadingAction(false)
        }
    }

    // pin / unpin a conversation
    const handleTogglePin = async (convId: string) => {
        setIsLoadingAction(true)
        try {
            const { isPinned } = await conversationApi.togglePin(convId)
            setConversationsList((prev) => {
                const updated = prev.map((c) =>
                    c._id === convId ? { ...c, isPinned } : c
                )
                // Sort: pinned first, then by updatedAt
                return [
                    ...updated.filter((c) => c.isPinned).sort((a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    ),
                    ...updated.filter((c) => !c.isPinned).sort((a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    )
                ]
            })
            setOpenDropdownId(null)
            toast.success(isPinned ? "Conversation pinned" : "Conversation unpinned")
        } catch (error) {
            toast.error("Failed to update pin")
        } finally {
            setIsLoadingAction(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    // Socket: realtime online/offline status updates
    useEffect(() => {
        if (!user) return

        const updateOnlineStatus = (userId: string, isOnline: boolean) => {
            setConversationsList((prev) =>
                prev.map((conv) => ({
                    ...conv,
                    members: conv.members.map((m) =>
                        m._id === userId ? { ...m, isOnline } : m
                    ),
                }))
            )
        }

        const onUserOnline = ({ userId }: { userId: string }) =>
            updateOnlineStatus(userId, true)
        const onUserOffline = ({ userId }: { userId: string }) =>
            updateOnlineStatus(userId, false)

        socket.on("user-online", onUserOnline)
        socket.on("user-offline", onUserOffline)
        return () => {
            socket.off("user-online", onUserOnline)
            socket.off("user-offline", onUserOffline)
        }
    }, [user, setConversationsList])

    // Derive displayed list (search + tab filter applied to freshest conversationsList)
    const displayList = conversationsList.filter((conv) => {
        const other = getOtherMember(conv, user?._id ?? "")
        if (!other) return false
        if (query.trim() && !other.name.toLowerCase().includes(query.toLowerCase())) return false
        if (filter === "unread") {
            const unread = conv.unreadCounts.find((u) => u.userId === (user?._id ?? ""))?.count ?? 0
            return unread > 0
        }
        if (filter === "online") return !!(other.isBot || other.isOnline)
        return true
    })

    // Group conversations: pinned first, then by date
    const groupedConversations = {
        pinned: displayList.filter(c => c.isPinned),
        recent: displayList.filter(c => !c.isPinned)
    }

    // Get filter counts for badges
    const getFilterCount = (filterType: string) => {
        if (filterType === "all") return conversationsList.length
        if (filterType === "unread") {
            return conversationsList.filter(conv => {
                const unread = conv.unreadCounts.find((u) => u.userId === (user?._id ?? ""))?.count ?? 0
                return unread > 0
            }).length
        }
        if (filterType === "online") {
            return conversationsList.filter(conv => {
                const other = getOtherMember(conv, user?._id ?? "")
                return !!(other?.isBot || other?.isOnline)
            }).length
        }
        return 0
    }

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header with gradient */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                <div className="relative flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Chats
                        </h1>
                        <Badge variant="secondary" className="text-xs">
                            {conversationsList.length}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full hover:bg-primary/10"
                                        onClick={() => setNewChatOpen(true)}
                                    >
                                        <SquarePen className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>New conversation</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />

            {/* Search bar with filter dropdown */}
            <div className="px-4 pb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-9 h-9 text-sm bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter pills with counts */}
            <div className="flex gap-1.5 px-4 pb-3 border-b">
                {(["all", "unread", "online"] as const).map((f) => {
                    const count = getFilterCount(f)
                    return (
                        <Button
                            key={f}
                            onClick={() => setFilter(f)}
                            variant={filter === f ? "default" : "ghost"}
                            className={cn(
                                "rounded-full px-3.5 h-7 text-xs font-medium transition-all duration-200",
                                filter === f
                                    ? "shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f === "all" ? (
                                <Inbox className="size-3 mr-1.5" />
                            ) : f === "unread" ? (
                                <MessageCircle className="size-3 mr-1.5" />
                            ) : (
                                <Wifi className="size-3 mr-1.5" />
                            )}
                            {f === "all" ? "All" : f === "unread" ? "Unread" : "Online"}
                            {count > 0 && (
                                <Badge
                                    variant={filter === f ? "secondary" : "outline"}
                                    className="ml-1.5 text-[9px] px-1.5 py-0 h-4"
                                >
                                    {count}
                                </Badge>
                            )}
                        </Button>
                    )
                })}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                <div className="px-2 py-2 space-y-0.5">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <ConversationSkeleton key={i} />)
                    ) : displayList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[calc(100vh-380px)] gap-3 text-muted-foreground">
                            {query ? (
                                <>
                                    <Search className="size-12 opacity-20" />
                                    <p className="text-sm font-medium">No results found</p>
                                    <p className="text-xs opacity-60">Try adjusting your search</p>
                                </>
                            ) : filter === "unread" ? (
                                <>
                                    <MessageCircle className="size-12 opacity-20" />
                                    <p className="text-sm font-medium">No unread conversations</p>
                                    <p className="text-xs opacity-60">All caught up!</p>
                                </>
                            ) : filter === "online" ? (
                                <>
                                    <WifiOff className="size-12 opacity-20" />
                                    <p className="text-sm font-medium">Nobody is online right now</p>
                                    <p className="text-xs opacity-60">Check back later</p>
                                </>
                            ) : (
                                <>
                                    <Users className="size-12 opacity-20" />
                                    <p className="text-sm font-medium">No conversations yet</p>
                                    <p className="text-xs opacity-60">Start a new chat to connect</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 rounded-full"
                                        onClick={() => setNewChatOpen(true)}
                                    >
                                        <UserPlus className="size-3 mr-2" />
                                        Start chatting
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Pinned conversations */}
                            {groupedConversations.pinned.length > 0 && (
                                <div className="mb-1">
                                    <div className="flex items-center gap-2 px-3 py-1.5">
                                        <Pin className="size-3 text-muted-foreground" />
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                            Pinned
                                        </span>
                                    </div>
                                    {groupedConversations.pinned.map((conv) => (
                                        <ConversationRow
                                            key={conv._id}
                                            conv={conv}
                                            myId={user?._id ?? ""}
                                            isActive={conv._id === activeId}
                                            isTyping={!!typingConversations[conv._id]}
                                            onClick={() => navigate(`/user/conversations/${conv._id}`)}
                                            openDropdownId={openDropdownId}
                                            setOpenDropdownId={setOpenDropdownId}
                                            onToggleBlock={handleToggleBlock}
                                            onClearChat={(convId) => setClearChatDialog({ open: true, convId })}
                                            onTogglePin={handleTogglePin}
                                            blockedUsers={blockedUsers}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Recent conversations */}
                            {groupedConversations.recent.length > 0 && (
                                <div>
                                    {groupedConversations.pinned.length > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-1.5">
                                            <Clock className="size-3 text-muted-foreground" />
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                Recent
                                            </span>
                                        </div>
                                    )}
                                    {groupedConversations.recent.map((conv) => (
                                        <ConversationRow
                                            key={conv._id}
                                            conv={conv}
                                            myId={user?._id ?? ""}
                                            isActive={conv._id === activeId}
                                            isTyping={!!typingConversations[conv._id]}
                                            onClick={() => navigate(`/user/conversations/${conv._id}`)}
                                            openDropdownId={openDropdownId}
                                            setOpenDropdownId={setOpenDropdownId}
                                            onToggleBlock={handleToggleBlock}
                                            onClearChat={(convId) => setClearChatDialog({ open: true, convId })}
                                            onTogglePin={handleTogglePin}
                                            blockedUsers={blockedUsers}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Clear Chat Confirmation Dialog */}
            <AlertDialog
                open={clearChatDialog.open}
                onOpenChange={(open) => setClearChatDialog(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All messages in this conversation will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleClearChat(clearChatDialog.convId!)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isLoadingAction}
                        >
                            {isLoadingAction ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Clearing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="size-4 mr-2" />
                                    Clear Chat
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
<script setup lang="ts">
import {
    LayoutDashboard,
    Info,
    CalendarDays,
    Images,
    Users,
    Mail,
    Award,
    LogOut,
    X,
    Sun,
    Moon,
    User,
} from 'lucide-vue-next'

const props = defineProps<{
    open: boolean
}>()
const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
}>()

const route = useRoute()
const router = useRouter()

const isDark = ref(false)

onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
})

const toggleDark = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('admin-theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
    const saved = localStorage.getItem('admin-theme')
    if (saved === 'dark') {
        isDark.value = true
        document.documentElement.classList.add('dark')
    }
})

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
    // { label: 'Tentang Kami', icon: Info, to: '/admin/about' },
    { label: 'Kegiatan', icon: CalendarDays, to: '/admin/activities' },
    { label: 'Galeri', icon: Images, to: '/admin/galleries' },
    { label: 'Organisasi', icon: Users, to: '/admin/members' },
    { label: 'Pesan Masuk', icon: Mail, to: '/admin/messages' },
    { label: 'SKU & SKK', icon: Award, to: '/admin/sku-skk' },
    { label: 'Twibbon', icon: Images, to: '/admin/twibbon' },
    { label: 'User', icon: Users, to: '/admin/users' },
    { label: 'Profil Saya', icon: User, to: '/admin/profile' },
]

const isActive = (path: string) => {
    if (path === '/admin') return route.path === '/admin'
    return route.path.startsWith(path)
}

const { clearProfile } = useAdminAuth()

const handleLogout = async () => {
    await clearProfile()
    router.push('/auth/login')
}

const closeMobile = () => emit('update:open', false)
</script>

<template>
    <!-- Desktop Sidebar -->
    <aside
        class="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar min-h-screen sticky top-0 h-screen">
        <!-- Brand -->
        <div class="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border shrink-0">
            <div class="w-10 h-10 shrink-0 overflow-hidden">
                <img src="/images/logo.webp" alt="Pramuka Logo" class="w-full h-full object-contain" />
            </div>
            <span class="font-display font-bold text-lg text-sidebar-foreground tracking-tight">Admin Panel</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                :class="isActive(item.to)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'">
                <component :is="item.icon" class="w-4 h-4 shrink-0" />
                {{ item.label }}
            </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="px-3 py-4 border-t border-sidebar-border space-y-1">
            <button @click="toggleDark"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-150 w-full">
                <Sun v-if="isDark" class="w-4 h-4 shrink-0" />
                <Moon v-else class="w-4 h-4 shrink-0" />
                {{ isDark ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <button @click="handleLogout"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-150 w-full">
                <LogOut class="w-4 h-4 shrink-0" />
                Logout
            </button>
        </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <Teleport to="body">
        <Transition name="sidebar-backdrop">
            <div v-if="open" class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" @click="closeMobile" />
        </Transition>
        <Transition name="sidebar-slide">
            <aside v-if="open"
                class="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border shadow-2xl lg:hidden">
                <div class="flex items-center justify-between px-6 h-16 border-b border-sidebar-border shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 shrink-0 overflow-hidden">
                            <img src="/images/logo.webp" alt="Pramuka Logo" class="w-full h-full object-contain" />
                        </div>
                        <span class="font-display font-bold text-lg text-sidebar-foreground">Admin</span>
                    </div>
                    <button @click="closeMobile"
                        class="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/70">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to" @click="closeMobile"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                        :class="isActive(item.to)
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'">
                        <component :is="item.icon" class="w-4 h-4 shrink-0" />
                        {{ item.label }}
                    </NuxtLink>
                </nav>

                <div class="px-3 py-4 border-t border-sidebar-border space-y-1">
                    <button @click="toggleDark"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-150 w-full">
                        <Sun v-if="isDark" class="w-4 h-4 shrink-0" />
                        <Moon v-else class="w-4 h-4 shrink-0" />
                        {{ isDark ? 'Light Mode' : 'Dark Mode' }}
                    </button>
                    <button @click="handleLogout"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-150 w-full">
                        <LogOut class="w-4 h-4 shrink-0" />
                        Logout
                    </button>
                </div>
            </aside>
        </Transition>
    </Teleport>
</template>

<style scoped>
.sidebar-backdrop-enter-active,
.sidebar-backdrop-leave-active {
    transition: opacity 0.2s ease;
}

.sidebar-backdrop-enter-from,
.sidebar-backdrop-leave-to {
    opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
    transition: transform 0.25s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
    transform: translateX(-100%);
}
</style>

<script setup lang="ts">
import { Megaphone, CalendarDays, Images, Users, Loader2 } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useMongoCrud from '~/composables/useMongoCrud'

definePageMeta({ layout: 'admin',middleware:'admin' })
useHead({ title: 'Dashboard Admin', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const activityCount = ref(0)
const galleryCount = ref(0)
const memberCount = ref(0)
const messageCount = ref(0)
const loading = ref(true)

const route = useRoute()
const router = useRouter()

onMounted(async () => {
    if (route.query.already_logged_in) {
        import('vue-sonner').then(({ toast }) => {
            toast.info('Anda sudah login', { id: 'already-logged-in' })
        })
        router.replace({ query: {} })
    }

    try {
        const activityCrud = useMongoCrud('activities')
        const galleryCrud = useMongoCrud('galleries')
        const memberCrud = useMongoCrud('organization_members')
        const messageCrud = useMongoCrud('contact_messages')

        const [a, b, c, d] = await Promise.all([
            activityCrud.fetchCount(),
            galleryCrud.fetchCount(),
            memberCrud.fetchCount(),
            messageCrud.fetchCount(),
        ])

        activityCount.value = a
        galleryCount.value = b
        memberCount.value = c
        messageCount.value = d
    } catch (e) {
        console.error('Failed to load dashboard stats:', e)
    } finally {
        loading.value = false
    }
})

const stats = computed(() => [
    { label: 'Total Kegiatan', value: activityCount.value, icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Galeri Foto', value: galleryCount.value, icon: Images, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Anggota Organisasi', value: memberCount.value, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Pesan Masuk', value: messageCount.value, icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
])
</script>

<template>
    <div class="flex flex-col gap-6">
        <div>
            <h1 class="text-2xl lg:text-3xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
            <p class="text-muted-foreground mt-1">Selamat datang di panel admin Pramuka SMAN 1 Pasawahan.</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card v-for="stat in stats" :key="stat.label" class="border-border/50">
                <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle class="text-sm font-medium text-muted-foreground">{{ stat.label }}</CardTitle>
                    <div :class="[stat.bg, 'h-9 w-9 rounded-lg flex items-center justify-center shrink-0']">
                        <component :is="stat.icon" :class="[stat.color, 'w-4 h-4']" />
                    </div>
                </CardHeader>
                <CardContent>
                    <template v-if="loading">
                        <div class="h-8 w-16 bg-muted animate-pulse rounded" />
                    </template>
                    <div v-else class="text-3xl font-bold text-foreground">{{ stat.value }}</div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

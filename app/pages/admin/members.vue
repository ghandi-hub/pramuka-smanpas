<script setup lang="ts">
import { Plus, Pencil, Trash2, GripVertical, Users } from 'lucide-vue-next'
import ConfirmDialog from '~/components/admin/ConfirmDialog.vue'
import { useMemberService, type OrganizationMember } from '~/services/memberService'

import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Kelola Organisasi', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { data, loading, fetchAllOrdered, insert, update, remove, reorder, uploadPhoto, deleteImage } = useMemberService()

const dialogOpen = ref(false)
const isEditing = ref(false)
const confirmOpen = ref(false)
const deleteTarget = ref<OrganizationMember | null>(null)
const saving = ref(false)
const deleting = ref(false)
const uploading = ref(false)

const form = ref({ name: '', position: '', photo: '' as string | null, order_number: 0 })
const editId = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

const openCreate = () => {
    isEditing.value = false
    editId.value = null
    form.value = { name: '', position: '', photo: null, order_number: data.value.length }
    selectedFile.value = null
    dialogOpen.value = true
}

const openEdit = (item: OrganizationMember) => {
    isEditing.value = true
    editId.value = item.id
    form.value = { name: item.name, position: item.position, photo: item.photo, order_number: item.order_number }
    selectedFile.value = null
    dialogOpen.value = true
}

const openDelete = (item: OrganizationMember) => {
    deleteTarget.value = item
    confirmOpen.value = true
}

const onFileSelected = (file: File) => {
    selectedFile.value = file
}

const handleSave = async () => {
    saving.value = true
    try {
        let photoUrl = form.value.photo
        let oldPhotoUrl: string | null = null

        if (isEditing.value && editId.value) {
            const originalMember = data.value.find(m => m.id === editId.value)
            oldPhotoUrl = originalMember?.photo || null
        }

        if (selectedFile.value) {
            uploading.value = true
            photoUrl = await uploadPhoto(selectedFile.value)
            uploading.value = false
        }

        const payload = {
            name: form.value.name,
            position: form.value.position,
            photo: photoUrl,
            order_number: form.value.order_number,
        }

        if (isEditing.value && editId.value) {
            await update(editId.value, payload)
            toast.success('Anggota berhasil diperbarui')
            if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
                await deleteImage(oldPhotoUrl)
            }
        } else {
            await insert(payload)
            toast.success('Anggota berhasil ditambahkan')
        }
        dialogOpen.value = false
        await fetchAllOrdered()
    } catch (e: any) {
        toast.error(e.message || 'Gagal menyimpan')
    } finally {
        saving.value = false
        uploading.value = false
    }
}

const handleDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await remove(deleteTarget.value.id, deleteTarget.value.photo)
        toast.success('Anggota berhasil dihapus')
        confirmOpen.value = false
        await fetchAllOrdered()
    } catch (e: any) {
        toast.error(e.message || 'Gagal menghapus')
    } finally {
        deleting.value = false
    }
}

// Drag to reorder
const dragIndex = ref<number | null>(null)
const dropIndex = ref<number | null>(null)

const onDragStart = (index: number) => {
    dragIndex.value = index
}

const onDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    dropIndex.value = index
}

const onDrop = async (index: number) => {
    if (dragIndex.value === null || dragIndex.value === index) {
        dragIndex.value = null
        dropIndex.value = null
        return
    }

    const items = [...data.value]
    const [moved] = items.splice(dragIndex.value, 1)
    items.splice(index, 0, moved!)

    // Update local order
    items.forEach((item, i) => {
        item.order_number = i
    })
    data.value = items

    dragIndex.value = null
    dropIndex.value = null

    // Save to MongoDB
    try {
        await reorder(items.map((item, i) => ({ id: item.id, order_number: i })))
        toast.success('Urutan berhasil diperbarui')
    } catch (e: any) {
        toast.error('Gagal menyimpan urutan')
        await fetchAllOrdered()
    }
}

const onDragEnd = () => {
    dragIndex.value = null
    dropIndex.value = null
}

onMounted(() => fetchAllOrdered())
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl lg:text-3xl font-display font-bold text-foreground tracking-tight">Struktur
                    Organisasi</h1>
                <p class="text-muted-foreground mt-1">Kelola anggota organisasi dan urutannya</p>
            </div>
            <Button @click="openCreate">
                <Plus class="w-4 h-4 mr-2" />
                Tambah Anggota
            </Button>
        </div>

        <p class="text-sm text-muted-foreground flex items-center gap-2">
            <GripVertical class="w-4 h-4" /> Seret untuk mengubah urutan anggota
        </p>

        <!-- Loading skeleton -->
        <div v-if="loading" class="space-y-2">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
                <div class="w-5 h-5 rounded bg-muted animate-pulse shrink-0" />
                <div class="h-12 w-12 rounded-full overflow-hidden bg-muted animate-pulse shrink-0" />
                <div class="flex-1 min-w-0 space-y-2">
                    <div class="h-4 bg-muted animate-pulse rounded w-1/3" />
                    <div class="h-3 bg-muted animate-pulse rounded w-1/4" />
                </div>
                <div class="flex gap-2">
                    <div class="h-8 w-8 rounded bg-muted animate-pulse" />
                    <div class="h-8 w-8 rounded bg-muted animate-pulse" />
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="data.length === 0" class="text-center py-16 text-muted-foreground">
            <Users class="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p class="text-lg font-medium">Belum ada anggota</p>
            <p class="text-sm mt-1">Klik "Tambah Anggota" untuk menambahkan.</p>
        </div>

        <!-- Member list (draggable) -->
        <div v-else class="space-y-2">
            <div v-for="(member, index) in data" :key="member.id" :draggable="true" @dragstart="onDragStart(index)"
                @dragover="(e) => onDragOver(e, index)" @drop="onDrop(index)" @dragend="onDragEnd" :class="[
                    'flex items-center gap-4 p-4 rounded-lg border bg-card transition-all cursor-grab active:cursor-grabbing',
                    dropIndex === index ? 'border-primary shadow-md' : 'border-border hover:border-border/80 hover:shadow-sm',
                    dragIndex === index ? 'opacity-50' : ''
                ]">
                <!-- Drag handle -->
                <GripVertical class="w-5 h-5 text-muted-foreground shrink-0" />

                <!-- Avatar -->
                <div class="h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0">
                    <img v-if="member.photo" :src="member.photo" :alt="member.name"
                        class="w-full h-full object-cover" />
                    <div v-else
                        class="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-lg">
                        {{ member.name.charAt(0) }}
                    </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-foreground truncate">{{ member.name }}</p>
                    <p class="text-sm text-muted-foreground truncate">{{ member.position }}</p>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click.stop="openEdit(member)">
                        <Pencil class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive"
                        @click.stop="openDelete(member)">
                        <Trash2 class="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>

        <!-- Create/Edit Dialog -->
        <Dialog v-model:open="dialogOpen">
            <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{{ isEditing ? 'Edit Anggota' : 'Tambah Anggota' }}</DialogTitle>
                </DialogHeader>
                <form @submit.prevent="handleSave" class="space-y-4 pt-2">
                    <div class="space-y-2">
                        <Label for="name">Nama Lengkap</Label>
                        <Input id="name" v-model="form.name" placeholder="Contoh: Dr. H. Sudirman, M.Pd" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="position">Jabatan</Label>
                        <Input id="position" v-model="form.position" placeholder="Contoh: Kamabigus" required />
                    </div>
                    <div class="space-y-2">
                        <Label>Foto</Label>
                        <AdminImageUploader :model-value="form.photo" :loading="uploading"
                            @file-selected="onFileSelected" @update:model-value="(v) => form.photo = v" />
                    </div>
                    <div class="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" @click="dialogOpen = false">Batal</Button>
                        <Button type="submit" :disabled="saving">
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>

        <!-- Delete Confirmation -->
        <ConfirmDialog v-model:open="confirmOpen" :loading="deleting" @confirm="handleDelete" />
    </div>
</template>

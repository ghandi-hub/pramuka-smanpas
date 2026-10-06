<script setup lang="ts">
import { computed, h, onMounted, ref } from "vue";
import { toast } from "vue-sonner";
import type { ColumnDef } from "@tanstack/vue-table";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ClipboardList,
} from "lucide-vue-next";
import Button from "~/components/ui/button/Button.vue";
import DataTable from "~/components/admin/DataTable.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  useSkuSkkAdminService,
  type Submission,
  type SubmissionStatus,
  type SubmissionType,
} from "~/services/skuSkkAdminService";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({
  title: "Verifikasi SKU & SKK",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { fetchSubmissions, verify } = useSkuSkkAdminService();

const submissions = ref<Submission[]>([]);
const loading = ref(false);
const typeFilter = ref<SubmissionType>("all");
const statusFilter = ref<SubmissionStatus>("all");

const dialogOpen = ref(false);
const saving = ref(false);
const activeSubmission = ref<Submission | null>(null);
const decision = ref<"verified" | "rejected">("verified");
const adminNotes = ref("");

const typeOptions: { value: SubmissionType; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "sku", label: "SKU" },
  { value: "skk", label: "SKK" },
];

const statusOptions: { value: SubmissionStatus; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "verified", label: "Terverifikasi" },
  { value: "rejected", label: "Ditolak" },
];

const statusMeta: Record<string, { label: string; class: string; icon: any }> =
  {
    pending: {
      label: "Menunggu",
      class: "bg-amber-500/10 text-amber-600 border border-amber-500/30",
      icon: Clock,
    },
    verified: {
      label: "Terverifikasi",
      class: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Ditolak",
      class: "bg-destructive/10 text-destructive border border-destructive/30",
      icon: XCircle,
    },
  };

const load = async () => {
  loading.value = true;
  try {
    submissions.value = await fetchSubmissions(
      typeFilter.value,
      statusFilter.value,
    );
  } catch (e: any) {
    toast.error(e.data?.statusMessage || "Gagal memuat data");
  } finally {
    loading.value = false;
  }
};

const itemTitle = (s: Submission): string => {
  if (!s.item) return "-";
  if (s.type === "sku") {
    return `${s.item.point_number ?? ""}. ${s.item.title ?? "-"}`;
  }
  return s.item.name ?? "-";
};

const formatDate = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openAction = (s: Submission, d: "verified" | "rejected") => {
  activeSubmission.value = s;
  decision.value = d;
  adminNotes.value = s.admin_notes ?? "";
  dialogOpen.value = true;
};

const handleConfirm = async () => {
  if (!activeSubmission.value) return;
  saving.value = true;
  try {
    await verify({
      type: activeSubmission.value.type,
      id: String(activeSubmission.value.id),
      status: decision.value,
      admin_notes: adminNotes.value,
    });
    toast.success(
      decision.value === "verified"
        ? "Pengajuan berhasil diverifikasi"
        : "Pengajuan berhasil ditolak",
    );
    dialogOpen.value = false;
    await load();
  } catch (e: any) {
    toast.error(e.data?.statusMessage || "Gagal menyimpan verifikasi");
  } finally {
    saving.value = false;
  }
};

const columns: ColumnDef<Submission, any>[] = [
  {
    id: "member",
    header: "Anggota",
    cell: ({ row }) => {
      const s = row.original;
      return h("div", { class: "min-w-[160px]" }, [
        h(
          "div",
          { class: "font-medium text-foreground truncate max-w-[200px]", title: s.member_name ?? undefined },
          s.member_name || "-",
        ),
        h(
          "div",
          { class: "text-xs text-muted-foreground truncate max-w-[200px]", title: s.member_email ?? undefined },
          s.member_email || "-",
        ),
      ]);
    },
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = row.original.type;
      return h(
        "span",
        {
          class: [
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
            type === "sku"
              ? "bg-primary/10 text-primary"
              : "bg-accent/10 text-accent",
          ],
        },
        type,
      );
    },
  },
  {
    id: "item",
    header: "Butir / Badge",
    cell: ({ row }) => {
      const s = row.original;
      return h("div", { class: "min-w-[180px]" }, [
        h(
          "div",
          { class: "font-medium truncate max-w-[240px]", title: itemTitle(s) },
          itemTitle(s),
        ),
        s.level
          ? h(
              "div",
              { class: "text-xs text-muted-foreground capitalize" },
              s.level,
            )
          : null,
      ]);
    },
  },
  {
    accessorKey: "submitted_at",
    header: "Tanggal",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-sm text-muted-foreground whitespace-nowrap" },
        formatDate(row.original.submitted_at),
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const meta = statusMeta[row.original.status] ?? statusMeta.pending;
      return h(
        "span",
        {
          class: [
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            meta.class,
          ],
        },
        [
          h(meta.icon, { class: "w-3 h-3" }),
          meta.label,
        ],
      );
    },
  },
  {
    id: "notes",
    header: "Catatan",
    cell: ({ row }) => {
      const note = row.original.notes || row.original.admin_notes || "-";
      return h(
        "div",
        { class: "max-w-[220px] truncate text-sm text-muted-foreground", title: note },
        note,
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const s = row.original;
      const buttons: any[] = [];
      if (s.evidence_url) {
        buttons.push(
          h(
            "a",
            {
              href: s.evidence_url,
              target: "_blank",
              rel: "noopener",
              class:
                "inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground",
              title: "Lihat bukti",
            },
            [h(ExternalLink, { class: "w-4 h-4" })],
          ),
        );
      }
      buttons.push(
        h(
          Button,
          {
            variant: "ghost",
            size: "icon",
            class: "h-8 w-8 text-emerald-600 hover:text-emerald-600",
            title: "Terverifikasi",
            onClick: () => openAction(s, "verified"),
          },
          () => h(CheckCircle2, { class: "w-4 h-4" }),
        ),
        h(
          Button,
          {
            variant: "ghost",
            size: "icon",
            class: "h-8 w-8 text-destructive hover:text-destructive",
            title: "Tolak",
            onClick: () => openAction(s, "rejected"),
          },
          () => h(XCircle, { class: "w-4 h-4" }),
        ),
      );
      return h("div", { class: "flex items-center gap-1" }, buttons);
    },
  },
];

const pendingCount = computed(
  () => submissions.value.filter((s) => s.status === "pending").length,
);

onMounted(load);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1
          class="text-2xl lg:text-3xl font-display font-bold text-foreground tracking-tight"
        >
          Verifikasi SKU & SKK
        </h1>
        <p class="text-muted-foreground mt-1">
          Tinjau dan verifikasi pengajuan Syarat Kecakapan Umum & Khusus
          anggota.
        </p>
      </div>
      <div
        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 text-sm font-semibold w-fit"
      >
        <Clock class="w-4 h-4" />
        {{ pendingCount }} menunggu
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-4 h-4 text-muted-foreground shrink-0" />
        <div class="inline-flex p-1 rounded-full border border-border bg-background">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            :class="
              typeFilter === opt.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="
              typeFilter = opt.value;
              load();
            "
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ClipboardList class="w-4 h-4 text-muted-foreground shrink-0" />
        <div class="inline-flex p-1 rounded-full border border-border bg-background">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            :class="
              statusFilter === opt.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="
              statusFilter = opt.value;
              load();
            "
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <DataTable
      :columns="columns"
      :data="submissions"
      :loading="loading"
      search-placeholder="Cari anggota / butir..."
    />

    <!-- Action dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <span
              class="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              :class="
                decision === 'verified'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-destructive/10 text-destructive'
              "
            >
              <CheckCircle2 v-if="decision === 'verified'" class="w-5 h-5" />
              <XCircle v-else class="w-5 h-5" />
            </span>
            {{ decision === "verified" ? "Verifikasi Pengajuan" : "Tolak Pengajuan" }}
          </DialogTitle>
          <DialogDescription class="pt-1">
            {{ activeSubmission?.member_name || "-" }} &middot;
            {{ activeSubmission ? itemTitle(activeSubmission) : "" }}
          </DialogDescription>
        </DialogHeader>

        <div
          v-if="activeSubmission?.notes"
          class="text-sm rounded-lg bg-muted/60 border border-border p-3"
        >
          <span class="font-semibold text-foreground">Catatan anggota:</span>
          {{ activeSubmission.notes }}
        </div>

        <div class="space-y-2">
          <Label for="admin-notes">Catatan Penguji</Label>
          <Textarea
            id="admin-notes"
            v-model="adminNotes"
            :placeholder="
              decision === 'verified'
                ? 'Catatan tambahan (opsional)...'
                : 'Alasan penolakan / hal yang perlu direvisi...'
            "
            class="h-[120px] resize-none"
          />
        </div>

        <DialogFooter class="gap-2">
          <Button type="button" variant="outline" @click="dialogOpen = false">
            Batal
          </Button>
          <Button
            v-if="decision === 'verified'"
            type="button"
            :disabled="saving"
            @click="handleConfirm"
          >
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            <CheckCircle2 v-else class="w-4 h-4 mr-2" />
            {{ saving ? "Menyimpan..." : "Verifikasi" }}
          </Button>
          <Button
            v-else
            type="button"
            variant="destructive"
            :disabled="saving"
            @click="handleConfirm"
          >
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            <XCircle v-else class="w-4 h-4 mr-2" />
            {{ saving ? "Menyimpan..." : "Tolak" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
import useMongoCrud from "~/composables/useMongoCrud"

export interface About {
    id: string
    vision: string
    mission: string | null
    history: string | null
    quote: string | null
    created_at: string
    updated_at: string
}

export function useAboutService() {
    const crud = useMongoCrud<About>('abouts')

    return {
        ...crud,
    }
}

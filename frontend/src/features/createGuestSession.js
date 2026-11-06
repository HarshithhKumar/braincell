import api from "../../utils/axios"

export async function createGuestSession() {
    const { data } = await api.post("/api/auth/guest")
    return data
}

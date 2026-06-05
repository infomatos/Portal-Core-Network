export async function healthCheck() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/health`);
    const data = await res.json();
    return data;    
}

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

// Fetch data from the backend
export async function getData(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

// Send data to the backend
export async function postData(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
    }

    return result;
}

// Specific API helper functions used across pages
export const getCampaigns = () => getData("/campaigns");
export const getCampaignById = (id) => getData(`/campaigns/${id}`);
export const createOrder = (data) => postData("/payments/create-order", data);
export const verifyPayment = (data) => postData("/payments/verify", data);
export const getRecentDonations = () => getData("/donations/recent");
export const getServices = () => getData("/services");
export const getDonationItems = () => getData("/donation-items");
export const getGalleryItems = () => getData("/gallery");
export const getHeroSlides = () => getData("/hero-slides");
export const submitVolunteer = (data) => postData("/volunteers", data);
export const submitContact = (data) => postData("/contact", data);

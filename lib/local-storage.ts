// Helper functions for working with localStorage in the onboarding process

// Keys
export const ONBOARDING_DATA_KEY = "onboarding_data"
export const CURRENT_STEP_KEY = "onboarding_current_step"
export const ORG_DATA_KEY = "organization_setup_data"
export const PROFILE_DATA_KEY = "profile_setup_data"
export const PRICING_DATA_KEY = "pricing_setup_data"
export const PAYMENT_DATA_KEY = "payment_setup_data"

// Type-safe localStorage functions
export function getLocalStorage<T>(key: string, userId: string): T | null {
    if (typeof window === "undefined") return null

    try {
        const item = localStorage.getItem(`${key}_${userId}`)
        return item ? JSON.parse(item) : null
    } catch (error) {
        console.error(`Error getting localStorage item ${key}:`, error)
        return null
    }
}

export function setLocalStorage<T>(key: string, userId: string, value: T): void {
    if (typeof window === "undefined") return

    try {
        localStorage.setItem(`${key}_${userId}`, JSON.stringify(value))
    } catch (error) {
        console.error(`Error setting localStorage item ${key}:`, error)
    }
}

export function removeLocalStorage(key: string, userId: string): void {
    if (typeof window === "undefined") return

    try {
        localStorage.removeItem(`${key}_${userId}`)
    } catch (error) {
        console.error(`Error removing localStorage item ${key}:`, error)
    }

}

// Specific onboarding functions
export function saveOnboardingStep(userId: string, step: number): void {
    setLocalStorage(CURRENT_STEP_KEY, userId, step)
}

export function getOnboardingStep(userId: string): number {
    return getLocalStorage<number>(CURRENT_STEP_KEY, userId) || 0
}

export function saveOnboardingData<T>(userId: string, data: T): void {
    setLocalStorage(ONBOARDING_DATA_KEY, userId, data)
}

export function getOnboardingData<T>(userId: string): T | null {
    return getLocalStorage<T>(ONBOARDING_DATA_KEY, userId)
}

export function clearOnboardingData(userId: string): void {
    removeLocalStorage(ONBOARDING_DATA_KEY, userId)
    removeLocalStorage(CURRENT_STEP_KEY, userId)
    removeLocalStorage(ORG_DATA_KEY, userId)
    removeLocalStorage(PROFILE_DATA_KEY, userId)
    removeLocalStorage(PRICING_DATA_KEY, userId)
    // removeLocalStorage(PAYMENT_DATA_KEY, userId)
}

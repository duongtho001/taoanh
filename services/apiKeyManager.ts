const API_KEYS_STORAGE_KEY = 'duong-tho-app-api-keys';

class ApiKeyManager {
    private keys: string[] = [];
    private currentIndex: number = 0;

    constructor() {
        this.loadKeys();
    }

    loadKeys(): void {
        try {
            const storedKeys = window.localStorage.getItem(API_KEYS_STORAGE_KEY);
            if (storedKeys) {
                this.keys = storedKeys.split('\n').map(k => k.trim()).filter(Boolean);
            } else {
                this.keys = [];
            }
            this.currentIndex = 0;
        } catch (error) {
            console.error("Failed to load API keys from localStorage", error);
            this.keys = [];
        }
    }

    saveKeys(keysString: string): void {
        try {
            window.localStorage.setItem(API_KEYS_STORAGE_KEY, keysString);
            this.loadKeys(); // Reload keys and reset index
        } catch (error) {
            console.error("Failed to save API keys to localStorage", error);
        }
    }

    getKeys(): string[] {
        return this.keys;
    }

    getKeysAsString(): string {
        return this.keys.join('\n');
    }
    
    getCurrentIndex(): number {
        return this.currentIndex;
    }

    setCurrentIndex(index: number): void {
        if (index >= 0 && index < this.keys.length) {
            this.currentIndex = index;
        }
    }
}

export const apiKeyManager = new ApiKeyManager();

export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    images?: string[]; // Multiple images support
    steel: string;
    hardness: string;
    handle: string;
    category: string;
    isNew?: boolean;
    description?: string;
    fullLength?: string;
    barrelLength?: string;
    thickness?: string;
    sizes?: string[]; // Available sizes
}

export interface FilterState {
    search: string;
    minPrice: number;
    maxPrice: number;
    steel: string[];
    handle: string[];
    category: string[];
}

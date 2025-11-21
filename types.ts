
export interface Specifications {
    cilindrada?: string;
    motor?: string;
    bateria?: string; // Optional, kept for electric bikes compatibility
    frenos?: string; // Optional
    velocidad?: string;
    autonomia?: string;
    transmision?: string;
    cap_combustible?: string;
    [key: string]: string | undefined;
}

export interface Motorcycle {
    id: string;
    nombre: string;
    categoria: string;
    precio: number;
    moneda: 'USD' | 'MLC';
    descripcion: string;
    especificaciones: Specifications;
    imagenes: string[];
    disponible: boolean;
    destacada: boolean;
    rating?: number; // 1-5 stars
    fechacreacion: string;
    fechaactualizacion?: string;
}

export interface Category {
    id: string;
    nombre: string;
    imageurl: string;
    created_at: string;
}

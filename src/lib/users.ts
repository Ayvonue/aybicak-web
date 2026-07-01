import { getSql, isDbConfigured } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

export interface DbUser {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string | null;
    birthDate: string | null;
    gender: string | null;
    createdAt: string;
}

interface UserRow {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string | null;
    password_hash: string;
    birth_date: string | null;
    gender: string | null;
    created_at: string;
}

function genId(): string {
    return `usr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function userExists(email: string): Promise<boolean> {
    if (!isDbConfigured()) return false;
    const rows = (await getSql()`SELECT 1 FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`) as unknown[];
    return rows.length > 0;
}

// Doğrulanmış kayıttan kalıcı kullanıcı oluşturur (şifre zaten hash'li gelir)
export async function createUser(data: {
    name: string; surname: string; email: string; phone?: string;
    passwordHash: string; birthDate?: string; gender?: string;
}): Promise<DbUser | null> {
    if (!isDbConfigured()) return null;
    const id = genId();
    try {
        await getSql()`
            INSERT INTO users (id, name, surname, email, phone, password_hash, birth_date, gender)
            VALUES (${id}, ${data.name}, ${data.surname}, ${data.email.toLowerCase()}, ${data.phone || null},
                    ${data.passwordHash}, ${data.birthDate || null}, ${data.gender || null})
            ON CONFLICT (email) DO NOTHING
        `;
        return {
            id, name: data.name, surname: data.surname, email: data.email.toLowerCase(),
            phone: data.phone || null, birthDate: data.birthDate || null,
            gender: data.gender || null, createdAt: new Date().toISOString(),
        };
    } catch (e) {
        console.error("createUser hatası:", e);
        return null;
    }
}

// E-posta + şifre doğrula; başarılıysa kullanıcıyı (şifresiz) döner
export async function authenticateUser(email: string, password: string): Promise<DbUser | null> {
    if (!isDbConfigured()) return null;
    const rows = (await getSql()`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`) as UserRow[];
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    if (!verifyPassword(password, u.password_hash)) return null;
    return {
        id: u.id, name: u.name, surname: u.surname, email: u.email, phone: u.phone,
        birthDate: u.birth_date, gender: u.gender, createdAt: u.created_at,
    };
}

export { hashPassword };

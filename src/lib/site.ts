// Merkezi site / iletişim bilgileri.
// Gerçek değerler yayına alınmadan önce buradan (veya env üzerinden) güncellenmelidir.

export const siteConfig = {
    name: "Ay Bıçak",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://aybicak.com",

    // İletişim — TODO: yayına almadan önce gerçek değerlerle değiştirin
    phone: "+90 555 555 55 55",
    phoneHref: "tel:+905555555555",
    whatsappNumber: "905555555555",
    email: "info@aybicak.com",

    address: {
        street: "Yatağan Mahallesi",
        district: "Serinhisar",
        city: "Denizli",
    },

    social: {
        instagram: "https://www.instagram.com/aybicak",
        facebook: "https://www.facebook.com/aybicak",
        twitter: "https://twitter.com/aybicak",
    },

    // Havale / EFT bilgileri — TODO: yayına almadan önce gerçek IBAN girin
    bank: {
        name: process.env.NEXT_PUBLIC_BANK_NAME || "Ziraat Bankası",
        owner: process.env.NEXT_PUBLIC_BANK_OWNER || "Ay Bıçak",
        iban: process.env.NEXT_PUBLIC_BANK_IBAN || "TR12 0001 0002 0003 0004 0005 06",
    },
};

export function whatsappLink(text: string): string {
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

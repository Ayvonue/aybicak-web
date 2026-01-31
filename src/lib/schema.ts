import { products } from '@/data/products';

// Organization Schema
export function getOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Ay Bıçak",
        "alternateName": "AYBIÇAK",
        "url": "https://aybicak.com",
        "logo": "https://aybicak.com/logo-full.png",
        "description": "30 yıllık ustalıkla üretilen el yapımı premium bıçaklar",
        "foundingDate": "1994",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "TR",
            "addressLocality": "İstanbul"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+90-555-123-4567",
            "contactType": "customer service",
            "availableLanguage": ["Turkish", "English"]
        },
        "sameAs": [
            "https://www.instagram.com/aybicak",
            "https://www.facebook.com/aybicak"
        ]
    };
}

// WebSite Schema (for sitelinks search box)
export function getWebsiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Ay Bıçak",
        "url": "https://aybicak.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://aybicak.com/shop?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };
}

// Product Schema
export function getProductSchema(productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `${product.name} - El yapımı premium bıçak`,
        "image": product.images?.[0]?.startsWith('http') ? product.images[0] : `https://aybicak.com${product.images?.[0] || '/placeholder-knife.png'}`,
        "brand": {
            "@type": "Brand",
            "name": "Ay Bıçak"
        },
        "category": product.category,
        "material": "Paslanmaz Çelik",
        "offers": {
            "@type": "Offer",
            "url": `https://aybicak.com/product/${product.id}`,
            "priceCurrency": "TRY",
            "price": product.price,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "Ay Bıçak"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127"
        }
    };
}

// BreadcrumbList Schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

// LocalBusiness Schema
export function getLocalBusinessSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Ay Bıçak",
        "image": "https://aybicak.com/hero.png",
        "priceRange": "₺₺₺",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Bıçakçılar Çarşısı",
            "addressLocality": "İstanbul",
            "addressCountry": "TR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "41.0082",
            "longitude": "28.9784"
        },
        "telephone": "+90-555-123-4567",
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "10:00",
                "closes": "16:00"
            }
        ]
    };
}

// FAQ Schema
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

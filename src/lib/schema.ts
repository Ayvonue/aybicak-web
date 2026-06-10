import { products } from '@/data/products';
import { siteConfig } from '@/lib/site';

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
            "addressLocality": siteConfig.address.city
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": siteConfig.phone,
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
        "sku": product.id,
        "description": product.description || `${product.name} - El yapımı premium bıçak`,
        "image": product.imageUrl,
        "brand": {
            "@type": "Brand",
            "name": "Ay Bıçak"
        },
        "category": product.category,
        "material": product.steel,
        "offers": {
            "@type": "Offer",
            "url": `https://aybicak.com/product/${product.id}`,
            "priceCurrency": "TRY",
            "price": product.price,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": 0,
                    "currency": "TRY"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "TR"
                }
            },
            "seller": {
                "@type": "Organization",
                "name": "Ay Bıçak"
            }
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
            "streetAddress": siteConfig.address.street,
            "addressLocality": `${siteConfig.address.district} / ${siteConfig.address.city}`,
            "addressCountry": "TR"
        },
        "telephone": siteConfig.phone,
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

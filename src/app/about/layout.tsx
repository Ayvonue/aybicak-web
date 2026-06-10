import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hakkımızda - Yatağan Bıçakçılığı',
    description: 'Ay Bıçak hikayesi. Denizli Yatağan\'da dededen toruna 30 yıllık tecrübe. Geleneksel el işçiliği ve modern çeliğin buluşması.',
    alternates: {
        canonical: 'https://aybicak.com/about',
    },
    openGraph: {
        title: 'Hakkımızda - Yatağan Bıçakçılığı | Ay Bıçak',
        description: 'Denizli Yatağan\'da dededen toruna 30 yıllık bıçak ustalığı.',
        url: 'https://aybicak.com/about',
        type: 'website',
        locale: 'tr_TR',
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

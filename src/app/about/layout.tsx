import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hakkımızda | Yatağan Bıçakçılığı',
    description: 'Ay Bıçak hikayesi. Denizli Yatağan\'da dededen toruna 30 yıllık tecrübe. Geleneksel el işçiliği ve modern çeliğin buluşması.',
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

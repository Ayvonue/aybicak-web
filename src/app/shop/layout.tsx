import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mağaza | Bıçak Koleksiyonu',
    description: 'Ay Bıçak özel koleksiyonu. Av, kamp, mutfak ve şef bıçakları. N690 paslanmaz çelik, el yapımı saplar ve ömür boyu garanti.',
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

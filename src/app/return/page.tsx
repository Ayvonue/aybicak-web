import type { Metadata } from "next";
import LegalPage from "@/components/shared/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
    title: "İade ve Değişim",
    description: "Ay Bıçak iade ve değişim koşulları: 14 gün cayma hakkı, iade süreci ve istisnalar.",
};

export default function ReturnPage() {
    return (
        <LegalPage
            title="İade ve Değişim"
            intro="Memnuniyetiniz bizim için önceliklidir. Yasal cayma hakkınız kapsamında ürünlerinizi kolayca iade edebilir veya değiştirebilirsiniz."
            sections={[
                {
                    title: "14 Gün Cayma Hakkı",
                    content: (
                        <p>
                            Ürünü teslim aldığınız tarihten itibaren <strong className="text-white">14 gün</strong> içinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz. İade talebinizi {siteConfig.email} adresine veya {siteConfig.phone} numarasına bildirmeniz yeterlidir.
                        </p>
                    ),
                },
                {
                    title: "İade Koşulları",
                    content: (
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Ürün kullanılmamış ve hasar görmemiş olmalıdır</li>
                            <li>Orijinal ambalajı, kılıfı ve aksesuarları eksiksiz olmalıdır</li>
                            <li>Fatura veya sipariş numarası ile birlikte gönderilmelidir</li>
                        </ul>
                    ),
                },
                {
                    title: "İade Edilemeyen Ürünler",
                    content: (
                        <p>
                            Mesafeli Sözleşmeler Yönetmeliği gereği, kişiye özel üretilen ürünlerde (isim/logo işlemeli, özel ölçü veya özel tasarım bıçaklar) cayma hakkı kullanılamaz. Bu ürünlerde yalnızca üretim hatası durumunda değişim yapılır.
                        </p>
                    ),
                },
                {
                    title: "İade Süreci",
                    content: (
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>İade talebinizi e-posta veya telefonla bildirin</li>
                            <li>Size ileteceğimiz anlaşmalı kargo kodu ile ürünü ücretsiz gönderin</li>
                            <li>Ürün tarafımıza ulaştıktan sonra kontrol edilir</li>
                            <li>Ürün bedeli 14 gün içinde ödeme yönteminize iade edilir</li>
                        </ol>
                    ),
                },
                {
                    title: "Değişim",
                    content: (
                        <p>
                            Ürününüzü farklı bir model veya boyutla değiştirmek isterseniz iade sürecindeki adımları izleyin ve talebinizde değişim istediğinizi belirtin. Fiyat farkı varsa tahsil edilir veya iade edilir.
                        </p>
                    ),
                },
                {
                    title: "Garanti",
                    content: (
                        <p>
                            Tüm ürünlerimiz üretim hatalarına karşı <strong className="text-white">1 yıl garanti</strong> kapsamındadır. Garanti; kullanım hatası, düşürme ve amacı dışında kullanım kaynaklı hasarları kapsamaz.
                        </p>
                    ),
                },
            ]}
        />
    );
}

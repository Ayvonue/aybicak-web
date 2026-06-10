import type { Metadata } from "next";
import LegalPage from "@/components/shared/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
    title: "Kargo ve Teslimat",
    description: "Ay Bıçak kargo süreleri, ücretsiz kargo koşulları ve teslimat bilgileri.",
};

export default function ShippingPage() {
    return (
        <LegalPage
            title="Kargo ve Teslimat"
            intro="Siparişleriniz özenle paketlenir ve anlaşmalı kargo firmalarımızla güvenle adresinize ulaştırılır."
            sections={[
                {
                    title: "Kargo Ücreti",
                    content: (
                        <p>
                            Türkiye&apos;nin her yerine <strong className="text-white">ücretsiz kargo</strong> ile gönderim yapıyoruz. Kapıda ödeme seçeneğinde kargo firmasının kapıda ödeme hizmet bedeli alıcıya aittir.
                        </p>
                    ),
                },
                {
                    title: "Hazırlama ve Teslimat Süresi",
                    content: (
                        <>
                            <p>Stokta bulunan ürünler, sipariş onayını takiben 1-3 iş günü içinde kargoya verilir. Kargoya verilen ürünler genellikle 1-3 iş günü içinde teslim edilir.</p>
                            <p>El yapımı özel sipariş ürünlerde üretim süresi ürüne göre değişir; tahmini süre sipariş esnasında tarafınıza bildirilir.</p>
                        </>
                    ),
                },
                {
                    title: "Havale / EFT Siparişleri",
                    content: (
                        <p>
                            Havale/EFT ile ödenen siparişler, ödemenin hesabımıza geçmesinin ardından işleme alınır. Açıklama kısmına sipariş numaranızı yazmayı unutmayın.
                        </p>
                    ),
                },
                {
                    title: "Paketleme",
                    content: (
                        <p>
                            Tüm bıçaklarımız, kesici kenarları koruyucu ile kapatılarak ve darbeye dayanıklı ambalajla paketlenir. Paketinizde hasar görmeniz halinde kargo görevlisine tutanak tutturup bizimle iletişime geçin.
                        </p>
                    ),
                },
                {
                    title: "Sipariş Takibi",
                    content: (
                        <p>
                            Siparişiniz kargoya verildiğinde takip numaranız e-posta/SMS ile iletilir. Sorularınız için bize {siteConfig.email} adresinden veya {siteConfig.phone} numarasından ulaşabilirsiniz.
                        </p>
                    ),
                },
            ]}
        />
    );
}

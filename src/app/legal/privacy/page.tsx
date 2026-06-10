import type { Metadata } from "next";
import LegalPage from "@/components/shared/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
    title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
    description: "Ay Bıçak kişisel verilerin korunması (KVKK) aydınlatma metni ve gizlilik politikası.",
};

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Gizlilik ve KVKK"
            intro="6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, veri sorumlusu sıfatıyla Ay Bıçak tarafından kişisel verilerinizin işlenmesine ilişkin aydınlatma metnidir."
            sections={[
                {
                    title: "1. Veri Sorumlusu",
                    content: (
                        <p>
                            {siteConfig.name} — {siteConfig.address.street}, {siteConfig.address.district} / {siteConfig.address.city} — {siteConfig.email}
                        </p>
                    ),
                },
                {
                    title: "2. İşlenen Kişisel Veriler",
                    content: (
                        <>
                            <p>Sitemiz üzerinden alışveriş yaptığınızda veya üye olduğunuzda aşağıdaki verileriniz işlenmektedir:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Kimlik bilgileri: ad, soyad, doğum tarihi</li>
                                <li>İletişim bilgileri: e-posta, telefon, teslimat adresi</li>
                                <li>Müşteri işlem bilgileri: sipariş geçmişi, sepet bilgileri</li>
                                <li>İşlem güvenliği bilgileri: IP adresi, çerez kayıtları</li>
                            </ul>
                        </>
                    ),
                },
                {
                    title: "3. İşleme Amaçları",
                    content: (
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Siparişlerin alınması, hazırlanması ve teslim edilmesi</li>
                            <li>Üyelik işlemlerinin yürütülmesi ve hesap doğrulama</li>
                            <li>Mevzuattan doğan yükümlülüklerin (fatura, kayıt saklama) yerine getirilmesi</li>
                            <li>Açık rıza vermeniz halinde kampanya ve duyuru bildirimleri</li>
                        </ul>
                    ),
                },
                {
                    title: "4. Verilerin Aktarılması",
                    content: (
                        <p>
                            Kişisel verileriniz; teslimat için kargo firmalarına, ödeme işlemleri için ödeme kuruluşlarına ve yasal zorunluluk halinde yetkili kamu kurumlarına, işleme amacıyla sınırlı olarak aktarılabilir. Verileriniz bunun dışında üçüncü kişilerle paylaşılmaz ve satılmaz.
                        </p>
                    ),
                },
                {
                    title: "5. Çerezler",
                    content: (
                        <p>
                            Sitemiz; sepetinizi hatırlamak, oturumunuzu sürdürmek ve site deneyimini iyileştirmek amacıyla zorunlu çerezler ve yerel depolama (localStorage) kullanır. Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz.
                        </p>
                    ),
                },
                {
                    title: "6. KVKK Kapsamındaki Haklarınız",
                    content: (
                        <>
                            <p>KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zarara uğramanız halinde tazminat talep etme haklarına sahipsiniz.</p>
                            <p>
                                Taleplerinizi {siteConfig.email} adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.
                            </p>
                        </>
                    ),
                },
                {
                    title: "7. Veri Güvenliği",
                    content: (
                        <p>
                            Verileriniz SSL şifreleme ile iletilir ve yetkisiz erişime karşı gerekli teknik ve idari tedbirler alınır. Şifreler sistemlerimizde geri döndürülemez şekilde hash&apos;lenerek saklanır.
                        </p>
                    ),
                },
            ]}
        />
    );
}

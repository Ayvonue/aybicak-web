import type { Metadata } from "next";
import LegalPage from "@/components/shared/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
    title: "Mesafeli Satış Sözleşmesi",
    description: "Ay Bıçak mesafeli satış sözleşmesi: sipariş, teslimat, cayma hakkı ve iade koşulları.",
};

export default function DistSalesPage() {
    return (
        <LegalPage
            title="Mesafeli Satış Sözleşmesi"
            intro="İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, aybicak.com üzerinden verilen siparişler için satıcı ile alıcı arasında akdedilmiştir."
            sections={[
                {
                    title: "1. Taraflar",
                    content: (
                        <>
                            <p>
                                <strong className="text-white">Satıcı:</strong> {siteConfig.name} — {siteConfig.address.street}, {siteConfig.address.district} / {siteConfig.address.city} — E-posta: {siteConfig.email} — Telefon: {siteConfig.phone}
                            </p>
                            <p>
                                <strong className="text-white">Alıcı:</strong> Sipariş formunda ad, soyad, adres ve iletişim bilgilerini beyan eden kişi.
                            </p>
                        </>
                    ),
                },
                {
                    title: "2. Sözleşmenin Konusu",
                    content: (
                        <p>
                            İşbu sözleşmenin konusu, alıcının satıcıya ait aybicak.com internet sitesinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı sitede belirtilen ürünlerin satışı ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerinin belirlenmesidir.
                        </p>
                    ),
                },
                {
                    title: "3. Ürün ve Ödeme Bilgileri",
                    content: (
                        <p>
                            Ürünlerin cinsi, türü, adedi ve KDV dahil satış fiyatı sipariş özetinde ve sipariş onayında belirtildiği gibidir. Ödeme, kapıda ödeme veya banka havalesi/EFT yöntemiyle yapılabilir. Havale/EFT ödemelerinde sipariş, ödemenin satıcı hesabına ulaşmasından sonra işleme alınır.
                        </p>
                    ),
                },
                {
                    title: "4. Teslimat",
                    content: (
                        <p>
                            Ürünler, sipariş onayını (havale/EFT&apos;de ödeme onayını) takiben en geç 30 gün içinde, alıcının bildirdiği adrese anlaşmalı kargo firması aracılığıyla teslim edilir. El yapımı ve kişiye özel üretilen ürünlerde üretim süresi sipariş esnasında ayrıca bildirilir. Kargo ücreti politikası sitede belirtilmiştir.
                        </p>
                    ),
                },
                {
                    title: "5. Cayma Hakkı",
                    content: (
                        <>
                            <p>
                                Alıcı, ürünün kendisine veya gösterdiği adresteki kişiye tesliminden itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılması için bu süre içinde satıcıya e-posta veya telefon yoluyla bildirimde bulunulması yeterlidir.
                            </p>
                            <p>
                                <strong className="text-white">İstisna:</strong> Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, alıcının istekleri doğrultusunda kişiye özel olarak üretilen (isim yazılı, özel ölçü/tasarım) ürünlerde cayma hakkı kullanılamaz.
                            </p>
                        </>
                    ),
                },
                {
                    title: "6. İade Prosedürü",
                    content: (
                        <p>
                            Cayma hakkı kapsamındaki iadelerde ürün; kullanılmamış, hasarsız ve orijinal ambalajıyla birlikte, faturası ile beraber satıcıya gönderilmelidir. Ürün bedeli, ürünün satıcıya ulaşmasını takiben 14 gün içinde alıcıya iade edilir.
                        </p>
                    ),
                },
                {
                    title: "7. Yetkili Mahkeme",
                    content: (
                        <p>
                            İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca ilan edilen parasal sınırlar dahilinde alıcının veya satıcının yerleşim yerindeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
                        </p>
                    ),
                },
                {
                    title: "8. Yürürlük",
                    content: (
                        <p>
                            Alıcı, sipariş verdiğinde işbu sözleşmenin tüm koşullarını kabul etmiş sayılır. Sözleşme, siparişin verilmesiyle birlikte yürürlüğe girer.
                        </p>
                    ),
                },
            ]}
        />
    );
}

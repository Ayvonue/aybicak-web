// SSS içeriği — hem sayfada render edilir hem de FAQPage JSON-LD şemasında
// kullanılır (layout). İçerik değişikliği iki tarafı da otomatik günceller.

export interface FAQQuestion {
    q: string;
    a: string;
}

export interface FAQCategory {
    title: string;
    questions: FAQQuestion[];
}

export const faqCategories: FAQCategory[] = [
    {
        title: "Sipariş ve Ödeme",
        questions: [
            {
                q: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
                a: "Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini sunuyoruz. Tüm kredi kartı işlemleri 256-bit SSL şifreleme ile korunmaktadır."
            },
            {
                q: "Taksitli ödeme yapabilir miyim?",
                a: "Evet, 500₺ üzeri alışverişlerinizde 3, 6 veya 9 taksit seçeneklerinden yararlanabilirsiniz. Taksit seçenekleri bankanıza göre değişiklik gösterebilir."
            },
            {
                q: "Siparişimi nasıl iptal edebilirim?",
                a: "Siparişiniz kargoya verilmeden önce müşteri hizmetlerimizi arayarak veya WhatsApp üzerinden iptal talebinde bulunabilirsiniz. Kargoya verilen siparişler için iade sürecini başlatmanız gerekmektedir."
            },
            {
                q: "Fatura bilgilerimi nasıl değiştirebilirim?",
                a: "Sipariş onaylandıktan sonra fatura bilgilerini değiştirmek için en kısa sürede müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir."
            }
        ]
    },
    {
        title: "Kargo ve Teslimat",
        questions: [
            {
                q: "Kargo ücreti ne kadar?",
                a: "Türkiye genelinde tüm siparişlerde kargo ücretsizdir. Kapıda ödeme seçeneğinde kargo firmasının kapıda ödeme hizmet bedeli alıcıya aittir."
            },
            {
                q: "Siparişim ne zaman elime ulaşır?",
                a: "Stokta bulunan ürünler sipariş onayından itibaren 1-3 iş günü içinde kargoya verilir. Kargo süresi bulunduğunuz bölgeye göre 1-3 gün arasında değişmektedir. Özel üretim siparişler 7-14 iş günü sürebilir."
            },
            {
                q: "Kargo takibi nasıl yapabilirim?",
                a: "Siparişiniz kargoya verildiğinde size SMS ve e-posta ile takip numarası gönderilir. 'Hesabım > Siparişlerim' bölümünden de takip edebilirsiniz."
            },
            {
                q: "Yurt dışına gönderim yapıyor musunuz?",
                a: "Evet, Avrupa ülkelerine gönderim yapıyoruz. Yurt dışı kargo ücretleri ülkeye ve ağırlığa göre değişmektedir. Detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz."
            }
        ]
    },
    {
        title: "Ürün ve Garanti",
        questions: [
            {
                q: "Bıçaklarınız hangi malzemeden üretiliyor?",
                a: "Bıçaklarımızda N690, D2, 1.4116 ve Şam çeliği gibi premium kalite çelikler kullanıyoruz. Sap malzemesi olarak ceviz, zeytin ağacı, geyik boynuzu ve kompozit malzemeler tercih ediyoruz."
            },
            {
                q: "Garanti süresi ne kadar?",
                a: "Tüm ürünlerimiz 1 yıl üretim hatası garantisi kapsamındadır. Kullanıcı kaynaklı hasarlar (düşürme, yanlış kullanım, bilemeden kaynaklı hasar) garanti kapsamı dışındadır."
            },
            {
                q: "Bıçağımı nasıl bilemeliyim?",
                a: "Bıçaklarımız keskin olarak teslim edilir. Bileme için 1000-3000 grit arası Japon tipi su taşı veya seramik bileme çubuğu öneriyoruz. Elektrikli bileyiciler bıçağa zarar verebilir."
            },
            {
                q: "Bıçağımı nasıl bakım yapmalıyım?",
                a: "Kullanımdan sonra ılık su ve sabunla yıkayıp kurulayın. Bulaşık makinesine koymayın. Uzun süreli saklamada gıda yağı veya kamelya yağı sürmenizi öneririz."
            }
        ]
    },
    {
        title: "İade ve Değişim",
        questions: [
            {
                q: "İade koşulları nelerdir?",
                a: "Ürünü teslim aldıktan sonra 14 gün içinde iade talebinde bulunabilirsiniz. Ürün kullanılmamış, orijinal ambalajında ve tüm aksesuarlarıyla birlikte olmalıdır."
            },
            {
                q: "İade kargo ücreti kime ait?",
                a: "Ürün hasarlı veya hatalı ise kargo ücreti bize aittir. Müşteri kaynaklı iadelerde kargo ücreti müşteriye aittir."
            },
            {
                q: "Param ne zaman iade edilir?",
                a: "İade edilen ürün depomuzda kontrol edildikten sonra 3-7 iş günü içinde ödemeniz iade edilir. Kredi kartı iadelerinde bankanızın işlem süresi değişebilir."
            },
            {
                q: "Özel üretim ürünleri iade edebilir miyim?",
                a: "Özel tasarım ve kişiye özel üretilen ürünler (isim yazılı, özel boyut vb.) üretim hatası dışında iade edilemez."
            }
        ]
    }
];

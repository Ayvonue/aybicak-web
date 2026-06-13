// Kategori landing sayfaları (/category/[slug]) ve ürün sayfalarındaki
// kategori içerik blokları için tek kaynak.

export interface CategoryConfig {
    slug: string;
    category: string; // products.ts içindeki category alanıyla eşleşir
    title: string;
    h1: string;
    metaDescription: string;
    keywords: string[];
    intro: string;
    careTitle: string;
    careContent: string[];
}

export const categories: CategoryConfig[] = [
    {
        slug: "caki",
        category: "Çakı",
        title: "El Yapımı Çakı Modelleri",
        h1: "El Yapımı Çakılar",
        metaDescription: "El yapımı çakı modelleri: N690 Böhler çelik, geyik boynuzu ve ceviz kabzeli, sırttan kilitli cep çakıları. Günlük taşıma (EDC) için ideal. Ücretsiz kargo.",
        keywords: ["el yapımı çakı", "çakı modelleri", "cep çakısı", "n690 çakı", "geyik boynuzu çakı", "sırttan kilitli çakı", "EDC çakı"],
        intro: "Günlük taşımadan koleksiyonerliğe, her ihtiyaca uygun el yapımı çakılar. Sırttan kilitleme mekanizmaları, N690 Böhler çelik ve doğal kabze malzemeleriyle her biri usta elinden tek tek çıkar.",
        careTitle: "Çakı Bakımı Nasıl Yapılır?",
        careContent: [
            "Çakınızın eklem mekanizmasını ayda bir damla makine yağı ile yağlayın; açılıp kapanma ömrü boyunca ilk günkü akıcılığını korur.",
            "Kullanım sonrası bıçak ağzını kuru bir bezle silin. Nemli ortamda saklamayın; deri kılıf uzun süreli saklama için uygun değildir, nem tutar.",
            "Bileme için 1000-3000 grit su taşı kullanın ve fabrika açısını (yaklaşık 20°) koruyun.",
        ],
    },
    {
        slug: "kamp-bicagi",
        category: "Kamp Bıçağı",
        title: "Kamp ve Bushcraft Bıçakları",
        h1: "Kamp ve Bushcraft Bıçakları",
        metaDescription: "El yapımı kamp ve bushcraft bıçakları: tam boy (full tang) N690 çelik, epoksi ve ahşap kabze, deri kılıf hediyeli. Doğa tutkunları için ücretsiz kargo ile.",
        keywords: ["kamp bıçağı", "bushcraft bıçak", "doğa bıçağı", "tam boy bıçak", "full tang bıçak", "kamp baltası", "survival bıçak"],
        intro: "Doğada güvenebileceğiniz, zorlu şartlar için üretilmiş tam boy (full tang) kamp bıçakları. Odun yontmadan mutfak işlerine kadar kampta tek bıçakla her işinizi görün; deri kılıfı ile birlikte gelir.",
        careTitle: "Kamp Bıçağı Bakımı ve Kullanımı",
        careContent: [
            "Kamp dönüşü bıçağınızı ılık sabunlu suyla yıkayıp tamamen kurutun; reçine ve tuz kalıntıları çeliğe zarar verir.",
            "Uzun süreli saklamada namluya ince bir kat gıda yağı veya kamelya yağı sürün.",
            "Batoning (odun yarma) yaparken yalnızca ahşap tokmak kullanın; metal çekiç sırtı çeliğe mikro çatlaklar oluşturabilir.",
        ],
    },
    {
        slug: "av-bicagi",
        category: "Av Bıçağı",
        title: "El Yapımı Av Bıçakları",
        h1: "Av Bıçakları",
        metaDescription: "El yapımı av bıçakları: keskinliğini uzun süre koruyan özel çelikler, kaymaz kabze, deri kılıf. Avcılar için tasarlanmış ergonomik modeller. Ücretsiz kargo.",
        keywords: ["av bıçağı", "avcı bıçağı", "el yapımı av bıçağı", "yüzme bıçağı", "av bıçağı fiyatları", "deri kılıflı bıçak"],
        intro: "Sahada sizi yarı yolda bırakmayan, keskinliğini uzun süre koruyan av bıçakları. Islak elde dahi kaymayan ergonomik kabzeler ve gövdeye uygun namlu geometrileriyle av tutkunları için üretilir.",
        careTitle: "Av Bıçağı Bakımı",
        careContent: [
            "Av sonrası bıçağınızı bekletmeden temizleyin; organik kalıntılar paslanmaz çelikte bile lekelenmeye yol açar.",
            "Deri kılıfı düzenli olarak deri besleyici ile besleyin; kuruyan deri çatlar ve bıçağı çizebilir.",
            "Sezon dışında bıçağı kılıfından çıkarıp kuru ortamda, hafif yağlanmış şekilde saklayın.",
        ],
    },
    {
        slug: "mutfak-setleri",
        category: "Set/Mutfak",
        title: "Mutfak Bıçakları ve Kurban Setleri",
        h1: "Mutfak Bıçakları ve Setler",
        metaDescription: "El yapımı mutfak bıçak setleri, şef bıçakları ve kurban setleri. 4116 Alman paslanmaz çelik, suya dayanıklı kabze, ahşap stantlı setler. Ücretsiz kargo.",
        keywords: ["mutfak bıçak seti", "şef bıçağı", "kurban bıçağı seti", "kasap bıçağı", "stantlı bıçak seti", "el yapımı mutfak bıçağı"],
        intro: "Ev mutfağından profesyonel kasaplığa, her kesim işi için el yapımı bıçak setleri. Suya ve asite dayanıklı kabzeler, gıdayla temasa uygun paslanmaz çelikler ve ahşap stantlı sunumlarıyla ömürlük setler.",
        careTitle: "Mutfak Bıçağı Bakımı",
        careContent: [
            "Bıçaklarınızı asla bulaşık makinesinde yıkamayın; yüksek ısı ve deterjan hem çeliğe hem kabzeye zarar verir.",
            "Kesim için cam veya mermer yerine ahşap ya da plastik kesme tahtası kullanın; sert yüzeyler ağzı köreltir.",
            "Keskinliği korumak için haftalık masat kullanın, yılda bir-iki kez su taşıyla bileyin.",
        ],
    },
    {
        slug: "bicaklar",
        category: "Bıçak",
        title: "El Yapımı Özel Bıçaklar",
        h1: "El Yapımı Bıçaklar",
        metaDescription: "El yapımı özel bıçaklar: dövme satır, kukri, pala, kolye bıçağı ve koleksiyonluk modeller. Dövme Ck75 ve paslanmaz çelik seçenekleri. Ücretsiz kargo.",
        keywords: ["el yapımı bıçak", "dövme bıçak", "kukri bıçak", "pala bıçak", "satır", "kolye bıçağı", "koleksiyon bıçağı"],
        intro: "Dövme satırlardan kukrilere, kolye bıçaklarından koleksiyonluk parçalara — kategorilere sığmayan özel üretim bıçaklar. Her biri tek tek dövülür, taşlanır ve elde polisajlanır.",
        careTitle: "Dövme ve Karbon Çelik Bıçak Bakımı",
        careContent: [
            "Dövme karbon çelik (Ck75) bıçaklar paslanmaz değildir; her kullanımdan sonra kurulayıp ince bir kat yağ sürün.",
            "Çelikte zamanla oluşan koyu patina doğaldır ve çeliği korur; zorla parlatmayın.",
            "Kesim dışı işlerde (vida sökme, kanırtma) kullanmayın; sert darbeler ağız kırılmasına yol açabilir.",
        ],
    },
    {
        slug: "kilic",
        category: "Kılıç",
        title: "El Yapımı Kılıçlar ve Katanalar",
        h1: "El Yapımı Kılıçlar",
        metaDescription: "El yapımı kılıçlar: Türk kılıcı, kurt başlı kılıç, Zülfikar, Fatih kılıcı ve katana modelleri. Duvar ve koleksiyon için özel üretim. Ücretsiz kargo.",
        keywords: ["el yapımı kılıç", "türk kılıcı", "zülfikar kılıcı", "katana", "kurt başlı kılıç", "koleksiyon kılıcı", "dekoratif kılıç"],
        intro: "Türk kılıç geleneğinden ilham alan, tarihi modellerin el yapımı yorumları. Kurt başlı kabzalar, üç hilal işlemeler ve katanalar — ofisinize, evinize veya koleksiyonunuza değer katacak parçalar.",
        careTitle: "Kılıç Bakımı ve Sergileme",
        careContent: [
            "Sergilenen kılıçları ayda bir kez kuru, tüy bırakmayan bezle silin ve namluya ince bir kat yağ uygulayın.",
            "Doğrudan güneş ışığı kabze ve kın malzemelerini soldurur; sergileme yerini buna göre seçin.",
            "Çıplak elle namluya dokunmaktan kaçının; parmak izindeki asit zamanla iz bırakır.",
        ],
    },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
    return categories.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): CategoryConfig | undefined {
    return categories.find((c) => c.category === name);
}

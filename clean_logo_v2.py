from PIL import Image
import numpy as np

def clean_logo(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    # RGB değerlerini al
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # 1. Adım: Arka planı temizle (Beyazlar ve Gri Dama Tahtası tonları)
    # Beyaz ve çok açık griler
    mask_white = (r > 200) & (g > 200) & (b > 200)
    
    # Gri dama tahtası desenleri (genelde 204, 204, 204 civarı)
    # Belirli bir gri aralığını hedefliyoruz
    mask_grey = (r > 150) & (r < 240) & (g > 150) & (g < 240) & (b > 150) & (b < 240) & (np.abs(r - g) < 10) & (np.abs(g - b) < 10)

    # Arka plan maskesi: Beyazlar VEYA Griler
    mask_bg = mask_white | mask_grey

    # 2. Adım: İçeriği Koru ve Düzenle
    # Bıçak İkonu ve Yazı (Koyu renkli kısımlar)
    # Koyu yerler (Yazı ve icon detayları)
    mask_content = ~mask_bg

    # Yeni görsel verisi oluştur
    new_data = np.zeros_like(data)

    # İçerik kısmını kopyala
    new_data[mask_content] = data[mask_content]

    # 3. Adım: Yazıyı Beyaza Çevir (Navbar koyu olduğu için)
    # Koyu lacivert/siyah olan kısımları (Yazı "AYBIÇAK") beyaza çeviriyoruz
    # Bıçağın gümüş/renkli kısımlarını korumaya çalışacağız ama çok koyu kısımlar beyaza dönebilir, bu okunurluk için iyi.
    
    # İçerik olup da koyu renkli olanlar (R, G, B hepsi düşük)
    r_content = new_data[:, :, 0]
    g_content = new_data[:, :, 1]
    b_content = new_data[:, :, 2]
    
    # Koyu renk eşiği (Yazı rengi)
    mask_dark_text = mask_content & (r_content < 100) & (g_content < 100) & (b_content < 120)

    # Yazıyı Beyaz Yap
    new_data[mask_dark_text, 0] = 255 # R
    new_data[mask_dark_text, 1] = 255 # G
    new_data[mask_dark_text, 2] = 255 # B
    new_data[mask_dark_text, 3] = 255 # Alpha tam opak

    # Bıçak kısmındaki grileri biraz koruyalım (tam beyaz olmasınlar) ama şeffaflığı kaldıralım
    # Mask_content içindeki diğer kısımların alphasını 255 yapalım
    new_data[mask_content, 3] = 255

    # Görüntüyü oluştur ve kaydet
    result_img = Image.fromarray(new_data)
    
    # Kenarları yumuşatmak için biraz crop yapabiliriz ama şimdilik gerek yok
    result_img.save(output_path)
    print(f"Saved processed logo to {output_path}")

# Dosya yolları
input_file = r"C:\Users\large\.gemini\antigravity\brain\c599f0d1-ffa9-420f-b5ff-6f997452a336\uploaded_media_1769856129195.png"
output_file = r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-python-clean.png"

clean_logo(input_file, output_file)

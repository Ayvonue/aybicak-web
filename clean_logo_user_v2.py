from PIL import Image, ImageFilter
import numpy as np

def clean_logo_user_refined(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # --- GELİŞMİŞ ARKA PLAN TEMİZLİĞİ ---
    # Sorun: Kenarlarda kalan beyaz/gri pikseller (Halo effect).
    # Çözüm: Arka plan tanımını genişletip, kenar piksellerinden kurtulacağız.
    
    # 1. Geniş Arka Plan Tespiti
    # Beyazlar, Açık Griler ve Dama Tahtası
    # Toleransı artırıyoruz: R,G,B hepsi > 50 ise ve birbirine yakınsa (gri/beyaz), potansiyel arka plandır.
    # Ancak Logo'nun gümüş kısımlarını korumalıyız. Logo metalik ve kontraslı.
    
    # Arka plan maskesi:
    # Renk (R,G,B) > 120 (Koyu grileri logoya ait sayalım)
    # Ve renkler birbirine çok yakın (Gri tonu)
    mask_bg_rough = (r > 120) & (g > 120) & (b > 120) & \
                    (np.abs(r - g) < 20) & (np.abs(g - b) < 20) & (np.abs(r - b) < 20)
                    
    # Ayrıca kesin beyazlar
    mask_white = (r > 200) & (g > 200) & (b > 200)
    
    mask_bg = mask_bg_rough | mask_white
    
    # --- 2. Kenar Temizliği (Erosion Benzeri) ---
    # Arka plan maskesini "genişleterek" logonun kenarındaki o yarı-beyaz pikselleri de yutmasını sağlayacağız.
    # Bunu PIL ImageFilter ile yapabiliriz ama numpy üzerinde manuel olarak da yapabiliriz.
    
    # Maskeyi Image'a çevirip işlem yapalım
    mask_img = Image.fromarray((mask_bg * 255).astype(np.uint8))
    
    # Maskeyi genişlet (Dilate) -> Bu işlem arka planı büyütür, logoyu daraltır (Erosion).
    # Kenarlardaki 1-2 piksellik beyazlığı temizler.
    mask_expanded = mask_img.filter(ImageFilter.MaxFilter(3)) # 3x3 kernel
    
    # Yeni maskeyi numpy dizisine çevir
    mask_final = np.array(mask_expanded) > 0
    
    # Veriyi kopyala
    new_data = data.copy()
    
    # Arka planı sil
    new_data[mask_final, 3] = 0
    
    # --- 3. Yarı Şeffaf Kenar Düzeltme ---
    # Logoya ait olup da kenarda kalan ve "biraz" beyaz olan pikselleri temizle.
    # Bu adım riskli olabilir, o yüzden MaxFilter(3) genellikle yeterlidir.
    
    # İkon ve Yazı rengine DOKUNMADAN kaydet
    result = Image.fromarray(new_data)
    result.save(output_path)
    print(f"Saved logo-user-refined.png to {output_path}")

clean_logo_user_refined(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-refined.png"
)

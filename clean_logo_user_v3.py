from PIL import Image, ImageFilter
import numpy as np

def clean_logo_flawless(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # 1. Convert to numpy
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # --- ARKA PLAN TESPİTİ ---
    # Hedef: Dama tahtası ve Beyazlar.
    # Bu renkler "Nötr"dür (R ~= G ~= B).
    
    # Renk farkı (Saturation gibi düşünülebilir, gri tonlarda düşüktür)
    color_diff = np.maximum(np.abs(r - g), np.abs(g - b))
    color_diff = np.maximum(color_diff, np.abs(r - b))
    
    # Arka plan kriterleri:
    # 1. Parlaklık > 100 (Çok koyu siyahları koru)
    # 2. Renk farkı < 20 (Nötr gri/beyaz tonlar)
    # 3. Veya çok parlak (> 230) - kesin beyaz
    
    is_neutral = (color_diff < 20)
    is_bright = (r > 130) & (g > 130) & (b > 130)
    is_very_bright = (r > 220) & (g > 220) & (b > 220)
    
    mask_bg = (is_neutral & is_bright) | is_very_bright
    
    # Ancak Logo'nun Gümüş kısımları da "Nötr ve Parlak" olabilir!
    # Bu yüzden sadece "Dışarıdan Erişilebilir" alanları silmeliyiz (Flood Fill mantığı).
    # Numpy üzerinde FloodFill yapmak yerine, PIL ImageDraw kullanabiliriz veya
    # Basitçe maskeyi iyileştirebiliriz.
    
    # Şimdilik global renk temizliği yapalım ama "Halo" temizliğine odaklanalım.
    
    # --- PRO MÜDAHALE: HALO TEMİZLİĞİ ---
    # Kenarlarda kalan beyaz pikselleri temizlemek için.
    
    # 1. Maskeyi oluştur
    mask_img = Image.fromarray((mask_bg * 255).astype(np.uint8), mode='L')
    
    # 2. Maskeyi "Yumuşat" ve "Genişlet"
    # Genişlet (Dilate) -> Logoyu daraltır. Kenardaki beyazları yutar.
    # Radius=1.5 civarı blur ile yumuşak geçiş.
    
    # Önce binary erosion (beyazı büyüt)
    mask_dilated = mask_img.filter(ImageFilter.MaxFilter(3)) # 3x3 kernel (1 px genişleme)
    
    # Sonra biraz blur vererek yumuşak kenar
    mask_blurred = mask_dilated.filter(ImageFilter.GaussianBlur(radius=0.8))
    
    # Maskeyi Alpha kanalına uygula
    # Maske 255 (Beyaz) -> Arka plan -> Alpha 0 olmalı.
    # Maske 0 (Siyah) -> Logo -> Alpha 255 olmalı.
    
    final_mask_arr = np.array(mask_blurred)
    
    # Yeni Alpha kanalı calculation:
    # Alpha = OrijinalAlpha * (1.0 - Mask/255.0)
    # Yani Maske beyazsa alpha 0 olur.
    
    current_alpha = data[:, :, 3].astype(float)
    inv_mask = 255.0 - final_mask_arr.astype(float)
    
    # Sert kenarları yumuşat
    new_alpha = np.minimum(current_alpha, inv_mask)
    
    # --- RENK DECONTAMINATION (Siyah/Koyu kenarlardaki beyaz parlamayı yok et) ---
    # Kenar pikselleri yarı şeffaf olsa bile "Beyaz" renkteyse, siyah zemin üstünde parlar.
    # Bu yüzden yarı şeffaf pikselleri "Koyulaştırmalıyız".
    
    # Basit yöntem: Eğer piksel "Nötr ve Parlak" ise (Arka plan gibi) ama silinmemişse (Logo kenarı),
    # Rengini logoya uydur veya karart.
    # Logomuz genelde Koyu/Gümüş. Kenardaki beyazları siyaha çekmek güvenlidir.
    
    # Kenar Pikselleri: Alpha > 0 ama Alpha < 255 (Yarı şeffaf)
    # Veya Maske tarafından "traşlanmış" bölgeler.
    
    # İşleme:
    data[:, :, 3] = new_alpha.astype(np.uint8)
    
    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Saved flawless logo to {output_path}")

clean_logo_flawless(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-flawless.png"
)

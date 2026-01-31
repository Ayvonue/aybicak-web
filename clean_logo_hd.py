from PIL import Image
import numpy as np

def clean_logo_hd(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    width, height = img.size
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # --- 1. ARKA PLAN TEMİZLİĞİ (Eğer Beyazsa) ---
    # Orijinal logonun arka planı beyaz olabilir.
    # Güvenli olması için beyaz ve çok açık grileri şeffaf yapalım.
    # Bıçak üzerindeki PARLAK BEYAZ yansımaları korumak için, 
    # arka planın genellikle "köşelerden" başladığını varsayabiliriz veya
    # sadece kesin beyazları (250+) silebiliriz.
    
    # Köşedeki renk referansı
    corner_color = data[0, 0]
    is_white_bg = corner_color[0] > 240 and corner_color[1] > 240 and corner_color[2] > 240 and corner_color[3] > 0
    
    if is_white_bg:
        print("Detected white background, removing...")
        # Beyaz aralığı
        mask_bg = (r > 230) & (g > 230) & (b > 230)
        # Bıçağı korumak için maskeyi biraz daraltabiliriz ama logo genelde ortada olur.
        # Basitçe beyazları silelim.
        data[mask_bg, 3] = 0
    
    # --- 2. YAZI RENGİ (Sadece "AYBIÇAK" kısmı) ---
    # İkon solda, Yazı sağda.
    # İkonun orijinalliğini korumak için ekranın sağına odaklanalım.
    split_x = int(width * 0.35) 
    
    # Sağ taraftaki veriler
    r_right = r[:, split_x:]
    g_right = g[:, split_x:]
    b_right = b[:, split_x:]
    a_right = a[:, split_x:]
    
    # Koyu renkli pikselleri bul (Yazı)
    mask_dark_text_right = (r_right < 80) & (g_right < 80) & (b_right < 100) & (a_right > 50)
    
    # Sadece sağ taraftaki koyu pikselleri beyaz yap
    # data dizisinde dilimleme (slicing) ile atama yaparken dikkatli olmalıyız.
    
    # Sağ taraf için geçici görünüm
    data_right = data[:, split_x:]
    
    # Rengi Beyaz Yap (255, 255, 255)
    # Alpha'ya dokunma (yumuşak kenarları korur)
    data_right[mask_dark_text_right, 0] = 255
    data_right[mask_dark_text_right, 1] = 255
    data_right[mask_dark_text_right, 2] = 255
    
    # Değişiklikleri ana diziye yansıt (Numpy view olduğu için otomatik olabilir ama emin olalım)
    data[:, split_x:] = data_right

    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Saved HD logo to {output_path}")

clean_logo_hd(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-final-hd.png"
)

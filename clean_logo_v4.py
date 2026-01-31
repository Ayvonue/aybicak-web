from PIL import Image
import numpy as np

def clean_logo_precise(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # --- 1. ARKA PLAN TEMİZLİĞİ ---
    # Hedef: Dama tahtası (gri/beyaz kareler) ve tam beyaz arka plan.
    # Gümüş bıçak detaylarına (ton farklarına) dokunmamak lazım.
    
    # Tam Beyaz ve çok açık griler (Arka plan)
    # Bıçağın parlak yerleri de beyaz olabilir, o yüzden toleransı çok yüksek tutmamalıyız.
    # Ancak arka plan dama tahtası olduğu için genelde belirgin renklerdedir.
    
    # Dama tahtası grileri genellikle R=G=B ve belirli aralıklardadır.
    mask_checkerboard = (np.abs(r - g) < 10) & (np.abs(g - b) < 10) & \
                        ((r > 200) | ((r > 150) & (r < 180))) # Genelde 204 ve beyaz arası
                        
    # Bu maske bıçağın gümüş kısımlarını da seçebilir. Bıçağı korumak için bir "Region of Interest" (ROI) veya renk analizi gerekebilir.
    # Basitçe: Bıçak metaliktir, arka plan mattır diyemeyiz.
    # Ama "AYBIÇAK" yazısı koyu renktir.
    
    # Arka planı şeffaf yap, AMA bıçak üzerindeki parlamaları koru.
    # Bunu yapmak zor olduğu için kullanıcıdan gelen "logo-target.png" görselindeki dama tahtasını spesifik olarak hedefleyelim.
    # Dama tahtası pikselleri tam grid şeklindedir ama burada piksel bazlı gidiyoruz.
    
    # Strateji: Köşe piksellerden "arka plan rengini" alıp flood fill yapmak daha mantıklı olurdu ama PIL floodfill alpha destekler mi?
    # Numpy ile devam edelim: Açık renkleri şeffaf yapalım.
    
    mask_bg = (r > 200) & (g > 200) & (b > 200) 
    # Checkerboard'ın gri kareleri (ör. 204, 204, 204)
    mask_grey_squares = (r > 150) & (r < 210) & (np.abs(r-g)<5) & (np.abs(g-b)<5)
    
    # Hepsini birleştir
    mask_background_removal = mask_bg | mask_grey_squares
    
    # --- 2. YAZI RENGİ (AYBIÇAK) ---
    # Koyu lacivert/siyah yazıyı beyaz yapmalıyız.
    # Yazı rengi tespiti: Koyu pikseller.
    mask_dark_text = (r < 60) & (g < 60) & (b < 80) & (a > 200)

    new_data = data.copy()
    
    # Arka planı sil
    new_data[mask_background_removal, 3] = 0
    
    # Yazıyı beyaz yap (Bıçağın siyah sapı varsa o da beyazlaşabilir, bu kabul edilebilir genelde)
    new_data[mask_dark_text, 0] = 255
    new_data[mask_dark_text, 1] = 255
    new_data[mask_dark_text, 2] = 255
    # Yazının opaklığını koru (veya tam yap)
    new_data[mask_dark_text, 3] = 255

    result = Image.fromarray(new_data)
    result.save(output_path)
    print(f"Saved precise logo to {output_path}")

clean_logo_precise(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-target.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-final-v4.png"
)

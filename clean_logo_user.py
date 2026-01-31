from PIL import Image
import numpy as np

def clean_logo_user(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

    # --- ARKA PLAN TEMİZLİĞİ ---
    # Kullanıcının attığı resimde dama tahtası ve beyazlar var.
    # Sadece bunları sileceğiz. İkon ve Yazı rengine ASLA dokunmayacağız.
    
    # 1. Beyaz Fon (230-255 arası)
    mask_white = (r > 230) & (g > 230) & (b > 230)
    
    # 2. Dama Tahtası Grileri (150-220 arası, nötr gri)
    mask_grey = (r > 150) & (r < 225) & (g > 150) & (g < 225) & (b > 150) & (b < 225) & \
                (np.abs(r - g) < 15) & (np.abs(g - b) < 15) & (np.abs(r - b) < 15)
                
    # Maskeyi birleştir
    mask_bg = mask_white | mask_grey
    
    # Arka planı sil (Alpha = 0)
    data[mask_bg, 3] = 0
    
    # Yazı veya İkon rengine dokunma! (User request)
    
    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Saved logo-user-processed.png to {output_path}")

clean_logo_user(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-processed.png"
)

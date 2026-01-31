from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def clean_logo_hybrid(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # --- ADIM 1: DIŞ ARKA PLAN (Flood Fill) ---
    # Dışarıdan bağlı tüm beyaz/gri alanları temizle.
    # Toleransı (thresh) dikkatli ayarlayalım.
    # Dama tahtası beyaz(255) ve gri(204). Fark 51. Thresh 60 ideal.
    
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=60)
    ImageDraw.floodfill(img, (width-1, 0), (0, 0, 0, 0), thresh=60)
    ImageDraw.floodfill(img, (0, height-1), (0, 0, 0, 0), thresh=60)
    ImageDraw.floodfill(img, (width-1, height-1), (0, 0, 0, 0), thresh=60)
    
    # --- ADIM 2: İÇERİDE KALAN DAMA TAHTASI ---
    # Hilalin içinde veya harflerin arasında kalan kapalı alanlar.
    # Bunları "Renk Eşleşmesi" ile sileceğiz ama toleransı SIFIRA yakın tutacağız.
    # Böylece gümüş bıçağın tonlarını silmeyiz.
    
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Checkerboard Grey: Genelde (204, 204, 204)
    # Bıçak Gümüşü: (190-220) arası değişir.
    # Riskli.
    # Ancak Checkerboard pikseli "Flat"tir (Düzdür).
    # Yanındaki pikselle aynı renktedir (Blok halindedir).
    # Bıçak ise Gradientli (değişken)dir.
    
    # Basitçe: Çok dar bir aralık hedefleyelim.
    # Genelde ekran görüntüsündeki gri: 204 veya 230-240 arası (Light theme vs dark theme).
    # Maske: R=G=B (Nötr) ve (150 < Parlaklık < 250)
    
    # İçeride kalan beyazları silmek için:
    mask_white_inner = (r > 250) & (g > 250) & (b > 250) & (a > 0)
    data[mask_white_inner, 3] = 0
    
    # İçeride kalan nötr grileri silmek için:
    # (r==g) ve (g==b) ve (r > 180) -> Bu gümüş bıçağı da silebilir mi?
    # Evet silebilir. 
    # O yüzden bunu yapmayalım. "Hilal ve bıçak tarafını almamışsın" demesinin sebebi buydu.
    # İçerideki grilere "DOKUNMAYALIM".
    
    # Kullanıcı "Hilal ve bıçak tarafını almamışsın" dediğinde, muhtemelen Flood Fill İÇERİ GİREMEDİĞİ için
    # hilalin içindeki dama tahtası duruyordu.
    # VEYA, çok fazla sildiğim için hilal gitti.
    # Bence: Hilalin içi dolu kaldı (Dama tahtası silinmedi).
    
    # Çözüm: Flood Fill'i manuel olarak "Hilalin ortasına" da uygulayabiliriz ama koordinat bilmiyoruz.
    # O zaman, "En çok tekrar eden gri rengi" bulup silebiliriz.
    # Arka plan en baskın renktir.
    
    # Şimdilik sadece Flood Fill + White Removal yapalım.
    # Grilere dokunmak çok riskli.
    
    # --- ADIM 3: KENAR YUMUŞATMA (Anti-Aliasing) ---
    # Flood Fill sert kenar bırakır. Bunu yumuşatalım.
    
    # Tekrar Image'a çevir
    img_processed = Image.fromarray(data)
    
    # Alpha kanalını al
    alpha = img_processed.split()[3]
    
    # Alpha üzerinde çok hafif blur
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    # Geri koy
    img_processed.putalpha(alpha)
    
    img_processed.save(output_path)
    print(f"Saved hybrid logo to {output_path}")

clean_logo_hybrid(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-user-source.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-native.png"
)

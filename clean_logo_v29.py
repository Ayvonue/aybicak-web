from PIL import Image, ImageEnhance
import numpy as np

def clean_logo_v29(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Target: Brighten the dark navy pixels, keep Silver pixels.
    # Silver > 100 brightness.
    # Navy < 50 brightness.
    
    rgb = data[:, :, :3]
    brightness = np.mean(rgb, axis=2)
    
    # Define Masks
    # Background is already alpha=0, but we look at valid pixels
    mask_exists = data[:, :, 3] > 0
    mask_silver = (brightness > 90) & mask_exists
    mask_navy = (~mask_silver) & mask_exists
    
    # Action: Boost Navy brightness
    # Factor 3.0 (300%)
    factor = 3.0
    
    # We apply this factor to R, G, B channels of Navy pixels
    # We must clip to 255
    
    # Convert separate channels to float to avoid overflow
    r, g, b = data[:,:,0].astype(float), data[:,:,1].astype(float), data[:,:,2].astype(float)
    
    r[mask_navy] *= factor
    g[mask_navy] *= factor
    b[mask_navy] *= factor
    
    # Clip
    r = np.clip(r, 0, 255)
    g = np.clip(g, 0, 255)
    b = np.clip(b, 0, 255)
    
    # Assign back
    data[:,:,0] = r.astype(np.uint8)
    data[:,:,1] = g.astype(np.uint8)
    data[:,:,2] = b.astype(np.uint8)
    
    # Save
    img_new = Image.fromarray(data)
    img_new.save(output_path)
    print(f"Saved {output_path}")

# Input is the V28 Perfect Shape logo
clean_logo_v29(
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-hq-final-v28.png",
    r"c:\Users\large\.gemini\antigravity\scratch\aybicak-web\public\logo-visible-v29.png"
)

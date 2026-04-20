from PIL import Image

def remove_white_background(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        min_val = min(r, g, b)
        max_val = max(r, g, b)
        
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        elif r > 180 and g > 180 and b > 180 and (max_val - min_val) < 20:
            alpha = int(255 * ((255 - max_val) / 75.0))
            new_data.append((255, 255, 255, alpha))
        elif r < 50 and g < 50 and b < 50:
            new_data.append((255, 255, 255, a))
        else:
            new_data.append(item)
                
    img.putdata(new_data)
    
    # Crop transparent borders to maximize size
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # Scale up to make it super crisp
    width, height = img.size
    img = img.resize((width * 3, height * 3), Image.LANCZOS)
        
    img.save(out_path, "PNG")

if __name__ == "__main__":
    remove_white_background("public/Real Estate  Logo.png", "public/logo-transparent.png")

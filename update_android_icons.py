import os
from PIL import Image, ImageOps

# Source original user logo
src_img_path = r'C:\Users\Fabrizio\.gemini\antigravity\brain\5b7f9a72-515f-4efc-909f-3365b41757c5\.user_uploaded\media__1789639170033.png'
android_res = r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\android\app\src\main\res'

img = Image.open(src_img_path).convert('RGBA')
w, h = img.size

# Extract top V-leaf icon area and make background transparent
icon_region = img.crop((0, 0, w, int(h * 0.65)))
datas = icon_region.getdata()
new_data = [(255, 255, 255, 0) if (item[0] > 240 and item[1] > 240 and item[2] > 240) else item for item in datas]

transparent_icon = Image.new('RGBA', icon_region.size)
transparent_icon.putdata(new_data)

bbox = transparent_icon.getbbox()
cropped_icon = transparent_icon.crop(bbox) if bbox else transparent_icon

def make_sq_icon(icon_img, target_size, padding_ratio=0.15, bg_color=(255, 255, 255, 255)):
    # Create square icon with specified background color (default white)
    base = Image.new('RGBA', (target_size, target_size), bg_color)
    max_icon_size = int(target_size * (1 - 2 * padding_ratio))
    
    cw, ch = icon_img.size
    ratio = min(max_icon_size / cw, max_icon_size / ch)
    nw, nh = int(cw * ratio), int(ch * ratio)
    
    resized = icon_img.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (target_size - nw) // 2
    oy = (target_size - nh) // 2
    
    base.paste(resized, (ox, oy), resized)
    return base

def make_foreground_icon(icon_img, target_size):
    # Android Adaptive Foreground requires 66% safe zone centered transparent canvas
    base = Image.new('RGBA', (target_size, target_size), (0, 0, 0, 0))
    safe_zone_size = int(target_size * 0.66)
    
    cw, ch = icon_img.size
    ratio = min(safe_zone_size / cw, safe_zone_size / ch)
    nw, nh = int(cw * ratio), int(ch * ratio)
    
    resized = icon_img.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (target_size - nw) // 2
    oy = (target_size - nh) // 2
    
    base.paste(resized, (ox, oy), resized)
    return base

# Mipmap density sizes: (folder_name, full_icon_size, foreground_icon_size)
densities = [
    ('mipmap-mdpi', 48, 108),
    ('mipmap-hdpi', 72, 162),
    ('mipmap-xhdpi', 96, 216),
    ('mipmap-xxhdpi', 144, 324),
    ('mipmap-xxxhdpi', 192, 432),
]

for folder, icon_sz, fg_sz in densities:
    folder_path = os.path.join(android_res, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # 1. Full square launcher icon (white background with green leaf)
    sq_icon = make_sq_icon(cropped_icon, icon_sz, padding_ratio=0.12, bg_color=(255, 255, 255, 255))
    sq_icon.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')
    sq_icon.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')
    
    # 2. Adaptive Foreground icon (transparent background)
    fg_icon = make_foreground_icon(cropped_icon, fg_sz)
    fg_icon.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), 'PNG')
    
    print(f'Updated icons for {folder}')

# 3. Update Splash screens
splash_folders = [
    ('drawable', 512, 512),
    ('drawable-land-hdpi', 800, 480),
    ('drawable-land-mdpi', 480, 320),
    ('drawable-land-xhdpi', 1280, 720),
    ('drawable-land-xxhdpi', 1600, 960),
    ('drawable-land-xxxhdpi', 1920, 1280),
    ('drawable-port-hdpi', 480, 800),
    ('drawable-port-mdpi', 320, 480),
    ('drawable-port-xhdpi', 720, 1280),
    ('drawable-port-xxhdpi', 960, 1600),
    ('drawable-port-xxxhdpi', 1280, 1920),
]

# For splash, use full logo (icon + "vita" text) on clean background
for folder, sw, sh in splash_folders:
    folder_path = os.path.join(android_res, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    splash_bg = Image.new('RGBA', (sw, sh), (255, 255, 255, 255))
    
    # Place full logo in center
    target_logo_size = min(sw, sh) * 0.4
    lw, lh = img.size
    ratio = min(target_logo_size / lw, target_logo_size / lh)
    nw, nh = int(lw * ratio), int(lh * ratio)
    
    resized_logo = img.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = int((sw - nw) / 2)
    oy = int((sh - nh) / 2)
    
    splash_bg.paste(resized_logo, (ox, oy), resized_logo)
    splash_bg.save(os.path.join(folder_path, 'splash.png'), 'PNG')
    print(f'Updated splash for {folder}')

print('All Android icons and splash screens updated successfully!')

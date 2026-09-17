import os

favicon_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <!-- Vita Icon Logo -->
  <g transform="translate(0, 10)">
    <!-- Left Stem of V -->
    <path d="M 102 85 C 135 110 188 220 244 382 C 248 395 264 395 268 382 C 285 330 300 270 306 200 C 275 230 258 275 248 320 C 238 240 195 130 102 85 Z" fill="#127A45"/>
    
    <!-- Right Leaf Stem of V -->
    <path d="M 252 390 C 265 310 305 200 416 22 C 310 22 245 130 252 390 Z" fill="#127A45"/>
    
    <!-- Leaf Vein Cutout -->
    <path d="M 285 205 Q 338 105 398 52" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" fill="none"/>
  </g>
</svg>'''

full_logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <!-- Vita Full Logo (Icon + Text) -->
  <g transform="translate(0, -20)">
    <!-- Left Stem of V -->
    <path d="M 112 75 C 142 98 190 195 244 340 C 248 352 264 352 268 340 C 282 295 296 242 302 180 C 275 207 258 248 248 288 C 238 216 198 116 112 75 Z" fill="#127A45"/>
    
    <!-- Right Leaf Stem of V -->
    <path d="M 252 348 C 263 276 300 178 400 18 C 304 18 246 114 252 348 Z" fill="#127A45"/>
    
    <!-- Leaf Vein Cutout -->
    <path d="M 282 182 Q 330 92 384 45" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" fill="none"/>
  </g>
  
  <!-- "vita" Text -->
  <text x="256" y="445" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="110" fill="#3D4045" letter-spacing="-2">vita</text>
</svg>'''

horizontal_logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" fill="none">
  <!-- Vita Horizontal Logo -->
  <g transform="translate(5, 5) scale(0.18)">
    <path d="M 112 75 C 142 98 190 195 244 340 C 248 352 264 352 268 340 C 282 295 296 242 302 180 C 275 207 258 248 248 288 C 238 216 198 116 112 75 Z" fill="#127A45"/>
    <path d="M 252 348 C 263 276 300 178 400 18 C 304 18 246 114 252 348 Z" fill="#127A45"/>
    <path d="M 282 182 Q 330 92 384 45" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" fill="none"/>
  </g>
  <text x="95" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="52" fill="#127A45" letter-spacing="-1">vita</text>
</svg>'''

public_dir = 'c:/Users/Fabrizio/Desktop/app/smart/v14/frontend/public'
with open(os.path.join(public_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(favicon_svg)

with open(os.path.join(public_dir, 'logo-vita.svg'), 'w', encoding='utf-8') as f:
    f.write(full_logo_svg)

with open(os.path.join(public_dir, 'logo-vita-horizontal.svg'), 'w', encoding='utf-8') as f:
    f.write(horizontal_logo_svg)

print('SVG assets created successfully!')

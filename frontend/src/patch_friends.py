import sys
import re

file_path = r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeriesDetailModal.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the avatar fallback mapping
content = content.replace(
    "avatar: f.friend_avatar || '',",
    "avatar: f.friend_avatar ? resolveImageUrl(f.friend_avatar) : '/default_avatar.png',"
)

# 2. Re-arrange the DOM
# Find the exact container
old_html = '''            {/* AMICI CHE LA GUARDANO E LISTE (In basso a destra) */}
            <div className="absolute bottom-4 right-6 flex items-center flex-row-reverse gap-1.5 z-20 max-w-[calc(100%-340px)] justify-start">
               {/* Liste truncate con ResizeObserver */}
               <SeriesDetailListsBar 
                 lists={listsWithSeries} 
                 onOpenManager={() => setIsListManagerOpen(true)} 
                 onOpenDrawer={(id) => {
                   if (id) {
                     setListDetailId(id);
                   } else {
                     setShowListsPanel(true);
                   }
                 }}
               />
               {SERIES_FRIENDS.length > 4 ? (
                  <div 
                    onClick={() => setShowFriendsPanel(true)}
                    className="relative cursor-pointer hover:z-30 transition-transform hover:scale-110 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-md text-blue-600"
                    title="Vedi tutti gli amici"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                  </div>
               ) : (
                  SERIES_FRIENDS.map(f => (
                    <div key={f.id} onClick={() => setShowFriendsPanel(true)} className="relative group/friend cursor-pointer hover:z-30 transition-transform hover:scale-110">
                       <img src={f.avatar} alt={f.name} className={w-8 h-8 rounded-full border-2 bg-gray-200 shadow-md \} />
                       
                       {/* Tooltip on hover */}
                       <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/friend:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                         {f.name}
                       </div>
                    </div>
                  ))
               )}
            </div>'''

new_html = '''            {/* AMICI CHE LA GUARDANO E LISTE (In basso a destra) */}
            <div className="absolute bottom-4 right-6 flex flex-col items-end gap-2 z-20 max-w-[calc(100%-340px)] justify-start">
               
               {/* AMICI (Rigo sopra) */}
               {SERIES_FRIENDS.length > 0 && (
                 <div className="flex items-center flex-row-reverse gap-1.5">
                   {SERIES_FRIENDS.length > 4 ? (
                      <div 
                        onClick={() => setShowFriendsPanel(true)}
                        className="relative cursor-pointer hover:z-30 transition-transform hover:scale-110 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-md text-blue-600"
                        title="Vedi tutti gli amici"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                      </div>
                   ) : (
                      SERIES_FRIENDS.map(f => (
                        <div key={f.id} onClick={() => setShowFriendsPanel(true)} className="relative group/friend cursor-pointer hover:z-30 transition-transform hover:scale-110">
                           <img src={f.avatar} alt={f.name} className={w-8 h-8 object-cover rounded-full border-2 bg-gray-200 shadow-md \} />
                           
                           {/* Tooltip on hover */}
                           <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/friend:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                             {f.name}
                           </div>
                        </div>
                      ))
                   )}
                 </div>
               )}

               {/* Liste truncate con ResizeObserver */}
               <SeriesDetailListsBar 
                 lists={listsWithSeries} 
                 onOpenManager={() => setIsListManagerOpen(true)} 
                 onOpenDrawer={(id) => {
                   if (id) {
                     setListDetailId(id);
                   } else {
                     setShowListsPanel(true);
                   }
                 }}
               />
            </div>'''

if old_html in content:
    content = content.replace(old_html, new_html)
    print("DOM replacement successful!")
else:
    print("DOM replacement failed! Could not find the exact snippet.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

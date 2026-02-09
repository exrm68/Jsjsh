# 🎬 StreamBox - সম্পূর্ণ গাইড

## ✅ **এই Files এ কী আছে:**

### 📁 **All Original Files - কিছুই মিসিং নেই!**

```
✅ components/
   ├── AdminPanel.tsx (82KB - সম্পূর্ণ original)
   ├── MovieDetails.tsx (19KB - সব features আছে)
   ├── Banner.tsx, BottomNav.tsx, etc (সব আছে)
   
✅ types.ts - Perfect structure
✅ App.tsx - Original
✅ constants.ts, firebase.ts, package.json, etc - সব আছে
```

---

## 🎯 **Features - সব কিছু আছে!**

### 🎬 **Movie Management:**
```
Fields:
- Title, Thumbnail, Category, Year, Rating, Quality, Description
- Telegram Code (Watch এর জন্য) ✅
- Download Code (Download এর জন্য - Optional) ✅
- Download Link (Alternative link - Optional) ✅
- Top 10, Story, Banner controls ✅
```

### 📺 **Series Management:**
```
Series Info + Episodes:
Each Episode has:
- Title, Season, Number, Duration
- Telegram Code (Watch) ✅
- Download Code (Download - Optional) ✅
- Download Link (Alternative - Optional) ✅
```

### 🔥 **Top 10 (Netflix Style):**
```
✅ Movies/Series select করতে পারবে
✅ Position (1-10) set করতে পারবে
✅ Drag করে reorder করতে পারবে
✅ Top 10 tab এ manage করতে পারবে
```

### 📱 **Stories (Instagram Style):**
```
✅ Story circle দেখাবে
✅ Click করে full screen story
✅ Movie/Series এ redirect
✅ Stories tab এ manage করতে পারবে
```

### 🎨 **Banners:**
```
✅ Main banner rotation
✅ Movie link করতে পারবে
✅ Custom image upload
✅ Banners tab এ manage করতে পারবে
```

### ⚙️ **Settings (Working - কালো না!):**
```
✅ Bot Username set করতে পারবে
✅ Channel Link set করতে পারবে
✅ Notice Text customize করতে পারবে
✅ Notice Enable/Disable করতে পারবে
✅ Feature toggles (Top 10, Stories, Banners)
✅ App Name, Primary Color change করতে পারবে
✅ Categories manage করতে পারবে
```

---

## 🚀 **Deployment Instructions:**

### Step 1: তোমার Project এ Replace করো
```bash
# Backup নাও (optional)
cp -r your-project your-project-backup

# Components replace করো
cp -r components/* your-project/src/components/

# Main files replace করো
cp types.ts your-project/src/
cp App.tsx your-project/src/
cp constants.ts your-project/src/

# অথবা সব একসাথে:
cp -r * your-project/src/
```

### Step 2: Install Dependencies
```bash
cd your-project
npm install
```

### Step 3: Build
```bash
npm run build
```

### Step 4: Deploy
```bash
# Vercel
vercel --prod

# অথবা Netlify
netlify deploy --prod --dir=dist
```

### Step 5: Configure Admin
```
1. App খোলো
2. Logo তে 5-7 বার tap করো (দ্রুত)
3. Admin login করো
4. Settings tab এ যাও
5. Bot Username দাও (without @)
6. Channel Link দাও
7. Save Settings click করো
```

---

## 📝 **Admin Panel Usage:**

### **Upload Tab - Single Movie:**
```
1. Basic Info:
   - Title: "Jawan"
   - Thumbnail: https://image.jpg
   - Category: "Exclusive"
   - Year: "2023"
   - Rating: "9.5"
   - Quality: "4K"
   - Description: "..."

2. Telegram Codes:
   - Telegram Code: 22 (Watch এর জন্য)
   - Download Code: 23 (Download এর জন্য - Optional)
   - Download Link: https://drive.google.com/... (Optional)

3. Premium Features:
   - [✓] Add to Top 10 → Position: 1
   - [✓] Enable Story → Image: https://...
   - [✓] Featured Banner → Order: 1

4. [Publish Movie]
```

### **Upload Tab - Series:**
```
1. Series Info (same as movie)

2. Episodes Section:
   Add Episode:
   - Title: "Episode 1: Pilot"
   - Season: 1
   - Episode Number: 1
   - Duration: "45 min"
   - Telegram Code: 65 (Watch)
   - Download Code: 66 (Download - Optional)
   - Download Link: https://... (Optional)
   
   [+ Add Episode]

3. Episode List:
   S1E1: Episode 1: Pilot
   Watch: 65 | Download: 66 | Link: ✓
   [Edit] [Delete]

4. [Publish Series]
```

### **Content Tab:**
```
- সব movies/series list
- Search করতে পারবে
- Category filter করতে পারবে
- Edit/Delete করতে পারবে
```

### **Top 10 Tab:**
```
Current Top 10:
- #1 Movie Title
- #2 Another Movie
  Position change করতে পারবে
  [Remove from Top 10]

Add to Top 10:
- Available movies list
  [Add to Top 10]
```

### **Banners Tab:**
```
Add Banner:
- Title: "New Release"
- Image URL: https://...
- Movie (Optional): Select from list
[Add Banner]

Current Banners:
- Banner 1 [Delete]
- Banner 2 [Delete]
```

### **Stories Tab:**
```
Add Story:
- Story Circle Image: https://...
- Full Image: https://...
- Link to Movie (Optional)
[Add Story]

Current Stories:
- Story 1 [Delete]
- Story 2 [Delete]
```

### **Settings Tab:**
```
App Information:
- App Name: "CINEFLIX"
- Primary Color: #FF0000

Telegram Settings:
- Bot Username: your_bot (without @)
- Channel Link: https://t.me/yourchannel

Notice Bar:
- [✓] Enable Notice Bar
- Notice Text: "Welcome to CINEFLIX!"

Feature Control:
- [✓] Show Top 10
- [✓] Show Stories
- [✓] Show Banners

Categories Management:
- Exclusive [x]
- Korean Drama [x]
- Series [x]
+ Add New Category

[Save Settings]
```

---

## 🎯 **User Experience:**

### **Single Movie:**
```
User clicks thumbnail
  ↓
Movie Details page opens
  ↓
Shows:
  [▶ Watch Now] → t.me/{bot}?start={telegramCode}
  [⬇ Download] → t.me/{bot}?start={downloadCode} or downloadLink
```

### **Series:**
```
User clicks thumbnail
  ↓
Series Details page opens
  ↓
Tabs: [Episodes] [Info]
  ↓
Episodes Tab shows:
  Season 1:
    E1: Episode Title
      [▶ Watch] → t.me/{bot}?start={episode.telegramCode}
      [⬇ Download] → t.me/{bot}?start={episode.downloadCode}
      [🔗 Alt Link] → episode.downloadLink (if exists)
```

---

## 💡 **Important Notes:**

### **Telegram Codes:**
```
✅ শুধু numbers use করো: 22, 527, 72772
❌ Letters বা symbols না: ABC, @22, #527
✅ যেকোনো length হতে পারে
```

### **Bot Username:**
```
✅ Correct: your_bot
❌ Wrong: @your_bot
❌ Wrong: https://t.me/your_bot
```

### **Optional Fields:**
```
- Download Code → না দিলে শুধু Watch button দেখাবে
- Download Link → Extra download option
- Episode Download Code → না দিলে শুধু Watch
```

### **Firebase Structure:**
```
movies/
  movie1/
    title: "Jawan"
    telegramCode: "22"
    downloadCode: "23"
    downloadLink: "https://..."
    episodes: null
  
  series1/
    title: "Stranger Things"
    episodes: [
      {
        telegramCode: "65"
        downloadCode: "66"
        downloadLink: "https://..."
      }
    ]

settings/
  config/
    botUsername: "your_bot"
    channelLink: "https://t.me/..."
    noticeText: "Welcome!"
    enableTop10: true
```

---

## ✅ **Testing Checklist:**

Deploy করার পর এইগুলো test করো:

- [ ] Admin panel খুলছে? (Logo তে 5-7 tap)
- [ ] Settings save হচ্ছে?
- [ ] Bot Username set হচ্ছে?
- [ ] Movie add করতে পারছে?
- [ ] Series add করতে পারছে?
- [ ] Episode add করতে পারছে?
- [ ] Watch button কাজ করছে? (Telegram bot এ যাচ্ছে?)
- [ ] Download button কাজ করছে?
- [ ] Top 10 দেখাচ্ছে?
- [ ] Stories দেখাচ্ছে?
- [ ] Banners দেখাচ্ছে?
- [ ] Notice bar দেখাচ্ছে?
- [ ] Mobile এ ঠিক দেখাচ্ছে?

---

## 🐛 **Common Issues & Solutions:**

### ❌ **Settings page কালো দেখাচ্ছে**
✅ Solution: Hard refresh করো (Ctrl + Shift + R)
✅ এই version এ fix করা হয়েছে

### ❌ **Telegram link কাজ করছে না**
✅ Check করো: Bot Username ঠিক আছে কিনা
✅ Check করো: @ দিয়েছ কিনা (দেওয়া যাবে না)

### ❌ **Download button দেখাচ্ছে না**
✅ Check করো: Download Code দিয়েছ কিনা
✅ না দিলে শুধু Watch button দেখাবে

### ❌ **Episode add হচ্ছে না**
✅ Check করো: Title আর Telegram Code required

### ❌ **Build failed**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎉 **Final Words:**

ভাই, এই files এ **সব কিছু আছে!**

- ✅ তোমার original AdminPanel (82KB)
- ✅ সব features working
- ✅ Top 10, Stories, Banners
- ✅ Settings page ঠিক
- ✅ Movie + Series management
- ✅ Download Code + Link support
- ✅ কোনো কিছু missing নেই!

**শুধু replace করো আর deploy করো - সব কাজ করবে!** 💪

---

**Good luck! 🚀 তুমি পারবে!** 😊

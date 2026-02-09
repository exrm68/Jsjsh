# 🎬 CINEFLIX - Admin Quick Reference Card

## 🔐 Admin Access করুন
```
1. Site খুলুন
2. "CINEFLIX" লোগোতে 5-7 বার দ্রুত TAP করুন (2 সেকেন্ডে)
3. Login করুন
```

---

## ✅ যা করতে পারবেন (Admin Panel)

### 📝 Content যোগ করা
| Field | Example | Required |
|-------|---------|----------|
| Title | "Jawan" | ✅ |
| Category | Exclusive/Korean Drama/Series | ✅ |
| Thumbnail | https://image-url.jpg | ✅ |
| Description | "Action thriller..." | - |
| Year | 2023 | - |
| Rating | 9.5 | - |
| Quality | 4K HDR | - |
| Initial Views | 2,850 | - |
| Telegram Code | jawan_4k | ✅ |

### 📺 Episode যোগ করা
| Field | Example |
|-------|---------|
| Season | 1, 2, 3... |
| Title | "Episode 1" |
| Duration | "45m" or "1h 20m" |
| Code | ep1_s1 |

### ⚙️ Settings
- **Bot Username**: YourBot_username
- **Channel Link**: https://t.me/yourchannel
- **Auto View**: ON/OFF
- **Interval**: 30min / 1hr / 2hr / 6hr / 24hr

---

## ❌ যা করতে পারবেন না

### Code থেকে চেঞ্জ করতে হবে:
- ❌ App Logo (CINEFLIX)
- ❌ Category Names
- ❌ Notice Bar Text
- ❌ Colors/Theme
- ❌ Button Texts

---

## 🎯 Content Type গাইড

### Exclusive → প্রিমিয়াম কন্টেন্ট
- ✅ Banner এ দেখাবে
- ✅ Feature হবে
- ✅ Trending এ আসবে (high rating হলে)

### Korean Drama → কোরিয়ান সিরিজ
- ✅ আলাদা category filter
- ✅ Episodes যোগ করা যাবে
- ✅ Multiple seasons support

### Series → সাধারণ সিরিজ
- ✅ Episodes যোগ করা যাবে
- ✅ Season numbering
- ✅ Auto episode ordering

---

## 🔥 Pro Tips

### 1. Banner এ আনতে চান?
```
Category: "Exclusive" সিলেক্ট করুন
অথবা
Rating: 8.5+ দিন
```

### 2. Trending Row এ আনতে চান?
```
Rating: 8.0+ দিন
Automatically সবার উপরে আসবে
```

### 3. View Count বাড়াতে চান?
```
Settings → Auto View Increment → ON
Interval সিলেক্ট করুন
Save Configuration
```

### 4. Multiple Season যোগ করতে চান?
```
Episode যোগ করার সময়:
Season: 1 → Episodes যোগ করুন
Season: 2 → আবার Episodes যোগ করুন
Automatically sorted হবে
```

---

## 🚀 Quick Actions

### নতুন Movie
1. Add Content → Fill Form → Publish

### নতুন Series
1. Add Content → Fill Form
2. Episodes Add করুন (Season Number দিন)
3. Publish

### Content Edit
1. Manage Content → Edit button → Update

### Content Delete
1. Manage Content → Delete button → Confirm

### Bot Settings
1. App Settings → Change → Save

---

## 📊 Auto Features

### Automatic হয় যা:
- ✅ Banner Slider (6 sec interval)
- ✅ Trending Sort (rating অনুযায়ী)
- ✅ Story Circles (latest 4)
- ✅ Search Index
- ✅ Real-time Updates
- ✅ View Increment (enabled হলে)

---

## 🔄 Real-time Updates

### যখনই Content যোগ/এডিট/ডিলিট করবেন:
```
✅ Users সাথে সাথে দেখবে
✅ Refresh লাগবে না
✅ Live sync হবে
✅ Database automatically update
```

---

## 🎯 File Code Format

### Movies:
```
movie_name_quality
Example: jawan_4k, surongo_hd
```

### Series Episodes:
```
s{season}_ep{number}
Example: s1_ep1, s2_ep5
```

### Bot Link Format:
```
t.me/{BotUsername}?start={FileCode}
Example: t.me/Cinaflix_Streembot?start=jawan_4k
```

---

## ⚠️ Important Notes

### Firebase:
- ✅ Connection আছে
- ✅ Auto sync হয়
- ✅ Real-time updates
- ✅ Secure storage

### Performance:
- ✅ Home এ 50 content লোড (fast)
- ✅ Search এ সব content (on demand)
- ✅ 1000+ content handle করতে পারে
- ✅ No lag বা crash

### Security:
- ✅ Admin access hidden (logo tap)
- ✅ Login required
- ✅ Firestore rules protected
- ✅ Users শুধু view করতে পারে

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Admin panel খুলছে না | 2 সেকেন্ডে 5-7 বার tap করুন |
| Content save হচ্ছে না | Title & Thumbnail দিয়েছেন? |
| Firebase error | Config সঠিক আছে? |
| View বাড়ছে না | Auto increment ON করেছেন? |
| Banner এ আসছে না | Exclusive category দিয়েছেন? |

---

## 📞 Support Files

বিস্তারিত জানতে পড়ুন:
- 📖 `README-FIRST.md` - Quick Start
- 📚 `DEPLOYMENT-GUIDE-BANGLA.md` - Full Guide
- 🔍 `COMPLETE-CONTROL-GUIDE.md` - All Features
- 📊 `FEATURE-COMPARISON.md` - What's New
- ✅ `SETUP-CHECKLIST.md` - Step by Step

---

**Print করে রাখুন! 🖨️ সবসময় কাজে লাগবে! 🎬✨**

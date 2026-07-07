# ⚡ Quick Start Guide

## 🚀 3 Bước để chạy app

### 1️⃣ Cài đặt & Chạy Locally

```bash
cd music-player

# Cài dependencies
npm install

# Chạy backend server
npm run server
```

Mở browser: **http://localhost:5000**

---

## 🌍 Deploy lên Render (5 phút)

### 1️⃣ Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/music-player.git
git push -u origin main
```

### 2️⃣ Setup MongoDB Atlas
1. Truy cập https://www.mongodb.com/cloud/atlas
2. Tạo free cluster
3. Tạo database user
4. Copy connection string

### 3️⃣ Deploy trên Render
1. Truy cập https://render.com (đăng nhập bằng GitHub)
2. "New +" → "Web Service"
3. Chọn repository `music-player`
4. Cấu hình:
   - Build: `npm install`
   - Start: `node server/server.js`
5. Environment Variables:
   - `MONGO_URI`: (MongoDB connection string)
   - `JWT_SECRET`: (random string)
   - `NODE_ENV`: production
6. Nhấp "Create"
7. Đợi 2-5 phút → Xong! 🎉

---

## 📚 Chi tiết

- **Local Dev**: Xem [README.md](README.md)
- **Deploy Guide**: Xem [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)
- **Issues**: Xem [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ✅ Checklist Deploy

- [ ] Code push lên GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string copied
- [ ] IP whitelist 0.0.0.0/0
- [ ] Render Web Service created
- [ ] Environment variables set
- [ ] App deployed & testing

---

**Bạn có câu hỏi?** → Xem [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)

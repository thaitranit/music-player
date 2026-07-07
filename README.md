# Music Player - Full Stack App

Ứng dụng phát nhạc trực tuyến với React, Express, và MongoDB.

## 🚀 Cách cài đặt và chạy locally

### 1. Clone hoặc tải project
```bash
cd music-player
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Thiết lập file `.env`
Tạo file `.env` trong thư mục gốc (copy từ `.env.example`):

```bash
cp .env.example .env
```

Sau đó chỉnh sửa `.env` với thông tin MongoDB Atlas của bạn.

### 4. Chạy server
```bash
npm run server
```

Server sẽ chạy trên `http://localhost:5000`

### 5. Chạy frontend (tuỳ chọn, chỉ để phát triển)
Mở terminal khác và chạy:
```bash
npm run dev
```

Frontend sẽ chạy trên `http://localhost:5173` (Vite dev server)

---

## 🗄️ Setup MongoDB Atlas (Miễn phí)

### Bước 1: Tạo tài khoản MongoDB Atlas
1. Truy cập https://www.mongodb.com/cloud/atlas
2. Nhấp "Try Free"
3. Tạo tài khoản Google hoặc email

### Bước 2: Tạo Cluster
1. Chọn "Create a Deployment" → "Free" tier
2. Chọn cloud provider (AWS, Google Cloud, Azure) - chọn gần bạn nhất
3. Chọn region (ví dụ: ap-southeast-1 cho Việt Nam)
4. Nhấp "Create Deployment"
5. Đợi cluster được tạo (khoảng 5 phút)

### Bước 3: Thiết lập Database User
1. Vào "Database Access" (menu trái)
2. Nhấp "Add New Database User"
3. Chọn "Password" authentication
4. Tạo username và password mạnh
5. Nhấp "Add User"

### Bước 4: Lấy Connection String
1. Vào "Databases" → Nhấp nút "Connect" trên cluster
2. Chọn "Connect your application"
3. Copy connection string (dạng: `mongodb+srv://...`)
4. Thay `<username>` và `<password>` bằng thông tin bạn vừa tạo

### Bước 5: Cập nhật `.env`
```
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/music-player?retryWrites=true&w=majority
```

---

## 🌍 Deploy lên Render (Miễn phí)

### Bước 1: Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/music-player.git
git push -u origin main
```

### Bước 2: Tạo Web Service trên Render
1. Truy cập https://render.com
2. Đăng nhập bằng GitHub
3. Nhấp "New +" → "Web Service"
4. Chọn repository `music-player`
5. Cài đặt:
   - **Name**: music-player (hoặc tên khác)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
   - **Plan**: Free

### Bước 3: Thêm Environment Variables
1. Vào section "Environment"
2. Thêm biến:
   - `MONGO_URI`: (copy từ MongoDB Atlas)
   - `JWT_SECRET`: (tạo random string mạnh, ví dụ: `your-random-secret-key-12345`)
   - `NODE_ENV`: `production`

### Bước 4: Deploy
1. Nhấp "Create Web Service"
2. Render sẽ tự động deploy
3. Đợi khoảng 2-3 phút
4. Lấy link app từ Render (ví dụ: `https://music-player.onrender.com`)

---

## 📱 Các tính năng

✅ Đăng nhập / Đăng ký  
✅ Phát nhạc  
✅ Tìm kiếm bài hát  
✅ Điều chỉnh âm lượng  
✅ Random và Repeat  
✅ Progress bar  
✅ Playlist thay đổi theo user (khi kết nối MongoDB)  

---

## 🔑 Biến môi trường cần thiết

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/music-player
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=5000
```

---

## 📝 Scripts NPM

- `npm run server` - Chạy backend server
- `npm run dev` - Chạy frontend dev server (Vite)
- `npm run build` - Build frontend cho production

---

## 🛠️ Stack công nghệ

- **Frontend**: React 18, Vite, CSS
- **Backend**: Express, Node.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcryptjs
- **Deployment**: Render, MongoDB Atlas

---

## 📞 Hỗ trợ

Nếu có vấn đề, kiểm tra:
1. MongoDB Atlas connection string đúng chưa
2. Firewall cho phép kết nối từ Render
3. Environment variables đã set đúng chưa

---

**Tạo bởi:** Trần Xuân Thái  
**Ngày**: 2026

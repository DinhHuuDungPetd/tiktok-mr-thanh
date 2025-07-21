# Sử dụng Node.js chính thức làm base image
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép file package.json và package-lock.json (nếu có)
COPY package.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng Next.js
RUN npm run build

# Expose cổng mà Next.js sử dụng (mặc định là 3000)
EXPOSE 3001

# Thiết lập biến môi trường (mặc định là production)
ENV NODE_ENV=production

# Chạy ứng dụng
CMD ["npm", "start", "--", "-p", "3001"]
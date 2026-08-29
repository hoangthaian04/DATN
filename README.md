# EasyTech HRM

Hệ thống quản lý tuyển dụng thông minh với AI.

## Cấu trúc dự án

```
EasyTech_HRM/
├── frontend/          # React + Vite + TypeScript + TailwindCSS v4
├── backend/           # Spring Boot 3 + Java 21 + PostgreSQL
└── README.md
```

> **AI Service** sẽ được thêm vào folder `ai/` khi cần (Python FastAPI).

---

## Chạy local

### Frontend
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

### Backend
```bash
cd backend
./mvnw spring-boot:run    # http://localhost:8080
```

### Toàn bộ stack (Docker Compose)
```bash
# (Sẽ thêm docker-compose.yml sau)
docker compose up
```

---

## Tài liệu nghiệp vụ

Xem `../EasyTech_FE/nghiep_vu/` để biết chi tiết từng Epic, Story và Task.

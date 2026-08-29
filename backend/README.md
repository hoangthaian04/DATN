# Backend — EasyTech HRM

Spring Boot 3 + Java 21 + PostgreSQL

## Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | Spring Boot 3.x |
| Ngôn ngữ | Java 21 |
| Database | PostgreSQL 16 |
| Migration | Flyway |
| Security | Spring Security + JWT |
| Email | Spring Mail (Mailtrap dev) |
| Docs | Springdoc OpenAPI (Swagger) |
| Build | Maven |

## Cấu trúc project (sau khi tạo)

```
backend/
├── src/
│   └── main/
│       ├── java/com/easytech/
│       │   ├── config/          # Security, CORS, Mail config
│       │   ├── controller/      # REST Controllers
│       │   ├── service/         # Business logic
│       │   ├── repository/      # JPA Repositories
│       │   ├── entity/          # JPA Entities
│       │   ├── dto/             # Request/Response DTOs
│       │   ├── exception/       # Global exception handler
│       │   └── util/            # JWT, Slug utilities
│       └── resources/
│           ├── application.yml
│           └── db/migration/    # Flyway SQL scripts
└── pom.xml
```

## Chạy local

```bash
# Yêu cầu: Java 21, PostgreSQL đang chạy
./mvnw spring-boot:run

# Hoặc build jar trước
./mvnw package -DskipTests
java -jar target/easytech-*.jar
```

## API Documentation

Sau khi chạy: http://localhost:8080/swagger-ui.html

## Biến môi trường

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/easytech
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}

jwt:
  secret: ${JWT_SECRET}

ai:
  service:
    url: http://localhost:8000   # Python AI Service
```

---

> ⚠️ **TODO:** Khởi tạo Spring Boot project (`mvn archetype:generate` hoặc Spring Initializr)

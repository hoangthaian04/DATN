# ---- Stage 1: Build ----
FROM maven:3.9-amazoncorretto-21 AS builder
WORKDIR /app

# Copy pom.xml trước để cache dependencies nhanh hơn
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source code và build
COPY src ./src
RUN mvn package -DskipTests -q

# ---- Stage 2: Runtime ----
FROM amazoncorretto:21-alpine
WORKDIR /app

# Tạo user không có quyền root để chạy ứng dụng
RUN addgroup -S easytech && adduser -S easytech -G easytech

COPY --from=builder /app/target/*.jar app.jar

RUN chown easytech:easytech app.jar
USER easytech

EXPOSE 8080

# Tắt CDS để tránh warning HotSpot trên Alpine JDK
ENTRYPOINT ["java", "-Xshare:off", "-jar", "app.jar"]

# 阶段一：Maven 构建（contract + service 多模块）
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
COPY contract/pom.xml contract/pom.xml
COPY service/pom.xml service/pom.xml
COPY contract contract
COPY service service
RUN mvn -B -DskipTests package

# 阶段二：只带运行所需的最小环境
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/service/target/fullstack-mall-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]

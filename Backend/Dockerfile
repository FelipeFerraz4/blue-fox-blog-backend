FROM maven:3.9.11-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

RUN chmod +x mvnw

RUN ./mvnw -B dependency:go-offline

COPY src ./src

RUN ./mvnw clean package -DskipTests && \
    echo "=== Conteúdo do target ===" && \
    ls -lah target/ && \
    echo "=== Arquivos JAR ===" && \
    find target -name "*.jar" -type f

FROM eclipse-temurin:21-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/target/app.jar app.jar

RUN chown app:app /app/app.jar

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/v1/actuator/health/liveness || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

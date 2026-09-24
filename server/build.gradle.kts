plugins {
  java
  id("org.springframework.boot")
  id("io.spring.dependency-management")
}

group = "com.anodyzed"
version = "0.0.1-SNAPSHOT"

java {
  toolchain {
    languageVersion.set(JavaLanguageVersion.of(21))
  }
}

dependencies {
    // Spring Boot Core & Web
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-validation")

    // Security & Google Authentication
  implementation("com.yubico:webauthn-server-core:2.5.0")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("com.fasterxml.jackson.core:jackson-databind") // For handling JSON WebAuthn payloads

    // Database
  runtimeOnly("com.mysql:mysql-connector-j")
  testRuntimeOnly("com.h2database:h2")

    // JWT
  implementation("io.jsonwebtoken:jjwt-api:0.12.6")
  runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
  runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // Utilities
  compileOnly("org.projectlombok:lombok")
  annotationProcessor("org.projectlombok:lombok")

    // Testing
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.security:spring-security-test")
}

tasks.withType<Test> {
  useJUnitPlatform()
}

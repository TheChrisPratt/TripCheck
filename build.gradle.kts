plugins {
  java
  id("org.springframework.boot") version "3.4.2" apply false
  id("io.spring.dependency-management") version "1.1.7" apply false
}

allprojects {
  repositories {
    mavenCentral()
  }
}

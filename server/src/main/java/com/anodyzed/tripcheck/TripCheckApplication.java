package com.anodyzed.tripcheck;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class TripCheckApplication extends SpringBootServletInitializer {

  @Override
  protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
    return application.sources(TripCheckApplication.class);
  }

  public static void main (String[] args) {
    SpringApplication.run(TripCheckApplication.class,args);
  } //main

} //*TripCheckApplication

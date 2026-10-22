package com.anodyzed.tripcheck.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StopServiceCatalog {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable=false,unique=true,length=100)
  private String name;

  public StopServiceCatalog (String name) {
    this.name = name;
  } //StopServiceCatalog

} //*StopServiceCatalog

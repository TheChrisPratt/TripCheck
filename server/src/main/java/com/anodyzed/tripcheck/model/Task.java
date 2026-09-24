package com.anodyzed.tripcheck.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.Instant;

@Entity
@Table(name="tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message="Task description is required")
  @Column(nullable=false,length=500)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false, length=30)
  @Builder.Default
  private TaskStatus status = TaskStatus.INCOMPLETE;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false, length=30)
  private TaskCategory category;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="trip_id")
  @JsonIgnore
  private Trip trip;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="stop_id")
  @JsonIgnore
  private Stop stop;

  @Column(name="created_at",nullable=false,updatable=false)
  @Builder.Default
  private Instant createdAt = Instant.now();

  @Column(name="updated_at")
  private Instant updatedAt;

  @PrePersist
  protected void onCreate () {
    if(createdAt == null) {
      createdAt = Instant.now();
    }
    if(status == null) {
      status = TaskStatus.INCOMPLETE;
    }
  } //onCreate

  @PreUpdate
  protected void onUpdate () {
    updatedAt = Instant.now();
  } //onUpdate

} //*Task

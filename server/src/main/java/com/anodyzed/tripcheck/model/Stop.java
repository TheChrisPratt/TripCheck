package com.anodyzed.tripcheck.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stop {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message="Stop name is required")
  @Column(nullable=false, length=200)
  private String name;

  @Column(name="stop_date")
  private LocalDate stopDate;

  @Column(length=500)
  private String location;

  @Column(name="number_of_nights")
  @Builder.Default
  private Integer numberOfNights = 1;

  @Column(name="web_address", length=500)
  private String webAddress;

  @Column(name="telephone_number", length=50)
  private String telephoneNumber;

  @Column(name="confirmation_code", length=100)
  private String confirmationCode;

  @Column(name="site_number", length=50)
  private String siteNumber;

  @Column(columnDefinition="TEXT")
  private String notes;

  @Column(name="order_index")
  @Builder.Default
  private Integer orderIndex = 0;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="trip_id")
  @JsonIgnore
  private Trip trip;

  @OneToMany(mappedBy="stop", cascade=CascadeType.ALL, orphanRemoval=true)
  @Builder.Default
  private List<Task> tasks = new ArrayList<>();

  public List<Task> getArrivalTasks () {
    if(tasks == null) {
      return new ArrayList<>();
    }
    return tasks.stream()
      .filter(t -> t.getCategory() == TaskCategory.ARRIVAL)
      .toList();
  } //getArrivalTasks

  public List<Task> getDepartureTasks () {
    if(tasks == null) {
      return new ArrayList<>();
    }
    return tasks.stream()
      .filter(t -> t.getCategory() == TaskCategory.DEPARTURE)
      .toList();
  } //getDepartureTasks

  public void addArrivalTask (String description) {
    if(tasks == null) {
      tasks = new ArrayList<>();
    }
    Task task = Task.builder()
      .description(description)
      .category(TaskCategory.ARRIVAL)
      .status(TaskStatus.INCOMPLETE)
      .stop(this)
      .build();
    tasks.add(task);
  } //addArrivalTask

  public void addDepartureTask (String description) {
    if(tasks == null) {
      tasks = new ArrayList<>();
    }
    Task task = Task.builder()
      .description(description)
      .category(TaskCategory.DEPARTURE)
      .status(TaskStatus.INCOMPLETE)
      .stop(this)
      .build();
    tasks.add(task);
  } //addDepartureTask

} //*Stop

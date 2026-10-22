package com.anodyzed.tripcheck.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
  @Column(nullable=false,length=200)
  private String name;

  @Column(name="stop_date")
  private LocalDate stopDate;

  @Column(length=500)
  private String location;

  @Column(name="number_of_nights")
  @Builder.Default
  private Integer numberOfNights = 1;

  @Column(name="web_address",length=500)
  private String webAddress;

  @Column(name="telephone_number",length=50)
  private String telephoneNumber;

  @Column(name="confirmation_code",length=100)
  private String confirmationCode;

  @Column(name="site_number",length=50)
  private String siteNumber;

  @Column(columnDefinition="TEXT")
  private String notes;

  @ElementCollection(fetch=FetchType.EAGER)
  @CollectionTable(name="stop_hookups",joinColumns=@JoinColumn(name="stop_id"))
  @Column(name="hookup",length=50)
  @Builder.Default
  private Set<String> hookups = new HashSet<>();

  @Column(name="checkin_time")
  private LocalTime checkinTime;

  @Column(name="checkout_time")
  private LocalTime checkoutTime;

  @ElementCollection(fetch=FetchType.EAGER)
  @CollectionTable(name="stop_amenities",joinColumns=@JoinColumn(name="stop_id"))
  @Column(name="amenity",length=100)
  @Builder.Default
  private Set<String> amenities = new HashSet<>();

  @ElementCollection(fetch=FetchType.EAGER)
  @CollectionTable(name="stop_services",joinColumns=@JoinColumn(name="stop_id"))
  @Column(name="service",length=100)
  @Builder.Default
  private Set<String> services = new HashSet<>();

  @Column(name="codes",length=128)
  @Size(max=128,message="Codes cannot exceed 128 characters")
  private String codes;

  @Column(name="order_index")
  @Builder.Default
  private Integer orderIndex = 0;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="trip_id")
  @JsonIgnore
  private Trip trip;

  @OneToMany(mappedBy="stop",cascade=CascadeType.ALL,orphanRemoval=true)
  @OrderBy("orderIndex ASC")
  @Builder.Default
  private List<Task> tasks = new ArrayList<>();

  public List<Task> getArrivalTasks () {
    if(tasks == null) {
      return new ArrayList<>();
    }
    return tasks.stream()
      .filter(t -> t.getCategory() == TaskCategory.ARRIVAL)
      .sorted(Comparator.comparing(Task::getOrderIndex))
      .toList();
  } //getArrivalTasks

  public List<Task> getDepartureTasks () {
    if(tasks == null) {
      return new ArrayList<>();
    }
    return tasks.stream()
      .filter(t -> t.getCategory() == TaskCategory.DEPARTURE)
      .sorted(Comparator.comparing(Task::getOrderIndex))
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
      .orderIndex(getArrivalTasks().size())
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
      .orderIndex(getDepartureTasks().size())
      .stop(this)
      .build();
    tasks.add(task);
  } //addDepartureTask

} //*Stop

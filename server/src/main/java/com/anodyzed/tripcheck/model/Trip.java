package com.anodyzed.tripcheck.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name="trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message="Trip name is required")
  @Column(nullable=false,length=200)
  private String name;

  @NotNull(message="Starting date is required")
  @Column(name="starting_date",nullable=false)
  private LocalDate startingDate;

  @Column(name="ending_date")
  private LocalDate endingDate;

  @ManyToMany
  @JoinTable(
    name="trip_users",
    joinColumns=@JoinColumn(name="trip_id"),
    inverseJoinColumns=@JoinColumn(name="user_id")
  )
  @Builder.Default
  private Set<User> users = new HashSet<>();

  @OneToMany(mappedBy="trip",cascade=CascadeType.ALL,orphanRemoval=true)
  @OrderBy("orderIndex ASC")
  @Builder.Default
  private List<Task> tasks = new ArrayList<>();

  @OneToMany(mappedBy="trip",cascade=CascadeType.ALL,orphanRemoval=true)
  @OrderBy("orderIndex ASC")
  @Builder.Default
  private List<Stop> stops = new ArrayList<>();

  public List<Task> getPreTripTasks () {
    if(tasks == null) {
      return new ArrayList<>();
    }
    return tasks.stream()
      .filter(t -> t.getCategory() == TaskCategory.PRE_TRIP)
      .sorted(Comparator.comparing(Task::getOrderIndex))
      .toList();
  } //getPreTripTasks

  public List<Task> getDepartureDayTasks () {
    if(tasks == null) {
      return new ArrayList<>();
    }
    return tasks.stream()
      .filter(t -> t.getCategory() == TaskCategory.DEPARTURE_DAY)
      .sorted(Comparator.comparing(Task::getOrderIndex))
      .toList();
  } //getDepartureDayTasks

  public List<Task> getReturnDayTasks () {
    if(tasks == null) {
      return new ArrayList<>();
    }
    return tasks.stream()
      .filter(t -> t.getCategory() == TaskCategory.RETURN_DAY)
      .sorted(Comparator.comparing(Task::getOrderIndex))
      .toList();
  } //getReturnDayTasks

  public void addPreTripTask (String description) {
    if(tasks == null) {
      tasks = new ArrayList<>();
    }
    Task task = Task.builder()
      .description(description)
      .category(TaskCategory.PRE_TRIP)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(getPreTripTasks().size())
      .trip(this)
      .build();
    tasks.add(task);
  } //addPreTripTask

  public void addDepartureDayTask (String description) {
    if(tasks == null) {
      tasks = new ArrayList<>();
    }
    Task task = Task.builder()
      .description(description)
      .category(TaskCategory.DEPARTURE_DAY)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(getDepartureDayTasks().size())
      .trip(this)
      .build();
    tasks.add(task);
  } //addDepartureDayTask

  public void addReturnDayTask (String description) {
    if(tasks == null) {
      tasks = new ArrayList<>();
    }
    Task task = Task.builder()
      .description(description)
      .category(TaskCategory.RETURN_DAY)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(getReturnDayTasks().size())
      .trip(this)
      .build();
    tasks.add(task);
  } //addReturnDayTask

  public void addStop (Stop stop) {
    if(stops == null) {
      stops = new ArrayList<>();
    }
    stop.setTrip(this);
    stop.setOrderIndex(stops.size());
    stops.add(stop);
    recalculateDates();
  } //addStop

  public void addClonedStop (Stop sourceStop,Stop clonedStop) {
    if(stops == null) {
      stops = new ArrayList<>();
    }
    int sourceIndex = sourceStop != null && sourceStop.getOrderIndex() != null ? sourceStop.getOrderIndex() : 0;
    for(Stop s : stops) {
      if(s.getOrderIndex() != null && s.getOrderIndex() > sourceIndex) {
        s.setOrderIndex(s.getOrderIndex() + 1);
      }
    }
    clonedStop.setOrderIndex(sourceIndex + 1);
    clonedStop.setTrip(this);
    stops.add(clonedStop);
    recalculateDates();
  } //addClonedStop

  public void recalculateDates () {
    if(startingDate != null) {
      if(stops != null && !stops.isEmpty()) {
          // Sort stops by order index
        stops.sort(Comparator.comparing(s -> s.getOrderIndex() != null ? s.getOrderIndex() : 0));

        LocalDate currentDate = this.startingDate;
        for(int i = 0;i < stops.size();i++) {
          Stop stop = stops.get(i);
          stop.setOrderIndex(i);
          stop.setStopDate(currentDate);

          int nights = (stop.getNumberOfNights() != null && stop.getNumberOfNights() >= 0) ? stop.getNumberOfNights() : 1;
          currentDate = currentDate.plusDays(nights);
        }
        this.endingDate = currentDate;
      } else {
        this.endingDate = this.startingDate;
      }
    }
  } //recalculateDates

  public boolean hasUser (String username) {
    if(username == null || users == null) {
      return false;
    }
    return users.stream().anyMatch(u -> username.equalsIgnoreCase(u.getUsername()));
  } //hasUser

  public void addUser (User user) {
    if(users == null) {
      users = new HashSet<>();
    }
    if(user != null) {
      users.add(user);
    }
  } //addUser

  public void removeUser (User user) {
    if(users != null && user != null) {
      users.remove(user);
    }
  } //removeUser

  @PrePersist
  @PreUpdate
  protected void onPersistOrUpdate () {
    recalculateDates();
  } //onPersistOrUpdate

} //*Trip

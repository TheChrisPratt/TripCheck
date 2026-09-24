package com.anodyzed.tripcheck.services;

import com.anodyzed.tripcheck.dto.CreateTaskRequest;
import com.anodyzed.tripcheck.dto.TaskResponse;
import com.anodyzed.tripcheck.dto.UpdateTaskStatusRequest;
import com.anodyzed.tripcheck.model.Stop;
import com.anodyzed.tripcheck.model.Task;
import com.anodyzed.tripcheck.model.TaskCategory;
import com.anodyzed.tripcheck.model.TaskStatus;
import com.anodyzed.tripcheck.model.Trip;
import com.anodyzed.tripcheck.repository.TaskRepository;
import com.anodyzed.tripcheck.util.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {

  private final TaskRepository taskRepository;
  private final TripService tripService;
  private final StopService stopService;

  public TaskService (
    TaskRepository taskRepository,
    TripService tripService,
    StopService stopService) {
    this.taskRepository = taskRepository;
    this.tripService = tripService;
    this.stopService = stopService;
  }

  public TaskResponse addPreTripTask (Long tripId,CreateTaskRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.PRE_TRIP)
      .status(TaskStatus.INCOMPLETE)
      .trip(trip)
      .build();
    Task saved = taskRepository.save(task);
    if(trip.getTasks() != null) {
      trip.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  }

  public TaskResponse addDepartureDayTask (Long tripId,CreateTaskRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.DEPARTURE_DAY)
      .status(TaskStatus.INCOMPLETE)
      .trip(trip)
      .build();
    Task saved = taskRepository.save(task);
    if(trip.getTasks() != null) {
      trip.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  }

  public TaskResponse addReturnDayTask (Long tripId,CreateTaskRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.RETURN_DAY)
      .status(TaskStatus.INCOMPLETE)
      .trip(trip)
      .build();
    Task saved = taskRepository.save(task);
    if(trip.getTasks() != null) {
      trip.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  }

  public TaskResponse addArrivalTask (Long stopId,CreateTaskRequest request,String userId) {
    Stop stop = stopService.getStopEntity(stopId,userId);
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.ARRIVAL)
      .status(TaskStatus.INCOMPLETE)
      .stop(stop)
      .build();
    Task saved = taskRepository.save(task);
    if(stop.getTasks() != null) {
      stop.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  }

  public TaskResponse addDepartureTask (Long stopId,CreateTaskRequest request,String userId) {
    Stop stop = stopService.getStopEntity(stopId,userId);
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.DEPARTURE)
      .status(TaskStatus.INCOMPLETE)
      .stop(stop)
      .build();
    Task saved = taskRepository.save(task);
    if(stop.getTasks() != null) {
      stop.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  }

  public TaskResponse updateTaskStatus (Long taskId,UpdateTaskStatusRequest request,String userId) {
    Task task = taskRepository.findById(taskId)
      .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

    if(task.getTrip() != null) {
      tripService.getTripEntity(task.getTrip().getId(),userId);
    } else if(task.getStop() != null && task.getStop().getTrip() != null) {
      tripService.getTripEntity(task.getStop().getTrip().getId(),userId);
    }

    task.setStatus(request.getStatus());
    Task updated = taskRepository.save(task);
    return TaskResponse.fromEntity(updated);
  }

  public void deleteTask (Long taskId,String userId) {
    Task task = taskRepository.findById(taskId)
      .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

    if(task.getTrip() != null) {
      Trip trip = tripService.getTripEntity(task.getTrip().getId(),userId);
      if(trip.getTasks() != null) {
        trip.getTasks().remove(task);
      }
    } else if(task.getStop() != null) {
      Stop stop = task.getStop();
      if(stop.getTrip() != null) {
        tripService.getTripEntity(stop.getTrip().getId(),userId);
      }
      if(stop.getTasks() != null) {
        stop.getTasks().remove(task);
      }
    }

    taskRepository.delete(task);
  }
}

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
  } //TaskService

  public TaskResponse addPreTripTask (Long tripId,CreateTaskRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);
    int nextOrder = trip.getPreTripTasks().size();
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.PRE_TRIP)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(nextOrder)
      .trip(trip)
      .build();
    Task saved = taskRepository.save(task);
    if(trip.getTasks() != null) {
      trip.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  } //addPreTripTask

  public TaskResponse addDepartureDayTask (Long tripId,CreateTaskRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);
    int nextOrder = trip.getDepartureDayTasks().size();
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.DEPARTURE_DAY)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(nextOrder)
      .trip(trip)
      .build();
    Task saved = taskRepository.save(task);
    if(trip.getTasks() != null) {
      trip.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  } //addDepartureDayTask

  public TaskResponse addReturnDayTask (Long tripId,CreateTaskRequest request,String userId) {
    Trip trip = tripService.getTripEntity(tripId,userId);
    int nextOrder = trip.getReturnDayTasks().size();
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.RETURN_DAY)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(nextOrder)
      .trip(trip)
      .build();
    Task saved = taskRepository.save(task);
    if(trip.getTasks() != null) {
      trip.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  } //addReturnDayTask

  public TaskResponse addArrivalTask (Long stopId,CreateTaskRequest request,String userId) {
    Stop stop = stopService.getStopEntity(stopId,userId);
    int nextOrder = stop.getArrivalTasks().size();
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.ARRIVAL)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(nextOrder)
      .stop(stop)
      .build();
    Task saved = taskRepository.save(task);
    if(stop.getTasks() != null) {
      stop.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  } //addArrivalTask

  public TaskResponse addDepartureTask (Long stopId,CreateTaskRequest request,String userId) {
    Stop stop = stopService.getStopEntity(stopId,userId);
    int nextOrder = stop.getDepartureTasks().size();
    Task task = Task.builder()
      .description(request.getDescription())
      .category(TaskCategory.DEPARTURE)
      .status(TaskStatus.INCOMPLETE)
      .orderIndex(nextOrder)
      .stop(stop)
      .build();
    Task saved = taskRepository.save(task);
    if(stop.getTasks() != null) {
      stop.getTasks().add(saved);
    }
    return TaskResponse.fromEntity(saved);
  } //addDepartureTask

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
  } //updateTaskStatus

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
  } //deleteTask

  public void reorderTasks (java.util.List<Long> taskIds,String userId) {
    if(taskIds != null && !taskIds.isEmpty()) {
      for(int i = 0;i < taskIds.size();i++) {
        Long taskId = taskIds.get(i);
        Task task = taskRepository.findById(taskId)
          .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if(task.getTrip() != null) {
          tripService.getTripEntity(task.getTrip().getId(),userId);
        } else if(task.getStop() != null && task.getStop().getTrip() != null) {
          tripService.getTripEntity(task.getStop().getTrip().getId(),userId);
        }

        task.setOrderIndex(i);
        taskRepository.save(task);
      }
    }
  } //reorderTasks

} //*TaskService

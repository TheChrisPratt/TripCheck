package com.anodyzed.tripcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.anodyzed.tripcheck.model.Task;
import com.anodyzed.tripcheck.model.TaskCategory;
import com.anodyzed.tripcheck.model.TaskStatus;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
  private Long id;
  private String description;
  private TaskStatus status;
  private TaskCategory category;
  private Long tripId;
  private Long stopId;
  private Instant createdAt;
  private Instant updatedAt;

  public static TaskResponse fromEntity (Task task) {
    if(task == null) {
      return null;
    }
    return TaskResponse.builder()
      .id(task.getId())
      .description(task.getDescription())
      .status(task.getStatus())
      .category(task.getCategory())
      .tripId(task.getTrip() != null ? task.getTrip().getId() : null)
      .stopId(task.getStop() != null ? task.getStop().getId() : null)
      .createdAt(task.getCreatedAt())
      .updatedAt(task.getUpdatedAt())
      .build();
  } //fromEntity

} //*TaskResponse

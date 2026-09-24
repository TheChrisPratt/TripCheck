package com.anodyzed.tripcheck.resources;

import jakarta.validation.Valid;

import com.anodyzed.tripcheck.dto.TaskResponse;
import com.anodyzed.tripcheck.dto.UpdateTaskStatusRequest;
import com.anodyzed.tripcheck.services.TaskService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskResource {

  private final TaskService taskService;

  public TaskResource (TaskService taskService) {
    this.taskService = taskService;
  } //TaskResource

  private String getUserId (Authentication authentication) {
    return authentication != null ? authentication.getName() : null;
  } //getUserId

  @PatchMapping("/{taskId}/status")
  public ResponseEntity<TaskResponse> updateTaskStatus (
    @PathVariable Long taskId,
    @Valid @RequestBody UpdateTaskStatusRequest request,
    Authentication authentication) {
    TaskResponse task = taskService.updateTaskStatus(taskId,request,getUserId(authentication));
    return ResponseEntity.ok(task);
  } //updateTaskStatus

  @DeleteMapping("/{taskId}")
  public ResponseEntity<Void> deleteTask (
    @PathVariable Long taskId,
    Authentication authentication) {
    taskService.deleteTask(taskId,getUserId(authentication));
    return ResponseEntity.noContent().build();
  } //deleteTask

} //*TaskResource

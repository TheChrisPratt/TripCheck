package com.anodyzed.tripcheck.repository;

import com.anodyzed.tripcheck.model.Task;
import com.anodyzed.tripcheck.model.TaskCategory;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task,Long> {
  List<Task> findByTripId (long tripId);
  List<Task> findByTripIdAndCategory (long tripId,TaskCategory category);
  List<Task> findByStopId (long stopId);
  List<Task> findByStopIdAndCategory (long stopId,TaskCategory category);

} //*TaskRepository

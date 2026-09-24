package com.anodyzed.tripcheck.repository;

import com.anodyzed.tripcheck.model.Trip;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripRepository extends JpaRepository<Trip,Long> {
  List<Trip> findByUserIdOrderByStartingDateAsc (String userId);
} //*TripRepository

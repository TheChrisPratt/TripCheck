package com.anodyzed.tripcheck.repository;

import com.anodyzed.tripcheck.model.Stop;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StopRepository extends JpaRepository<Stop,Long> {
  List<Stop> findByTripIdOrderByOrderIndexAsc (long tripId);
} //*StopRepository

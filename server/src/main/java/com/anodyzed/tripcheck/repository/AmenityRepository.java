package com.anodyzed.tripcheck.repository;

import com.anodyzed.tripcheck.model.Amenity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity,Long> {

  boolean existsByNameIgnoreCase (String name);

  List<Amenity> findAllByOrderByNameAsc ();

} //#AmenityRepository

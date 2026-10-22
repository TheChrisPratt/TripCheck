package com.anodyzed.tripcheck.repository;

import com.anodyzed.tripcheck.model.StopServiceCatalog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StopServiceCatalogRepository extends JpaRepository<StopServiceCatalog,Long> {

  boolean existsByNameIgnoreCase (String name);

  List<StopServiceCatalog> findAllByOrderByNameAsc ();

} //#StopServiceCatalogRepository

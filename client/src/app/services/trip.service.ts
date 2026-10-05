import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripDetail, TripSummary, CreateTripDto } from '../models/trip.model';
import { Stop, CreateStopDto } from '../models/stop.model';
import { Task, CreateTaskDto, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private http = inject(HttpClient);
  private baseUrl = 'api/trips';
  private stopUrl = 'api/stops';
  private taskUrl = 'api/tasks';

  getTrips(): Observable<TripSummary[]> {
    return this.http.get<TripSummary[]>(this.baseUrl);
  }

  getTrip(id: number): Observable<TripDetail> {
    return this.http.get<TripDetail>(`${this.baseUrl}/${id}`);
  }

  createTrip(dto: CreateTripDto): Observable<TripDetail> {
    return this.http.post<TripDetail>(this.baseUrl, dto);
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addStop(tripId: number, dto: CreateStopDto): Observable<Stop> {
    return this.http.post<Stop>(`${this.baseUrl}/${tripId}/stops`, dto);
  }

  deleteStop(stopId: number): Observable<void> {
    return this.http.delete<void>(`${this.stopUrl}/${stopId}`);
  }

  addPreTripTask(tripId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/${tripId}/tasks/pre-trip`, dto);
  }

  addDepartureDayTask(tripId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/${tripId}/tasks/departure-day`, dto);
  }

  addReturnDayTask(tripId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/${tripId}/tasks/return-day`, dto);
  }

  addArrivalTask(stopId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.stopUrl}/${stopId}/tasks/arrival`, dto);
  }

  addDepartureTask(stopId: number, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.stopUrl}/${stopId}/tasks/departure`, dto);
  }

  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${this.taskUrl}/${taskId}/status`, { status });
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.taskUrl}/${taskId}`);
  }
}

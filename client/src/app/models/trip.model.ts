import { Stop } from './stop.model';
import { Task } from './task.model';

export interface TripSummary {
  id: number;
  name: string;
  startingDate: string;
  endingDate: string;
  stopCount: number;
  totalTaskCount: number;
  completedTaskCount: number;
}

export interface TripDetail {
  id: number;
  name: string;
  startingDate: string;
  endingDate: string;
  userId?: string;
  preTripTasks: Task[];
  departureDayTasks: Task[];
  returnDayTasks: Task[];
  stops: Stop[];
}

export interface CreateTripDto {
  name: string;
  startingDate: string;
}

export interface UpdateTripDto {
  name: string;
  startingDate: string;
}

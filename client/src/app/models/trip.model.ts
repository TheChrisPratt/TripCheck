import { Stop } from './stop.model';
import { Task } from './task.model';
import { UserSummary } from './user.model';

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
  users?: UserSummary[];
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

export interface CloneTripDto {
  name: string;
  startingDate: string;
}

import { Task } from './task.model';

export interface Stop {
  id: number;
  name: string;
  stopDate: string;
  location?: string;
  numberOfNights: number;
  webAddress?: string;
  telephoneNumber?: string;
  confirmationCode?: string;
  siteNumber?: string;
  notes?: string;
  orderIndex: number;
  tripId?: number;
  arrivalTasks: Task[];
  departureTasks: Task[];
}

export interface CreateStopDto {
  name: string;
  location?: string;
  numberOfNights?: number;
  webAddress?: string;
  telephoneNumber?: string;
  confirmationCode?: string;
  siteNumber?: string;
  notes?: string;
}

export interface UpdateStopDto {
  name: string;
  location?: string;
  numberOfNights?: number;
  webAddress?: string;
  telephoneNumber?: string;
  confirmationCode?: string;
  siteNumber?: string;
  notes?: string;
}

export interface CloneStopDto {
  name: string;
  numberOfNights?: number;
  location?: string;
  telephoneNumber?: string;
  confirmationCode?: string;
  notes?: string;
  siteNumber?: string;
  stopDate?: string;
  webAddress?: string;
}

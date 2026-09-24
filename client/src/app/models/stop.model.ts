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

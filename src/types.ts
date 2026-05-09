/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Status = 'Not checked' | 'Working on it' | 'Done';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorTheme = 'Classic' | 'Muted Blue' | 'Soft Sage' | 'Dusty Rose' | 'Minimal Slate';

export interface UserProfile {
  name: string;
  salutation: string;
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  profilePicture?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Student {
  id: string;
  name: string;
}

export interface TrackerCategory {
  id: string;
  name: string;
  completions: Record<string, boolean>; // studentId -> boolean
}

export interface ClassSection {
  id: string;
  name: string;
  subject: string;
  status: Status;
  studentCount: number;
  students: Student[];
  categories: TrackerCategory[];
  updatedAt: number;
}

export interface AppData {
  profile: UserProfile;
  tasks: Task[];
  sections: ClassSection[];
}

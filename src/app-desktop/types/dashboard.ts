export interface SiteSummary {
  totalSites: number;
  activeSites: number;
  siteManagers: number;
}

export interface WorkerAttendanceSummary {
  totalWorkers: number;
  presentToday: number;
  attendancePercentage: number;
  absentToday: number;
}

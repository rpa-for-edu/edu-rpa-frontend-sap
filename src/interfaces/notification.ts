export enum NotificationType {
  ROBOT_TRIGGER = 'ROBOT_TRIGGER',
  ROBOT_EXECUTION = 'ROBOT_EXECUTION',
  PROCESS_SHARED = 'PROCESS_SHARED',
  CONNECTION_CHECK = 'CONNECTION_CHECK',
  TEAM_INVITATION = 'TEAM_INVITATION',
  WORKSPACE_INVITATION = 'WORKSPACE_INVITATION',
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  type: NotificationType;
  createdAt: Date;
}
import { Step } from 'react-joyride';

export interface TourStep extends Step {
  route?: string;
}

export const getSteps = (t: any): TourStep[] => [
  {
    target: 'body',
    content: t('tour.app.welcome'),
    placement: 'center',
    skipBeacon: true,
    route: '/home',
  },
  {
    target: '#sidebar-item--home',
    content: t('tour.app.home'),
    placement: 'right',
    route: '/home',
  },
  {
    target: '#sidebar-item--robot-dashboard',
    content: t('tour.app.dashboard'),
    placement: 'right',
    route: '/robot/dashboard',
  },
  {
    target: '#sidebar-item--studio',
    content: t('tour.app.studio'),
    placement: 'right',
    route: '/studio',
  },
  {
    target: '#sidebar-item--robot',
    content: t('tour.app.robot'),
    placement: 'right',
    route: '/robot',
  },
  {
    target: '#sidebar-item--integration-service',
    content: t('tour.app.integration'),
    placement: 'right',
    route: '/integration-service',
  },
  {
    target: '#sidebar-item--storage',
    content: t('tour.app.storage'),
    placement: 'right',
    route: '/storage',
  },
  {
    target: '#sidebar-item--document-template',
    content: t('tour.app.template'),
    placement: 'right',
    route: '/document-template',
  },
  {
    target: '#sidebar-item--workspace',
    content: t('tour.app.workspace'),
    placement: 'right',
    route: '/workspace',
  },
  {
    target: 'body',
    content: t('tour.app.finish'),
    placement: 'center',
    route: '/home',
  }
];

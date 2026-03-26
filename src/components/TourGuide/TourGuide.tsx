import React, { useEffect, useState } from 'react';
import { useToken } from '@chakra-ui/react';
import { Joyride, EventData, EVENTS, ACTIONS, STATUS } from 'react-joyride';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { tourSelector } from '@/redux/selector';
import { setRun, setStepIndex, stopTour } from '@/redux/slice/tourSlice';
import { steps } from './steps';
import { useTranslation } from 'next-i18next';

const TourGuide: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { run, stepIndex } = useSelector(tourSelector);
  const [isClient, setIsClient] = useState(false);
  const { t } = useTranslation('common');
  const [primaryColor] = useToken('colors', ['teal.500']);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      dispatch(stopTour());
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      const isNextStepAvailable = nextStepIndex >= 0 && nextStepIndex < steps.length;
      
      if (isNextStepAvailable) {
        const nextStep = steps[nextStepIndex];
        
        // Custom logic to handle route change before continuing
        if (nextStep.route && nextStep.route !== router.pathname) {
          dispatch(setRun(false)); // Temporarily stop to navigate
          router.push(nextStep.route).then(() => {
            dispatch(setStepIndex(nextStepIndex));
            setTimeout(() => {
              dispatch(setRun(true)); // Resume after transition
            }, 600); // Give Next.js time to paint page
          });
        } else {
          dispatch(setStepIndex(nextStepIndex));
        }
      }
    }
  };

  if (!isClient) return null;

  // Unmount Joyride completely when the tour is stopped to clear the blurred overlay bug
  if (!run && stepIndex === 0) {
    return null;
  }

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      stepIndex={stepIndex}
      steps={steps}
      locale={{
        last: t('finish') || 'Finish',
        next: t('next') || 'Next',
        skip: t('skip') || 'Skip',
        back: t('back') || 'Back',
      }}
      options={{
        zIndex: 10000,
        primaryColor,
        showProgress: true,
      }}
    />
  );
};

export default TourGuide;

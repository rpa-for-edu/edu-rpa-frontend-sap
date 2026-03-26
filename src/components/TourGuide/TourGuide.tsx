import React, { useEffect, useState } from 'react';
import { useToken } from '@chakra-ui/react';
import {
  Joyride,
  EventData,
  EVENTS,
  ACTIONS,
  STATUS,
  TooltipRenderProps,
} from 'react-joyride';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { tourSelector } from '@/redux/selector';
import { setRun, setStepIndex, stopTour } from '@/redux/slice/tourSlice';
import { getSteps } from './steps';
import { useTranslation } from 'next-i18next';

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip — màn hình Welcome (step đầu)
// ─────────────────────────────────────────────────────────────────────────────
const WelcomeTooltip: React.FC<TooltipRenderProps & { color: string }> = ({
  tooltipProps,
  primaryProps,
  skipProps,
  color,
}) => {
  const { t } = useTranslation('common');
  return (
  <div
    {...tooltipProps}
    style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '40px 44px',
      width: '500px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      color: '#1a202c',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}
  >
    <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 700, lineHeight: 1.3, color: '#1a202c' }}>
      {t('tour.welcome.title')}
    </h2>
    <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#718096', lineHeight: 1.75 }}>
      {t('tour.welcome.desc1')}
      <strong style={{ color }}>{t('tour.welcome.desc2')}</strong>
      {t('tour.welcome.desc3')}
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
      {[
        t('tour.welcome.features.studio'),
        t('tour.welcome.features.robot'),
        t('tour.welcome.features.integration'),
        t('tour.welcome.features.storage')
      ].map((text: string) => (
        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: color, flexShrink: 0,
          }} />
          <span style={{ fontSize: '14px', color: '#4a5568' }}>{text}</span>
        </div>
      ))}
    </div>

    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        {...primaryProps}
        style={{
          flex: 1, padding: '12px 20px',
          background: color,
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {t('tour.welcome.start')}
      </button>
      <button
        {...skipProps}
        style={{
          padding: '12px 20px',
          background: '#f7fafc', color: '#718096',
          border: '1px solid #e2e8f0', borderRadius: '10px',
          fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#edf2f7')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#f7fafc')}
      >
        {t('tour.general.skip')}
      </button>
    </div>
  </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip — màn hình Finish (step cuối)
// ─────────────────────────────────────────────────────────────────────────────
const FinishTooltip: React.FC<TooltipRenderProps & { color: string }> = ({
  tooltipProps,
  closeProps,
  backProps,
  color,
}) => {
  const { t } = useTranslation('common');
  return (
  <div
    {...tooltipProps}
    style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '40px 44px',
      width: '500px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      color: '#1a202c',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      textAlign: 'center',
    }}
  >
    <h2 style={{ margin: '0 0 14px', fontSize: '24px', fontWeight: 700, color: '#1a202c' }}>
      {t('tour.finish.title')}
    </h2>
    <p style={{ margin: '0 0 28px', fontSize: '15px', color: '#718096', lineHeight: 1.75 }}>
      {t('tour.finish.desc1')}
      <strong style={{ color }}>EduRPA</strong>.
      {t('tour.finish.desc2')}
    </p>

    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        {...backProps}
        style={{
          padding: '12px 20px',
          background: '#f7fafc', color: '#718096',
          border: '1px solid #e2e8f0', borderRadius: '10px',
          fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#edf2f7')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#f7fafc')}
      >
        {t('tour.general.back')}
      </button>
      <button
        {...closeProps}
        style={{
          flex: 1, padding: '12px 28px',
          background: color,
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {t('tour.finish.start')}
      </button>
    </div>
  </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip mặc định cho các bước giữa — giống Joyride default (nền trắng)
// ─────────────────────────────────────────────────────────────────────────────
const StepTooltip: React.FC<TooltipRenderProps & { color: string }> = ({
  tooltipProps,
  step,
  index,
  size,
  primaryProps,
  backProps,
  skipProps,
  color,
}) => {
  const { t } = useTranslation('common');
  return (
  <div
    {...tooltipProps}
    style={{
      background: '#ffffff',
      borderRadius: '4px',
      padding: '0',
      maxWidth: '380px',
      boxShadow: '0 0 0 1px rgba(0,0,0,.1), 0 4px 16px rgba(0,0,0,.2)',
      color: '#333',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontSize: '16px',
    }}
  >
    {step.title && (
      <div style={{
        borderBottom: '1px solid rgba(0,0,0,.1)',
        padding: '16px',
        fontSize: '18px',
        fontWeight: 700,
      }}>
        {step.title as string}
      </div>
    )}

    <div style={{ padding: '16px', lineHeight: 1.6 }}>
      {step.content as React.ReactNode}
    </div>

    <div style={{
      borderTop: '1px solid rgba(0,0,0,.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', gap: '8px',
    }}>
      <button
        {...skipProps}
        style={{
          background: 'none', border: 'none', color: '#999',
          fontSize: '14px', cursor: 'pointer', padding: '4px 0',
        }}
      >
        {t('tour.general.skip')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: '#999' }}>
          {index + 1} / {size}
        </span>
        {index > 0 && (
          <button
            {...backProps}
            style={{
              padding: '8px 16px',
              background: 'transparent', color: '#333',
              border: '1px solid #ccc', borderRadius: '4px',
              fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            {t('tour.general.back')}
          </button>
        )}
        <button
          {...primaryProps}
          style={{
            padding: '8px 16px',
            background: color,
            color: '#fff', border: 'none', borderRadius: '4px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {t('tour.general.next')}
        </button>
      </div>
    </div>
  </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Wrapper chọn đúng tooltip component theo stepIndex
// ─────────────────────────────────────────────────────────────────────────────
const TooltipWrapper: React.FC<TooltipRenderProps & { color: string; totalSteps: number }> = (props) => {
  const { index, totalSteps } = props;
  if (index === 0) return <WelcomeTooltip {...props} />;
  if (index === totalSteps - 1) return <FinishTooltip {...props} />;
  return <StepTooltip {...props} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main TourGuide component
// ─────────────────────────────────────────────────────────────────────────────
const TourGuide: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { run, stepIndex, isActive } = useSelector(tourSelector);
  const [isClient, setIsClient] = useState(false);
  const [primaryColor] = useToken('colors', ['teal.500']);
  const { t } = useTranslation('common');
  const steps = getSteps(t);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;

    // Helper ẩn overlay an toàn tránh lỗi React unmount node
    const cleanOverlay = () => {
      document.querySelectorAll('.react-joyride__overlay, .react-joyride__spotlight').forEach((el: any) => {
        el.style.display = 'none';
      });
    };

    // STATUS.SKIPPED (nhấn skip) → dừng tour
    if ((STATUS.SKIPPED as string) === status) {
      cleanOverlay();
      dispatch(stopTour());
      return;
    }

    // STATUS.FINISHED hoặc TOUR_END → dừng tour
    if ((STATUS.FINISHED as string) === status || type === EVENTS.TOUR_END) {
      setTimeout(cleanOverlay, 50); // sau khi Joyride hoàn tất render cycle
      dispatch(stopTour());
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      const isNextStepAvailable = nextStepIndex >= 0 && nextStepIndex < steps.length;

      if (!isNextStepAvailable) {
        // ← ROOT CAUSE FIX: bước cuối trong controlled mode
        // STATUS.FINISHED không tự fire, phải handle ở đây
        setTimeout(cleanOverlay, 50);
        dispatch(stopTour());
        return;
      }

      const nextStep = steps[nextStepIndex];

      if (nextStep.route && nextStep.route !== router.pathname) {
        dispatch(setRun(false)); // tạm dừng để navigate, isActive vẫn true
        router.push(nextStep.route).then(() => {
          dispatch(setStepIndex(nextStepIndex));
          setTimeout(() => dispatch(setRun(true)), 600);
        });
      } else {
        dispatch(setStepIndex(nextStepIndex));
      }
    }
  };

  // Không render phía server
  if (!isClient) return null;

  // CHIẾN LƯỢC: luôn giữ <Joyride> mounted, dùng hideOverlay + run=false
  // khi tour không active. Joyride tự xử lý DOM overlay của nó.
  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={isActive && run}
      stepIndex={stepIndex}
      steps={steps}
      tooltipComponent={(props) => (
        <TooltipWrapper
          {...props}
          color={primaryColor}
          totalSteps={steps.length}
        />
      )}
      options={{
        zIndex: 10000,
        primaryColor,
        overlayColor: 'rgba(0, 0, 0, 0.62)',
        spotlightPadding: 6,
        overlayClickAction: false,
        hideOverlay: !isActive,  // ← ẩn overlay khi tour kết thúc
      }}
    />
  );
};

export default TourGuide;

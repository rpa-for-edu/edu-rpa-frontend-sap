import React, { useState, useEffect, useRef } from 'react';
import {
  Joyride,
  EventData,
  EVENTS,
  ACTIONS,
  STATUS,
  TooltipRenderProps,
  Step,
} from 'react-joyride';
import { useToken } from '@chakra-ui/react';

import { useTranslation } from 'next-i18next';

// ─────────────────────────────────────────────────────────────────────────────
// Step definitions — waitFor: BPMN type auto-advance khi user drag shape
// ─────────────────────────────────────────────────────────────────────────────
export interface ModelerStep extends Step {
  spotlightClicks?: boolean;
  data?: {
    isWelcome?: boolean;
    isFinish?: boolean;
    waitFor?: string; // BPMN type cần chờ, vd 'bpmn:StartEvent'
    highlightAction?: string;  // data-action của item cần highlight trong palette
  };
}

export const getModelerSteps = (t: any): ModelerStep[] => [
  {
    target: 'body',
    placement: 'center',
    skipBeacon: true,
    content: '',
    title: '',
    data: { isWelcome: true },
  },
  {
    target: '.djs-palette',
    placement: 'right',
    skipBeacon: true,
    title: t('tour.modeler.palette.title'),
    content: t('tour.modeler.palette.content'),
    data: {},
  },
  {
    target: '.djs-palette [data-action="create.task"]',
    placement: 'right',
    skipBeacon: true,
    title: t('tour.modeler.dragTask.title'),
    content: (
      <span>
        {t('tour.modeler.dragTask.content', 'Kéo biểu tượng này (hình chữ nhật) vào canvas.')}
        <br /><br />
        <strong>{t('tour.modeler.autoAdvance', 'Tour sẽ tự chuyển bước khi bạn thả xuống.')}</strong>
      </span>
    ),
    data: { waitFor: 'bpmn:Task', highlightAction: 'create.task' },
  },
  {
    target: '.djs-palette [data-action="create.end-event"]',
    placement: 'right',
    skipBeacon: true,
    title: t('tour.modeler.dragEnd.title'),
    content: (
      <span>
        {t('tour.modeler.dragEnd.content', 'Kéo biểu tượng này (vòng tròn đậm) vào canvas để kết thúc quy trình.')}
        <br /><br />
        <strong>{t('tour.modeler.autoAdvance', 'Tour sẽ tự chuyển bước khi bạn thả xuống.')}</strong>
      </span>
    ),
    data: { waitFor: 'bpmn:EndEvent', highlightAction: 'create.end-event' },
  },
  {
    target: '.djs-container',
    placement: 'center',
    skipBeacon: true,
    title: t('tour.modeler.connect.title'),
    content: t('tour.modeler.connect.content'),
    data: {},
  },
  {
    target: '.djs-element[data-element-id^="Activity_"]',
    placement: 'bottom',
    skipBeacon: true,
    title: t('tour.modeler.nameTask.title'),
    content: t('tour.modeler.nameTask.content'),
    data: {},
  },
  {
    target: '.djs-container .djs-element[data-element-id^="Activity_"]',
    placement: 'bottom',
    skipBeacon: true,
    spotlightClicks: true,
    title: t('tour.modeler.properties.title'),
    content: (
      <span>
        {t('tour.modeler.properties.content')}
      </span>
    ),
    data: {},
  },
  {
    target: '#modeler-right-sidebar',
    placement: 'left',
    skipBeacon: true,
    title: t('tour.modeler.package.title'),
    content: t('tour.modeler.package.content'),
    data: {},
  },
  {
    target: '#modeler-right-sidebar',
    placement: 'left',
    skipBeacon: true,
    title: t('tour.modeler.template.title'),
    content: t('tour.modeler.template.content'),
    data: {},
  },
  {
    target: '#modeler-ai-chatbot-btn',
    placement: 'left',
    skipBeacon: true,
    title: t('tour.modeler.ai.title'),
    content: t('tour.modeler.ai.content'),
    data: {},
  },
  {
    target: '.modeler-problems-tab',
    placement: 'top-start',
    skipBeacon: true,
    spotlightClicks: true,
    title: t('tour.modeler.problems.title'),
    content: t('tour.modeler.problems.content'),
    data: {},
  },
  {
    target: '.modeler-logs-tab',
    placement: 'top-start',
    skipBeacon: true,
    spotlightClicks: true,
    title: t('tour.modeler.logs.title'),
    content: t('tour.modeler.logs.content'),
    data: {},
  },
  {
    target: '.modeler-variables-tab',
    placement: 'top-start',
    skipBeacon: true,
    spotlightClicks: true,
    title: t('tour.modeler.variables.title'),
    content: t('tour.modeler.variables.content'),
    data: {},
  },
  {
    target: 'body',
    placement: 'center',
    skipBeacon: true,
    content: '',
    title: '',
    data: { isFinish: true },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
const cleanOverlay = () => {
  document
    .querySelectorAll('.react-joyride__overlay, .react-joyride__spotlight')
    .forEach((el: any) => (el.style.display = 'none'));
};

// ─────────────────────────────────────────────────────────────────────────────
// Step Dots — clickable progress indicator
// ─────────────────────────────────────────────────────────────────────────────
const StepDots: React.FC<{ total: number; current: number; color: string; goToStep: (i: number) => void; isActionStep?: (i: number) => boolean }> = ({ total, current, color, goToStep, isActionStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
    {Array.from({ length: total }).map((_, i) => {
      const isAction = isActionStep ? isActionStep(i) : false;
      return (
        <button
          key={i}
          title={`Bước ${i + 1}${isAction ? ' (cần tương tác)' : ''}`}
          onClick={() => goToStep(i)}
          style={{
            width: i === current ? '18px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: i === current ? color : isAction ? '#F6AD55' : '#cbd5e0',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            flexShrink: 0,
          }}
        />
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Welcome Panel
// ─────────────────────────────────────────────────────────────────────────────
const WelcomePanel: React.FC<
  TooltipRenderProps & { color: string; onStart: () => void; onSkip: () => void }
> = ({ tooltipProps, color, onStart, onSkip }) => {
  const { t } = useTranslation('common');
  return (
  <div
    {...tooltipProps}
    style={{
      background: '#fff', borderRadius: '16px', padding: '40px 44px',
      width: '500px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}
  >
    <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: '#1a202c' }}>
      {t('tour.welcome.title')}
    </h2>
    <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#718096', lineHeight: 1.7 }}>
      {t('tour.welcome.desc1')}
    </p>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={onStart} style={{
        flex: 1, padding: '11px 16px', background: color, color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      }}>{t('tour.welcome.start')}</button>
      <button onClick={onSkip} style={{
        padding: '11px 16px', background: '#f7fafc', color: '#718096',
        border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
      }}>{t('tour.general.skip')}</button>
    </div>
  </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Finish Panel
// ─────────────────────────────────────────────────────────────────────────────
const FinishPanel: React.FC<
  TooltipRenderProps & { color: string; onDone: () => void; onBack: () => void }
> = ({ tooltipProps, color, onDone, onBack }) => {
  const { t } = useTranslation('common');
  return (
  <div
    {...tooltipProps}
    style={{
      background: '#fff', borderRadius: '16px', padding: '40px 44px',
      width: '480px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      fontFamily: "'Inter','Segoe UI',sans-serif", textAlign: 'center',
    }}
  >
    <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: '#1a202c' }}>
      {t('tour.finish.title')}
    </h2>
    <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#718096', lineHeight: 1.7 }}>
      {t('tour.finish.desc1')}
    </p>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={onBack} style={{
        padding: '11px 16px', background: '#f7fafc', color: '#718096',
        border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
      }}>{t('tour.general.back')}</button>
      <button onClick={onDone} style={{
        flex: 1, padding: '11px 16px', background: color, color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      }}>{t('tour.finish.start')}</button>
    </div>
  </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Step Panel — hiển thị waiting UI khi có waitFor
// ─────────────────────────────────────────────────────────────────────────────
const StepPanel: React.FC<
  TooltipRenderProps & { color: string; stepData?: ModelerStep['data']; goToStep: (i: number) => void; isActionStep?: (i: number) => boolean }
> = ({ tooltipProps, step, index, size, backProps, skipProps, primaryProps, color, stepData, goToStep, isActionStep }) => {
  const { t } = useTranslation('common');
  const isWaiting = !!stepData?.waitFor;
  return (
    <div
      {...tooltipProps}
      style={{
        background: '#fff', borderRadius: '4px', padding: 0, maxWidth: '480px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1), 0 4px 16px rgba(0,0,0,.18)',
        fontFamily: "'Inter','Segoe UI',sans-serif", fontSize: '14px', color: '#333',
      }}
    >
      {step.title && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,.08)', fontWeight: 700, fontSize: '15px' }}>
          {step.title as string}
        </div>
      )}
      <div style={{ padding: '14px 16px', lineHeight: 1.65, color: '#444', whiteSpace: 'pre-line' }}>
        {step.content as React.ReactNode}
      </div>


      {/* Footer: Skip | số+dots | Back+Next/Waiting */}
      <div style={{
        borderTop: '1px solid rgba(0,0,0,.08)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', gap: '8px',
      }}>
        {/* Left: Skip */}
        <button {...skipProps} style={{ background: 'none', border: 'none', color: '#999', fontSize: '13px', cursor: 'pointer', padding: '4px 0', flexShrink: 0 }}>
          {t('tour.general.skip')}
        </button>

        {/* Center: số + dots */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', color: '#bbb', flexShrink: 0 }}>{index} / {size - 2}</span>
          <StepDots
            total={size}
            current={index}
            color={color}
            goToStep={goToStep}
            isActionStep={isActionStep}
          />
        </div>

        {/* Right: Back + Next/Waiting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {index > 1 && (
            <button {...backProps} style={{ padding: '7px 14px', background: 'transparent', color: '#444', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
              {t('tour.general.back')}
            </button>
          )}
          {isWaiting ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px',
              background: '#EBF8FF', border: '1px solid #BEE3F8', borderRadius: '4px',
              fontSize: '12px', color: '#2B6CB0', fontWeight: 500, minWidth: '140px', justifyContent: 'center',
            }}>
              <span style={{
                display: 'inline-block', width: '12px', height: '12px',
                border: '2px solid #4299E1', borderTopColor: 'transparent',
                borderRadius: '50%', animation: 'mSpin 0.8s linear infinite', flexShrink: 0,
              }} />
              {stepData.waitFor?.includes('Selected') || stepData.waitFor?.startsWith('tab:') ? t('tour.general.waitingClick') : t('tour.general.waiting')}
              <style>{`@keyframes mSpin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <button {...primaryProps} style={{ padding: '7px 14px', background: color, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              {t('tour.general.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ModelerTourGuide
// ─────────────────────────────────────────────────────────────────────────────
interface ModelerTourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  modelerRef?: any;
}

export default function ModelerTourGuide({ isOpen, onClose, modelerRef }: ModelerTourGuideProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [primaryColor] = useToken('colors', ['teal.500']);
  const { t } = useTranslation('common');
  const modelerSteps = getModelerSteps(t);
  const stepIndexRef = useRef(0);

  useEffect(() => { stepIndexRef.current = stepIndex; }, [stepIndex]);
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (isOpen) { setStepIndex(0); setRun(true); }
    else { setRun(false); cleanOverlay(); }
  }, [isOpen]);

  // ── Lắng nghe BPMN shape.added và Selection để auto-advance action steps ──
  useEffect(() => {
    const bpmnModeler = modelerRef?.bpmnModeler;
    if (!bpmnModeler || !isOpen || !run) return;

    const currentStep = modelerSteps[stepIndex];
    const waitFor = currentStep?.data?.waitFor;
    if (!waitFor) return;

    let handled = false;
    const handleNext = () => {
      if (handled) return;
      handled = true;
      setTimeout(() => {
        const next = stepIndexRef.current + 1;
        if (next < modelerSteps.length) setStepIndex(next);
        else { setRun(false); cleanOverlay(); onClose(); }
      }, 600);
    };

    // 1. Lắng nghe thả Shape vào canvas
    const handleShapeAdded = (event: any) => {
      if (handled || (waitFor && waitFor.includes('Selected'))) return;
      const shapeType = event.element?.type;
      if (shapeType === waitFor) handleNext();
    };

    // 2. Lắng nghe chọn Task mở properties sidebar
    const handleSelectionChanged = (event: any) => {
      if (handled || waitFor !== 'bpmn:Task_Selected') return;
      const selected = event.newSelection?.[0];
      if (selected && selected.type === 'bpmn:Task') handleNext();
    };

    try {
      const eventBus = bpmnModeler.get('eventBus');
      eventBus.on('shape.added', handleShapeAdded);
      eventBus.on('selection.changed', handleSelectionChanged);
      return () => {
        eventBus.off('shape.added', handleShapeAdded);
        eventBus.off('selection.changed', handleSelectionChanged);
      };
    } catch { return undefined; }
  }, [modelerRef?.bpmnModeler, stepIndex, isOpen, run, modelerSteps.length]);

  const handleCallback = (data: EventData) => {
    const { action, index, status, type } = data;

    if ((STATUS.SKIPPED as string) === status) { cleanOverlay(); setRun(false); onClose(); return; }
    if ((STATUS.FINISHED as string) === status || type === EVENTS.TOUR_END) {
      setTimeout(cleanOverlay, 50); setRun(false); onClose(); return;
    }

    if (type === EVENTS.STEP_AFTER) {
      const isWaiting = !!modelerSteps[index]?.data?.waitFor;
      // Chặn "Next" cho action steps — chỉ interaction thật sự mới advance
      if (isWaiting && action === ACTIONS.NEXT) return;

      const next = index + (action === ACTIONS.PREV ? -1 : 1);
      if (next < 0 || next >= modelerSteps.length) {
        setTimeout(cleanOverlay, 50); setRun(false); onClose(); return;
      }

      setStepIndex(next);
    }
  };

  const TooltipComponent = (props: TooltipRenderProps) => {
    const { index } = props;
    const stepData = modelerSteps[index]?.data;
    if (stepData?.isWelcome) return (
      <WelcomePanel {...props} color={primaryColor}
        onStart={() => setStepIndex(1)}
        onSkip={() => { cleanOverlay(); setRun(false); onClose(); }}
      />
    );
    if (stepData?.isFinish) return (
      <FinishPanel {...props} color={primaryColor}
        onDone={() => { setTimeout(cleanOverlay, 50); setRun(false); onClose(); }}
        onBack={() => setStepIndex(modelerSteps.length - 2)}
      />
    );
    return (
      <StepPanel
        {...props}
        color={primaryColor}
        stepData={stepData}
        goToStep={(targetIndex) => setStepIndex(targetIndex)}
        isActionStep={(i) => !!modelerSteps[i]?.data?.waitFor}
      />
    );
  };

  if (!isClient || !isOpen) return null;

  const currentStepData = modelerSteps[stepIndex]?.data;
  const isActionStep = !!currentStepData?.waitFor;
  const highlightAction = currentStepData?.highlightAction;

  return (
    <>
      {/* 
        BẬT phủ mờ (với lỗ đục) để layout tối xung quanh và chỉ tập trung vào target cho toàn bộ Tour.
      */}
      <style>{`
        /* Bỏ block click của overlay */
        .react-joyride__overlay svg path { pointer-events: none !important; }
        .react-joyride__overlay { pointer-events: none !important; }
        
        /* Dim/Outline cho Action steps (kéo thả) */
        ${
          isActionStep && highlightAction
            ? `
            .djs-palette .entry {
              opacity: 0.25 !important;
              filter: grayscale(1) !important;
              pointer-events: none !important;
            }
            .djs-palette [data-action="${highlightAction}"] {
              opacity: 1 !important;
              filter: none !important;
              pointer-events: auto !important;
              outline: 2px solid #319795 !important;
              outline-offset: 3px !important;
              border-radius: 4px;
              box-shadow: 0 0 0 4px rgba(49, 151, 149, 0.2);
            }
            `
            : `
            .djs-palette .entry {
              opacity: 1 !important;
              filter: none !important;
              pointer-events: auto !important;
            }
            `
        }

        /* 
          CSS đặc biệt để highlight mục tiêu CỤ THỂ BÊN TRONG sidebar:
          Bước 7: Chỉ highlight package đầu tiên.
          Bước 8: Chỉ highlight template đầu tiên.
        */
        ${
          (stepIndex === 7) 
            ? `
            .activity-package-item:first-of-type {
              outline: 2px solid #319795 !important;
              outline-offset: 4px !important;
              border-radius: 6px;
              box-shadow: 0 0 12px rgba(49, 151, 149, 0.4) !important;
              position: relative;
              z-index: 10001;
            }
            `
            : ''
        }
        ${
          (stepIndex === 8) 
            ? `
            .activity-template-btn:first-of-type {
              outline: 2px solid #319795 !important;
              outline-offset: 4px !important;
              border-radius: 6px;
              box-shadow: 0 0 12px rgba(49, 151, 149, 0.4) !important;
              position: relative;
              z-index: 10001;
            }
            `
            : ''
        }

        /* Đẩy các Tooltip ở Tab dưới đáy (Problems=10, Logs=11, Variables=12) lên cao */
        ${
          (stepIndex >= 10 && stepIndex <= 12)
            ? `
            .react-joyride__tooltip {
              margin-top: -35px !important;
            }
            `
            : ''
        }
      `}</style>
      <Joyride
        onEvent={handleCallback}
        continuous
        run={run}
        stepIndex={stepIndex}
        steps={modelerSteps}
        tooltipComponent={TooltipComponent}
        options={{
          zIndex: 10000,
          primaryColor,
          overlayColor: 'rgba(0, 0, 0, 0.55)',
          spotlightPadding: 6,
          overlayClickAction: false,
          hideOverlay: !run,
        }}
      />
    </>
  );
}

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

// ─────────────────────────────────────────────────────────────────────────────
// Step definitions — waitFor: BPMN type auto-advance khi user drag shape
// ─────────────────────────────────────────────────────────────────────────────
interface ModelerStep extends Step {
  data?: {
    isWelcome?: boolean;
    isFinish?: boolean;
    waitFor?: string; // BPMN type cần chờ, vd 'bpmn:StartEvent'
    highlightAction?: string;  // data-action của item cần highlight trong palette
  };
}

const modelerSteps: ModelerStep[] = [
  {
    target: 'body',
    placement: 'center',
    skipBeacon: true,
    content: '',
    title: '',
    data: { isWelcome: true },
  },
  {
    // Highlight toàn bộ palette — luôn tồn tại
    target: '.djs-palette',
    placement: 'right',
    skipBeacon: true,
    title: 'Bảng công cụ (Palette)',
    content: 'Đây là bảng công cụ BPMN. Bạn sẽ kéo các phần tử từ đây vào canvas.',
    data: {},
  },
  {
    // Target đúng icon Task trong palette
    target: '.djs-palette [data-action="create.task"]',
    placement: 'right',
    skipBeacon: true,
    title: 'Kéo Task vào canvas',
    content: (
      <span>
        Kéo biểu tượng này (hình chữ nhật) vào canvas.
        <br /><br />
        Tour sẽ <strong>tự chuyển bước</strong> khi bạn thả xuống.
      </span>
    ),
    data: { waitFor: 'bpmn:Task', highlightAction: 'create.task' },
  },
  {
    // Target đúng icon End Event trong palette
    target: '.djs-palette [data-action="create.end-event"]',
    placement: 'right',
    skipBeacon: true,
    title: 'Kéo End Event vào canvas',
    content: (
      <span>
        Kéo biểu tượng này (vòng tròn đậm) vào canvas để kết thúc quy trình.
        <br /><br />
        Tour sẽ <strong>tự chuyển bước</strong> khi bạn thả xuống.
      </span>
    ),
    data: { waitFor: 'bpmn:EndEvent', highlightAction: 'create.end-event' },
  },
  {
    target: '.djs-container',
    placement: 'center',
    skipBeacon: true,
    title: 'Kết nối các phần tử',
    content: 'Click chuột vào một phần tử → xuất hiện mũi tên → kéo sang phần tử khác để nối. Hãy nối: Start Event → Task → End Event.',
    data: {},
  },
  {
    // Hướng dẫn đặt tên task bằng cách double-click
    target: '.djs-element[data-element-id^="Activity_"]',
    placement: 'bottom',
    skipBeacon: true,
    title: 'Đặt tên cho Task',
    content: (
      <span>
        <strong>Double-click</strong> vào Task trên canvas để đặt tên.
        <br /><br />
        Đặt tên rõ ràng giúp dễ đọc quy trình và tạo robot code chính xác hơn.
      </span>
    ),
    data: {},
  },
  {
    // Hướng dẫn mở sidebar bên phải
    target: '.djs-element[data-element-id^="Activity_"]',
    placement: 'bottom',
    skipBeacon: true,
    title: 'Properties Sidebar',
    content: (
      <span>
        Click vào <strong>Task</strong> trên canvas để mở sidebar bên phải.
        <br /><br />
        Sidebar hiển thị thông tin và cho phép cấu hình chi tiết cho từng phần tử.
      </span>
    ),
    data: {},
  },
  {
    // Hướng dẫn chọn Activity Package
    target: '#modeler-right-sidebar',
    placement: 'left',
    skipBeacon: true,
    title: 'Chọn Activity Package',
    content: (
      <span>
        Trong sidebar, chọn <strong>Activity Package</strong> phù hợp (ví dụ: Browser Automation, Data Manipulation...).
        <br /><br />
        Mỗi package chứa các hoạt động có thể tự động hóa được.
      </span>
    ),
    data: {},
  },
  {
    // Hướng dẫn chọn Activity Template
    target: '#modeler-right-sidebar',
    placement: 'left',
    skipBeacon: true,
    title: 'Gắn Activity Template vào Task',
    content: (
      <span>
        Sau khi chọn package, chọn <strong>Activity Template</strong> cụ thể.
        <br /><br />
        Sau đó thêm giá trị phù hợp cho các tham số
      </span>
    ),
  data: {},
  },
  {
    // Hướng dẫn AI Chatbot
    target: '#modeler-ai-chatbot-btn',
    placement: 'left',
    skipBeacon: true,
    title: 'Sử dụng AI Chatbot',
    content: (
      <span>
        Nhấn nút <strong>AI Robot</strong> này để mở AI Chatbot.
        <br /><br />
        AI có thể tự động tạo quy trình BPMN từ mô tả bằng ngôn ngữ tự nhiên của bạn.
      </span>
    ),
    data: {},
  },
  {
    target: '.modeler-problems-tab',
    placement: 'top-start',
    skipBeacon: true,
    title: 'Xem Problems',
    content: 'Tab "Problems" hiển thị lỗi và cảnh báo trong quy trình. Click vào đây để xem chi tiết.',
    data: {},
  },
  {
    target: '.modeler-logs-tab',
    placement: 'top-start',
    skipBeacon: true,
    title: 'Xem Logs',
    content: 'Tab "Logs" hiển thị lịch sử và nhật ký chạy của Robot. Theo dõi Logs để biết quá trình thực thi.',
    data: {},
  },
  {
    target: '.modeler-variables-tab',
    placement: 'top-start',
    skipBeacon: true,
    title: 'Tạo Variables',
    content: 'Tab "Variables" để khai báo biến dùng trong quy trình. Click vào rồi nhấn "+ Add Variable" để thêm mới.',
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
  const portal = document.getElementById('react-joyride-portal');
  if (portal) portal.innerHTML = '';
  document
    .querySelectorAll('.react-joyride__overlay, .react-joyride__spotlight')
    .forEach((el) => el.remove());
};

// ─────────────────────────────────────────────────────────────────────────────
// Welcome Panel
// ─────────────────────────────────────────────────────────────────────────────
const WelcomePanel: React.FC<
  TooltipRenderProps & { color: string; onStart: () => void; onSkip: () => void }
> = ({ tooltipProps, color, onStart, onSkip }) => (
  <div
    {...tooltipProps}
    style={{
      background: '#fff', borderRadius: '16px', padding: '40px 44px',
      width: '500px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}
  >
    <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: '#1a202c' }}>
      Hướng dẫn tạo Process trong Studio
    </h2>
    <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#718096', lineHeight: 1.7 }}>
      Tour này sẽ chỉ từng bước để bạn tự thực hiện:
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
      {[
        'Kéo Start Event, Task, End Event vào canvas',
        'Kết nối các phần tử với nhau',
        'Gắn Activity Template vào Task',
        'Xem Problems và khai báo Variables',
      ].map((text) => (
        <div key={text} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#4a5568' }}>{text}</span>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={onStart} style={{
        flex: 1, padding: '11px 16px', background: color, color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      }}>Bắt đầu →</button>
      <button onClick={onSkip} style={{
        padding: '11px 16px', background: '#f7fafc', color: '#718096',
        border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
      }}>Bỏ qua</button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Finish Panel
// ─────────────────────────────────────────────────────────────────────────────
const FinishPanel: React.FC<
  TooltipRenderProps & { color: string; onDone: () => void; onBack: () => void }
> = ({ tooltipProps, color, onDone, onBack }) => (
  <div
    {...tooltipProps}
    style={{
      background: '#fff', borderRadius: '16px', padding: '40px 44px',
      width: '480px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      fontFamily: "'Inter','Segoe UI',sans-serif", textAlign: 'center',
    }}
  >
    <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 700, color: '#1a202c' }}>
      Hoàn thành!
    </h2>
    <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#718096', lineHeight: 1.7 }}>
      Bạn đã nắm được các bước cơ bản. Hãy thử tạo quy trình của riêng bạn ngay bây giờ!
    </p>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={onBack} style={{
        padding: '11px 16px', background: '#f7fafc', color: '#718096',
        border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
      }}>← Xem lại</button>
      <button onClick={onDone} style={{
        flex: 1, padding: '11px 16px', background: color, color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      }}>Bắt đầu tạo process</button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Step Panel — hiển thị waiting UI khi có waitFor
// ─────────────────────────────────────────────────────────────────────────────
const StepPanel: React.FC<
  TooltipRenderProps & { color: string; stepData?: ModelerStep['data'] }
> = ({ tooltipProps, step, index, size, backProps, skipProps, primaryProps, color, stepData }) => {
  const isWaiting = !!stepData?.waitFor;
  return (
    <div
      {...tooltipProps}
      style={{
        background: '#fff', borderRadius: '4px', padding: 0, maxWidth: '360px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1), 0 4px 16px rgba(0,0,0,.18)',
        fontFamily: "'Inter','Segoe UI',sans-serif", fontSize: '14px', color: '#333',
      }}
    >
      {step.title && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,.08)', fontWeight: 700, fontSize: '15px' }}>
          {step.title as string}
        </div>
      )}
      <div style={{ padding: '14px 16px', lineHeight: 1.65, color: '#444' }}>
        {step.content as React.ReactNode}
      </div>
      <div style={{
        borderTop: '1px solid rgba(0,0,0,.08)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', gap: '8px',
      }}>
        <button {...skipProps} style={{ background: 'none', border: 'none', color: '#999', fontSize: '13px', cursor: 'pointer', padding: '4px 0' }}>
          Bỏ qua
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#bbb' }}>{index} / {size - 2}</span>
          {index > 1 && (
            <button {...backProps} style={{ padding: '7px 14px', background: 'transparent', color: '#444', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
              Quay lại
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
              Đang chờ bạn kéo...
              <style>{`@keyframes mSpin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <button {...primaryProps} style={{ padding: '7px 14px', background: color, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Tiếp theo
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
  const stepIndexRef = useRef(0);

  useEffect(() => { stepIndexRef.current = stepIndex; }, [stepIndex]);
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (isOpen) { setStepIndex(0); setRun(true); }
    else { setRun(false); cleanOverlay(); }
  }, [isOpen]);

  // ── Lắng nghe BPMN shape.added để auto-advance action steps ──
  useEffect(() => {
    const bpmnModeler = modelerRef?.bpmnModeler;
    if (!bpmnModeler || !isOpen || !run) return;

    const currentStep = modelerSteps[stepIndex];
    const waitFor = currentStep?.data?.waitFor;
    if (!waitFor) return;

    let handled = false;
    const handleShapeAdded = (event: any) => {
      if (handled) return;
      const shapeType = event.element?.type;
      if (shapeType === waitFor) {
        handled = true;
        setTimeout(() => {
          const next = stepIndexRef.current + 1;
          if (next < modelerSteps.length) setStepIndex(next);
          else { setRun(false); cleanOverlay(); onClose(); }
        }, 600);
      }
    };

    try {
      const eventBus = bpmnModeler.get('eventBus');
      eventBus.on('shape.added', handleShapeAdded);
      return () => eventBus.off('shape.added', handleShapeAdded);
    } catch { return undefined; }
  }, [modelerRef?.bpmnModeler, stepIndex, isOpen, run]);

  const handleCallback = (data: EventData) => {
    const { action, index, status, type } = data;

    if ((STATUS.SKIPPED as string) === status) { cleanOverlay(); setRun(false); onClose(); return; }
    if ((STATUS.FINISHED as string) === status || type === EVENTS.TOUR_END) {
      setTimeout(cleanOverlay, 50); setRun(false); onClose(); return;
    }

    if (type === EVENTS.STEP_AFTER) {
      const isWaiting = !!modelerSteps[index]?.data?.waitFor;
      // Chặn "Next" cho action steps — chỉ BPMN event mới advance
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
    return <StepPanel {...props} color={primaryColor} stepData={stepData} />;
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

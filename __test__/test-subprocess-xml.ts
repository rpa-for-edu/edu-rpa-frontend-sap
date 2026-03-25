import { convertJsonToBpmn } from "../src/utils/bpmn-parser/json-to-bpmn-xml.util";

const testCases = [
  {
    name: "Simple",
    data: {
      bpmn: {
        nodes: [
          { id: "s1", type: "StartEvent", name: "Bắt đầu", in_loop: false },
          { id: "n2", type: "ServiceTask", name: "Nhận danh sách", in_loop: false },
          { id: "n3", type: "ServiceTask", name: "Chấm điểm", in_loop: true },
          { id: "n5", type: "ServiceTask", name: "Gửi thông báo", in_loop: false },
          { id: "e1", type: "EndEvent", name: "Kết thúc", in_loop: false },
        ],
        flows: [
          { source: "s1", target: "n2", type: "SequenceFlow", condition: null },
          { source: "n2", target: "n3", type: "SequenceFlow", condition: null },
          { source: "n3", target: "n5", type: "SequenceFlow", condition: null },
          { source: "n5", target: "e1", type: "SequenceFlow", condition: null },
        ],
      },
      mapping: [
        { node_id: "n3", activity_id: "test", candidates: [], is_automatic: true } as any
      ]
    },
  },
  {
    name: "Medium",
    data: {
      bpmn: {
        nodes: [
          { id: "s1", type: "StartEvent", name: "Bắt đầu", in_loop: false },
          { id: "n2", type: "ServiceTask", name: "Nhận danh sách bài làm", in_loop: false },
          { id: "n3", type: "ServiceTask", name: "Chấm điểm bài làm", in_loop: true },
          { id: "n4", type: "ServiceTask", name: "Lưu kết quả chấm điểm", in_loop: true },
          { id: "n5", type: "ServiceTask", name: "Gửi thông báo", in_loop: false },
          { id: "e1", type: "EndEvent", name: "Kết thúc", in_loop: false },
        ],
        flows: [
          { source: "s1", target: "n2", type: "SequenceFlow", condition: null },
          { source: "n2", target: "n3", type: "SequenceFlow", condition: null },
          { source: "n3", target: "n4", type: "SequenceFlow", condition: null },
          { source: "n4", target: "n5", type: "SequenceFlow", condition: null },
          { source: "n5", target: "e1", type: "SequenceFlow", condition: null },
        ],
      },
      mapping: [
        { node_id: "n3", activity_id: "test", candidates: [], is_automatic: true } as any,
        { node_id: "n4", activity_id: "test", candidates: [], is_automatic: true } as any
      ]
    },
  },
  {
    name: "Complex",
    data: {
      bpmn: {
        nodes: [
          { id: "s1", type: "StartEvent", name: "Bắt đầu", in_loop: false },
          { id: "n2", type: "ServiceTask", name: "Chuẩn bị", in_loop: false },
          { id: "gw1", type: "ExclusiveGateway", name: "Kiểm tra", in_loop: true },
          { id: "n3", type: "ServiceTask", name: "Nhánh 1", in_loop: true },
          { id: "n4", type: "ServiceTask", name: "Nhánh 2", in_loop: true },
          { id: "gw2", type: "ExclusiveGateway", name: "Gộp", in_loop: true },
          { id: "n5", type: "ServiceTask", name: "Tổng hợp", in_loop: false },
          { id: "e1", type: "EndEvent", name: "Kết thúc", in_loop: false },
        ],
        flows: [
          { source: "s1", target: "n2", type: "SequenceFlow", condition: null },
          { source: "n2", target: "gw1", type: "SequenceFlow", condition: null },
          { source: "gw1", target: "n3", type: "SequenceFlow", condition: "Đúng" },
          { source: "gw1", target: "n4", type: "SequenceFlow", condition: "Sai" },
          { source: "n3", target: "gw2", type: "SequenceFlow", condition: null },
          { source: "n4", target: "gw2", type: "SequenceFlow", condition: null },
          { source: "gw2", target: "n5", type: "SequenceFlow", condition: null },
          { source: "n5", target: "e1", type: "SequenceFlow", condition: null },
        ],
      },
      mapping: [
        { node_id: "gw1", activity_id: "test", candidates: [], is_automatic: true } as any,
        { node_id: "n3", activity_id: "test", candidates: [], is_automatic: true } as any,
        { node_id: "n4", activity_id: "test", candidates: [], is_automatic: true } as any,
        { node_id: "gw2", activity_id: "test", candidates: [], is_automatic: true } as any
      ]
    },
  }
];

testCases.forEach(({ name, data }) => {
  console.log(`\n========================================`);
  console.log(`Running Test Case: ${name}`);
  console.log(`========================================`);
  
  const result = convertJsonToBpmn(data);

  if (result.success && result.xml) {
    // console.log("Generated XML snippet:", result.xml.substring(0, 200) + "...");
    
    // Check subprocess elements
    const hasSubProcess = result.xml.includes("<bpmn:subProcess");
    const hasExpandedShape = result.xml.includes('isExpanded="true"');

    console.log("Has subprocess:", hasSubProcess);
    console.log("Has isExpanded:", hasExpandedShape);

    // Extract subprocess ID and check shape
    const subProcessMatches = Array.from(result.xml.matchAll(/<bpmn:subProcess id="([^"]+)"/g));
    
    if (subProcessMatches.length > 0) {
      console.log(`Found ${subProcessMatches.length} SubProcess(es)`);
      
      subProcessMatches.forEach((match, index) => {
        const subProcessId = match[1];
        console.log(`[${index + 1}] SubProcess ID: ${subProcessId}`);

        const shapeMatch = result.xml.match(new RegExp(`bpmnElement="${subProcessId}"`));
        console.log(`    Has matching BPMNShape: ${!!shapeMatch}`);

        if (!shapeMatch) {
          console.log("    ❌ ERROR: BPMNShape not found for this SubProcess!");
        } else {
          console.log("    ✅ SUCCESS: BPMNShape matches subprocess ID");
        }
      });
    } else {
      console.log("❌ ERROR: No SubProcess element found in the generated XML!");
    }
  } else {
    console.error(`❌ Errors in ${name} test case:`, result.errors);
  }
});

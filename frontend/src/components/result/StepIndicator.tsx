import styled from "@emotion/styled";

type ResultStep = "past" | "present" | "future" | "summary" | "lucky";

interface StepIndicatorProps {
  currentStep: ResultStep;
}

interface StepInfo {
  title: string;
  icon: string;
  index: number;
}

const STEP_INFO: Record<ResultStep, StepInfo> = {
  past: { title: "과거", icon: "🕰️", index: 0 },
  present: { title: "현재", icon: "⭐", index: 1 },
  future: { title: "미래", icon: "🔮", index: 2 },
  summary: { title: "총평", icon: "📋", index: 3 },
  lucky: { title: "행운카드", icon: "🍀", index: 4 },
};

const STEPS: ResultStep[] = ["past", "present", "future", "summary", "lucky"];

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentStepInfo = STEP_INFO[currentStep];
  const currentIndex = currentStepInfo.index;

  return (
    <IndicatorContainer>
      <DotsContainer>
        {/* <StartIcon>🔮</StartIcon> */}
        {STEPS.map((step, index) => (
          <Dot key={step} $isActive={index <= currentIndex} />
        ))}
        {/* <EndIcon>🍀</EndIcon> */}
      </DotsContainer>
    </IndicatorContainer>
  );
}

const IndicatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const DotsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// const StartIcon = styled.span`
//   font-size: 1.2rem;
//   margin-right: 4px;
// `;

// const EndIcon = styled.span`
//   font-size: 1.2rem;
//   margin-left: 4px;
// `;

const Dot = styled.div<{ $isActive: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) =>
    props.$isActive ? "var(--color-accent-300)" : "var(--color-primary-600)"};
  border: 2px solid
    ${(props) =>
      props.$isActive ? "var(--color-accent-400)" : "var(--color-primary-500)"};
  transition: all 0.3s ease;
`;

// const CurrentStepText = styled.div`
//   color: var(--color-accent-300);
//   font-size: 1rem;
//   font-weight: 500;
//   text-align: center;
//   margin-bottom: 12px;
// `;

// const ProgressCounter = styled.div`
//   color: var(--color-primary-300);
//   font-size: 0.875rem;
//   font-weight: 400;
//   text-align: center;
//   margin-top: 8px;
// `;

export default StepIndicator;

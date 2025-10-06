// Properties interface.
interface Props {
    steps: {
        number: number,
        name: string
    }[];
    currentStep: number;
}

const WizardStepsInfo = (props: Props) => {
    const { steps, currentStep } = props;

    return (
        <div className="steps-container">
            {steps.map(step => (
                <div key={step.number} className="step-wrapper">
                    <div className="step-container">
                        <div className={`step-circle ${step.number == currentStep ? "step-active" : ""}`}>{step.number}</div>
                        <span>{step.name}</span>
                    </div>
                    {step.number < steps.length && <div className="step-line" />}
                </div>
            ))}
        </div>
    );
};

export default WizardStepsInfo;
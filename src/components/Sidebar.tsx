const modelChoices = [
  {
    name: "GPT 3.5",
    value: "gpt-3.5-turbo",
  },
  {
    name: "GPT 4",
    value: "gpt-4",
  },
];

const levelChoices = [1, 2, 3, 4, 5];

export const Sidebar = ({
  level,
  model,
  onLevelChange,
  onModelChange,
}: {
  level: number;
  model: string;
  onLevelChange: (n: number) => void;
  onModelChange: (m: string) => void;
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">MingDu</div>
        <img width="64" height="64" src="/logo.png" alt="logo" />
      </div>
      <div className="sidebar-selectors">
        <div className="sidebar-selector select">
          <label htmlFor="levels">Level</label>
          <select
            name="levels"
            id="levels"
            onChange={(e) => onLevelChange(parseInt(e.target.value))}
          >
            {levelChoices.map((choice) => {
              return (
                <option
                  key={`level-${choice}`}
                  selected={level === choice}
                  value={choice}
                >
                  HSK {choice}
                </option>
              );
            })}
          </select>
        </div>
        <div className="sidebar-selector select">
          <label htmlFor="models">Model</label>
          <select
            name="models"
            id="models"
            onChange={(e) => onModelChange(e.target.value)}
          >
            {modelChoices.map((choice) => {
              return (
                <option
                  key={`model-${choice.value}`}
                  selected={model === choice.value}
                  value={choice.value}
                >
                  {choice.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="sidebar-stories">
        <div className="selected">Story 1</div>
        <div>Story 2</div>
      </div>
      <div className="sidebar-buttons">
        <button className="button">New Story</button>
        <button className="button">New Question</button>
      </div>
    </div>
  );
};

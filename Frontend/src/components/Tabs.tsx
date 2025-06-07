import { useState, cloneElement, ReactElement } from 'react';

interface Tab {
  label: string;
  component: ReactElement;
}

interface TabsProps {
  tabs: Tab[];
}

function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div>
      <div role="tablist" className="tabs tabs-border px-4">
        {tabs.map((tab, i) => (
          <a
            key={i}
            role="tab"
            className={`tab ${
              activeTab === tab.label ? 'tab-active font-bold' : ''
            }`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div
          key={i}
          role="tabpanel"
          className={`tab-content bg-base-100 border-base-300 rounded-box p-6 ${
            activeTab === tab.label ? 'block' : 'hidden'
          }`}
        >
          {cloneElement(tab.component, { isActive: activeTab === tab.label })}
        </div>
      ))}
    </div>
  );
}

export default Tabs;

import { useState, ReactNode } from 'react';

interface Tab {
  label: string;
  component: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div>
      <div role="tablist" className="tabs tabs-lifted px-4">
        {tabs.map((tab) => (
          <>
            <a
              key={tab.label}
              role="tab"
              className={`tab ${
                activeTab === tab.label ? 'tab-active font-bold' : ''
              }`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </a>
            <div
              role="tabpanel"
              className="tab-content bg-base-100 border-base-300 rounded-box p-6"
            >
              {tab.component}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

export default Tabs;

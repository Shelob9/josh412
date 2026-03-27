import { ReactNode, useState } from "react"

export default function Tabs({
tabs,
  className
}:{
  tabs: {
	id: string,
	content: ReactNode
	label: string
  }[],
  className?: string
}) {
	const [activeTab, setActiveTab] = useState(tabs[0].id);
	return (
		<section className={className}>
			<nav role="tablist">
				{tabs.map((tab) => (

					<a
						key={tab.id}
						href={`#tab-${tab.id}`}
						aria-controls={`tab-${tab.id}`}
						id={`tab-link-${tab.id}`}
						role="tab"
						onClick={() => setActiveTab(tab.id)}
						className={`tab-link tab ${tab.id === activeTab ? 'tab-active' : 'tab-inactive'}`}
					>
						{tab.label}
					</a>
				))}
			</nav>
			<section id="content" aria-live="polite" role="region">
				{tabs.map((tab) => (
					<div
						key={tab.id}
						id={`tab-${tab.id}`}
						role="tabpanel"
						aria-selected={tab.id === activeTab}
						className={`tab-panel ${tab.id === activeTab ? 'active' : 'hidden'}`}
					>
						{tab.content}
					</div>
				))}
			</section>
		</section>
	)
}

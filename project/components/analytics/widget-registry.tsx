import CycleLeadComparisonWidget from "./cycle-lead-comparison-widget";
import ProgressTimelineWidget from "./progress-timeline-widget";
import TasksPerAssigneeWidget from "./tasks-per-assignee-widget";
import TasksPerWeekWidget from "./tasks-per-week-widget";
import {
	FinishedRatioWidget,
	OverdueWidget,
	TotalTasksWidget,
} from "./widgets";

export const WIDGET_REGISTRY = {
	progress_timeline: {
		label: "Task Progress Timeline",
		Component: ProgressTimelineWidget,
	},
	stat_total_tasks: { label: "Total Tasks", Component: TotalTasksWidget },
	stat_finished_ratio: {
		label: "Finished / Total",
		Component: FinishedRatioWidget,
	},
	stat_overdue: { label: "Overdue Tasks", Component: OverdueWidget },
	tasks_per_week: {
		label: "Tasks Completed / Week",
		Component: TasksPerWeekWidget,
	},
	project_cycle_lead: {
		label: "Project Cycle & Lead Time",
		Component: CycleLeadComparisonWidget,
	},
	user_cycle_lead: {
		label: "User Cycle & Lead Time",
		Component: CycleLeadComparisonWidget,
	},
	tasks_per_assignee: {
		label: "Tasks Per Assignee",
		Component: TasksPerAssigneeWidget,
	},
} as const;

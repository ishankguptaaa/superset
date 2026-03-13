import { AnimatePresence, motion } from "framer-motion";
import { HiChevronRight } from "react-icons/hi2";
import { LuPlus } from "react-icons/lu";
import { useOpenNewWorkspaceModal } from "renderer/stores/new-workspace-modal";
import type { V2SidebarWorkspace } from "../../types";
import { V2WorkspaceListItem } from "../V2WorkspaceListItem";

interface V2ProjectSectionProps {
	projectId: string;
	projectName: string;
	isCollapsed: boolean;
	workspaces: V2SidebarWorkspace[];
	onToggleCollapse: (projectId: string) => void;
}

export function V2ProjectSection({
	projectId,
	projectName,
	isCollapsed,
	workspaces,
	onToggleCollapse,
}: V2ProjectSectionProps) {
	const openModal = useOpenNewWorkspaceModal();

	return (
		<div className="space-y-0.5">
			<div className="group flex w-full items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
				<button
					type="button"
					onClick={() => onToggleCollapse(projectId)}
					className="flex items-center gap-1 min-w-0 flex-1 hover:text-foreground transition-colors"
				>
					<HiChevronRight
						className={`size-3 shrink-0 transition-transform duration-150 ${
							isCollapsed ? "" : "rotate-90"
						}`}
					/>
					<span className="truncate">{projectName}</span>
				</button>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						openModal(projectId);
					}}
					className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:text-foreground transition-all"
				>
					<LuPlus className="size-3" />
				</button>
				<span className="text-[10px] tabular-nums opacity-60">
					{workspaces.length}
				</span>
			</div>

			<AnimatePresence initial={false}>
				{!isCollapsed && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="overflow-hidden"
					>
						<div className="space-y-0.5">
							{workspaces.map((workspace) => (
								<V2WorkspaceListItem
									key={workspace.id}
									id={workspace.id}
									name={workspace.name}
									branch={workspace.branch}
									deviceId={workspace.deviceId}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

import { cn } from "@superset/ui/utils";
import { useMatchRoute, useNavigate } from "@tanstack/react-router";

interface V2WorkspaceListItemProps {
	id: string;
	name: string;
	branch: string;
	deviceId: string | null;
}

export function V2WorkspaceListItem({
	id,
	name,
	branch,
}: V2WorkspaceListItemProps) {
	const navigate = useNavigate();
	const matchRoute = useMatchRoute();

	const isActive = !!matchRoute({
		to: "/v2-workspace/$workspaceId",
		params: { workspaceId: id },
		fuzzy: true,
	});

	const showBranch = !!name && name !== branch;

	return (
		<button
			type="button"
			onClick={() =>
				navigate({
					to: "/v2-workspace/$workspaceId",
					params: { workspaceId: id },
				})
			}
			className={cn(
				"flex w-full pl-3 pr-2 text-sm text-left cursor-pointer relative",
				"hover:bg-muted/50 transition-colors",
				showBranch ? "py-1.5" : "py-2 items-center",
				isActive && "bg-muted",
			)}
		>
			{isActive && (
				<div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
			)}

			<div className="flex-1 min-w-0">
				<div className="flex flex-col gap-0.5">
					<span
						className={cn(
							"truncate text-[13px] leading-tight transition-colors",
							isActive ? "text-foreground font-medium" : "text-foreground/80",
						)}
					>
						{name || branch}
					</span>

					{showBranch && (
						<span className="text-[11px] text-muted-foreground/60 truncate font-mono leading-tight">
							{branch}
						</span>
					)}
				</div>
			</div>
		</button>
	);
}

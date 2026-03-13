import { useLiveQuery } from "@tanstack/react-db";
import { useCallback, useMemo } from "react";
import { useCollections } from "renderer/routes/_authenticated/providers/CollectionsProvider";
import { useV2ProjectLocalMetaStore } from "renderer/stores/v2-project-local-meta";
import type { V2SidebarProject, V2SidebarWorkspace } from "../../types";

const DEFAULT_META = { isCollapsed: false, tabOrder: 0 };

export function useV2SidebarData() {
	const collections = useCollections();
	const { toggleProjectCollapsed, projects: projectMetas } =
		useV2ProjectLocalMetaStore();

	const { data: projects = [] } = useLiveQuery(
		(q) => q.from({ v2Projects: collections.v2Projects }),
		[collections],
	);

	const { data: workspaces = [] } = useLiveQuery(
		(q) => q.from({ v2Workspaces: collections.v2Workspaces }),
		[collections],
	);

	const groups = useMemo<V2SidebarProject[]>(() => {
		const workspacesByProject = new Map<string, V2SidebarWorkspace[]>();

		for (const workspace of workspaces) {
			const projectWorkspaces =
				workspacesByProject.get(workspace.projectId) ?? [];
			projectWorkspaces.push({
				id: workspace.id,
				projectId: workspace.projectId,
				deviceId: workspace.deviceId ?? null,
				name: workspace.name,
				branch: workspace.branch,
				createdAt: workspace.createdAt,
				updatedAt: workspace.updatedAt,
			});
			workspacesByProject.set(workspace.projectId, projectWorkspaces);
		}

		return [...projects]
			.sort((a, b) => {
				const metaA = projectMetas[a.id] ?? DEFAULT_META;
				const metaB = projectMetas[b.id] ?? DEFAULT_META;
				const orderDiff = metaA.tabOrder - metaB.tabOrder;
				if (orderDiff !== 0) return orderDiff;
				return a.name.localeCompare(b.name);
			})
			.map((project) => {
				const meta = projectMetas[project.id] ?? DEFAULT_META;
				return {
					id: project.id,
					name: project.name,
					slug: project.slug,
					githubRepositoryId: project.githubRepositoryId ?? null,
					createdAt: project.createdAt,
					updatedAt: project.updatedAt,
					isCollapsed: meta.isCollapsed,
					workspaces: (workspacesByProject.get(project.id) ?? []).sort((a, b) =>
						a.name.localeCompare(b.name),
					),
				};
			});
	}, [projects, workspaces, projectMetas]);

	const totalWorkspaceCount = useMemo(
		() =>
			groups.reduce((count, project) => count + project.workspaces.length, 0),
		[groups],
	);

	const handleToggleProjectCollapsed = useCallback(
		(projectId: string) => {
			toggleProjectCollapsed(projectId);
		},
		[toggleProjectCollapsed],
	);

	return {
		groups,
		totalWorkspaceCount,
		isEmpty: totalWorkspaceCount === 0,
		toggleProjectCollapsed: handleToggleProjectCollapsed,
	};
}

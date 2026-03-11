import { normalizeWorkspaceFilePath } from "../../../../../../../../ChatPane/ChatInterface/utils/file-paths";
import { LinkedTaskChip } from "../../../../../../../../components/LinkedTaskChip";
import type { MastraMessage, MastraMessagePart } from "../../types";
import { parseUserMentions } from "../../utils/parseUserMentions";

interface UserMessageTextProps {
	message: MastraMessage;
	workspaceCwd?: string;
	onOpenMentionedFile: (filePath: string) => void;
}

export function UserMessageText({
	message,
	workspaceCwd,
	onOpenMentionedFile,
}: UserMessageTextProps) {
	return message.content.map((part: MastraMessagePart, partIndex: number) => {
		if (part.type !== "text") {
			return null;
		}

		const mentionSegments = parseUserMentions(part.text);
		const taskMentions = mentionSegments.filter(
			(s) => s.type === "task-mention",
		);
		const otherSegments = mentionSegments.filter(
			(s) => s.type !== "task-mention",
		);
		const hasNonTaskContent = otherSegments.some(
			(s) => (s.type === "text" && s.value.trim()) || s.type === "file-mention",
		);

		return (
			<div
				key={`${message.id}-${partIndex}`}
				className="flex max-w-[85%] flex-col items-end gap-2"
			>
				{taskMentions.length > 0 && (
					<div className="flex flex-wrap justify-end gap-2">
						{taskMentions.map((segment, segmentIndex) => (
							<LinkedTaskChip
								key={`${message.id}-${partIndex}-task-${segmentIndex}`}
								slug={segment.slug}
							/>
						))}
					</div>
				)}
				{hasNonTaskContent && (
					<div className="rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground whitespace-pre-wrap">
						{otherSegments.map((segment, segmentIndex) => {
							if (segment.type === "text") {
								return (
									<span
										key={`${message.id}-${partIndex}-${segmentIndex}`}
										className="whitespace-pre-wrap break-words"
									>
										{segment.value}
									</span>
								);
							}

							if (segment.type === "file-mention") {
								const normalizedPath = normalizeWorkspaceFilePath({
									filePath: segment.relativePath,
									workspaceRoot: workspaceCwd,
								});
								const canOpen = Boolean(normalizedPath);

								return (
									<button
										type="button"
										key={`${message.id}-${partIndex}-${segmentIndex}`}
										className="mx-0.5 inline-flex items-center gap-0.5 rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-xs text-primary transition-colors hover:bg-primary/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default disabled:opacity-60"
										onClick={() => {
											if (!normalizedPath) return;
											onOpenMentionedFile(normalizedPath);
										}}
										disabled={!canOpen}
										aria-label={`Open file ${segment.relativePath}`}
									>
										<span className="font-semibold text-primary">@</span>
										<span className="text-primary/95">
											{segment.relativePath}
										</span>
									</button>
								);
							}

							return null;
						})}
					</div>
				)}
			</div>
		);
	});
}

import { StorageThreadType } from "@mastra/core";

interface ThreadListItemProps {
  thread: StorageThreadType;
}

export const ThreadListItem: React.FC<ThreadListItemProps> = ({ thread }) => {
  return (
    <div>
      <h2>{thread.title}</h2>
    </div>
  );
};

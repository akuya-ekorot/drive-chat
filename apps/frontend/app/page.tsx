import { Thread } from "@/components/assistant-ui/thread";
import { AssistantProvider } from "@/components/custom/assistant-runtime-provider";

export default async function Home() {
  return (
    <AssistantProvider initialMessages={[]}>
      <div className="h-dvh w-full">
        <Thread />
      </div>
    </AssistantProvider>
  );
}

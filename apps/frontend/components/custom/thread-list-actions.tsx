"use client";

import { deleteThreadsAction } from "@/actions/deleteThreadAction";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "@tanstack/react-form";
import type { StorageThreadType } from "@mastra/core";
import { Button } from "../ui/button";
import { ListChecks, Plus, Trash, X } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";

interface ThreadListActionsProps {
  threads: StorageThreadType[];
}

export const ThreadListActions: React.FC<ThreadListActionsProps> = ({
  threads,
}) => {
  const { threadId } = useParams();
  const [open, setOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const action = useAction(deleteThreadsAction, {
    onSuccess: () => {
      setOpen(false);
      setSelectMode(false);
      setSelectAll(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      threads: [] as StorageThreadType[],
      hasActivePath: undefined as boolean | undefined,
    },
    onSubmit: ({ value }) => action.execute(value),
  });

  const toggleSelection = () => {
    setSelectMode((prev) => !prev);
    setSelectAll(false);
    form.reset();
  };

  const handleSelectAll = () => {
    setSelectAll(true);
    form.setFieldValue("threads", threads);
  };

  const handleSelectNone = () => {
    setSelectAll(false);
    form.setFieldValue("threads", []);
  };

  const handleSelectThread = (thread: StorageThreadType) => {
    form.pushFieldValue("threads", thread);
  };

  const handleDeselectThread = (thread: StorageThreadType) => {
    const index = form.state.values.threads.findIndex(
      (t) => t.id === thread.id,
    );

    if (index !== -1) {
      form.removeFieldValue("threads", index);
    }
  };

  const handleOnOpenChange = (open: boolean) => {
    setOpen(open);
    !open && form.reset();
  };

  return (
    <form>
      <form.Field name="threads" mode="array">
        {(field) => (
          <Dialog open={open} onOpenChange={handleOnOpenChange}>
            <DialogContent>
              <DialogTitle>
                Delete thread{form.state.values.threads.length > 1 ? "s" : ""}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                {form.state.values.threads.length > 1
                  ? "these threads"
                  : "this thread"}
                ?
              </DialogDescription>
              <div className="max-h-48 overflow-y-auto my-4 divide-y">
                {field.state.value.map((thread) => (
                  <div key={thread.id} className="py-1">
                    <p>{thread.title}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <DialogClose>Cancel</DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      field.state.value.some((thread) => thread.id === threadId)
                    ) {
                      form.setFieldValue("hasActivePath", true);
                    }
                    form.handleSubmit();
                  }}
                >
                  {action.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </DialogContent>
            <SidebarGroup>
              <SidebarGroupLabel>Chats</SidebarGroupLabel>
              <SidebarGroupAction
                title="Select chats"
                className="right-10 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                onClick={toggleSelection}
                type="button"
                disabled={threads.length === 0}
              >
                {selectMode ? <X /> : <ListChecks />}
                <span className="sr-only">
                  {selectMode ? "Exit selection" : "Select chats"}
                </span>
              </SidebarGroupAction>
              <SidebarGroupAction title="New chat" asChild>
                <Link href="/">
                  <Plus />
                  <span className="sr-only">Create new chat</span>
                </Link>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {selectMode && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <div className="flex items-center justify-between">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleSelectAll();
                                } else {
                                  handleSelectNone();
                                }
                              }}
                            />
                            <Button
                              className="size-6 p-1"
                              size="icon"
                              variant="destructive"
                              disabled={field.state.value.length === 0}
                              type="button"
                              onClick={() => setOpen(true)}
                            >
                              <Trash className="size-4" />
                              <span className="sr-only">Delete all</span>
                            </Button>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  {threads.map((thread) => (
                    <SidebarMenuItem key={thread.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={thread.id === threadId}
                      >
                        {selectMode ? (
                          <div>
                            <Checkbox
                              checked={form.state.values.threads.some(
                                (t) => t.id === thread.id,
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleSelectThread(thread);
                                } else {
                                  handleDeselectThread(thread);
                                }
                              }}
                            />
                            <span>{thread.title}</span>
                          </div>
                        ) : (
                          <Link href={`/chat/${thread.id}`}>
                            <span>{thread.title}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                      {!selectMode && (
                        <DialogTrigger asChild>
                          <SidebarMenuAction
                            className={cn(
                              "peer-data-[active=true]/menu-button:text-destructive-foreground",
                              "peer-hover/menu-button:text-destructive-foreground peer-hover/menu-button:bg-destructive/60",
                              "hover:text-destructive-foreground hover:bg-destructive",
                            )}
                            onClick={() => {
                              field.pushValue(thread);
                            }}
                            showOnHover
                          >
                            <Trash className="size-4" />
                            <span className="sr-only">Delete thread</span>
                          </SidebarMenuAction>
                        </DialogTrigger>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Dialog>
        )}
      </form.Field>
    </form>
  );
};

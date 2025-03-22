import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";
import { ThemeSwitcher } from "./theme-switcher";
import { UserButton } from "@/components/custom/user-button";
import { ThreadList } from "./thread-list";

export const AppSidebar: React.FC = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <ThreadList />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between px-2">
            <div className="shrink-0">
              <ThemeSwitcher />
            </div>
            <UserButton showName />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

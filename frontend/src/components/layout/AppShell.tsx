import { AppShell as MantineAppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const SIDEBAR_WIDTH_EXPANDED = 250;
const SIDEBAR_WIDTH_COLLAPSED = 72;

export function AppShell() {
  const [opened, { toggle }] = useDisclosure(true);

  return (
    <MantineAppShell
      layout="alt"
      navbar={{
        width: opened ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      header={{ height: 60 }}
      padding="lg"
      styles={{
        main: {
          background: "var(--bg-main)",
          minHeight: "100vh",
          transition: "padding-left 300ms ease",
        },
        header: {
          background: "var(--bg-main)",
          borderBottom: "1px solid var(--border-subtle)",
          transition: "left 300ms ease",
        },
        navbar: {
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border-subtle)",
          transition: "width 300ms ease",
          overflow: "hidden",
        },
      }}
    >
      <MantineAppShell.Navbar>
        <Sidebar collapsed={!opened} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Header>
        <TopBar opened={opened} toggle={toggle} />
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}

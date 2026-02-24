import { AppShell as MantineAppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineAppShell
      layout="alt"
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      header={{ height: 60 }}
      padding="lg"
      styles={{
        main: {
          background: "var(--bg-main)",
          minHeight: "100vh",
        },
        header: {
          background: "var(--bg-main)",
          borderBottom: "1px solid var(--border-subtle)",
        },
        navbar: {
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border-subtle)",
        },
      }}
    >
      <MantineAppShell.Navbar>
        <Sidebar />
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

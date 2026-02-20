import { AppShell as MantineAppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <MantineAppShell
      layout="alt"
      navbar={{ width: 250, breakpoint: "sm" }}
      header={{ height: 60 }}
      padding="lg"
      styles={{
        main: {
          background: "#0F172A",
          minHeight: "100vh",
        },
        header: {
          background: "#0F172A",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        },
        navbar: {
          background: "#020617",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        },
      }}
    >
      <MantineAppShell.Navbar>
        <Sidebar />
      </MantineAppShell.Navbar>

      <MantineAppShell.Header>
        <TopBar />
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}

import { AppShell as MantineAppShell } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const SIDEBAR_WIDTH_EXPANDED = 250;
const SIDEBAR_WIDTH_COLLAPSED = 72;

export function AppShell() {
  const isMobile = useMediaQuery("(max-width: 48em)");
  // Desktop: expanded by default; Mobile: collapsed (hidden) by default
  const [opened, { toggle, close }] = useDisclosure(!isMobile);

  return (
    <>
      {/* Mobile backdrop overlay — rendered OUTSIDE AppShell so it covers everything */}
      {isMobile && opened && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            zIndex: 199,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <MantineAppShell
        layout="alt"
        navbar={{
          width: opened ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        header={{ height: 60 }}
        padding={isMobile ? "sm" : "lg"}
        styles={{
          main: {
            background: "var(--bg-main)",
            minHeight: "100vh",
            transition: "padding-left 300ms ease",
            // Force padding-top so the header doesn't cover content on mobile
            paddingTop: isMobile
              ? "calc(60px + var(--mantine-spacing-md))"
              : "calc(60px + var(--mantine-spacing-lg))",
            paddingLeft: isMobile ? "var(--mantine-spacing-sm)" : undefined,
            paddingRight: isMobile ? "var(--mantine-spacing-sm)" : undefined,
            paddingBottom: isMobile ? "var(--mantine-spacing-sm)" : undefined,
          },
          header: {
            background: "var(--bg-main)",
            borderBottom: "1px solid var(--border-subtle)",
            transition: "left 300ms ease",
          },
          navbar: {
            background: "var(--sidebar-bg)",
            borderRight: "1px solid var(--border-subtle)",
            transition: "width 300ms ease, transform 300ms ease",
            overflow: "hidden",
            zIndex: 200, // Ensure it's above the backdrop and header when open on mobile
          },
        }}
      >
        <MantineAppShell.Navbar>
          <Sidebar
            collapsed={!opened}
            isMobile={isMobile ?? false}
            onNavigate={() => {
              if (isMobile) close();
            }}
          />
        </MantineAppShell.Navbar>

        <MantineAppShell.Header>
          <TopBar
            opened={opened}
            toggle={toggle}
            isMobile={isMobile ?? false}
          />
        </MantineAppShell.Header>

        <MantineAppShell.Main>
          <Outlet />
        </MantineAppShell.Main>
      </MantineAppShell>
    </>
  );
}

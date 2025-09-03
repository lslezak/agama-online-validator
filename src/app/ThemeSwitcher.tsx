import { Icon, MenuToggle, Select, SelectList, SelectOption } from "@patternfly/react-core";
import React, { useState } from "react";

// see https://mui.com/material-ui/material-icons
import LightMode from "@mui/icons-material/LightMode";
import DarkMode from "@mui/icons-material/DarkMode";
import SystemMode from "@mui/icons-material/Computer";

export default function ThemeSwitcher({ theme, themeChanged }): React.ReactNode {
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);

  const changeMode = (_event, newMode) => {
    theme.setMode(newMode);
    themeChanged(newMode === theme.modes.SYSTEM ? theme.resolvedTheme : newMode);
    setIsSelectionOpen(false);
  };

  const themeIcon = (currentMode, systemMode) => {
    const mode = currentMode === theme.modes.SYSTEM ? systemMode : currentMode;

    switch (mode) {
      case theme.modes.LIGHT:
        return LightMode;
      case theme.modes.DARK:
        return DarkMode;
      default:
        return LightMode;
    }
  };

  const CurrentThemeIcon = themeIcon(theme.mode, theme.resolvedTheme);

  return (
    <Select
      isOpen={isSelectionOpen}
      selected={theme.mode}
      onSelect={changeMode}
      onOpenChange={(isOpen) => setIsSelectionOpen(isOpen)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsSelectionOpen(!isSelectionOpen)}
          isExpanded={isSelectionOpen}
          icon={
            <Icon size="lg">
              <CurrentThemeIcon sx={{ fontSize: 16 }} />
            </Icon>
          }
        />
      )}
      popperProps={{ position: "end" }}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        <SelectOption value={theme.modes.SYSTEM} icon={<SystemMode />}>
          System default ({theme.resolvedTheme === theme.modes.DARK ? "dark" : "light"})
        </SelectOption>
        <SelectOption value={theme.modes.LIGHT} icon={<LightMode />}>
          Light
        </SelectOption>
        <SelectOption value={theme.modes.DARK} icon={<DarkMode />}>
          Dark
        </SelectOption>
      </SelectList>
    </Select>
  );
}

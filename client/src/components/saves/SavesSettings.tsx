import {
  Menu,
  MenuTrigger,
  MenuContent,
  Checkbox,
  Divider,
  Tooltip,
} from "@hope-ui/solid";
import { Component } from "solid-js";
import { useSiteSettingsContext } from "../../context/siteSettingsContext";
import { Settings } from "lucide-solid";

export default function SavesSettings() {
  const [siteSettings, mutSiteSettings] = useSiteSettingsContext();
  const promptDeleteConfirmation = () => siteSettings.prompt.delete;
  const togglePromptDeleteConfirmation = () => {
    mutSiteSettings.prompt.delete();
  };

  return (
    <div class="w-12 h-12 p-2 bg-white rounded-md">
      <Menu
        closeOnSelect={false}
        placement="bottom-end"
        motionPreset="scale-top-right"
      >
        <MenuTrigger class="focus:outline-none">
          <SettingsButton />
        </MenuTrigger>
        <MenuContent
          style={{ "padding-block": "0px", "min-width": "max-content" }}
        >
          <div class="flex flex-col p-2 gap-2">
            <h4 class="text-sm font-medium opacity-75 uppercase">
              Saves Settings
            </h4>
            <Divider />
            <div class="px-1 flex flex-col gap-1">
              <h5 class="text-xs font-medium opacity-75 uppercase">Prompts</h5>
              <Tooltip label="Enable/disable delete confirmation popup (Auto accepts)">
                <Checkbox
                  defaultChecked={promptDeleteConfirmation()}
                  onChange={togglePromptDeleteConfirmation}
                >
                  Delete confirmation
                </Checkbox>
              </Tooltip>
            </div>
          </div>
        </MenuContent>
      </Menu>
    </div>
  );
}

const SettingsButton: Component = () => {
  return (
    <>
      <button class="primary-button focus:outline-none">
        <Settings size={32} class="p-1" />
      </button>
    </>
  );
};

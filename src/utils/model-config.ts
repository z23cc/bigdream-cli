import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ModelOption {
  model: string;
}

export type ModelConfig = string;

// User settings interface - for global defaults and configuration
export interface UserSettings {
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;  // User's preferred default model
  models?: string[];      // Available models list
}

// Project settings interface - for current project state
export interface ProjectSettings {
  model?: string;         // Current model for this project
  mcpServers?: Record<string, any>;
}

// Default hardcoded model list (for backward compatibility)
const DEFAULT_MODELS: string[] = [
  "grok-4-latest",
  "grok-3-latest", 
  "grok-3-fast",
  "grok-3-mini-fast"
];

/**
 * Load user settings from user-settings.json
 */
function loadUserSettings(): UserSettings {
  try {
    const homeDir = os.homedir();
    const settingsPath = path.join(homeDir, '.grok', 'user-settings.json');

    if (!fs.existsSync(settingsPath)) {
      return {};
    }

    const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(settingsContent);
  } catch (error) {
    console.warn('Failed to load user settings:', error instanceof Error ? error.message : 'Unknown error');
    return {};
  }
}

/**
 * Load project settings from project-level settings.json
 */
function loadProjectSettings(): ProjectSettings {
  try {
    const projectSettingsPath = path.join(process.cwd(), '.grok', 'settings.json');

    if (!fs.existsSync(projectSettingsPath)) {
      return {};
    }

    const settingsContent = fs.readFileSync(projectSettingsPath, 'utf-8');
    return JSON.parse(settingsContent);
  } catch (error) {
    console.warn('Failed to load project settings:', error instanceof Error ? error.message : 'Unknown error');
    return {};
  }
}

/**
 * Get the effective current model
 * Priority: project current model > user default model > system default
 */
export function getCurrentModel(): string {
  // 1. Check project current model
  const projectSettings = loadProjectSettings();
  if (projectSettings.model) {
    return projectSettings.model;
  }

  // 2. Check user default model
  const userSettings = loadUserSettings();
  if (userSettings.defaultModel) {
    return userSettings.defaultModel;
  }

  // 3. Fallback to system default
  return DEFAULT_MODELS[0];
}

/**
 * Save user settings to user-settings.json
 */
function saveUserSettings(settings: UserSettings): void {
  try {
    const homeDir = os.homedir();
    const grokDir = path.join(homeDir, '.grok');
    const settingsPath = path.join(grokDir, 'user-settings.json');

    // Create directory if it doesn't exist
    if (!fs.existsSync(grokDir)) {
      fs.mkdirSync(grokDir, { recursive: true });
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Failed to save user settings:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Load model configuration
 * Priority: user-settings.json models > default hardcoded
 */
export function loadModelConfig(): ModelOption[] {
  try {
    const userSettings = loadUserSettings();

    if (userSettings.models && Array.isArray(userSettings.models) && userSettings.models.length > 0) {
      const validModels = userSettings.models.filter(model =>
        typeof model === 'string' && model.trim().length > 0
      );

      if (validModels.length > 0) {
        return validModels.map(model => ({
          model: model.trim()
        }));
      }
    }

    // Fallback to default models
    return DEFAULT_MODELS.map(model => ({
      model
    }));
  } catch (error) {
    console.warn('Failed to load model config, using default models:', error instanceof Error ? error.message : 'Unknown error');
    return DEFAULT_MODELS.map(model => ({
      model
    }));
  }
}

/**
 * Get default models list
 */
export function getDefaultModels(): string[] {
  return [...DEFAULT_MODELS];
}

/**
 * Update the current model in project settings
 */
export function updateCurrentModel(modelName: string): void {
  try {
    const projectSettings = loadProjectSettings();
    const updatedSettings: ProjectSettings = {
      ...projectSettings,
      model: modelName
    };

    saveProjectSettings(updatedSettings);
  } catch (error) {
    console.warn('Failed to update current model:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Update the user's default model preference
 */
export function updateDefaultModel(modelName: string): void {
  try {
    const userSettings = loadUserSettings();
    const updatedSettings: UserSettings = {
      ...userSettings,
      defaultModel: modelName
    };

    saveUserSettings(updatedSettings);
  } catch (error) {
    console.warn('Failed to update default model:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Save project settings to project-level settings.json
 */
function saveProjectSettings(settings: ProjectSettings): void {
  try {
    const projectDir = path.join(process.cwd(), '.grok');
    const settingsPath = path.join(projectDir, 'settings.json');

    // Create directory if it doesn't exist
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Failed to save project settings:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

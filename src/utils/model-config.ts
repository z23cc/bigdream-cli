import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ModelOption {
  model: string;
  description: string;
}

// Simplified config format: just model names array
export interface ModelConfig {
  models: string[];
  defaultModel?: string;
}

// Default hardcoded model list (for backward compatibility)
const DEFAULT_MODELS: string[] = [
  "grok-4-latest",
  "grok-3-latest", 
  "grok-3-fast",
  "grok-3-mini-fast"
];

// Generate model description (simple rules)
function generateDescription(modelId: string): string {
  const descriptions: Record<string, string> = {
    "grok-4-latest": "Latest grok-4 model (most capable)",
    "grok-3-latest": "Latest grok-3 model", 
    "grok-3-fast": "Fast grok-3 variant",
    "grok-3-mini-fast": "Fastest grok-3 variant",
  };
  
  return descriptions[modelId] || `${modelId} model`;
}

/**
 * Load model configuration
 * Priority: user config file > default hardcoded
 */
export function loadModelConfig(): ModelOption[] {
  try {
    const homeDir = os.homedir();
    const configPath = path.join(homeDir, '.bigdream', 'models.json');
    
    if (!fs.existsSync(configPath)) {
      // Config file doesn't exist, use default config
      return DEFAULT_MODELS.map(model => ({
        model,
        description: generateDescription(model)
      }));
    }
    
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config: ModelConfig = JSON.parse(configContent);
    
    // Validate config format
    if (!config.models || !Array.isArray(config.models)) {
      console.warn('Invalid models.json format, using default models');
      return DEFAULT_MODELS.map(model => ({
        model,
        description: generateDescription(model)
      }));
    }
    
    // Filter out empty strings
    const validModels = config.models.filter(model => 
      typeof model === 'string' && model.trim().length > 0
    );
    
    if (validModels.length === 0) {
      console.warn('No valid models found in config, using default models');
      return DEFAULT_MODELS.map(model => ({
        model,
        description: generateDescription(model)
      }));
    }
    
    return validModels.map(model => ({
      model: model.trim(),
      description: generateDescription(model.trim())
    }));
  } catch (error) {
    console.warn('Failed to load model config, using default models:', error instanceof Error ? error.message : 'Unknown error');
    return DEFAULT_MODELS.map(model => ({
      model,
      description: generateDescription(model)
    }));
  }
}

/**
 * Get default model config (for generating config file template)
 */
export function getDefaultModelConfig(): ModelConfig {
  return {
    models: DEFAULT_MODELS,
    defaultModel: "grok-4-latest"
  };
}

/**
 * Generate config file template
 */
export function createConfigTemplate(): string {
  const config = getDefaultModelConfig();
  const template = {
    ...config,
    _comment: "Add your custom models here. Just list the model names as strings."
  };
  
  return JSON.stringify(template, null, 2);
}

/**
 * Initialize user config directory and template file
 */
export function initUserConfig(): boolean {
  try {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.bigdream');
    const configPath = path.join(configDir, 'models.json');
    
    // Create config directory
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // If config file doesn't exist, create template
    if (!fs.existsSync(configPath)) {
      const template = createConfigTemplate();
      fs.writeFileSync(configPath, template, 'utf-8');
      console.log(`Created model configuration template at: ${configPath}`);
      return true;
    } else {
      console.log(`Model configuration already exists at: ${configPath}`);
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize user config:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
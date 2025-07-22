#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import { program } from "commander";
import * as dotenv from "dotenv";
import { BigDreamAgent } from "./agent/bigdream-agent";
import ChatInterface from "./ui/components/chat-interface";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Load environment variables
dotenv.config();

// Load API key from user settings if not in environment
function loadApiKey(): string | undefined {
  // First check environment variables
  let apiKey = process.env.GROK_API_KEY;
  
  if (!apiKey) {
    // Try to load from user settings file
    try {
      const homeDir = os.homedir();
      const settingsFile = path.join(homeDir, '.bigdream', 'user-settings.json');
      
      if (fs.existsSync(settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        apiKey = settings.apiKey;
      }
    } catch (error) {
      // Ignore errors, apiKey will remain undefined
    }
  }
  
  return apiKey;
}

// Load base URL from user settings if not in environment
function loadBaseURL(): string | undefined {
  // First check environment variables
  let baseURL = process.env.GROK_BASE_URL;
  
  if (!baseURL) {
    // Try to load from user settings file
    try {
      const homeDir = os.homedir();
      const settingsFile = path.join(homeDir, '.bigdream', 'user-settings.json');
      
      if (fs.existsSync(settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        baseURL = settings.baseURL;
      }
    } catch (error) {
      // Ignore errors, baseURL will remain undefined
    }
  }
  
  return baseURL;
}

// Save user settings to file
function saveUserSettings(apiKey?: string, baseURL?: string): void {
  try {
    const homeDir = os.homedir();
    const settingsDir = path.join(homeDir, '.bigdream');
    const settingsFile = path.join(settingsDir, 'user-settings.json');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }
    
    // Load existing settings
    let settings: any = {};
    if (fs.existsSync(settingsFile)) {
      try {
        settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      } catch (error) {
        // If file is corrupted, start with empty settings
        settings = {};
      }
    }
    
    // Update settings
    if (apiKey) settings.apiKey = apiKey;
    if (baseURL) settings.baseURL = baseURL;
    
    // Save updated settings
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.warn('Failed to save user settings:', error instanceof Error ? error.message : 'Unknown error');
  }
}

program
  .name("bigdream")
  .description(
    "A conversational AI CLI tool powered by BigDream-3 with text editor capabilities"
  )
  .version("1.0.0")
  .option("-d, --directory <dir>", "set working directory", process.cwd())
  .option("-k, --api-key <key>", "BigDream API key (or set GROK_API_KEY env var)")
  .option("-u, --base-url <url>", "BigDream API base URL (or set GROK_BASE_URL env var)")
  .option("-m, --model <model>", "AI model to use (e.g., claude-sonnet-4-20250514)")
  .action((options) => {
    if (options.directory) {
      try {
        process.chdir(options.directory);
      } catch (error: any) {
        console.error(
          `Error changing directory to ${options.directory}:`,
          error.message
        );
        process.exit(1);
      }
    }

    try {
      // Get API key from options, environment, or user settings
      const apiKey = options.apiKey || loadApiKey();
      const baseURL = options.baseUrl || loadBaseURL();
      const model = options.model;
      
      // Auto-save CLI-provided settings to user config
      if (options.apiKey || options.baseUrl) {
        // Only save the values that were provided via CLI
        const saveApiKey = options.apiKey && !process.env.GROK_API_KEY ? options.apiKey : undefined;
        const saveBaseURL = options.baseUrl && !process.env.GROK_BASE_URL ? options.baseUrl : undefined;
        
        if (saveApiKey || saveBaseURL) {
          saveUserSettings(saveApiKey, saveBaseURL);
          if (saveApiKey) console.log("✓ API key saved to ~/.bigdream/user-settings.json");
          if (saveBaseURL) console.log("✓ Base URL saved to ~/.bigdream/user-settings.json");
        }
      }
      
      const agent = apiKey ? new BigDreamAgent(apiKey, baseURL, model) : undefined;

      console.log("🤖 Starting BigDream CLI Conversational Assistant...\n");

      render(React.createElement(ChatInterface, { agent }));
    } catch (error: any) {
      console.error("❌ Error initializing BigDream CLI:", error.message);
      process.exit(1);
    }
  });

program.parse();

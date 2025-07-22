import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "ink";
import { BigDreamAgent, ChatEntry } from "../../agent/bigdream-agent";
import { useInputHandler } from "../../hooks/use-input-handler";
import { LoadingSpinner } from "./loading-spinner";
import { CommandSuggestions } from "./command-suggestions";
import { ModelSelection } from "./model-selection";
import { ChatHistory } from "./chat-history";
import { ChatInput } from "./chat-input";
import ConfirmationDialog from "./confirmation-dialog";
import { ConfirmationService, ConfirmationOptions } from "../../utils/confirmation-service";
import cfonts from "cfonts";

interface ChatInterfaceProps {
  agent?: BigDreamAgent;
}

// Main chat component that handles input when agent is available
function ChatInterfaceWithAgent({ agent }: { agent: BigDreamAgent }) {
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [confirmationOptions, setConfirmationOptions] = useState<ConfirmationOptions | null>(null);
  const scrollRef = useRef<any>();
  const processingStartTime = useRef<number>(0);
  
  const confirmationService = ConfirmationService.getInstance();

  const {
    input,
    showCommandSuggestions,
    selectedCommandIndex,
    showModelSelection,
    selectedModelIndex,
    commandSuggestions,
    availableModels,
  } = useInputHandler({
    agent,
    chatHistory,
    setChatHistory,
    setIsProcessing,
    setIsStreaming,
    setTokenCount,
    setProcessingTime,
    processingStartTime,
    isProcessing,
    isStreaming,
    isConfirmationActive: !!confirmationOptions,
  });

  useEffect(() => {
    console.clear();
    cfonts.say("Big Dream", {
      font: "block",
      align: "left",
      colors: ["magenta", "gray"],
      space: false,
      maxLength: "0",
      gradient: ["magenta", "cyan"],
      independentGradient: false,
      transitionGradient: true,
      env: "node",
    });

    console.log("Tips for getting started:");
    console.log("1. Ask questions, edit files, or run commands.");
    console.log("2. Be specific for the best results.");
    console.log(
      "3. Create BigDream.md files to customize your interactions with BigDream."
    );
    console.log("4. /help for more information.");
    console.log("");

    setChatHistory([]);
  }, []);

  useEffect(() => {
    const handleConfirmationRequest = (options: ConfirmationOptions) => {
      setConfirmationOptions(options);
    };

    confirmationService.on('confirmation-requested', handleConfirmationRequest);

    return () => {
      confirmationService.off('confirmation-requested', handleConfirmationRequest);
    };
  }, [confirmationService]);

  useEffect(() => {
    if (!isProcessing && !isStreaming) {
      setProcessingTime(0);
      return;
    }

    if (processingStartTime.current === 0) {
      processingStartTime.current = Date.now();
    }

    const interval = setInterval(() => {
      setProcessingTime(
        Math.floor((Date.now() - processingStartTime.current) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, isStreaming]);

  const handleConfirmation = (dontAskAgain?: boolean) => {
    confirmationService.confirmOperation(true, dontAskAgain);
    setConfirmationOptions(null);
  };

  const handleRejection = (feedback?: string) => {
    confirmationService.rejectOperation(feedback);
    setConfirmationOptions(null);
    
    // Reset processing states when operation is cancelled
    setIsProcessing(false);
    setIsStreaming(false);
    setTokenCount(0);
    setProcessingTime(0);
    processingStartTime.current = 0;
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text dimColor>
          Type your request in natural language. Type 'exit' or Ctrl+C to quit.
        </Text>
      </Box>

      <Box flexDirection="column" ref={scrollRef}>
        <ChatHistory entries={chatHistory} />
      </Box>

      {/* Show confirmation dialog if one is pending */}
      {confirmationOptions && (
        <ConfirmationDialog
          operation={confirmationOptions.operation}
          filename={confirmationOptions.filename}
          showVSCodeOpen={confirmationOptions.showVSCodeOpen}
          content={confirmationOptions.content}
          onConfirm={handleConfirmation}
          onReject={handleRejection}
        />
      )}


      {!confirmationOptions && (
        <>
          <LoadingSpinner
            isActive={isProcessing || isStreaming}
            processingTime={processingTime}
            tokenCount={tokenCount}
          />

          <ChatInput
            input={input}
            isProcessing={isProcessing}
            isStreaming={isStreaming}
          />

          <CommandSuggestions
            suggestions={commandSuggestions}
            input={input}
            selectedIndex={selectedCommandIndex}
            isVisible={showCommandSuggestions}
          />

          <ModelSelection
            models={availableModels}
            selectedIndex={selectedModelIndex}
            isVisible={showModelSelection}
            currentModel={agent.getCurrentModel()}
          />
        </>
      )}
    </Box>
  );
}

// Main component that handles missing agent gracefully
export default function ChatInterface({ agent }: ChatInterfaceProps) {
  if (!agent) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">❌ No API key provided</Text>
        <Text>Please provide an API key using one of these methods:</Text>
        <Text>• Environment variable: export GROK_API_KEY=your_key</Text>
        <Text>• Command line: --api-key your_key</Text>
        <Text>• User settings: ~/.bigdream/user-settings.json</Text>
        <Text dimColor>Press Ctrl+C to exit</Text>
      </Box>
    );
  }

  return <ChatInterfaceWithAgent agent={agent} />;
}

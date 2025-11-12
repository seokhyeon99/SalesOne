"use client";

import dynamic from "next/dynamic";
import { forwardRef, useRef, useImperativeHandle, useState } from "react";
import type { EditorRef as UnlayerEditorRef, EmailEditorProps as UnlayerEmailEditorProps, UnlayerOptions } from 'react-email-editor';

// Import the Unlayer editor dynamically to avoid SSR issues
const UnlayerEmailEditor = dynamic(
  () => import("react-email-editor").then((mod) => mod.default),
  { ssr: false }
);

// Define the shape of the forwarded ref with explicit methods
export interface EditorRef {
  loadTemplate: (templateId: number) => void;
  loadDesign: (design: object) => void;
  exportHtml: (callback: (data: { design: object; html: string }) => void) => void;
  isReady: boolean; // Add a flag to check if editor is ready
}

export interface EmailEditorProps extends Omit<UnlayerEmailEditorProps, 'ref' | 'options' | 'projectId'> {
  options?: Partial<UnlayerOptions>;
  projectId?: number;
  onReady?: () => void;
}

export const EmailEditor = forwardRef<EditorRef, EmailEditorProps>(
  ({ style, options: userOptions, projectId, onReady: userOnReady, ...props }, ref) => {
    const editorRefInternal = useRef<UnlayerEditorRef>(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    // Add a ref to store the global unlayer instance
    const globalUnlayerRef = useRef<any>(null);
    
    // Track pending operations if called before editor is ready
    const pendingOperations = useRef<{
      loadTemplate?: number;
      loadDesign?: object;
    }>({});

    // Handle the editor ready event
    const handleReady = () => {
      console.log("Unlayer Editor is ready!");
      
      // Store the global unlayer reference if available
      if (typeof window !== 'undefined' && (window as any).unlayer) {
        globalUnlayerRef.current = (window as any).unlayer;
        console.log("Captured global unlayer reference");
      }
      
      // Debug the editor structure to understand the API better
      const editor = editorRefInternal.current as any;
      console.log("Editor structure:", {
        hasEditor: !!editor,
        editorProperties: editor ? Object.keys(editor) : [],
        hasNestedEditor: editor && !!editor.editor,
        nestedProperties: editor && editor.editor ? Object.keys(editor.editor) : [],
        hasGlobalUnlayer: typeof window !== 'undefined' && !!(window as any).unlayer,
        globalUnlayerProps: typeof window !== 'undefined' && (window as any).unlayer ? Object.keys((window as any).unlayer) : []
      });
      
      setIsEditorReady(true);
      
      // Process any pending operations
      processPendingOperations();
      
      // Call the user's onReady callback if provided
      if (userOnReady) {
        userOnReady();
      }
    };
    
    // Process pending operations after editor is ready
    const processPendingOperations = () => {
      const pending = pendingOperations.current;
      
      // If there's a pending loadTemplate operation
      if (pending.loadTemplate !== undefined) {
        console.log(`Processing pending loadTemplate for ID: ${pending.loadTemplate}`);
        processLoadTemplate(pending.loadTemplate);
        pending.loadTemplate = undefined;
      }
      
      // If there's a pending loadDesign operation
      if (pending.loadDesign) {
        console.log("Processing pending loadDesign operation");
        processLoadDesign(pending.loadDesign);
        pending.loadDesign = undefined;
      }
    };
    
    // Method to get the best unlayer instance
    const getUnlayer = () => {
      // First try the global window.unlayer (most reliable)
      if (typeof window !== 'undefined' && (window as any).unlayer) {
        return (window as any).unlayer;
      }
      
      // Then try the stored global reference
      if (globalUnlayerRef.current) {
        return globalUnlayerRef.current;
      }
      
      // Then try unlayer through the editor ref
      const editor = editorRefInternal.current as any;
      if (editor && editor.editor) {
        return editor.editor;
      }
      
      // Finally just return the editor ref itself
      return editor;
    };
    
    // Helper function to access loadTemplate through all possible paths
    const processLoadTemplate = (templateId: number) => {
      console.log(`Processing loadTemplate for ID: ${templateId}`);
      
      const unlayer = getUnlayer();
      if (unlayer && typeof unlayer.loadTemplate === 'function') {
        console.log("Using unlayer.loadTemplate");
        try {
          unlayer.loadTemplate(templateId);
          return true;
        } catch (error) {
          console.error("Error calling unlayer.loadTemplate:", error);
        }
      }
      
      // Fallback to global window.unlayer
      if (typeof window !== 'undefined' && (window as any).unlayer && 
          typeof (window as any).unlayer.loadTemplate === 'function') {
        console.log("Using window.unlayer.loadTemplate as fallback");
        try {
          (window as any).unlayer.loadTemplate(templateId);
          return true;
        } catch (error) {
          console.error("Error calling window.unlayer.loadTemplate:", error);
        }
      }
      
      console.error("Failed to find a working loadTemplate method");
      return false;
    };
    
    // Helper function to access loadDesign through all possible paths
    const processLoadDesign = (design: object) => {
      console.log("Processing loadDesign");
      
      const unlayer = getUnlayer();
      if (unlayer && typeof unlayer.loadDesign === 'function') {
        console.log("Using unlayer.loadDesign");
        try {
          unlayer.loadDesign(design);
          return true;
        } catch (error) {
          console.error("Error calling unlayer.loadDesign:", error);
        }
      }
      
      // Fallback to global window.unlayer
      if (typeof window !== 'undefined' && (window as any).unlayer && 
          typeof (window as any).unlayer.loadDesign === 'function') {
        console.log("Using window.unlayer.loadDesign as fallback");
        try {
          (window as any).unlayer.loadDesign(design);
          return true;
        } catch (error) {
          console.error("Error calling window.unlayer.loadDesign:", error);
        }
      }
      
      console.error("Failed to find a working loadDesign method");
      return false;
    };
    
    // Helper function for exportHtml
    const processExportHtml = (callback: (data: { design: object; html: string }) => void) => {
      console.log("Processing exportHtml");
      
      const unlayer = getUnlayer();
      if (unlayer && typeof unlayer.exportHtml === 'function') {
        console.log("Using unlayer.exportHtml");
        try {
          unlayer.exportHtml(callback);
          return true;
        } catch (error) {
          console.error("Error calling unlayer.exportHtml:", error);
        }
      }
      
      // Fallback to global window.unlayer
      if (typeof window !== 'undefined' && (window as any).unlayer && 
          typeof (window as any).unlayer.exportHtml === 'function') {
        console.log("Using window.unlayer.exportHtml as fallback");
        try {
          (window as any).unlayer.exportHtml(callback);
          return true;
        } catch (error) {
          console.error("Error calling window.unlayer.exportHtml:", error);
        }
      }
      
      console.error("Failed to find a working exportHtml method");
      callback({ design: {}, html: '' });
      return false;
    };

    useImperativeHandle(
      ref,
      () => {
        return {
          loadTemplate: (templateId: number) => {
            console.log(`Attempting to load template ID: ${templateId}`);
            if (isEditorReady) {
              console.log("Editor is ready, loading template directly");
              try {
                processLoadTemplate(templateId);
              } catch (error) {
                console.error("Failed to load template:", error);
              }
            } else {
              console.log("Editor not ready, queuing loadTemplate operation");
              // Queue the operation for when the editor is ready
              pendingOperations.current.loadTemplate = templateId;
            }
          },
          loadDesign: (design: object) => {
            if (isEditorReady) {
              try {
                processLoadDesign(design);
              } catch (error) {
                console.error("Failed to load design:", error);
              }
            } else {
              // Queue the operation for when the editor is ready
              pendingOperations.current.loadDesign = design;
            }
          },
          exportHtml: (callback: (data: { design: object; html: string }) => void) => {
            processExportHtml(callback);
          },
          isReady: isEditorReady
        };
      },
      [isEditorReady]
    );

    // Combine default and user options, add projectId
    const editorOptions: UnlayerOptions = {
      // --- Default Options ---
      locale: "ko-KR",
      features: {
        textEditor: { spellChecker: false },
      },
      appearance: {
        theme: "light",
        panels: { tools: { dock: "left" } },
      },
      tools: {},
      mergeTags: {
        company: {
          name: "회사명",
          value: "대표자명",
        },
        sender: {
          name: "보내는 사람 이름",
          value: "보내는 사람 이메일",
        },
      },
      // --- Merge User Options ---
      ...userOptions,
      // --- Add Project ID if provided ---
      ...(projectId && { projectId: projectId }),
    };

    return (
      <div className="flex-1 relative">
        <UnlayerEmailEditor
          ref={editorRefInternal}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            ...style
          }}
          options={editorOptions}
          onReady={handleReady}
          {...props}
        />
      </div>
    );
  }
);

EmailEditor.displayName = "EmailEditor"; 
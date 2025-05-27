"use client";

import {useState, useEffect, useRef} from "react";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  LinkIcon,
  ChevronDown,
} from "lucide-react";
import {apiUrl_AI, fontFamilies, fontSizes} from "@/utils/constant";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  isContentEmpty?: boolean;
  onUploadClick?: () => void;
  isExtracting:boolean;
  setIsExtracting:(isload:boolean)=>void
}

// Add supported file types interface
interface SupportedFileTypes {
  supported_extensions: string[];
  unavailable_formats: string[];
  note: string;
  isExtracting:boolean;
  setIsExtracting:(isload:boolean)=>void
}

const TipTapEditor = ({
  content,
  onChange,
  placeholder = "Enter Information or Upload the document...",
  isContentEmpty = true,
  onUploadClick,
  isExtracting,
  setIsExtracting
}: TipTapEditorProps) => {
  // Refs for dropdowns
  const paragraphDropdownRef = useRef<HTMLDivElement>(null);
  const fontSizeDropdownRef = useRef<HTMLDivElement>(null);
  const fontFamilyDropdownRef = useRef<HTMLDivElement>(null);

  // State for dropdown visibility
  const [showParagraphDropdown, setShowParagraphDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const [supportedFileTypes, setSupportedFileTypes] =
    useState<SupportedFileTypes | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  // const [isExtracting, setIsExtracting] = useState(false);

  // State for selected values
  const [selectedParagraph, setSelectedParagraph] = useState("Paragraph");
  const [selectedFontSize, setSelectedFontSize] = useState("12");
  const [selectedFontFamily, setSelectedFontFamily] = useState("Default");

  // Custom extension for font size
  const FontSize = TextStyle.configure().extend({
    addAttributes() {
      return {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize,
          renderHTML: (attributes) => {
            if (!attributes.fontSize) {
              return {};
            }
            return {
              style: `font-size: ${attributes.fontSize}`,
            };
          },
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#F9DB6F] hover:text-[#F9DB6F]/80",
        },
      }),
    ],
    content: content || "",
    onUpdate: ({editor}) => {
      const html = editor.getHTML();
      // Sanitize the content before sending it
      const sanitizedHtml = html.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      onChange(sanitizedHtml);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert focus:outline-none min-h-[200px] h-full w-full",
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData("text/plain") || "";
        const sanitizedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        event.preventDefault();
        view.dispatch(view.state.tr.insertText(sanitizedText));
        return true;
      },
    },
  });

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        paragraphDropdownRef.current &&
        !paragraphDropdownRef.current.contains(event.target as Node)
      ) {
        setShowParagraphDropdown(false);
      }
      if (
        fontSizeDropdownRef.current &&
        !fontSizeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFontSizeDropdown(false);
      }
      if (
        fontFamilyDropdownRef.current &&
        !fontFamilyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFontFamilyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const sanitizedContent = content.replace(
        /[\u0000-\u001F\u007F-\u009F]/g,
        ""
      );
      editor.commands.setContent(sanitizedContent);
    }
  }, [content, editor]);

  const fetchSupportedFileType = async () => {
    try {
      const response = await fetch(
        `${apiUrl_AI}/data-extraction/supported-formats`,
        {
          method: "GET",
          headers: {"Content-Type": "application/json"},
        }
      );

      if (!response.ok) throw new Error("Failed to fetch supported file types");

      const data = await response.json();
      setSupportedFileTypes(data);
    } catch (error) {
      console.error("Error fetching supported file types:", error);
      setUploadError("Failed to fetch supported file types");
    }
  };

  // Function to validate file type
  const validateFileType = (file: File): boolean => {
    if (!supportedFileTypes) return false;

    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    // Check if file extension is in supported extensions
    if (supportedFileTypes.supported_extensions.includes(fileExtension)) {
      return true;
    }

    // Check if file extension is in unavailable formats
    if (
      supportedFileTypes.unavailable_formats.some((format) =>
        format.includes(fileExtension)
      )
    ) {
      setUploadError(
        `File type ${fileExtension} is not supported. Please convert to a supported format.`
      );
      return false;
    }

    setUploadError(`File type ${fileExtension} is not supported.`);
    return false;
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    if (!validateFileType(file)) {
      return;
    }

    try {
      setIsExtracting(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `${apiUrl_AI}/data-extraction/extract-text`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        setUploadError("Failed to extract text from file.");
        return;
      }

      const data = await response.json();
      const extractedText = data.text || data.extracted_text || "";

      if (extractedText) {
        // Sanitize the extracted text before setting it
        const sanitizedText = extractedText.replace(
          /[\u0000-\u001F\u007F-\u009F]/g,
          ""
        );
        onChange(sanitizedText);
      } else {
        setUploadError("No text could be extracted from the file.");
      }
    } catch (error) {
      setUploadError("An error occurred while extracting text from the file.");
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    fetchSupportedFileType();
  }, []);

  if (!editor) {
    return null;
  }

  // Apply paragraph style
  const applyParagraphStyle = (style: string) => {
    if (!editor) return;

    if (style === "Paragraph") {
      editor.chain().focus().setParagraph().run();
      setSelectedParagraph("Paragraph");
    } else if (style.startsWith("Heading")) {
      const level = Number.parseInt(style.split(" ")[1]) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
      editor.chain().focus().toggleHeading({level}).run();
      setSelectedParagraph(style);
    }
    setShowParagraphDropdown(false);
  };

  // Apply font size
  const applyFontSize = (size: string) => {
    if (!editor) return;

    // Select all text if nothing is selected
    if (editor.state.selection.empty) {
      editor.chain().focus().selectAll().run();
    }

    editor
      .chain()
      .focus()
      .setMark("textStyle", {fontSize: `${size}px`})
      .run();
    setSelectedFontSize(size);
    setShowFontSizeDropdown(false);
  };

  // Apply font family
  const applyFontFamily = (font: string) => {
    if (!editor) return;

    // Select all text if nothing is selected
    if (editor.state.selection.empty) {
      editor.chain().focus().selectAll().run();
    }

    if (font === "Default") {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(font).run();
    }
    setSelectedFontFamily(font);
    setShowFontFamilyDropdown(false);
  };

  // Apply text alignment
  const applyTextAlign = (align: "left" | "center" | "right" | "justify") => {
    if (!editor) return;
    editor.chain().focus().setTextAlign(align).run();
  };

  // Handle link insertion
  const insertLink = () => {
    if (!editor) return;

    const url = window.prompt("Enter link URL");
    if (url) {
      // If no text is selected, use the URL as the link text
      if (editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${url}</a>`)
          .run();
      } else {
        // If text is selected, turn it into a link
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({href: url})
          .run();
      }
    }
  };

  return (
    <div className="tiptap-editor w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="toolbar flex items-center gap-2 p-4 flex-shrink-0 sticky top-0 z-10 bg-[#191919]">
        {/* Paragraph Style Dropdown */}
        <div
          ref={paragraphDropdownRef}
          className="relative cursor-pointer !h-[44px]"
          style={{borderRadius: "6px"}}
        >
          <button
            onClick={() => setShowParagraphDropdown(!showParagraphDropdown)}
            className="flex items-center justify-between w-[252px] bg-[#2C2D2E] text-white px-3 py-2 !h-[44px] rounded cursor-pointer"
          >
            <span className="text-sm">{selectedParagraph}</span>
            <ChevronDown size={14} />
          </button>
          {showParagraphDropdown && (
            <div className="absolute z-10 mt-1 w-[252px] bg-[#2C2D2E] rounded shadow-lg">
              <button
                onClick={() => applyParagraphStyle("Paragraph")}
                className="block w-full text-left px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] text-sm cursor-pointer"
              >
                Paragraph
              </button>
              <button
                onClick={() => applyParagraphStyle("Heading 1")}
                className="block w-full text-left px-3 py-2 text-white hover:bg-[#333] text-sm cursor-pointer hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] "
              >
                Heading 1
              </button>
              <button
                onClick={() => applyParagraphStyle("Heading 2")}
                className="block w-full text-left px-3 py-2 text-white hover:bg-[#333] text-sm cursor-pointer hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] "
              >
                Heading 2
              </button>
              <button
                onClick={() => applyParagraphStyle("Heading 3")}
                className="block w-full text-left px-3 py-2 text-white hover:bg-[#333] text-sm cursor-pointer hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] "
              >
                Heading 3
              </button>
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div ref={fontSizeDropdownRef} className="relative">
          <button
            onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
            className="flex items-center justify-between w-[120px] bg-[#2C2D2E] h-[44px] text-white px-3 py-2 rounded cursor-pointer"
            style={{borderRadius: "6px"}}
          >
            <span className="text-sm">{selectedFontSize}</span>
            <ChevronDown size={14} />
          </button>
          {showFontSizeDropdown && (
            <div
              className="absolute z-10 mt-1 w-[120px] max-h-[200px] overflow-y-auto bg-[#2C2D2E]  rounded shadow-lg cursor-pointer"
              style={{borderRadius: "6px"}}
            >
              {fontSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => applyFontSize(size)}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F]  text-sm cursor-pointer"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Family Dropdown */}
        <div ref={fontFamilyDropdownRef} className="relative">
          <button
            onClick={() => setShowFontFamilyDropdown(!showFontFamilyDropdown)}
            className="flex items-center justify-between w-[180px] bg-[#2C2D2E]  h-[44px] text-white px-3 py-2  cursor-pointer"
            style={{borderRadius: "6px"}}
          >
            <span className="truncate text-sm">{selectedFontFamily}</span>
            <ChevronDown size={14} />
          </button>
          {showFontFamilyDropdown && (
            <div className="absolute z-10 mt-1 w-[180px] max-h-[300px] overflow-y-auto bg-[#2C2D2E]  rounded shadow-lg cursor-pointer">
              {fontFamilies.map((font) => (
                <button
                  key={font}
                  onClick={() => applyFontFamily(font)}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F]  text-sm cursor-pointer"
                  style={{fontFamily: font === "Default" ? "inherit" : font}}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formatting Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            // ${editor.isActive("bold") ? "opacity-100" : "opacity-80"}

            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>

          {/* Text Alignment */}
          <button
            onClick={() => applyTextAlign("left")}
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => applyTextAlign("center")}
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => applyTextAlign("right")}
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => applyTextAlign("justify")}
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            title="Justify"
          >
            <AlignJustify size={16} />
          </button>

          {/* Link */}
          <button
            onClick={insertLink}
            className={`p-2  bg-[#F9DB6F] text-black opacity-100

              hover:opacity-80 focus:outline-none cursor-pointer h-[40px] w-[42px] text-center flex flex-row justify-center items-center

              `}
            style={{borderRadius: "8px"}}
            title="Add Link"
          >
            <LinkIcon size={16} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-grow rounded-[20px] bg-[#191919] overflow-auto !border !border-[white] !border-dashed mt-4 p-4 h-[200px] overflow-y-[auto]">
        {isContentEmpty ? (
          <div className="flex flex-col items-center justify-center h-full w-full text-center">
            <p className="text-white mb-4 text-[20px] font-urbanist">
              {placeholder}
            </p>
            <div className="flex flex-col items-center gap-2">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept={supportedFileTypes?.supported_extensions.join(",")}
              />
              <button
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isExtracting}
                className={`bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black px-4 py-2 rounded-md flex gap-2 items-center justify-center w-[200px] cursor-pointer ${
                  isExtracting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isExtracting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    {/* <span>Extracting...</span> */}
                  </>
                ) : (
                  <>
                    <img src="/upload-image.png" alt="user" />
                    <span>Upload</span>
                  </>
                )}
              </button>
              {uploadError && (
                <p className="text-red-500 text-sm mt-2">{uploadError}</p>
              )}
            </div>
          </div>
        ) : (
          <EditorContent editor={editor} className="h-full" />
        )}
      </div>

      {/* Styles for the editor */}
      <style jsx global>{`
        .tiptap-editor {
          background-color: #191919;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .tiptap-editor .ProseMirror {
          min-height: 200px;
          height: 100%;
          outline: none;
          color: white;
          overflow-y: auto;
        }

        .tiptap-editor .ProseMirror p {
          margin: 0.5em 0;
        }

        .tiptap-editor .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
        }

        .tiptap-editor .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
        }

        .tiptap-editor .ProseMirror h3 {
          font-size: 1.3em;
          font-weight: bold;
        }

        .tiptap-editor .ProseMirror a {
          color: #f9db6f;
          text-decoration: underline;
        }

        /* Font family styles */
        .tiptap-editor .ProseMirror [style*="font-family: Helvetica"] {
          font-family: Helvetica, sans-serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Garamond"] {
          font-family: Garamond, serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Arial"] {
          font-family: Arial, sans-serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Verdana"] {
          font-family: Verdana, sans-serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Georgia"] {
          font-family: Georgia, serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Calibri"] {
          font-family: Calibri, sans-serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Futura"] {
          font-family: Futura, sans-serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Times New Roman"] {
          font-family: "Times New Roman", serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Cambria"] {
          font-family: Cambria, serif;
        }
        .tiptap-editor .ProseMirror [style*="font-family: Consolas"] {
          font-family: Consolas, monospace;
        }
      `}</style>
    </div>
  );
};

export default TipTapEditor;

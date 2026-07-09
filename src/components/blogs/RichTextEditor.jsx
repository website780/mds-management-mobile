"use client"
import React, { useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';

const RichTextEditor = ({
  value = '',
  onChange,
  height = 400,
  placeholder = 'Start writing...',
  disabled = false,
  uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/blogs/upload-image`,
  authToken = null,
}) => {
  const editor = useRef(null);

  // Store token in a ref so Jodit's XHR always reads the CURRENT value.
  // useMemo captures the token at creation time — a ref is always live.
  const authTokenRef = useRef(authToken);
  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  const config = useMemo(() => ({
    readonly: disabled,
    placeholder,
    height,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    toolbarAdaptive: false,

    buttons: [
      'bold', 'italic', 'underline', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', '|',
      'align', '|',
      'link', 'image', 'table', '|',
      'undo', 'redo', '|',
      'fullsize', 'source',
    ],

    uploader: {
      insertImageAsBase64URI: false,
      url: uploadUrl,

      // Field name multer expects
      filesVariableName: () => 'image',

      // Use a JS getter so the token is read fresh at every request,
      // not frozen at the time useMemo ran.
      get headers() {
        const token = authTokenRef.current;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      isSuccess: (resp) => !!resp.success,
      getMessage: (resp) => resp.message || '',

      process: (resp) => ({
        files: resp.files || [],
        path: '',
        baseurl: '',
        error: resp.success ? 0 : 1,
        message: resp.message || '',
      }),

      defaultHandlerSuccess(data) {
        const { files } = data;
        if (files && files.length) {
          files.forEach((url) => {
            this.s.insertImage(url);
          });
        }
      },

      defaultHandlerError(resp) {
        console.error('Jodit image upload failed:', resp);
        this.events.fire('errorMessage', 'Image upload failed. Please try again.');
      },
    },

    processPasteHTML: true,
    processPasteFromWord: true,

    style: {
      font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#374151',
    },

    removeButtons: ['about'],
  }), [disabled, placeholder, height, uploadUrl]);
  // Note: authToken intentionally NOT in deps — the ref handles live updates
  // without re-creating the entire Jodit instance on every auth state change.

  const handleChange = (content) => {
    if (onChange) onChange(content);
  };

  return (
    <div className="rich-text-editor-container">
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <JoditEditor
          ref={editor}
          value={value}
          config={config}
          tabIndex={1}
          onBlur={handleChange}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;